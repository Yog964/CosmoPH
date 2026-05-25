"""
CosmoPH - ML Classifier Training Script
========================================
Generates synthetic Gaussian and non-Gaussian CMB patches, runs the TDA
pipeline on each, extracts a 12-D feature vector, and trains a Random
Forest classifier to predict three inflation-model classes:

    0  →  Single-field slow-roll  (Gaussian,        f_NL ≈ 0)
    1  →  Multi-field              (moderate NG,     f_NL ≈ 50-200)
    2  →  Non-Bunch-Davies         (strong NG,       f_NL ≈ 200-500+)

The trained model is serialized with joblib and saved to:
    backend/app/models/inflation_classifier.joblib

Usage
-----
    cd Code1
    python scripts/train_classifier.py                     # defaults
    python scripts/train_classifier.py --samples 600       # more data
    python scripts/train_classifier.py --patch-size 64     # larger patches

Public Datasets for further training (optional)
------------------------------------------------
These are NOT required; the script generates its own synthetic training
data from first principles.  However, if you want real CMB sky data to
augment training or to validate your pipeline, you can download the
following **free, publicly-available** datasets:

1. Planck 2018 CMB Maps (ESA / IRSA)
   Temperature + polarisation full-sky maps at NSIDE 2048.
   - Commander: https://irsa.ipac.caltech.edu/data/Planck/release_3/all-sky-maps/maps/component-maps/cmb/COM_CMB_IQU-commander_2048_R3.00_full.fits
   - NILC:      https://irsa.ipac.caltech.edu/data/Planck/release_3/all-sky-maps/maps/component-maps/cmb/COM_CMB_IQU-nilc_2048_R3.00_full.fits
   - SEVEM:     https://irsa.ipac.caltech.edu/data/Planck/release_3/all-sky-maps/maps/component-maps/cmb/COM_CMB_IQU-sevem_2048_R3.00_full.fits
   - SMICA:     https://irsa.ipac.caltech.edu/data/Planck/release_3/all-sky-maps/maps/component-maps/cmb/COM_CMB_IQU-smica_2048_R3.00_full.fits

2. Planck CMB Analysis Masks
   - Common Mask: https://irsa.ipac.caltech.edu/data/Planck/release_2/ancillary-data/masks/COM_Mask_CMB-common-Mask-Int_2048_R3.00.fits

3. Planck FFP10 Simulations (10 000 Monte Carlo CMB realisations)
   Used by the Planck collaboration for null-hypothesis testing.
   - Index: https://pla.esac.esa.int/#maps  → Filter by "Simulations"
   - Direct FTP: https://irsa.ipac.caltech.edu/data/Planck/release_3/ancillary-data/simulation/

4. WebSky Extragalactic Simulations (U of Toronto / CITA)
   Full-sky lensed CMB + foreground sims at arcminute resolution.
   - https://mocks.cita.utoronto.ca/data/websky/v0.0/

5. CAMB Online (NASA LAMBDA) — generate your own C_ℓ power spectra
   - https://lambda.gsfc.nasa.gov/toolbox/camb_online.html

6. NERSC CMB Data Portal — community simulation archive
   - https://cmb-s4.org/wiki/index.php/CMB-S4_Simulations
   - https://portal.nersc.gov/project/cmb/

All of the above are free and public.  For this training script, however,
we generate everything synthetically using the project's own
gaussian_generator.py.
"""

import os
import sys
import time
import argparse

# Force torch import first to avoid WinError 1114 DLL initialization conflict
import torch

import numpy as np

# ---------------------------------------------------------------------------
# Make the backend package importable when running from the repo root
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)


# ---------------------------------------------------------------------------
# Imports from the CosmoPH backend
# ---------------------------------------------------------------------------
from app.services.gaussian_generator import (
    generate_gaussian_field,
    generate_non_gaussian_field,
)
from app.services.preprocessor import preprocess_pipeline
from app.services.tda_engine import run_tda_pipeline
from app.services.ml_classifier import extract_features

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_LABELS = {0: "Single-field slow-roll", 1: "Multi-field", 2: "Non-Bunch-Davies"}
MODEL_SAVE_DIR = os.path.join(BACKEND_DIR, "app", "models")
MODEL_PATH = os.path.join(MODEL_SAVE_DIR, "inflation_classifier.pkl")


