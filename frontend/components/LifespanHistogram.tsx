"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: { birth: number; death: number; dimension: number }[];
}

export default function LifespanHistogram({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data || data.length === 0) return null;

    // Calculate lifespans (persistence)
    const h0_lifespans = data.filter((p) => p.dimension === 0).map((p) => p.death - p.birth);
    const h1_lifespans = data.filter((p) => p.dimension === 1).map((p) => p.death - p.birth);

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Feature Lifespan Distribution</h3>
            <Plot
                data={[
                    {
                        x: h0_lifespans,
                        type: "histogram",
                        name: "H₀ (Components)",
                        marker: { color: "#00d4ff", opacity: 0.7 },
                        xbins: { size: Math.max(...h0_lifespans) / 20 }
                    },
                    {
                        x: h1_lifespans,
                        type: "histogram",
                        name: "H₁ (Loops)",
                        marker: { color: "#ff6b6b", opacity: 0.7 },
                        xbins: { size: Math.max(...h1_lifespans) / 20 }
                    }
                ]}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "white" },
                    barmode: "overlay",
                    xaxis: {
                        title: { text: "Lifespan (Death - Birth)", font: { color: "white", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "Count", font: { color: "white", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    legend: { bgcolor: "#1a1a2e", bordercolor: "#333", font: { color: "white" } },
                    margin: { t: 20, r: 20, b: 65, l: 65 }, autosize: true,
                }}
                config={{ responsive: true, displaylogo: false }}
                style={{ width: "100%", height: "400px" }}
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
                        <p>This <strong className="text-[#00d4ff]">Histogram</strong> breaks down exactly how long structures "lived" during the topological filtration. The lifespan is geometrically interpreted as the prominence of the feature.</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">X-axis (Lifespan):</strong> The persistence value (Death minus Birth). Things on the far left are short-lived. Things on the right are highly persistent structures.</li>
                            <li><strong className="text-white">Y-axis (Count):</strong> The number of features that share that exact lifespan.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 <strong>Key insight:</strong> Notice the massive spike on the far left? That is statistical noise — lots of tiny features that pop in and out. The isolated bumps further out to the right represent the true, statistically significant topological "fingerprints" of the universe.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
