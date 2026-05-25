"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchDatasets } from "@/lib/api";

interface Job { job_id: string; status: string; job_type: string; created_at: string; }
interface Dataset { id: string; name: string; is_available: boolean; category: string; }

export default function DashboardPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);

    useEffect(() => {
        fetchDatasets().then((d) => setDatasets(d.datasets || [])).catch(() => { });
    }, []);

    const stats = [
        { label: "Datasets Available", value: datasets.filter(d => d.is_available).length, icon: "📡" },
        { label: "Sample Datasets", value: datasets.filter(d => d.category === "sample").length, icon: "🧪" },
        { label: "Pipeline Steps", value: 4, icon: "⚡" },
        { label: "Export Formats", value: 4, icon: "📦" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="gradient-text">Dashboard</span>
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                    <div key={i} className="glass-card text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-bold gradient-text">{s.value}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Link href="/upload" className="glass-card hover:border-[var(--accent-cyan)]/30 group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🛰️</div>
                    <h3 className="text-lg font-semibold mb-1">Upload / Select Data</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Upload a FITS map or choose a pre-loaded sample dataset</p>
                </Link>
                <Link href="/demo" className="glass-card hover:border-[var(--accent-purple)]/30 group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🚀</div>
                    <h3 className="text-lg font-semibold mb-1">Run Demo</h3>
                    <p className="text-sm text-[var(--text-secondary)]">One-click demo with synthetic data — no upload needed</p>
                </Link>
                <Link href="/docs" className="glass-card hover:border-[var(--accent-green)]/30 group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📖</div>
                    <h3 className="text-lg font-semibold mb-1">Documentation</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Learn about TDA, persistence diagrams, and Betti curves</p>
                </Link>
            </div>

            {/* Datasets */}
            <div className="glass-card">
                <h2 className="text-xl font-semibold mb-4">Available Datasets</h2>
                <div className="space-y-2">
                    {datasets.map((ds) => (
                        <div key={ds.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-sm">{ds.name}</span>
                            <span className={`badge ${ds.is_available ? "badge-completed" : "badge-pending"}`}>
                                {ds.is_available ? "Ready" : "Not downloaded"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
