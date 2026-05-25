# CosmoPH ✦

**Topological Data Analysis for Cosmic Microwave Background Maps**

CosmoPH is an interactive, web-based platform that brings cutting-edge Topological Data Analysis (TDA) to cosmology research. Upload, process, and visualize CMB maps to detect primordial non-Gaussianities using persistent homology.

---

## 🚀 Features

- **Upload/Select Datasets** — Drag-drop FITS uploads or select pre-loaded Planck samples
- **Interactive Preprocessing** — Masking, patch extraction, normalization, wavelet filtering
- **Persistence Diagrams** — H₀ (components) and H₁ (loops) topological features
- **Betti Curves** — Track feature counts across filtration scales
- **Persistence Images** — Vectorized topological summaries
- **Gaussian Comparison** — Wasserstein distance against null hypothesis
- **Topological Deep Learning** — Hybrid PyTorch architecture fusing raw CMB pixels (CNN) with 12 TDA features (MLP) for Inflation model classification.
- **Export** — ZIP bundles with PNG plots, CSV data, JSON results
- **One-Click Demo** — Full pipeline with synthetic data, no upload needed

---

## 🏗️ Architecture

```
Frontend (Next.js + Tailwind + Plotly)
    ↓ REST API
Backend (FastAPI + Python)
    ↓ Processing
Services (healpy + ripser + persim + PyTorch)
    ↓ Storage
Dataset Directory + Output Files
```

---

## 📁 Project Structure

```
Code1/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI app entry point
│   │   ├── config.py     # Settings / env management
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic (TDA, preprocessing, export)
│   │   ├── schemas/      # Pydantic models
│   │   └── utils/        # Validators, helpers
│   ├── tests/            # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/             # Next.js frontend
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # API client, constants
│   └── Dockerfile
├── dataset/              # Data directory
│   ├── raw/              # Original Planck FITS maps
│   ├── sample/           # Generated demo data
│   ├── processed/        # Preprocessed patches
│   ├── external/         # Third-party data
│   ├── metadata/         # Dataset metadata/configs
│   └── outputs/          # Analysis results & exports
├── scripts/              # Utility scripts
├── notebooks/            # Jupyter tutorials
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Clone & Setup Backend

```bash
# Create virtual environment
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
```

### 2. Generate Sample Datasets

```bash
cd ..
python scripts/download_datasets.py
```

### 3. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend available at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 4. Setup & Start Frontend

```bash
cd frontend
npm install

# Copy environment config
copy .env.local.example .env.local     # Windows
# cp .env.local.example .env.local     # macOS/Linux

npm run dev
```

Frontend available at: http://localhost:3000

### 5. Run Tests

```bash
cd backend
pytest tests/ -v
```

---

## 🐳 Docker Setup

```bash
docker-compose up --build
```

This starts:
- **Backend** at http://localhost:8000
- **Frontend** at http://localhost:3000
- **Redis** at localhost:6379

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/datasets` | List available datasets |
| POST | `/api/upload` | Upload a FITS file |
| POST | `/api/preprocess` | Start preprocessing |
| POST | `/api/compute-tda` | Run TDA computation |
| GET | `/api/results/{job_id}` | Get analysis results |
| GET | `/api/export/{job_id}` | Download results ZIP |
| POST | `/api/demo` | Run one-click demo |

Full OpenAPI docs: http://localhost:8000/docs

---

## 📊 Dataset Plan

### MVP Demo Data (Auto-generated)
| File | Location | Purpose |
|------|----------|---------|
| `gaussian_sample_nside64.npy` | `dataset/sample/` | Gaussian null comparison |
| `demo_cmb_patch_64x64.npy` | `dataset/sample/` | Demo CMB patch |
| `demo_non_gaussian_patch_64x64.npy` | `dataset/sample/` | Non-Gaussian demo |

### Optional Full-Sky Data
| File | Location | Source |
|------|----------|--------|
| `COM_CMB_IQU-commander_2048_R3.00_full.fits` | `dataset/raw/` | [Planck PR3 IRSA](https://irsa.ipac.caltech.edu/data/Planck/release_3/all-sky-maps/maps/component-maps/cmb/) |
| `COM_Mask_CMB-common-Mask-Int_2048_R3.00.fits` | `dataset/raw/` | [Planck PR2 IRSA](https://irsa.ipac.caltech.edu/data/Planck/release_2/ancillary-data/masks/) |

---

## 🔬 End-to-End Workflow

1. **Select/Upload** → Choose a sample dataset or upload a FITS file
2. **Configure** → Set mask type, patch size, scale, normalization
3. **Preprocess** → Extract & clean a 2D CMB patch
4. **TDA Compute** → Run persistent homology (Ripser)
5. **Visualize** → Interactive persistence diagram, Betti curves, persistence images
6. **Compare** → Wasserstein distance against Gaussian null hypothesis
7. **Export** → Download ZIP bundle (PNG + CSV + JSON)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Specific test files
pytest tests/test_health.py -v
pytest tests/test_tda.py -v
pytest tests/test_preprocess.py -v
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS, Plotly.js |
| Backend | FastAPI, Pydantic, Uvicorn |
| TDA | Ripser, Persim, scikit-tda |
| Astronomy | Healpy, Astropy |
| ML | PyTorch (Hybrid CNN + TDA) |
| Queue | In-memory (MVP) → Celery + Redis (production) |
| Testing | Pytest, Jest |
| Deployment | Docker, Docker Compose |

---

## 📈 Future Roadmap

- [ ] tNG estimators (tNG₁, tNG₂, tNG₃)
- [x] Trained ML classifier on labeled simulations (PyTorch Hybrid)
- [ ] f_NL constraint visualization
- [ ] Full-sky HEALPix support with HPC offload
- [ ] User authentication (OAuth)
- [ ] Batch processing / comparison mode
- [ ] LaTeX report generation
- [ ] CAMB sim generator via web form
- [ ] Celery + Redis production queue
- [ ] Cloud deployment (AWS/GCP)

---

## 📝 License

MIT License — feel free to use, modify, and distribute.

---

**Built with ✦ for cosmology research.**
