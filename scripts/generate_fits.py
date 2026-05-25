"""
Script to generate sample FITS files for Gaussian and Non-Gaussian CMB patches.
"""
import os
import sys
import numpy as np

# Setup path so we can import from backend
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app.services.gaussian_generator import generate_gaussian_field, generate_non_gaussian_field

try:
    from astropy.io import fits
    ASTROPY_AVAILABLE = True
except ImportError:
    ASTROPY_AVAILABLE = False
    print("astropy is required to save FITS files. Please 'pip install astropy'.")
    sys.exit(1)

def main():
    output_dir = os.path.join(BASE_DIR, "dataset", "samples")
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating Gaussian patch...")
    gaussian_patch = generate_gaussian_field(
        shape=(128, 128),
        std=1e-5,
        correlation_length=2.5,
        seed=42
    )
    
    print("Generating Non-Gaussian patch (f_NL=300)...")
    non_gaussian_patch = generate_non_gaussian_field(
        shape=(128, 128),
        std=1e-5,
        f_nl=300.0,
        correlation_length=2.5,
        seed=42
    )
    
    # Save Gaussian FITS
    gauss_path = os.path.join(output_dir, "sample_gaussian.fits")
    hdu_g = fits.PrimaryHDU(gaussian_patch)
    hdu_g.header['MODEL'] = 'Single-field slow-roll (Gaussian)'
    hdu_g.header['FNL'] = 0.0
    hdu_g.writeto(gauss_path, overwrite=True)
    print(f"[OK] Saved Gaussian FITS to {gauss_path}")
    
    # Save Non-Gaussian FITS
    ng_path = os.path.join(output_dir, "sample_non_gaussian.fits")
    hdu_ng = fits.PrimaryHDU(non_gaussian_patch)
    hdu_ng.header['MODEL'] = 'Non-Bunch-Davies (Strong Non-Gaussian)'
    hdu_ng.header['FNL'] = 300.0
    hdu_ng.writeto(ng_path, overwrite=True)
    print(f"[OK] Saved Non-Gaussian FITS to {ng_path}")

if __name__ == "__main__":
    main()
