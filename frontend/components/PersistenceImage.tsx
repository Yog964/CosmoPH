"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props { data: number[][] | null; }

// Matplotlib magma equivalent colorscale
const MagmaColorscale: [number, string][] = [
    [0, "rgb(0,0,4)"],
    [0.13, "rgb(28,16,68)"],
    [0.25, "rgb(79,18,123)"],
    [0.38, "rgb(129,37,129)"],
    [0.5, "rgb(181,54,122)"],
    [0.63, "rgb(229,89,100)"],
    [0.75, "rgb(251,135,97)"],
    [0.88, "rgb(254,194,140)"],
    [1, "rgb(252,253,191)"],
];

export default function PersistenceImage({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data) return null;
    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Persistence Image</h3>
            <Plot
                data={[{
                    z: data, type: "heatmap", colorscale: MagmaColorscale as unknown as string,
                    colorbar: { tickfont: { color: "white", size: 12 } }
                }]}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "white" },
                    xaxis: {
                        title: { text: "Birth", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "Persistence", font: { color: "#ff6b6b", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
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
                        <p>The <strong className="text-[#00d4ff]">Persistence Image</strong> is a stable, vectorized representation of the persistence diagram — it converts topological features into a fixed-size image for machine learning.</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">X-axis (Birth):</strong> The filtration value at which a feature was born.</li>
                            <li><strong className="text-white">Y-axis (Persistence):</strong> How long a feature survived (Death − Birth). Higher = more significant.</li>
                            <li><strong className="text-white">Color intensity:</strong> <span className="text-yellow-300">Bright regions</span> indicate a high density of topological features at that (birth, persistence) coordinate. <span className="text-purple-400">Dark regions</span> have few or no features.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 <strong>Key insight:</strong> This image acts as a &quot;topological fingerprint&quot; of the CMB map. It can be fed directly into ML classifiers to distinguish between different cosmological models (e.g., Gaussian vs. non-Gaussian).</p>
                    </div>
                )}
            </div>
        </div>
    );
}
