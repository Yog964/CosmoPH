"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface BoundingBox {
    x_min: number; y_min: number; x_max: number; y_max: number;
    width: number; height: number; aspect_ratio: number;
}

interface Defect {
    id: string;
    type: string;
    dimension: number;
    persistence: number;
    birth: number;
    death: number;
    confidence: number;
    bounding_box: BoundingBox;
    center: { row: number; col: number };
    n_generator_points: number;
    intensity_stats: { mean: number; max: number; min: number };
    highlight_pixels: { row: number; col: number }[];
    description: string;
}

interface DefectDetections {
    defects: Defect[];
    summary: {
        total_defects: number;
        by_type: Record<string, { count: number; avg_confidence: number; max_persistence: number }>;
        max_confidence: number;
        mean_confidence: number;
        most_significant?: { type: string; confidence: number; persistence: number; location: { row: number; col: number } };
    };
}

interface Props {
    mapData: number[][] | null;
    defectData: DefectDetections | null;
}

// Color scheme for defect types
const DEFECT_COLORS: Record<string, { border: string; fill: string; glow: string; icon: string }> = {
    "Cosmic String":   { border: "#00d4ff", fill: "rgba(0,212,255,0.08)",   glow: "rgba(0,212,255,0.4)",   icon: "〰️" },
    "Cosmic Texture":  { border: "#c084fc", fill: "rgba(192,132,252,0.08)", glow: "rgba(192,132,252,0.4)", icon: "🌀" },
    "Cosmic Monopole": { border: "#fbbf24", fill: "rgba(251,191,36,0.08)",  glow: "rgba(251,191,36,0.4)",  icon: "⚡" },
};

// CMB colorscale
const RdBu_r: [number, string][] = [
    [0, "rgb(5,10,172)"], [0.15, "rgb(40,60,190)"], [0.3, "rgb(90,120,215)"],
    [0.4, "rgb(150,175,230)"], [0.5, "rgb(245,245,245)"], [0.6, "rgb(230,165,140)"],
    [0.7, "rgb(215,110,90)"], [0.85, "rgb(190,50,40)"], [1, "rgb(172,10,5)"],
];

