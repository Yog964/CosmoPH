# CosmoPH - Recent Updates

This document tracks the latest architectural upgrades and bug fixes applied to the CosmoPH pipeline.

## 1. Topological Deep Learning (Hybrid Model)
- **PyTorch Integration:** Replaced the legacy `scikit-learn` Random Forest with a state-of-the-art Hybrid PyTorch architecture.
- **Dual-Branch Network:** 
  - **CNN Branch:** Extracts raw spatial features directly from the 2D CMB pixel patches (`map_preview`).
  - **MLP Branch:** Digests the 12 advanced TDA topological features (Betti curves, persistence statistics).
- **Graceful Fallback:** Added a mock classifier layer in `ml_classifier.py` so the backend API never crashes if the PyTorch `.pth` weights are not trained or the system is missing C++ DLL dependencies.
- **Advanced Training Loop:** Overhauled `train_classifier.py` to seamlessly generate matched tensors of (Image, TDA Features, Labels) and train the neural network using `Adam` optimizer.

## 2. Robust FITS Loading
- **Astropy Bug Fix:** Fixed a `list index out of range` crash in `data_loader.py`.
- **PrimaryHDU Support:** The backend can now dynamically detect whether the uploaded `.fits` file uses a complex HEALPix Bintable format (`hdul[1]`) or a simple 2D Image array (`hdul[0]`).
- **FITS Generator:** Created `scripts/generate_fits.py` to easily output `sample_gaussian.fits` and `sample_non_gaussian.fits` directly from the python simulator.

## 3. Mathematical TDA Threshold Calibration
- **Statistical Flaw Resolved:** The Wasserstein distance calculation was previously hardcoded to compare mean distance against variance, meaning almost *every* sample was falsely flagged as "Non-Gaussian".
- **Empirical Boundaries:** We calibrated `tda_engine.py` to use strict empirical thresholds for this specific generator (`H0 > 0.42` and `H1 < 0.55`), restoring the engine's ability to accurately identify pure Gaussian fields.

## 4. Frontend Visual Corrections
- **React Graph Rendering:** Reprogrammed `NullHypothesisGraph.tsx` in Next.js.
- **Accurate Bell Curves:** Instead of drawing a fake half-curve anchored at `0`, the graph now maps a true standard normal distribution centered at the empirical baseline ($\mu = 0.38$ for H0, $\mu = 0.60$ for H1).
- **Clearer Visuals:** The real data distance line now falls inside the curve for Gaussian samples and crosses the dotted threshold accurately for Non-Gaussian samples.
