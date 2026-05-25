"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import DatasetSelector from "@/components/DatasetSelector";
import PreprocessControls from "@/components/PreprocessControls";
import { startPreprocess } from "@/lib/api";

export default function UploadPage() {
    const router = useRouter();
    const [selectedDataset, setSelectedDataset] = useState("");
    const [preprocessConfig, setPreprocessConfig] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tab, setTab] = useState<"upload" | "select">("select");

    const handleUploadComplete = (data: { dataset_id: string }) => {
        setSelectedDataset(data.dataset_id);
    };

    const handleStartPipeline = async () => {
        if (!selectedDataset) { setError("Please select or upload a dataset first"); return; }
        setLoading(true); setError("");
        try {
            const result = await startPreprocess({ dataset_id: selectedDataset, ...preprocessConfig });
            router.push(`/results?job_id=${result.job_id}&type=preprocess`);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to start preprocessing");
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="gradient-text">Upload / Select Dataset</span>
            </h1>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                {(["select", "upload"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${tab === t ? "bg-white/10 text-[var(--accent-cyan)]" : "text-[var(--text-secondary)] hover:text-white"}`}>
                        {t === "select" ? "📡 Sample Datasets" : "📁 Upload File"}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div>
                    {tab === "upload" ? (
                        <FileUploader onUploadComplete={handleUploadComplete} />
                    ) : (
                        <DatasetSelector onSelect={setSelectedDataset} selected={selectedDataset} />
                    )}
                    {selectedDataset && (
                        <div className="mt-4 p-3 rounded-lg bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 text-[var(--accent-green)] text-sm">
                            ✓ Selected: {selectedDataset}
                        </div>
                    )}
                </div>

                <div>
                    <PreprocessControls onConfigChange={setPreprocessConfig} />
                    <button onClick={handleStartPipeline} disabled={!selectedDataset || loading}
                        className="btn-primary w-full mt-4 justify-center text-lg py-4">
                        {loading ? "⏳ Processing..." : "🔬 Start Preprocessing"}
                    </button>
                    {error && (
                        <div className="mt-3 p-3 rounded-lg bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 text-[var(--accent-red)] text-sm">
                            ⚠ {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
