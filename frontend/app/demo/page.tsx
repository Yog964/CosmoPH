"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { runDemo } from "@/lib/api";
import PersistenceDiagram from "@/components/PersistenceDiagram";
import BettiCurve from "@/components/BettiCurve";
import CMBHeatmap from "@/components/CMBHeatmap";
import PersistenceImage from "@/components/PersistenceImage";
import ComparisonChart from "@/components/ComparisonChart";
import ExportPanel from "@/components/ExportPanel";

export default function DemoPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [jobId, setJobId] = useState("");
    const [fNl, setFNl] = useState(100);
    const [patchSize, setPatchSize] = useState(64);

    const handleRunDemo = async () => {
        setLoading(true); setResult(null);
        try {
            const data = await runDemo(patchSize, fNl);
            setJobId(data.job_id);
            setResult(data.result);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="gradient-text">Interactive Demo</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">One-click pipeline: Synthetic data → Preprocess → TDA → Visualize</p>

            {/* Controls */}
            <div className="glass-card max-w-2xl mb-8">
                <h3 className="text-lg font-semibold mb-4">Demo Parameters</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-medium block mb-2">Patch Size: {patchSize}px</label>
                        <input type="range" min={32} max={128} step={16} value={patchSize}
                            onChange={(e) => setPatchSize(parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-2">f_NL (non-linearity): {fNl}</label>
                        <input type="range" min={0} max={500} step={10} value={fNl}
                            onChange={(e) => setFNl(parseInt(e.target.value))} className="w-full" />
                        <p className="text-xs text-[var(--text-secondary)] mt-1">0 = Gaussian • Higher = more non-Gaussian</p>
                    </div>
                </div>
                <button onClick={handleRunDemo} disabled={loading} className="btn-primary w-full justify-center text-lg py-3">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Running TDA Pipeline...
                        </span>
                    ) : "🚀 Run Demo Pipeline"}
                </button>
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary Stats */}
                    <div className="glass-card">
                        <h3 className="text-lg font-semibold mb-4 gradient-text">Analysis Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Features", value: (result as Record<string, unknown>).summary && ((result as Record<string, unknown>).summary as Record<string, unknown>).total_features },
                                { label: "Max Persistence", value: (result as Record<string, unknown>).summary && Number(((result as Record<string, unknown>).summary as Record<string, unknown>).max_persistence).toFixed(4) },
                                { label: "Mean Persistence", value: (result as Record<string, unknown>).summary && Number(((result as Record<string, unknown>).summary as Record<string, unknown>).mean_persistence).toFixed(4) },
                                { label: "f_NL Input", value: fNl },
                            ].map((s, i) => (
                                <div key={i} className="text-center p-3 rounded-lg bg-white/[0.02]">
                                    <div className="text-xl font-bold gradient-text">{String(s.value)}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Classification */}
                    {!!(result as Record<string, unknown>).classification && (
                        <div className="glass-card">
                            <h3 className="text-lg font-semibold mb-3 gradient-text">Inflation Model Classification</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="badge badge-completed">
                                    {((result as Record<string, unknown>).classification as Record<string, unknown>).predicted_model as string}
                                </span>
                                <span className="text-sm text-[var(--text-secondary)]">
                                    Confidence: {(Number(((result as Record<string, unknown>).classification as Record<string, unknown>).confidence) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">
                                {((result as Record<string, unknown>).classification as Record<string, unknown>).note as string}
                            </p>
                        </div>
                    )}

                    {/* Visualizations */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <CMBHeatmap data={(result as Record<string, unknown>).map_preview as number[][] | null} title="CMB Patch (Preprocessed)" />
                        <PersistenceDiagram data={(result as Record<string, unknown>).persistence_diagram as { birth: number; death: number; dimension: number }[]} />
                        <BettiCurve data={(result as Record<string, unknown>).betti_curves as Record<string, { thresholds: number[]; counts: number[] }>} />
                        <PersistenceImage data={(result as Record<string, unknown>).persistence_image as number[][] | null} />
                    </div>

                    <ComparisonChart data={(result as Record<string, unknown>).gaussian_comparison as {
                        wasserstein_distances: Record<string, { mean: number; std: number; values: number[] }>;
                        is_non_gaussian: Record<string, boolean>;
                        n_gaussian_samples: number;
                    } | null} />

                    <ExportPanel jobId={jobId} />
                </div>
            )}
        </div>
    );
}