def generate_training_sample(
    label: int,
    patch_size: int,
    seed: int,
    max_points: int = 500,
    n_gaussian_samples: int = 2,
) -> dict:
    """Generate one training sample (feature vector + label).

    Parameters
    ----------
    label : int
        0 = Gaussian (slow-roll), 1 = moderate NG, 2 = strong NG.
    patch_size : int
        Side length of the 2D CMB patch.
    seed : int
        Random seed for reproducibility.
    max_points : int
        Max points fed to the TDA engine (controls speed vs detail).
    n_gaussian_samples : int
        Number of Gaussian comparison patches for Wasserstein distance.

    Returns
    -------
    dict with keys 'features' (np.ndarray of shape (12,)) and 'label' (int).
    """
    rng = np.random.RandomState(seed)

    # Select f_NL range based on inflation model class
    if label == 0:
        # Gaussian / single-field slow-roll: f_NL very close to zero
        f_nl = rng.uniform(0.0, 5.0)
    elif label == 1:
        # Multi-field: moderate non-Gaussianity
        f_nl = rng.uniform(50.0, 200.0)
    else:
        # Non-Bunch-Davies: strong non-Gaussianity
        f_nl = rng.uniform(200.0, 600.0)

    # Vary correlation length slightly for diversity
    corr_len = rng.uniform(1.5, 3.5)

    # Generate the patch
    if label == 0:
        patch = generate_gaussian_field(
            shape=(patch_size, patch_size),
            std=1e-5,
            correlation_length=corr_len,
            seed=int(seed),
        )
    else:
        patch = generate_non_gaussian_field(
            shape=(patch_size, patch_size),
            std=1e-5,
            f_nl=f_nl,
            correlation_length=corr_len,
            seed=int(seed),
        )

    # Preprocess (normalise, no masking for synthetic data)
    prep = preprocess_pipeline(
        patch, apply_mask=False, patch_size=patch_size, normalize=True
    )
    clean_patch = prep["patch"]

    # Run TDA
    tda = run_tda_pipeline(
        clean_patch,
        max_points=max_points,
        n_gaussian_samples=n_gaussian_samples,
    )

    # Extract the same 12-D feature vector used at inference time
    features = extract_features(tda)

    return {"features": features, "label": label, "patch": tda["map_preview"]}


def build_dataset(
    n_per_class: int,
    patch_size: int,
    max_points: int,
    n_gaussian_samples: int,
) -> tuple:
    """Build a balanced dataset of (X, y) for all three classes.

    Returns
    -------
    patches : np.ndarray of shape (3 * n_per_class, H, W)
    X : np.ndarray of shape (3 * n_per_class, 12)
    y : np.ndarray of shape (3 * n_per_class,)
    """
    total = 3 * n_per_class
    patches_list, X_list, y_list = [], [], []

    print(f"\n{'='*60}")
    print(f"  Generating {total} training samples  ({n_per_class} per class)")
    print(f"  Patch size: {patch_size}x{patch_size}  |  TDA points: {max_points}")
    print(f"{'='*60}\n")

    for cls in range(3):
        cls_name = MODEL_LABELS[cls]
        print(f"  Class {cls} — {cls_name}")
        for i in range(n_per_class):
            seed = cls * 100_000 + i
            t0 = time.time()
            sample = generate_training_sample(
                label=cls,
                patch_size=patch_size,
                seed=seed,
                max_points=max_points,
                n_gaussian_samples=n_gaussian_samples,
            )
            elapsed = time.time() - t0
            patches_list.append(sample["patch"])
            X_list.append(sample["features"])
            y_list.append(sample["label"])

            # Progress
            done = cls * n_per_class + i + 1
            pct = done / total * 100
            bar = "#" * int(pct // 2) + "-" * (50 - int(pct // 2))
            print(
                f"\r    [{bar}] {pct:5.1f}%  "
                f"({done}/{total})  {elapsed:.1f}s/sample",
                end="",
                flush=True,
            )
        print()  # newline after each class finishes

    patches = np.array(patches_list, dtype=np.float32)
    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)
    return patches, X, y


