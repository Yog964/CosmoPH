"use client";
import { useState } from "react";

interface DefectSummary {
    total_defects: number;
    by_type: Record<string, { count: number; avg_confidence: number; max_persistence: number }>;
    max_confidence: number;
    mean_confidence: number;
    most_significant?: {
        type: string;
        confidence: number;
        persistence: number;
        location: { row: number; col: number };
    };
    error?: string;
}

interface Defect {
    id: string;
    type: string;
    dimension: number;
    persistence: number;
    confidence: number;
    center: { row: number; col: number };
    bounding_box: { x_min: number; y_min: number; x_max: number; y_max: number; width: number; height: number };
    description: string;
}

interface Props {
    defectData: {
        defects: Defect[];
        summary: DefectSummary;
    } | null;
}

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
    "Cosmic String":   { icon: "〰️", color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
    "Cosmic Texture":  { icon: "🌀", color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
    "Cosmic Monopole": { icon: "⚡", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
};

export default function DefectSummaryPanel({ defectData }: Props) {
    const [expanded, setExpanded] = useState(false);

    if (!defectData || !defectData.defects || defectData.defects.length === 0) return null;

    const { summary, defects } = defectData;

    // Confidence level label
    const overallConfidence = summary.max_confidence;
    const confLabel = overallConfidence > 0.7 ? "High" : overallConfidence > 0.4 ? "Moderate" : "Low";
    const confColor = overallConfidence > 0.7 ? "#f87171" : overallConfidence > 0.4 ? "#fbbf24" : "#4ade80";

    return (
        <div className="glass-card" id="defect-summary-panel">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-lg">
                        🛰️
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold gradient-text">Anomaly Classification Report</h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Theoretical cosmic defects identified from TDA signatures
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-center bg-[#050510] py-2 px-4 rounded-lg border border-white/10">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-0.5">Anomalies</span>
                        <span className="text-xl font-bold text-white">{summary.total_defects}</span>
                    </div>
                    <div className="text-center bg-[#050510] py-2 px-4 rounded-lg border border-white/10">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-0.5">Peak Confidence</span>
                        <span className="text-xl font-bold" style={{ color: confColor }}>{(overallConfidence * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Type breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {Object.entries(summary.by_type).map(([type, stats]) => {
                    const meta = TYPE_ICONS[type] || TYPE_ICONS["Cosmic String"];
                    return (
                        <div
                            key={type}
                            className="p-4 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/15"
                            style={{ background: meta.bg }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{meta.icon}</span>
                                <h4 className="font-semibold text-sm" style={{ color: meta.color }}>{type}</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/50">Detected</span>
                                    <span className="text-white font-bold">{stats.count}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/50">Avg Confidence</span>
                                    <span className="text-white font-mono">{(stats.avg_confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/50">Max Persistence</span>
                                    <span className="text-white font-mono">{stats.max_persistence.toFixed(4)}</span>
                                </div>
                                {/* Confidence bar */}
                                <div className="w-full h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${stats.avg_confidence * 100}%`,
                                            backgroundColor: meta.color,
                                            boxShadow: `0 0 8px ${meta.color}`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Most significant defect highlight */}
            {summary.most_significant && (
                <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs uppercase tracking-widest font-bold text-white/50">Most Significant Anomaly</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{(TYPE_ICONS[summary.most_significant.type] || TYPE_ICONS["Cosmic String"]).icon}</span>
                            <span className="font-bold text-white text-base">{summary.most_significant.type}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                            <div>
                                <span className="text-white/40">Confidence </span>
                                <span className="font-bold" style={{ color: confColor }}>
                                    {(summary.most_significant.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40">Persistence </span>
                                <span className="font-mono text-white">{summary.most_significant.persistence.toFixed(4)}</span>
                            </div>
                            <div>
                                <span className="text-white/40">Location </span>
                                <span className="font-mono text-white">
                                    ({summary.most_significant.location.col}, {summary.most_significant.location.row})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expandable full defect list */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm font-medium text-[#00d4ff] hover:text-[#33dfff] transition-colors cursor-pointer"
            >
                <span className={`transform transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>▶</span>
                {expanded ? "Hide" : "Show"} full defect table ({defects.length} entries)
            </button>

            {expanded && (
                <div className="mt-4 overflow-x-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="text-[10px] text-white/50 uppercase bg-white/[0.03] border border-white/5">
                            <tr>
                                <th className="px-4 py-3 border border-white/5">#</th>
                                <th className="px-4 py-3 border border-white/5">Type</th>
                                <th className="px-4 py-3 border border-white/5">Dim</th>
                                <th className="px-4 py-3 border border-white/5">Persistence</th>
                                <th className="px-4 py-3 border border-white/5">Confidence</th>
                                <th className="px-4 py-3 border border-white/5">Location (x, y)</th>
                                <th className="px-4 py-3 border border-white/5">Bbox Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {defects.map((d, i) => {
                                const meta = TYPE_ICONS[d.type] || TYPE_ICONS["Cosmic String"];
                                return (
                                    <tr key={d.id} className="border border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-2.5 text-white/40 font-mono">{i + 1}</td>
                                        <td className="px-4 py-2.5">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                                                <span style={{ color: meta.color }} className="font-medium">{d.type.replace("Cosmic ", "")}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-white/70 font-mono">H{d.dimension}</td>
                                        <td className="px-4 py-2.5 text-white font-mono">{d.persistence.toFixed(4)}</td>
                                        <td className="px-4 py-2.5">
                                            <span
                                                className="font-bold"
                                                style={{ color: d.confidence > 0.7 ? "#f87171" : d.confidence > 0.4 ? "#fbbf24" : "#4ade80" }}
                                            >
                                                {(d.confidence * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-white/70 font-mono">({d.center.col}, {d.center.row})</td>
                                        <td className="px-4 py-2.5 text-white/70 font-mono">{d.bounding_box.width}×{d.bounding_box.height}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
