"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: { birth: number; death: number; dimension: number }[];
}

export default function PersistenceDiagram({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data || data.length === 0) return <div className="glass-card text-center text-[var(--text-secondary)]">No persistence data available</div>;

    const h0 = data.filter((p) => p.dimension === 0);
    const h1 = data.filter((p) => p.dimension === 1);
    const maxVal = Math.max(...data.map((p) => Math.max(p.birth, p.death))) * 1.1;

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Persistence Diagram</h3>
            <Plot
                data={[
                    {
                        x: h0.map((p) => p.birth), y: h0.map((p) => p.death),
                        mode: "markers", type: "scatter", name: "H₀ (Components)",
                        marker: { color: "#00d4ff", size: 8, opacity: 0.7, line: { color: "white", width: 0.5 } },
                    },
                    {
                        x: h1.map((p) => p.birth), y: h1.map((p) => p.death),
                        mode: "markers", type: "scatter", name: "H₁ (Loops)",
                        marker: { color: "#ff6b6b", size: 8, opacity: 0.7, line: { color: "white", width: 0.5 } },
                    },
                    {
                        x: [0, maxVal], y: [0, maxVal], mode: "lines", type: "scatter", name: "Diagonal",
                        line: { color: "rgba(255,255,255,0.2)", dash: "dash" }, showlegend: false
                    },
                ]}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "white" },
                    xaxis: {
                        title: { text: "Birth (Filtration Value)", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)", zerolinecolor: "rgba(255,255,255,0.1)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "Death (Filtration Value)", font: { color: "#ff6b6b", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)", zerolinecolor: "rgba(255,255,255,0.1)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    legend: { bgcolor: "#1a1a2e", bordercolor: "#333", font: { color: "white" } },
                    margin: { t: 20, r: 20, b: 65, l: 65 },
                    autosize: true,
                }}
                config={{ responsive: true, displayModeBar: true, displaylogo: false }}
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
                        <p>The <strong className="text-[#00d4ff]">Persistence Diagram</strong> is the core output of Topological Data Analysis. Each point represents a topological feature found in the CMB map.</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">X-axis (Birth):</strong> The filtration scale at which a feature <em>first appears</em>.</li>
                            <li><strong className="text-white">Y-axis (Death):</strong> The filtration scale at which a feature <em>disappears</em>.</li>
                            <li><strong className="text-[#00d4ff]">Blue dots (H₀):</strong> Connected components — clusters of similar temperature values.</li>
                            <li><strong className="text-[#ff6b6b]">Red dots (H₁):</strong> Loops/holes — ring-like structures in the temperature field.</li>
                            <li><strong className="text-gray-400">Dashed diagonal:</strong> Points on this line have zero persistence (noise). Points far from it are significant features.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 <strong>Key insight:</strong> Features farther from the diagonal are more &quot;persistent&quot; and represent real, significant structures. Points near the diagonal are typically noise.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
