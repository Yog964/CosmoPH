"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: {
        wasserstein_distances: Record<string, { mean: number; std: number; values: number[] }>;
        is_non_gaussian: Record<string, boolean>;
        n_gaussian_samples: number;
    } | null;
}

export default function ComparisonChart({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data) return null;
    const dims = Object.keys(data.wasserstein_distances);

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Gaussian Comparison</h3>
            <Plot
                data={dims.map((dim) => ({
                    y: data.wasserstein_distances[dim].values,
                    type: "box" as const, name: dim,
                    marker: { color: dim === "H0" ? "#00d4ff" : "#ff6b6b" },
                    boxpoints: "all" as const, jitter: 0.3,
                }))}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "white" },
                    xaxis: {
                        title: { text: "Homology Dimension", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "Wasserstein Distance", font: { color: "#ff6b6b", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    margin: { t: 20, r: 20, b: 65, l: 75 }, autosize: true,
                    showlegend: true,
                    legend: { bgcolor: "#1a1a2e", bordercolor: "#333", font: { color: "white" } },
                }}
                config={{ responsive: true, displaylogo: false }}
                style={{ width: "100%", height: "350px" }}
            />
            <div className="mt-4 flex flex-wrap gap-3">
                {dims.map((dim) => (
                    <div key={dim} className={`badge ${data.is_non_gaussian[dim] ? "badge-failed" : "badge-completed"}`}>
                        {dim}: {data.is_non_gaussian[dim] ? "⚠ Non-Gaussian signal" : "✓ Consistent with Gaussian"}
                    </div>
                ))}
            </div>
            <div className="mt-3">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center gap-2 text-sm font-medium text-[#00d4ff] hover:text-[#33dfff] transition-colors cursor-pointer"
                >
                    <span className={`transform transition-transform duration-200 ${showInfo ? "rotate-90" : ""}`}>▶</span>
                    See what it means
                </button>
                {showInfo && (
                    <div className="mt-3 p-4 rounded-lg bg-[#0f0f2a] border border-[#1a1a3e] text-sm text-[#c8c8e0] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p><strong className="text-white">📊 What this graph shows:</strong></p>
                        <p>This <strong className="text-[#00d4ff]">box plot</strong> compares the topological structure of your CMB map against multiple Gaussian random field simulations using the <strong>Wasserstein distance</strong>.</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">X-axis (Homology Dimension):</strong> H0 measures connected components, H1 measures loops.</li>
                            <li><strong className="text-white">Y-axis (Wasserstein Distance):</strong> Measures how different the persistence diagram is from a Gaussian simulation. Higher = more different.</li>
                            <li><strong className="text-[#00d4ff]">Box plot:</strong> Shows the distribution of distances across {data.n_gaussian_samples} random Gaussian realizations. The box spans the interquartile range; whiskers show the full range.</li>
                        </ul>
                        <p className="mt-2"><strong className="text-white">🔍 Result badges above:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-green-400">✓ Consistent with Gaussian:</strong> The CMB map&apos;s topology is within expected Gaussian fluctuations — no anomalous signal detected.</li>
                            <li><strong className="text-red-400">⚠ Non-Gaussian signal:</strong> The CMB map shows statistically significant topological differences from Gaussian fields — this could indicate primordial non-Gaussianities or foreground contamination.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 <strong>Key insight:</strong> Detecting non-Gaussianity in the CMB is crucial for constraining inflation models. A significant Wasserstein distance can point to primordial physics beyond simple inflation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
