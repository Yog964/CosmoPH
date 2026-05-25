"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getJobStatus, getResults, startTDA, startPreprocess } from "@/lib/api";
import JobStatusComp from "@/components/JobStatus";
import PersistenceDiagram from "@/components/PersistenceDiagram";
import BettiCurve from "@/components/BettiCurve";
import CMBHeatmap from "@/components/CMBHeatmap";
import PersistenceImage from "@/components/PersistenceImage";
import ComparisonChart from "@/components/ComparisonChart";
import ExportPanel from "@/components/ExportPanel";
import LifespanHistogram from "@/components/LifespanHistogram";
import NullHypothesisGraph from "@/components/NullHypothesisGraph";
import ECCCurve from "@/components/ECCCurve";
import DefectOverlay from "@/components/DefectOverlay";
import DefectSummaryPanel from "@/components/DefectSummaryPanel";
import { Suspense } from "react";

import PreprocessControls from "@/components/PreprocessControls";

function ResultsContent() {
    const router = useRouter();
    const params = useSearchParams();
    const jobId = params.get("job_id") || "";
    const jobType = params.get("type") || "preprocess";

    const [status, setStatus] = useState("pending");
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [tdaJobId, setTdaJobId] = useState("");
    const [tdaResult, setTdaResult] = useState<Record<string, unknown> | null>(null);
    const [tdaStatus, setTdaStatus] = useState("");
    const [msg, setMsg] = useState("");
    const [configData, setConfigData] = useState<Record<string, any> | null>(null);
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [editedConfig, setEditedConfig] = useState<Record<string, any> | null>(null);

    // Poll preprocessing status
    useEffect(() => {
        if (!jobId || jobType !== "preprocess") return;
        const interval = setInterval(async () => {
            const job = await getJobStatus("preprocess", jobId);
            setStatus(job.status);
            setMsg(job.message || "");
            if (job.parameters) {
                setConfigData(job.parameters);
            }
            if (job.status === "completed") {
                setResult(job.result);
                clearInterval(interval);
            } else if (job.status === "failed") {
                clearInterval(interval);
            }
        }, 1500);
        return () => clearInterval(interval);
    }, [jobId, jobType]);

    // Poll TDA status
    useEffect(() => {
        if (!tdaJobId) return;
        const interval = setInterval(async () => {
            try {
                const job = await getJobStatus("compute-tda", tdaJobId);
                setTdaStatus(job.status);
                if (job.status === "completed") {
                    const res = await getResults(tdaJobId);
                    setTdaResult(res.result);
                    clearInterval(interval);
                } else if (job.status === "failed") {
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Error polling TDA status:", err);
                setTdaStatus("failed");
                clearInterval(interval);
            }
        }, 1500);
        return () => clearInterval(interval);
    }, [tdaJobId]);

    const handleStartTDA = async () => {
        const res = await startTDA({ job_id: jobId, max_dimension: 1, max_points: 1000, compare_gaussian: true });
        setTdaJobId(res.job_id);
        setTdaStatus("pending");
    };

    const handleReSubmit = async () => {
        if (!configData || !editedConfig) return;
        
        // Merge dataset ID with edited config
        const fullConfig = { ...configData, ...editedConfig };
        
        // Start new job
        setStatus("pending");
        setMsg("Starting new preprocessing job...");
        try {
            const res = await startPreprocess(fullConfig);
            
            // Redirect to new job
            router.push(`/results?job_id=${res.job_id}&type=preprocess`);
            
            // Reset local states for smooth transition
            setIsEditingConfig(false);
            setResult(null);
            setTdaJobId("");
            setTdaResult(null);
        } catch (e: any) {
            alert(e.message || "Failed to start another job");
            setStatus("failed");
            setMsg("Error submitting new job");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="gradient-text">Results</span>
            </h1>

            {/* Preprocessing Status */}
            {configData && !isEditingConfig && (
                <div className="glass-card mb-6 animate-fade-in border-l-4 border-l-[var(--accent-cyan)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 w-full text-sm">
                        <h3 className="text-base font-semibold mb-3 text-white">Job Configuration</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <span className="text-[var(--text-secondary)] block text-xs mb-1">Dataset</span>
                                <span className="font-medium text-[var(--accent-cyan)]">{configData.dataset_id}</span>
                            </div>
                            <div>
                                <span className="text-[var(--text-secondary)] block text-xs mb-1">Coordinates (Lon, Lat)</span>
                                <span className="font-medium">{configData.patch_center_lon}°, {configData.patch_center_lat}°</span>
                            </div>
                            <div>
                                <span className="text-[var(--text-secondary)] block text-xs mb-1">Mask Applied</span>
                                <span className="font-medium">
                                    {configData.apply_mask ? configData.mask_type : "None"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[var(--text-secondary)] block text-xs mb-1">Wavelet Filter</span>
                                <span className="font-medium">
                                    {configData.apply_filter ? `Scale ${configData.filter_scale}` : "None"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => { setEditedConfig(configData); setIsEditingConfig(true); }} className="btn-secondary whitespace-nowrap px-4 py-2 border border-white/20 hover:border-white/40">
                        ✏️ Edit Configuration
                    </button>
                </div>
            )}

            {configData && isEditingConfig && (
                <div className="mb-6 animate-fade-in border border-[var(--accent-cyan)] rounded-xl p-6 bg-[#050510]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <h3 className="text-xl font-bold text-[var(--accent-cyan)]">Edit Configuration & Re-run</h3>
                        <button onClick={() => setIsEditingConfig(false)} className="text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer text-sm">✕ Cancel</button>
                    </div>
                    <div>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">You are editing the configuration for dataset: <strong className="text-white">{configData.dataset_id}</strong></p>
                        <PreprocessControls initialConfig={configData} onConfigChange={(cfg) => setEditedConfig(cfg)} />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setIsEditingConfig(false)} className="px-6 py-2 rounded font-medium text-white/70 hover:text-white transition-colors cursor-pointer">Cancel</button>
                        <button onClick={handleReSubmit} className="btn-primary cursor-pointer hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all px-8">🚀 Submit Again</button>
                    </div>
                </div>
            )}

            <JobStatusComp status={status} message={msg} />

            {/* Preprocessing Results */}
            {result && status === "completed" && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <CMBHeatmap data={(result as Record<string, unknown>).preview_data as number[][] | null} title="Preprocessed CMB Patch" />

                    {!tdaJobId && (
                        <button onClick={handleStartTDA} className="btn-primary text-lg py-3 px-8">
                            🔬 Run TDA Analysis
                        </button>
                    )}
                </div>
            )}

            {/* TDA Status */}
            {tdaJobId && !tdaResult && <div className="mt-6"><JobStatusComp status={tdaStatus} message="Computing persistent homology..." /></div>}

            {/* TDA Results */}
            {tdaResult && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="grid lg:grid-cols-2 gap-6">
                        <PersistenceDiagram data={(tdaResult as Record<string, unknown>).persistence_diagram as { birth: number; death: number; dimension: number }[]} />
                        <LifespanHistogram data={(tdaResult as Record<string, unknown>).persistence_diagram as { birth: number; death: number; dimension: number }[]} />
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <BettiCurve data={(tdaResult as Record<string, unknown>).betti_curves as Record<string, { thresholds: number[]; counts: number[] }>} />
                        <ECCCurve data={(tdaResult as Record<string, unknown>).betti_curves as Record<string, { thresholds: number[]; counts: number[] }>} />
                    </div>
                    <div className="grid lg:grid-cols-1 gap-6">
                        <PersistenceImage data={(tdaResult as Record<string, unknown>).persistence_image as number[][] | null} />
                    </div>

                    {/* Cosmic Defect Detection Overlay */}
                    {(tdaResult as any).defect_detections && (tdaResult as any).defect_detections.defects && (tdaResult as any).defect_detections.defects.length > 0 && (
                        <DefectOverlay
                            mapData={(tdaResult as Record<string, unknown>).map_preview as number[][] | null}
                            defectData={(tdaResult as any).defect_detections}
                        />
                    )}
                    <ComparisonChart data={(tdaResult as Record<string, unknown>).gaussian_comparison as {
                        wasserstein_distances: Record<string, { mean: number; std: number; values: number[] }>;
                        is_non_gaussian: Record<string, boolean>;
                        n_gaussian_samples: number;
                    } | null} />
                    
                    {/* Overall Verdict */}
                    {(tdaResult as any).gaussian_comparison && (tdaResult as any).gaussian_comparison.is_non_gaussian && (
                        <div className="glass-card mt-6 p-6 border-2 border-[var(--accent-cyan)]/20 rounded-xl bg-gradient-to-br from-[#00d4ff10] to-[#ff6b6b10]">
                            <h3 className="text-2xl flex justify-center sm:justify-start font-bold mb-4 items-center gap-2">
                                <span className="gradient-text">Overall TDA Verdict</span>
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="text-center md:text-left flex-1">
                                    <p className="text-[var(--text-secondary)] text-sm mb-4">
                                        Conclusion based on comparing the topological features (Wasserstein Distances) against randomized Gaussian fields:
                                    </p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        {Object.entries((tdaResult as any).gaussian_comparison.is_non_gaussian).map(([dim, isNG]) => (
                                            <div key={dim} className={`px-4 py-2 rounded-lg font-medium border ${isNG ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]'}`}>
                                                <span className="font-bold">{dim} Features:</span> {isNG ? "Anomalous (Non-Gaussian)" : "Gaussian"}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-center bg-[#050510] py-5 px-8 rounded-xl border border-white/10 min-w-[250px] shadow-lg">
                                    <span className="text-[var(--text-secondary)] block text-xs uppercase tracking-widest mb-2 font-semibold">Final Conclusion</span>
                                    <div className={`text-2xl font-bold ${Object.values((tdaResult as any).gaussian_comparison.is_non_gaussian).some((v) => v) ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}>
                                        {Object.values((tdaResult as any).gaussian_comparison.is_non_gaussian).some((v) => v) ? 'NON-GAUSSIAN' : 'GAUSSIAN'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Insert Null Hypothesis Bell Curve below the Verdict conclusion */}
                            <div className="mt-6 border-t border-white/10 pt-4">
                                <NullHypothesisGraph data={(tdaResult as any).gaussian_comparison} />
                            </div>
                        </div>
                    )}

                    {/* Cosmic Defect Classification Summary */}
                    {(tdaResult as any).defect_detections && (
                        <DefectSummaryPanel defectData={(tdaResult as any).defect_detections} />
                    )}

                    <div className="flex justify-center my-8">
                        <button onClick={() => window.open(`/report?preprocess_id=${jobId}&tda_id=${tdaJobId}`, '_blank')} className="btn-primary py-3 px-8 text-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all flex items-center gap-2 cursor-pointer">
                            📄 Open Detailed Report (Printable)
                        </button>
                    </div>

                    <ExportPanel jobId={tdaJobId} />
                </div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="skeleton h-64" /></div>}>
            <ResultsContent />
        </Suspense>
    );
}
