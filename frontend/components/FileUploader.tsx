"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/lib/api";

interface Props {
    onUploadComplete: (data: { dataset_id: string; filename: string }) => void;
}

export default function FileUploader({ onUploadComplete }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const onDrop = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);
        setError("");
        try {
            const result = await uploadFile(files[0]);
            onUploadComplete(result);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/fits": [".fits", ".fit", ".fts"], "application/octet-stream": [".npy", ".npz"] },
        maxFiles: 1,
        maxSize: 500 * 1024 * 1024,
    });

    return (
        <div className="glass-card">
            <div {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5" : "border-[var(--border)] hover:border-[var(--accent-purple)]"}
          ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <input {...getInputProps()} id="file-upload-input" />
                <div className="text-4xl mb-4">{isDragActive ? "📡" : "🛰️"}</div>
                <p className="text-lg font-medium mb-2">
                    {isDragActive ? "Drop your CMB map here..." : uploading ? "Uploading..." : "Drag & drop a FITS map here"}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                    or click to browse • Supports .fits, .npy, .npz • Max 500MB
                </p>
            </div>
            {error && (
                <div className="mt-4 p-3 rounded-lg bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 text-[var(--accent-red)] text-sm">
                    ⚠ {error}
                </div>
            )}
        </div>
    );
}
