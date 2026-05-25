# CosmoPH

CosmoPH is a full-stack web application for applying Topological Data Analysis (TDA) to Cosmic Microwave Background (CMB) maps. It helps users upload or select CMB data, preprocess maps, compute persistent homology, visualize topological signatures, compare results with Gaussian null models, and classify inflation-model patterns using machine learning.

The project is designed for students, researchers, and educators who want an accessible browser-based workflow for exploring primordial non-Gaussianity without manually running a complex Python/TDA pipeline.

## Key Features

- FITS file upload and dataset selection for CMB analysis.
- Interactive preprocessing for CMB patches.
- Robust FITS loading with support for both 2D image HDUs and HEALPix-style table HDUs.
- Persistent homology computation for H0 and H1 features.
- Persistence diagram, Betti curve, persistence image, ECC curve, and lifespan histogram visualizations.
- Gaussian null-hypothesis comparison using calibrated TDA thresholds.
- Defect and anomaly detection overlays.
- Hybrid ML classifier using raw CMB map information and extracted TDA features.
- Demo workflow for quick testing without custom data.
- Export-ready result views and report page.
- Full frontend included in the main repository.

## Screenshots

Add project screenshots in `docs/screenshots/` and update the links below.

| Page / View | Screenshot Path |
|-------------|-----------------|
| Home | ![Home Page](https://github.com/user-attachments/assets/563054fb-406b-465a-ab0d-aebbb16fd3fe) |
| Dashboard | `docs/screenshots/dashboard.png` |
| Upload | `docs/screenshots/upload.png` |
| Demo | `docs/screenshots/demo.png` |
| Results | `docs/screenshots/results.png` |
| Report | `docs/screenshots/report.png` |

Example:

```md
![Dashboard](docs/screenshots/dashboard.png)
![Results](docs/screenshots/results.png)
```

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Visualization | Plotly.js, react-plotly.js |
| UI Icons | lucide-react |
| Backend | FastAPI, Pydantic, Uvicorn |
| Astronomy / FITS | Astropy, Healpy |
| TDA | Ripser, Persim |
| Machine Learning | PyTorch, scikit-learn, joblib |
| Data Processing | NumPy, SciPy |
| Testing | Pytest, ESLint |
| Deployment | Docker, Docker Compose |

## Project Structure

```text
Code1/
|-- backend/
|   |-- app/
|   |   |-- main.py
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
|-- scripts/
|-- uploads/
|-- docker-compose.yml
|-- PRD.txt
|-- UPDATES.md
`-- README.md
```

## How To Run

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- Git

### 1. Clone The Repository

```bash
git clone https://github.com/Yog964/CosmoPH.git
cd CosmoPH
```

### 2. Run The Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend URLs:

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 3. Run The Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:3000`

### 4. Run With Docker

From the project root:

```bash
docker-compose up --build
```

## Main Workflow

1. Open the frontend in the browser.
2. Upload a FITS file or select a sample dataset.(https://irsa.ipac.caltech.edu/data/Planck/release_3/)
3. Configure preprocessing options.
4. Generate a clean CMB patch.
5. Run TDA computation.
6. View persistence diagrams, Betti curves, persistence images, and related plots.
7. Compare the sample against Gaussian null models.
8. Inspect detected defects or anomalies.
9. Run the ML classifier.
10. Export or review the generated report.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check backend health |
| GET | `/api/datasets` | List available datasets |
| POST | `/api/upload` | Upload a FITS file |
| POST | `/api/preprocess` | Run preprocessing |
| POST | `/api/compute-tda` | Start TDA computation |
| GET | `/api/compute-tda/{job_id}` | Check TDA job status |
| GET | `/api/results/{job_id}` | Fetch result data |
| GET | `/api/export/{job_id}` | Export result files |
| POST | `/api/demo` | Run demo analysis |

## Useful Scripts

Generate or prepare sample datasets:

```bash
python scripts/download_datasets.py
```

Generate Gaussian and non-Gaussian FITS samples:

```bash
python scripts/generate_fits.py
```

Train or refresh the classifier:

```bash
python scripts/train_classifier.py
```

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

## Notes

- `node_modules/` is ignored and should not be pushed to Git.
- Large generated files such as `.zip`, `.fits`, `.npy`, and `.npz` are ignored.
- Uploaded files and generated outputs are stored locally during development.
- The frontend is tracked as normal source code inside this repository.

## License

MIT License.