def train_and_save(patches, X, y, model_path: str):
    """Train a Hybrid PyTorch model and save it."""
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import TensorDataset, DataLoader
    from app.models.hybrid_nn import HybridCosmoClassifier

    print(f"\n{'='*60}")
    print("  Training PyTorch Hybrid Classifier")
    print(f"{'='*60}\n")

    # Replace any NaN / Inf with 0 (safety net)
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

    # Convert to tensors
    patches_tensor = torch.tensor(patches).unsqueeze(1) # [N, 1, H, W]
    X_tensor = torch.tensor(X)
    y_tensor = torch.tensor(y)

    dataset = TensorDataset(patches_tensor, X_tensor, y_tensor)
    loader = DataLoader(dataset, batch_size=16, shuffle=True)

    model = HybridCosmoClassifier()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    epochs = 10
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        correct = 0
        for b_patches, b_X, b_y in loader:
            optimizer.zero_grad()
            logits = model(b_patches, b_X)
            loss = criterion(logits, b_y)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            preds = torch.argmax(logits, dim=1)
            correct += (preds == b_y).sum().item()
            
        acc = correct / len(dataset)
        print(f"  Epoch {epoch+1:2d}/{epochs} - Loss: {total_loss/len(loader):.4f} - Acc: {acc:.4f}")

    # Save
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    torch.save(model.state_dict(), model_path)
    print(f"\n  [OK] Model saved to: {model_path}")
    print(f"     File size: {os.path.getsize(model_path) / 1024:.1f} KB")

    return model


def main():
    parser = argparse.ArgumentParser(
        description="Train the CosmoPH inflation-model classifier on synthetic TDA features.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples
--------
  python scripts/train_classifier.py                     # 150 samples (fast)
  python scripts/train_classifier.py --samples 300       # better accuracy
  python scripts/train_classifier.py --patch-size 64     # larger patches
  python scripts/train_classifier.py --max-points 800    # more TDA detail
        """,
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=150,
        help="Total training samples (split evenly across 3 classes). Default: 150.",
    )
    parser.add_argument(
        "--patch-size",
        type=int,
        default=48,
        help="Side length of synthetic CMB patches. Default: 48.",
    )
    parser.add_argument(
        "--max-points",
        type=int,
        default=500,
        help="Max points for TDA subsampling. Default: 500.",
    )
    parser.add_argument(
        "--gaussian-samples",
        type=int,
        default=2,
        help="Number of Gaussian null-hypothesis samples per TDA run. Default: 2.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=MODEL_PATH,
        help=f"Path to save the trained .pkl model. Default: {MODEL_PATH}",
    )
    args = parser.parse_args()

    n_per_class = max(args.samples // 3, 10)

    print("\n" + "=" * 60)
    print("  CosmoPH — Inflation Model Classifier Training")
    print("=" * 60)
    print(f"  Samples per class : {n_per_class}")
    print(f"  Total samples     : {n_per_class * 3}")
    print(f"  Patch size        : {args.patch_size}x{args.patch_size}")
    print(f"  TDA max points    : {args.max_points}")
    print(f"  Gaussian samples  : {args.gaussian_samples}")
    print(f"  Output path       : {args.output}")

    t_start = time.time()

    # 1. Generate training data
    patches, X, y = build_dataset(
        n_per_class=n_per_class,
        patch_size=args.patch_size,
        max_points=args.max_points,
        n_gaussian_samples=args.gaussian_samples,
    )

    print(f"\n  Dataset shape: patches={patches.shape}, X={X.shape}, y={y.shape}")
    print(f"  Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}")

    # 2. Train and save
    clf = train_and_save(patches, X, y, args.output)

    elapsed = time.time() - t_start
    print(f"\n  Total training time: {elapsed:.1f}s ({elapsed/60:.1f} min)")
    print("  Done! [OK]\n")


if __name__ == "__main__":
    main()
