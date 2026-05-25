"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props { data: number[][] | null; title?: string; colorscale?: string; }

// Matplotlib RdBu_r equivalent colorscale
const RdBu_r: [number, string][] = [
    [0, "rgb(5,10,172)"],
    [0.15, "rgb(40,60,190)"],
    [0.3, "rgb(90,120,215)"],
    [0.4, "rgb(150,175,230)"],
    [0.5, "rgb(245,245,245)"],
    [0.6, "rgb(230,165,140)"],
    [0.7, "rgb(215,110,90)"],
    [0.85, "rgb(190,50,40)"],
    [1, "rgb(172,10,5)"],
];

export default function CMBHeatmap({ data, title = "Preprocessed CMB Patch", colorscale }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    const [threshold, setThreshold] = useState<number | null>(null);

    if (!data) return null;

    // Flatten data to find min/max
    const flatData = data.flat().filter(v => v !== null && !isNaN(v));
    const minVal = Math.min(...flatData);
    const maxVal = Math.max(...flatData);
    
    // Initialize threshold to min if not set
    const currentThreshold = threshold ?? minVal;

    // Filter data based on threshold (Threshold Filtration)
    const filteredData = data.map(row => 
        row.map(val => (val >= currentThreshold ? val : null))
    );

    return (
        <div className="glass-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold gradient-text">{title}</h3>
                
                {/* Filtration Slider */}
                <div className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-full border border-white/10 w-full sm:w-auto">
                    <span className="text-xs font-bold text-[var(--accent-cyan)] whitespace-nowrap uppercase tracking-tighter">Filtration Threshold:</span>
                    <input 
                        type="range" 
                        min={minVal} 
                        max={maxVal} 
                        step={(maxVal - minVal) / 100} 
                        value={currentThreshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        className="flex-1 accent-[var(--accent-cyan)] cursor-pointer h-1.5"
                    />
                    <span className="text-xs font-mono min-w-[50px] text-right">{currentThreshold.toFixed(2)}</span>
                </div>
            </div>

            <Plot
                data={[{
                    z: filteredData, type: "heatmap", colorscale: colorscale ?? RdBu_r as unknown as string,
                    zmin: minVal, zmax: maxVal, // Keep colorscale fixed
                    colorbar: { tickfont: { color: "#e8e8f0", size: 12 }, titlefont: { color: "#e8e8f0" } }
                }]}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "#e8e8f0" },
                    xaxis: {
                        title: { text: "Pixel X", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        showgrid: false,
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "Pixel Y", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        showgrid: false, scaleanchor: "x",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    margin: { t: 20, r: 20, b: 60, l: 60 }, autosize: true,
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
                        <p>This is a <strong className="text-[#00d4ff]">2D heatmap</strong> of the preprocessed Cosmic Microwave Background (CMB) temperature patch.</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li><strong className="text-white">Interactive Filtration:</strong> Use the slider above to sweep the threshold. This visually demonstrates <strong>Superlevel Set Filtration</strong> — notice how hot spots (islands) merge and form loops as you move the slider.</li>
                            <li><strong className="text-white">Color:</strong> Temperature fluctuation intensity — <span className="text-blue-400">blue = cold spots</span>, <span className="text-red-400">red = hot spots</span>.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 This sweep exactly mimics how the TDA algorithm "sees" the data to build the Persistence Diagram.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
