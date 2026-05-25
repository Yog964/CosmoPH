"use client";
import { API_BASE } from "@/lib/api";

interface Props { jobId: string; }

export default function ExportPanel({ jobId }: Props) {
    const download = (format: string) => {
        if (format === "zip") {
            window.open(`${API_BASE}/api/export/${jobId}`, "_blank");
        } else if (format === "json") {
            window.open(`${API_BASE}/api/export/${jobId}/json`, "_blank");
        }
    };

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Export Results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "ZIP Bundle", icon: "📦", fmt: "zip", desc: "All plots + data" },
                    { label: "JSON Data", icon: "📋", fmt: "json", desc: "Raw results" },
                    { label: "PNG Plots", icon: "🖼️", fmt: "zip", desc: "All visualizations" },
                    { label: "CSV Data", icon: "📊", fmt: "zip", desc: "Numerical outputs" },
                ].map((item) => (
                    <button key={item.label} onClick={() => download(item.fmt)}
                        className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-cyan)] 
            hover:bg-[var(--accent-cyan)]/5 transition-all duration-200 text-center cursor-pointer">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
