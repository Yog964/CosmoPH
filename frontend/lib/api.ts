// CosmoPH API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDatasets() {
  const res = await fetch(`${API_BASE}/api/datasets`);
  return res.json();
}

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function startPreprocess(config: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/preprocess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error starting preprocess: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getJobStatus(endpoint: string, jobId: string) {
  const res = await fetch(`${API_BASE}/api/${endpoint}/${jobId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching job status: ${res.status} ${text}`);
  }
  return res.json();
}

export async function startTDA(config: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/compute-tda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error starting TDA: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getResults(jobId: string) {
  const res = await fetch(`${API_BASE}/api/results/${jobId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching results: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getExportUrl(jobId: string) {
  return `${API_BASE}/api/export/${jobId}`;
}

export async function runDemo(patchSize = 64, fNl = 100) {
  const res = await fetch(`${API_BASE}/api/demo?patch_size=${patchSize}&f_nl=${fNl}`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error running demo: ${res.status} ${text}`);
  }
  return res.json();
}

export { API_BASE };
