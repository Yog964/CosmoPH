"use client";
import { useEffect, useState } from "react";
import { fetchDatasets } from "@/lib/api";

interface Dataset {
    id: string; name: string; filename: string; category: string;
    description: string; is_available: boolean; file_size_mb: number | null;
}
interface Props { onSelect: (id: string) => void; selected: string; }

export default function DatasetSelector({ onSelect, selected }: Props) {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDatasets().then((d) => { setDatasets(d.datasets || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="glass-card"><div className="skeleton h-32" /></div>;

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4">Select Dataset</h3>
            <div className="space-y-2">
                {datasets.map((ds) => (
                    <button key={ds.id} onClick={() => ds.is_available && onSelect(ds.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200
              ${selected === ds.id ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5" : "border-[var(--border)] hover:border-[var(--accent-purple)]"}
              ${!ds.is_available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{ds.name}</span>
                            <span className={`badge ${ds.is_available ? "badge-completed" : "badge-pending"}`}>
                                {ds.is_available ? "Available" : "Download needed"}
                            </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{ds.description}</p>
                        {ds.file_size_mb && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{ds.file_size_mb} MB</p>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
