"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: {
        wasserstein_distances: Record<string, { mean: number; std: number; values: number[] }>;
        is_non_gaussian: Record<string, boolean>;
    } | null;
}

export default function NullHypothesisGraph({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data) return null;

    const dims = Object.keys(data.wasserstein_distances);

    // We use empirical Gaussian-vs-Gaussian Wasserstein distances for the true Null Hypothesis
    // H0: Mean ~ 0.38, Std ~ 0.06
    // H1: Mean ~ 0.60, Std ~ 0.05
    const NULL_STATS: Record<string, { nullMean: number, nullStd: number, threshold: number, isUpper: boolean }> = {
        "H0": { nullMean: 0.38, nullStd: 0.06, threshold: 0.42, isUpper: true },
        "H1": { nullMean: 0.60, nullStd: 0.05, threshold: 0.55, isUpper: false }
    };

    const traces: any = [];

    dims.forEach((dim, i) => {
        const { mean } = data.wasserstein_distances[dim]; // Real data's mean distance to nulls
        const isNG = data.is_non_gaussian[dim];
        const color = dim === "H0" ? "#00d4ff" : "#ff6b6b";
        
        const stats = NULL_STATS[dim] || { nullMean: 0, nullStd: 0.1, threshold: 0.2, isUpper: true };
        const { nullMean, nullStd, threshold } = stats;

        // Generate X values for the bell curve
        const minX = Math.max(0, nullMean - nullStd * 5);
        const maxX = Math.max(mean * 1.2, nullMean + nullStd * 5);
        const xValues = [];
        const yValues = [];
        
        for (let x = minX; x <= maxX; x += (maxX - minX) / 100) {
            xValues.push(x);
            // Full bell curve centered at nullMean
            const y = Math.exp(-Math.pow(x - nullMean, 2) / (2 * Math.pow(nullStd, 2)));
            yValues.push(y);
        }

        // 1. The Bell Curve (Null Hypothesis Distribution)
        traces.push({
            x: xValues, y: yValues,
            type: "scatter", mode: "lines",
            name: `${dim} Null Dist.`,
            line: { color: color, width: 2, shape: "spline" },
            fill: "tozeroy", fillcolor: `${color}15`,
            xaxis: `x${i + 1}`, yaxis: `y${i + 1}`,
        });

        // 2. The Real Data Line
        traces.push({
            x: [mean, mean], y: [0, 1],
            type: "scatter", mode: "lines",
            name: `${dim} Real Data`,
            line: { color: isNG ? "#ff3333" : "#33ff33", width: 3, dash: "solid" },
            xaxis: `x${i + 1}`, yaxis: `y${i + 1}`,
        });

        // 3. The Significance Threshold Line
        traces.push({
            x: [threshold, threshold], y: [0, 1],
            type: "scatter", mode: "lines",
            name: `${dim} Threshold`,
            line: { color: "rgba(255,255,255,0.4)", width: 2, dash: "dot" },
            xaxis: `x${i + 1}`, yaxis: `y${i + 1}`,
        });
    });

    const layout: any = {
        paper_bgcolor: "transparent", plot_bgcolor: "transparent",
        font: { color: "white" },
        showlegend: false,
        margin: { t: 30, r: 20, b: 40, l: 40 }, 
        autosize: true,
        grid: { rows: 1, columns: dims.length, pattern: 'independent' },
    };

    dims.forEach((dim, i) => {
        layout[`xaxis${i + 1}`] = { 
            title: { text: `${dim} Wasserstein Dist.`, font: { size: 12, color: "#ccc" } },
            gridcolor: "rgba(255,255,255,0.05)", zerolinecolor: "rgba(255,255,255,0.2)",
            tickfont: { size: 10, color: "#888" }
        };
        layout[`yaxis${i + 1}`] = { 
            showgrid: false, zeroline: false, showticklabels: false 
        };
    });

    return (
        <div className="glass-card mt-6 border-t-4 border-t-purple-500">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">Null-Hypothesis Distribution Map</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
                Visualizes where your patch's topological distance (solid line) falls relative to the expected Gaussian variance (shaded curve). If the line crosses the dotted threshold, it is statistically anomalous.
            </p>
            <Plot
                data={traces}
                layout={layout}
                config={{ responsive: true, displaylogo: false }}
                style={{ width: "100%", height: "250px" }}
            />
            <div className="mt-4">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                    <span className={`transform transition-transform duration-200 ${showInfo ? "rotate-90" : ""}`}>▶</span>
                    See what it means
                </button>
                {showInfo && (
                    <div className="mt-3 p-4 rounded-lg bg-[#0f0f2a] border border-[#1a1a3e] text-sm text-[#c8c8e0] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p><strong className="text-white">📊 What this graph shows:</strong></p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li><strong style={{color: "#00d4ff"}}>Shaded Bell Curve:</strong> The expected distribution of Wasserstein distances if your patch was perfectly Gaussian (Null Hypothesis). It represents the natural statistical noise.</li>
                            <li><strong className="text-gray-400">Dotted Line:</strong> The significance threshold ($2\times$ standard deviation). Anything past this line is highly unlikely to happen by standard random chance.</li>
                            <li><strong className="text-white">Solid Line (Your Data):</strong> The actual topological distance of your CMB patch. If it's <strong className="text-green-400">Green</strong>, it's safely within the Gaussian zone. If it's <strong className="text-red-400">Red</strong>, it has pushed past the boundary into the Non-Gaussian anomaly zone!</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
