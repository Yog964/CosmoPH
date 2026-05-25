"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: Record<string, { thresholds: number[]; counts: number[] }>;
}

export default function BettiCurve({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data) return null;
    const colors: Record<string, string> = { H0: "#00d4ff", H1: "#ff6b6b" };

    const traces = Object.entries(data).map(([key, curve]) => ({
        x: curve.thresholds, y: curve.counts,
        mode: "lines" as const, type: "scatter" as const,
        name: `β${key.slice(1)}`,
        line: { color: colors[key] || "#fff", width: 2 },
        fill: "tozeroy" as const, fillcolor: `${colors[key] || "#fff"}15`,
    }));

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Betti Curves</h3>
            <Plot data={traces}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "white" },
                    xaxis: {
                        title: { text: "Threshold (ε)", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "Betti Number (β)", font: { color: "#ff6b6b", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    legend: { bgcolor: "#1a1a2e", bordercolor: "#333", font: { color: "white" } },
                    margin: { t: 20, r: 20, b: 65, l: 65 }, autosize: true,
                }}
                config={{ responsive: true, displaylogo: false }}
                style={{ width: "100%", height: "350px" }}
            />
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
                        <p><strong className="text-[#00d4ff]">Betti Curves</strong> track how many topological features exist at each filtration threshold.</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">X-axis (Threshold ε):</strong> The filtration radius — as it grows, more connections form between nearby points.</li>
                            <li><strong className="text-white">Y-axis (Betti Number β):</strong> The count of features alive at each threshold.</li>
                            <li><strong className="text-[#00d4ff]">β₀ (Blue curve):</strong> Number of connected components — starts high (many isolated clusters) and drops as they merge.</li>
                            <li><strong className="text-[#ff6b6b]">β₁ (Red curve):</strong> Number of loops/holes — peaks when ring-like structures form, then drops as holes get filled.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 <strong>Key insight:</strong> A sharp peak in β₁ indicates strong loop-like structures. The height and position of peaks reveal the spatial scale of CMB features. Differences from Gaussian expectations may signal non-Gaussianity.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
