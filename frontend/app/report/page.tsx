"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getJobStatus, getResults } from "@/lib/api";

function ReportContent() {
    const params = useSearchParams();
    const preprocessId = params.get("preprocess_id");
    const tdaId = params.get("tda_id");

    const [configData, setConfigData] = useState<any>(null);
    const [tdaResult, setTdaResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                if (preprocessId) {
                    const job = await getJobStatus("preprocess", preprocessId);
                    if (job.parameters) setConfigData(job.parameters);
                }
                if (tdaId) {
                    const res = await getResults(tdaId);
                    if (res.result) setTdaResult(res.result);
                }
            } catch (e) {
                console.error("Failed to load report data", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [preprocessId, tdaId]);

    if (loading) return <div className="p-8 text-center text-white text-xl">Loading Report...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 bg-[#050510] min-h-screen">
            <div className="flex justify-between items-center mb-8 print:hidden border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: "'Outfit', sans-serif" }}>Detailed Calculation Report</h1>
                <button onClick={() => window.print()} className="btn-primary py-2 px-6">🖨️ Print / Save PDF</button>
            </div>
            
            <div className="space-y-10">
                <section>
                    <h3 className="text-2xl font-semibold mb-6 text-[var(--accent-cyan)]">1. System Parameters & Configuration</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-white/70 uppercase bg-white/5 border border-white/10">
                                <tr>
                                    <th className="px-6 py-4 border border-white/10">Parameter Name</th>
                                    <th className="px-6 py-4 border border-white/10">Value</th>
                                    <th className="px-6 py-4 border border-white/10">Description / Threshold</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#050510]">
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Dataset ID</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{configData?.dataset_id || "N/A"}</td>
                                    <td className="px-6 py-4 text-white/60">The FITS file identifier used for analysis.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Patch Center (Lon, Lat)</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{configData?.patch_center_lon}°, {configData?.patch_center_lat}°</td>
                                    <td className="px-6 py-4 text-white/60">Galactic coordinates for the extracted patch.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Mask Applied</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{configData?.apply_mask ? configData.mask_type : "None"}</td>
                                    <td className="px-6 py-4 text-white/60">Galactic plane/point source masking.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Wavelet Filter Scale</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{configData?.apply_filter ? configData.filter_scale : "None"}</td>
                                    <td className="px-6 py-4 text-white/60">Used to isolate features of specific angular size.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Max Homology Dimension</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">1</td>
                                    <td className="px-6 py-4 text-white/60">Computes H0 (connected components) and H1 (loops).</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Max Points (Subsampling)</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">1000</td>
                                    <td className="px-6 py-4 text-white/60">Maximum number of points sampled from the image for filtration.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Max Edge Length</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">2.0</td>
                                    <td className="px-6 py-4 text-white/60">Threshold distance for Vietoris-Rips complex construction.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Gaussian Samples</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{tdaResult?.gaussian_comparison?.n_gaussian_samples || 5}</td>
                                    <td className="px-6 py-4 text-white/60">Number of random Gaussian fields generated for Null Hypothesis.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold mb-6 text-[var(--accent-cyan)]">2. Results & Final Metrics</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-white/70 uppercase bg-white/5 border border-white/10">
                                <tr>
                                    <th className="px-6 py-4 border border-white/10">Metric</th>
                                    <th className="px-6 py-4 border border-white/10">Value</th>
                                    <th className="px-6 py-4 border border-white/10">Explanation</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#050510]">
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Total Features</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{tdaResult?.summary?.total_features ?? "N/A"}</td>
                                    <td className="px-6 py-4 text-white/60">Total number of topological features detected across all dimensions.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white">Mean Persistence</td>
                                    <td className="px-6 py-4 text-[var(--accent-cyan)]">{tdaResult?.summary?.mean_persistence?.toFixed(4) ?? "N/A"}</td>
                                    <td className="px-6 py-4 text-white/60">Average lifespan (Death - Birth) of detected topological features.</td>
                                </tr>
                                {tdaResult?.gaussian_comparison?.wasserstein_distances && Object.entries(tdaResult.gaussian_comparison.wasserstein_distances).map(([dim, data]: [string, any]) => (
                                    <tr key={dim} className="border border-white/10">
                                        <td className="px-6 py-4 font-medium text-white">Wasserstein Distance ({dim})</td>
                                        <td className="px-6 py-4 text-[var(--accent-cyan)]">
                                            Mean: {data.mean.toFixed(4)} <br/> Std: {data.std.toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 text-white/60">Distance between the real CMB patch and simulated Gaussian patches.</td>
                                    </tr>
                                ))}
                                {tdaResult?.gaussian_comparison?.is_non_gaussian && Object.entries(tdaResult.gaussian_comparison.is_non_gaussian).map(([dim, isNG]: [string, any]) => (
                                    <tr key={`ng-${dim}`} className="border border-white/10">
                                        <td className="px-6 py-4 font-medium text-white">Verdict ({dim})</td>
                                        <td className={`px-6 py-4 font-bold ${isNG ? 'text-red-400' : 'text-green-400'}`}>
                                            {isNG ? "Non-Gaussian" : "Gaussian"}
                                        </td>
                                        <td className="px-6 py-4 text-white/60">Determined based on the Anomaly Threshold criteria.</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold mb-6 text-[var(--accent-cyan)]">3. Formulas & Computational Methods</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-white/70 uppercase bg-white/5 border border-white/10">
                                <tr>
                                    <th className="px-6 py-4 border border-white/10">Term / Factor</th>
                                    <th className="px-6 py-4 border border-white/10">Formula / Method</th>
                                    <th className="px-6 py-4 border border-white/10">Reference & Importance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#050510]">
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">Point Cloud Extraction</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs leading-relaxed">
                                        x_norm = cols / width<br/>
                                        y_norm = rows / height<br/>
                                        prob(p) = |val - mean| / sum(|val - mean|)
                                    </td>
                                    <td className="px-6 py-4 text-white/60">Converts image pixels to spatial coordinates weighted by extreme intensity values for filtration.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">Persistence (Lifespan)</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs">
                                        P = Death(ε) - Birth(ε)
                                    </td>
                                    <td className="px-6 py-4 text-white/60">Quantifies the robustness of a topological feature. Higher P indicates significant structural features.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">Betti Number (β_k)</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs">
                                        β_k(ε) = count(Birth ≤ ε &lt; Death)
                                    </td>
                                    <td className="px-6 py-4 text-white/60">Number of k-dimensional features alive at scale ε. Used to plot Betti Curves.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">Wasserstein Distance (W)</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs">
                                        W_p(D1, D2) = [inf_γ sum(||x - γ(x)||²)]^(1/2)
                                    </td>
                                    <td className="px-6 py-4 text-white/60">Measures the cost of optimally transporting features from one diagram to another. Used for comparing real vs. Gaussian.</td>
                                </tr>
                                <tr className="border border-white/10">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">Anomaly Threshold</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs">
                                        W_mean &gt; 2 * W_std
                                    </td>
                                    <td className="px-6 py-4 text-white/60">Threshold criterion used to reject the Null Hypothesis (Gaussianity). If W_mean &gt; 2*W_std, the patch is declared Non-Gaussian.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <div className="bg-gradient-to-r from-[var(--accent-cyan)]/10 to-transparent p-6 rounded-lg border-l-4 border-[var(--accent-cyan)]">
                        <h4 className="font-bold text-white mb-4 text-lg">Important Terms Reference</h4>
                        <ul className="list-disc list-inside space-y-3 text-white/70">
                            <li><strong className="text-[var(--accent-cyan)]">H0 Features:</strong> Connected components (clusters or distinct &quot;islands&quot; of temperature anomalies).</li>
                            <li><strong className="text-[var(--accent-cyan)]">H1 Features:</strong> 1-dimensional loops or &quot;holes&quot; (rings of hot/cold spots).</li>
                            <li><strong className="text-[var(--accent-cyan)]">Vietoris-Rips Complex:</strong> A simplicial complex built by connecting points that are within a distance ε of each other.</li>
                            <li><strong className="text-[var(--accent-cyan)]">Null Hypothesis:</strong> The assumption that CMB fluctuations are purely Gaussian random fields.</li>
                            <li><strong className="text-[var(--accent-cyan)]">Cosmic String:</strong> 1-Dimensional Topological Defect (spacetime cracks from early universe phase transitions) detected via elongated H₁ loop patterns in the persistence diagram.</li>
                            <li><strong className="text-[var(--accent-cyan)]">Cosmic Texture:</strong> 3-Dimensional Topological Defect (collapsing spacetime knots from symmetry breaking phase transitions) appearing as dense, persistent H₀ components.</li>
                            <li><strong className="text-[var(--accent-cyan)]">Cosmic Monopole:</strong> 0-Dimensional Topological Defect (isolated point-like singularities from grand unification phase transitions) appearing as extreme, isolated H₀ spikes with tiny spatial footprints.</li>
                        </ul>
                    </div>
                </section>

                {/* Section 4: Cosmic Defect Detections */}
                {tdaResult?.defect_detections && tdaResult.defect_detections.defects && tdaResult.defect_detections.defects.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-semibold mb-6 text-[var(--accent-cyan)]">4. Cosmic Defect Detections</h3>
                        
                        {/* Summary stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] text-center">
                                <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Total Detected</span>
                                <span className="text-2xl font-bold text-white">{tdaResult.defect_detections.summary.total_defects}</span>
                            </div>
                            <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] text-center">
                                <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Peak Confidence</span>
                                <span className="text-2xl font-bold text-[#f87171]">{(tdaResult.defect_detections.summary.max_confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] text-center">
                                <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Avg Confidence</span>
                                <span className="text-2xl font-bold text-white">{(tdaResult.defect_detections.summary.mean_confidence * 100).toFixed(0)}%</span>
                            </div>
                            {tdaResult.defect_detections.summary.most_significant && (
                                <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] text-center">
                                    <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Top Anomaly</span>
                                    <span className="text-sm font-bold text-[var(--accent-cyan)]">{tdaResult.defect_detections.summary.most_significant.type.replace("Cosmic ", "")}</span>
                                </div>
                            )}
                        </div>

                        {/* Defect table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-white/70 uppercase bg-white/5 border border-white/10">
                                    <tr>
                                        <th className="px-4 py-4 border border-white/10">#</th>
                                        <th className="px-4 py-4 border border-white/10">Defect Type</th>
                                        <th className="px-4 py-4 border border-white/10">Dimension</th>
                                        <th className="px-4 py-4 border border-white/10">Persistence</th>
                                        <th className="px-4 py-4 border border-white/10">Confidence</th>
                                        <th className="px-4 py-4 border border-white/10">Location (x, y)</th>
                                        <th className="px-4 py-4 border border-white/10">Bounding Box</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#050510]">
                                    {tdaResult.defect_detections.defects.map((d: any, i: number) => (
                                        <tr key={d.id} className="border border-white/10">
                                            <td className="px-4 py-3 text-white/50 font-mono">{i + 1}</td>
                                            <td className="px-4 py-3 font-medium" style={{
                                                color: d.type === "Cosmic String" ? "#00d4ff" : d.type === "Cosmic Texture" ? "#c084fc" : "#fbbf24"
                                            }}>{d.type}</td>
                                            <td className="px-4 py-3 text-[var(--accent-cyan)] font-mono">H{d.dimension}</td>
                                            <td className="px-4 py-3 text-[var(--accent-cyan)] font-mono">{d.persistence.toFixed(4)}</td>
                                            <td className={`px-4 py-3 font-bold ${d.confidence > 0.7 ? 'text-red-400' : d.confidence > 0.4 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {(d.confidence * 100).toFixed(1)}%
                                            </td>
                                            <td className="px-4 py-3 text-white/70 font-mono">({d.center.col}, {d.center.row})</td>
                                            <td className="px-4 py-3 text-white/70 font-mono text-xs">
                                                ({d.bounding_box.x_min},{d.bounding_box.y_min}) → ({d.bounding_box.x_max},{d.bounding_box.y_max})
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Classification methodology note */}
                        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-white/[0.02] to-transparent border-l-2 border-white/10 text-xs text-white/50">
                            <strong className="text-white/70">Classification Methodology:</strong> Defects are classified by reverse-engineering TDA persistence pairs to their source pixels to identify Topological Defects from early universe phase transitions.
                            Cosmic Strings (1D cracks) are identified via elongated H₁ loop patterns, Cosmic Textures (3D collapsing knots) via dense persistent H₀ components,
                            and Cosmic Monopoles (0D singularities) via isolated extreme H₀ features. Confidence scores combine persistence significance
                            relative to the noise floor with deviation from the Gaussian null hypothesis.
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default function ReportPage() {
    return <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}><ReportContent /></Suspense>;
}