export default function DefectOverlay({ mapData, defectData }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
        "Cosmic String": true, "Cosmic Texture": true, "Cosmic Monopole": true,
    });
    const [hoveredDefect, setHoveredDefect] = useState<string | null>(null);
    const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);

    if (!mapData || !defectData || !defectData.defects || defectData.defects.length === 0) return null;

    const flatData = mapData.flat().filter(v => v !== null && !isNaN(v));
    const minVal = Math.min(...flatData);
    const maxVal = Math.max(...flatData);

    const visibleDefects = defectData.defects.filter(d => activeTypes[d.type] !== false);

    // Build Plotly shapes for bounding boxes
    const shapes = visibleDefects.map((d) => {
        const colors = DEFECT_COLORS[d.type] || DEFECT_COLORS["Cosmic String"];
        const isHovered = hoveredDefect === d.id;
        return {
            type: "rect" as const,
            x0: d.bounding_box.x_min,
            y0: d.bounding_box.y_min,
            x1: d.bounding_box.x_max,
            y1: d.bounding_box.y_max,
            line: {
                color: isHovered ? "#ffffff" : colors.border,
                width: isHovered ? 3 : 2,
                dash: d.dimension === 1 ? "dot" as const : "solid" as const,
            },
            fillcolor: isHovered ? colors.glow : colors.fill,
        };
    });

    // Build annotations for defect labels
    const annotations = visibleDefects.map((d) => {
        const colors = DEFECT_COLORS[d.type] || DEFECT_COLORS["Cosmic String"];
        return {
            x: d.bounding_box.x_min,
            y: d.bounding_box.y_min - 1.5,
            text: `${d.type.split(" ")[1]} (${(d.confidence * 100).toFixed(0)}%)`,
            showarrow: false,
            font: { color: colors.border, size: 10, family: "'Inter', sans-serif" },
            bgcolor: "rgba(5,5,16,0.85)",
            bordercolor: colors.border,
            borderwidth: 1,
            borderpad: 3,
        };
    });

    // Scatter trace for highlight pixels (generator points)
    const highlightTraces = visibleDefects.map((d) => ({
        x: d.highlight_pixels.map(p => p.col),
        y: d.highlight_pixels.map(p => p.row),
        mode: "markers" as const,
        type: "scatter" as const,
        name: d.id,
        showlegend: false,
        marker: {
            color: (DEFECT_COLORS[d.type] || DEFECT_COLORS["Cosmic String"]).border,
            size: 4,
            opacity: 0.6,
            symbol: d.dimension === 1 ? "diamond" : "circle",
        },
        hoverinfo: "text" as const,
        hovertext: d.highlight_pixels.map(
            () => `${d.type}\nConfidence: ${(d.confidence * 100).toFixed(1)}%\nPersistence: ${d.persistence.toFixed(4)}\nCenter: (${d.center.col}, ${d.center.row})`
        ),
    }));

    const toggleType = (type: string) => {
        setActiveTypes(prev => ({ ...prev, [type]: !prev[type] }));
    };

    return (
        <div className="glass-card" id="defect-overlay-section">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4ff]/20 to-[#c084fc]/20 border border-white/10 flex items-center justify-center text-lg">
                        🔍
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold gradient-text">Cosmic Defect Detection</h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {defectData.summary.total_defects} anomal{defectData.summary.total_defects === 1 ? "y" : "ies"} localized
                        </p>
                    </div>
                </div>

                {/* Toggle controls */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(DEFECT_COLORS).map(([type, colors]) => {
                        const count = defectData.defects.filter(d => d.type === type).length;
                        if (count === 0) return null;
                        const isActive = activeTypes[type] !== false;
                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? "bg-white/5 border-white/20 text-white"
                                        : "bg-transparent border-white/5 text-white/30"
                                }`}
                                style={{ borderColor: isActive ? colors.border : undefined }}
                            >
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isActive ? colors.border : "#555" }} />
                                <span>{type.replace("Cosmic ", "")}</span>
                                <span className="text-[10px] font-bold opacity-60">({count})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main visualization */}
            <Plot
                data={[
                    {
                        z: mapData,
                        type: "heatmap",
                        colorscale: RdBu_r as unknown as string,
                        zmin: minVal,
                        zmax: maxVal,
                        colorbar: {
                            tickfont: { color: "#e8e8f0", size: 11 },
                            titlefont: { color: "#e8e8f0" },
                            thickness: 15,
                            len: 0.85,
                        },
                        hoverinfo: "z",
                        name: "CMB Patch",
                    },
                    ...highlightTraces,
                ]}
                layout={{
                    paper_bgcolor: "#0a0a1a",
                    plot_bgcolor: "#0a0a1a",
                    font: { color: "#e8e8f0" },
                    xaxis: {
                        title: { text: "Pixel X", font: { color: "#00d4ff", size: 13 }, standoff: 10 },
                        showgrid: false,
                        tickfont: { color: "#999", size: 10 },
                    },
                    yaxis: {
                        title: { text: "Pixel Y", font: { color: "#00d4ff", size: 13 }, standoff: 10 },
                        showgrid: false,
                        scaleanchor: "x",
                        tickfont: { color: "#999", size: 10 },
                    },
                    margin: { t: 20, r: 30, b: 60, l: 60 },
                    autosize: true,
                    shapes: shapes as any,
                    annotations: annotations as any,
                    showlegend: false,
                }}
                config={{ responsive: true, displaylogo: false, displayModeBar: true }}
                style={{ width: "100%", height: "480px" }}
            />

            {/* Selected defect detail card */}
            {selectedDefect && (
                <div className="mt-4 p-4 rounded-xl border border-white/10 bg-[#0f0f2a] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-white text-base">{selectedDefect.type}</h4>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedDefect.description}</p>
                        </div>
                        <button
                            onClick={() => setSelectedDefect(null)}
                            className="text-white/40 hover:text-white transition-colors cursor-pointer text-sm"
                        >✕</button>
                    </div>
                </div>
            )}

            {/* Defect cards grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleDefects.slice(0, 9).map((d) => {
                    const colors = DEFECT_COLORS[d.type] || DEFECT_COLORS["Cosmic String"];
                    return (
                        <button
                            key={d.id}
                            onClick={() => setSelectedDefect(selectedDefect?.id === d.id ? null : d)}
                            onMouseEnter={() => setHoveredDefect(d.id)}
                            onMouseLeave={() => setHoveredDefect(null)}
                            className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer group ${
                                selectedDefect?.id === d.id
                                    ? "border-white/30 bg-white/5"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.border }} />
                                    <span className="text-xs font-semibold text-white">{d.type.replace("Cosmic ", "")}</span>
                                </div>
                                <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: d.confidence > 0.7 ? "rgba(248,113,113,0.15)" : d.confidence > 0.4 ? "rgba(251,191,36,0.15)" : "rgba(74,222,128,0.15)",
                                        color: d.confidence > 0.7 ? "#f87171" : d.confidence > 0.4 ? "#fbbf24" : "#4ade80",
                                    }}
                                >
                                    {(d.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <div>
                                    <span className="text-white/40">Persist.</span>{" "}
                                    <span className="text-white/80 font-mono">{d.persistence.toFixed(4)}</span>
                                </div>
                                <div>
                                    <span className="text-white/40">H{d.dimension}</span>{" "}
                                    <span className="text-white/80">{d.dimension === 0 ? "Component" : "Loop"}</span>
                                </div>
                                <div>
                                    <span className="text-white/40">Location</span>{" "}
                                    <span className="text-white/80 font-mono">({d.center.col},{d.center.row})</span>
                                </div>
                                <div>
                                    <span className="text-white/40">Points</span>{" "}
                                    <span className="text-white/80">{d.n_generator_points}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Explainer */}
            <div className="mt-4">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center gap-2 text-sm font-medium text-[#00d4ff] hover:text-[#33dfff] transition-colors cursor-pointer"
                >
                    <span className={`transform transition-transform duration-200 ${showInfo ? "rotate-90" : ""}`}>▶</span>
                    How defect detection works
                </button>
                {showInfo && (
                    <div className="mt-3 p-4 rounded-lg bg-[#0f0f2a] border border-[#1a1a3e] text-sm text-[#c8c8e0] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p><strong className="text-white">🔬 Topological Defects & TDA:</strong></p>
                        <p>
                            In theoretical cosmology, as the early universe cooled, it underwent phase transitions (similar to water freezing into ice). 
                            These transitions may have formed "cracks" and "knots" in the fabric of spacetime, known as <strong>Topological Defects</strong>.
                            This overlay reverse-engineers the TDA persistence pairs to find the exact pixels that caused these anomalies.
                        </p>
                        <ul className="list-none space-y-3 ml-1">
                            <li className="flex items-start gap-2">
                                <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#00d4ff" }} />
                                <div>
                                    <strong className="text-[#00d4ff]">Cosmic Strings (1-Dimensional):</strong> 
                                    <p className="text-xs mt-0.5 text-[#999]">Infinitely long, microscopic cracks in spacetime predicted by string theory and GUTs. In TDA, they are detected via specific elongated <strong className="text-white">H₁ (loop)</strong> patterns, as they create loop-like temperature discontinuities in the CMB.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#c084fc" }} />
                                <div>
                                    <strong className="text-[#c084fc]">Cosmic Textures (3-Dimensional):</strong>
                                    <p className="text-xs mt-0.5 text-[#999]">Complex "knots" in space-time that collapse, leaving massive localized hot/cold spots (like the famous CMB Cold Spot). In TDA, they appear as dense, highly persistent <strong className="text-white">H₀ (component)</strong> islands.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#fbbf24" }} />
                                <div>
                                    <strong className="text-[#fbbf24]">Magnetic Monopoles (0-Dimensional):</strong>
                                    <p className="text-xs mt-0.5 text-[#999]">Point-like singularities predicted by almost all Grand Unified Theories. In TDA, they are detected as extreme, isolated <strong className="text-white">H₀ (component)</strong> spikes occupying a tiny spatial footprint.</p>
                                </div>
                            </li>
                        </ul>
                        <p className="text-xs text-[#888] mt-2 border-t border-white/10 pt-2">
                            💡 Confidence scores are computed from persistence relative to the noise floor and deviation from the Gaussian null hypothesis.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
