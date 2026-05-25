"use client";

interface Props {
    status: string;
    progress?: number;
    message?: string;
}

export default function JobStatus({ status, progress = 0, message = "" }: Props) {
    const statusColors: Record<string, string> = {
        pending: "badge-pending",
        running: "badge-running",
        completed: "badge-completed",
        failed: "badge-failed",
    };

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Job Status</h3>
                <span className={`badge ${statusColors[status] || "badge-pending"}`}>{status}</span>
            </div>

            {status === "running" && (
                <div className="mb-3">
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
                            }}
                        />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{progress.toFixed(0)}% complete</p>
                </div>
            )}

            {message && <p className="text-sm text-[var(--text-secondary)]">{message}</p>}

            {status === "running" && (
                <div className="flex items-center gap-2 mt-3 text-[var(--accent-cyan)]">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Processing...</span>
                </div>
            )}
        </div>
    );
}
