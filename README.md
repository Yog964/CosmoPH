# CosmoPH

Topological Data Analysis for Cosmic Microwave Background maps.

CosmoPH is a full-stack web platform for exploring primordial non-Gaussianity in Cosmic Microwave Background (CMB) data. It combines FITS upload, preprocessing, persistent homology, null-hypothesis comparison, defect visualization, and inflation-model classification in a browser-based workflow.

## Latest Updates

- Added the full Next.js frontend source directly into the main repository.
- Added dashboard, upload, demo, docs, results, and report pages.
- Added reusable visualization components for CMB heatmaps, persistence diagrams, Betti curves, persistence images, ECC curves, lifespan histograms, null-hypothesis graphs, defect overlays, and export panels.
- Added robust FITS loading that supports both primary 2D image HDUs and HEALPix-style table HDUs.
- Added `scripts/generate_fits.py` for generating Gaussian and non-Gaussian sample FITS files.
- Added a hybrid ML pipeline with a CNN branch for CMB patch pixels and an MLP branch for TDA features.
- Added classifier model assets and `scripts/train_classifier.py` for training the inflation classifier.
- Added graceful classifier fallback behavior so backend APIs remain usable even when trained PyTorch weights or local native dependencies are unavailable.
- Added calibrated TDA thresholds in the comparison engine to reduce false non-Gaussian flags.
- Added `defect_detector.py` for defect/anomaly overlay support.
- Updated dependencies for the backend and frontend.
- Converted `frontend` from a nested Git repo into normal source files tracked by this repository.
- Kept generated archives and dependency folders out of Git with ignore rules such as `*.zip` and `node_modules/`.

## Features

- Upload FITS files or select bundled/sample datasets.
- Preview CMB patches and preprocessing output.
- Configure preprocessing options such as patch size, masking, normalization, and scale settings.
- Compute persistent homology using TDA services.
- Visualize H0 and H1 topology through persistence diagrams and Betti curves.
- Generate persistence images and statistical summaries.
- Compare samples against Gaussian null hypotheses.
- Detect topological anomalies and render visual overlays.
- Run ML-based inflation model classification.
- Export results, plots, reports, and structured data.
- Use a demo workflow without requiring a custom upload.

## Screenshots

Add screenshots to a folder such as `docs/screenshots/` and update these links when ready.

| View | Screenshot |
|------|------------|
| Home / Landing | `docs/screenshots/home.png` |
| Dashboard | `docs/screenshots/dashboard.png` |
| Upload Flow | `docs/screenshots/upload.png` |
| Demo Run | `docs/screenshots/demo.png` |
| Results Visualizations | `docs/screenshots/results.png` |
| Report Export | `docs/screenshots/report.png` |

Suggested Markdown once screenshots are added:

```md
![Dashboard](docs/screenshots/dashboard.png)
![Results](docs/screenshots/results.png)
```

## Architecture

```text
Browser
  |
  v
Frontend: Next.js + React + Tailwind + Plotly
  |
  v
Backend API: FastAPI + Pydantic + Uvicorn
  |
  v
Services: Astropy/Healpy + Ripser/Persim + PyTorch/sklearn
  |
  v
Local storage: uploads, datasets, outputs, model assets
```

## Project Structure

```text
Code1/
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   |-- config.py
|   |   |-- routes/
|   |   |-- schemas/
|   |   |-- services/
|   |   |-- models/
|   |   `-- utils/
|   |-- tests/
|   |-- requirements.txt
|   `-- Dockerfile
|-- frontend/
|   |-- app/
|   |   |-- dashboard/
|   |   |-- demo/
|   |   |-- docs/
|   |   |-- report/
|   |   |-- results/
|   |   `-- upload/
|   |-- components/
|   |-- lib/
|   |-- public/
|   |-- types/
|   |-- package.json
|   `-- Dockerfile
|-- dataset/
|-- notebooks/
|-- scripts/
|   |-- download_datasets.py
|   |-- generate_fits.py
|   `-- train_classifier.py
|-- uploads/
|-- docker-compose.yml
|-- PRD.txt
|-- UPDATES.md
`-- README.md
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Git

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend:

- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

- App: `http://localhost:3000`

### Docker

```bash
docker-compose up --build
```

This starts the backend and frontend using the project Docker configuration.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |
| GET | `/api/datasets` | List available datasets |
| POST | `/api/upload` | Upload a FITS file |
| POST | `/api/preprocess` | Start preprocessing |
| POST | `/api/compute-tda` | Run TDA computation |
| GET | `/api/results/{job_id}` | Fetch analysis results |
| GET | `/api/export/{job_id}` | Download exported results |
| POST | `/api/demo` | Run the demo pipeline |

## Data and Scripts

### Sample Data

Use the dataset script to generate or prepare local samples:

```bash
python scripts/download_datasets.py
```

### FITS Generation

Generate sample Gaussian and non-Gaussian FITS files:

```bash
python scripts/generate_fits.py
```

### Classifier Training

Train or refresh the classifier pipeline:

```bash
python scripts/train_classifier.py
```

## Analysis Workflow

1. Select a sample dataset or upload a FITS map.
2. Configure preprocessing options.
3. Generate a cleaned 2D CMB patch.
4. Run persistent homology.
5. Review persistence diagrams, Betti curves, persistence images, and statistical summaries.
6. Compare the sample against Gaussian null distributions.
7. Inspect defect overlays and anomaly summaries.
8. Run model classification.
9. Export plots, data, and reports.

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | Next.js, React, Tailwind CSS, Plotly.js, lucide-react |
| Backend | FastAPI, Pydantic, Uvicorn |
| TDA | Ripser, Persim, scikit-tda style workflow |
| Astronomy | Astropy, Healpy |
| ML | PyTorch, scikit-learn, joblib |
| Data | FITS, NumPy arrays, local outputs |
| Testing | Pytest, ESLint |
| Deployment | Docker, Docker Compose |

## Testing

Backend tests:

```bash
cd backend
pytest tests/ -v
```

Frontend lint:

```bash
cd frontend
npm run lint
```

## Git Notes

The frontend is now tracked as normal source code in this repository. Dependency folders and generated files should not be committed.

Ignored examples:

- `node_modules/`
- `__pycache__/`
- `.pytest_cache/`
- `.env`
- `uploads/`
- `*.zip`
- `*.fits`
- `*.npy`
- `*.npz`

## Roadmap

- Add real screenshot assets to `docs/screenshots/`.
- Improve tNG estimator reporting.
- Add f_NL constraint visualization.
- Add batch comparison workflows.
- Add authenticated projects and saved runs.
- Add cloud storage and a production queue.
- Add shareable result links.
- Add PDF/LaTeX report generation.
- Add broader validation on public Planck datasets.

## License

MIT License.
