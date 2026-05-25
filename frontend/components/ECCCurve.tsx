"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: Record<string, { thresholds: number[]; counts: number[] }>;
}

export default function ECCCurve({ data }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    if (!data || !data.H0 || !data.H1) return null;

    // ECC = H0 - H1
    const h0 = data.H0;
    const h1 = data.H1;
    
    // Ensure both have same thresholds (they should by backend logic)
    const eccCounts = h0.counts.map((val, idx) => val - (h1.counts[idx] || 0));

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Euler Characteristic Curve (ECC)</h3>
            <Plot
                data={[
                    {
                        x: h0.thresholds,
                        y: eccCounts,
                        mode: "lines",
                        type: "scatter",
                        name: "ECC (H₀ - H₁)",
                        line: { color: "#a855f7", width: 3 },
                        fill: "tozeroy",
                        fillcolor: "rgba(168, 85, 247, 0.1)",
                    }
                ]}
                layout={{
                    paper_bgcolor: "#0a0a1a", plot_bgcolor: "#0a0a1a",
                    font: { color: "white" },
                    xaxis: {
                        title: { text: "Threshold (ε)", font: { color: "#00d4ff", size: 14 }, standoff: 10 },
                        gridcolor: "rgba(255,255,255,0.05)",
                        tickfont: { color: "#ccc", size: 11 },
                    },
                    yaxis: {
                        title: { text: "ECC (χ)", font: { color: "#ff6b6b", size: 14 }, standoff: 10 },
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
                    className="flex items-center gap-2 text-sm font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors cursor-pointer"
                >
                    <span className={`transform transition-transform duration-200 ${showInfo ? "rotate-90" : ""}`}>▶</span>
                    See what it means
                </button>
                {showInfo && (
                    <div className="mt-3 p-4 rounded-lg bg-[#0f0f2a] border border-[#1a1a3e] text-sm text-[#c8c8e0] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p><strong className="text-white">📊 What this graph shows:</strong></p>
                        <p>The <strong className="text-[#a855f7]">Euler Characteristic Curve (ECC)</strong> is a fundamental descriptor in topology, calculated here as the difference between connected components ($H_0$) and loops ($H_1$).</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">Physical Meaning:</strong> It measures the overall "connectedness" or "porosity" of the CMB field at different temperature levels.</li>
                            <li><strong className="text-white">Pattern:</strong> It typically oscillates from positive to negative. The shape of this oscillation is extremely sensitive to Non-Gaussianity.</li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2">💡 <strong>Key insight:</strong> Cosmologists use the ECC to test the "Minkowski Functionals" of the universe. If the real ECC drastically deviates from the expected symmetric oscillation, it's a major sign of anomalous cosmic physics.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
