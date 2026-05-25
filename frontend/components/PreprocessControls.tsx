"use client";
import { useState } from "react";

interface Config {
    apply_mask: boolean; mask_type: string; patch_size: number;
    patch_center_lon: number; patch_center_lat: number;
    normalize: boolean; apply_filter: boolean; filter_scale: number;
    target_nside: number;
}
interface Props { onConfigChange: (config: Config) => void; initialConfig?: Partial<Config>; selectedDataset?: string; }

export default function PreprocessControls({ onConfigChange, initialConfig, selectedDataset }: Props) {
    const [config, setConfig] = useState<Config>({
        apply_mask: initialConfig?.apply_mask ?? true, 
        mask_type: initialConfig?.mask_type ?? "galactic", 
        patch_size: initialConfig?.patch_size ?? 64,
        patch_center_lon: initialConfig?.patch_center_lon ?? 0, 
        patch_center_lat: initialConfig?.patch_center_lat ?? 90,
        normalize: initialConfig?.normalize ?? true, 
        apply_filter: initialConfig?.apply_filter ?? false, 
        filter_scale: initialConfig?.filter_scale ?? 1.0, 
        target_nside: initialConfig?.target_nside ?? 64,
    });

    const update = (key: string, val: unknown) => {
        const next = { ...config, [key]: val };
        setConfig(next);
        onConfigChange(next);
    };

    return (
        <div className="glass-card space-y-5">
            <h3 className="text-lg font-semibold gradient-text">Preprocessing Controls</h3>

            {/* Masking */}
            <div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" checked={config.apply_mask} onChange={(e) => update("apply_mask", e.target.checked)}
                        className="w-4 h-4 accent-[var(--accent-cyan)]" />
                    <span className="text-sm font-medium">Apply Mask</span>
                </label>
                {config.apply_mask && (
                    <select value={config.mask_type} onChange={(e) => update("mask_type", e.target.value)} className="input-field">
                        <option value="galactic">Galactic Plane</option>
                        <option value="point_source">Point Sources</option>
                    </select>
                )}
            </div>

            {/* Patch Size */}
            <div>
                <label className="text-sm font-medium block mb-2">Patch Size: {config.patch_size}px</label>
                <input type="range" min={16} max={256} step={16} value={config.patch_size}
                    onChange={(e) => update("patch_size", parseInt(e.target.value))} className="w-full" />
            </div>

            {/* Center coordinates */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium block mb-1">Longitude</label>
                    <input type="number" value={config.patch_center_lon}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) update("patch_center_lon", v); }} className="input-field" />
                </div>
                <div>
                    <label className="text-sm font-medium block mb-1">Latitude</label>
                    <input type="number" value={config.patch_center_lat}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) update("patch_center_lat", v); }} className="input-field" />
                </div>
            </div>

            {/* Normalization */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.normalize} onChange={(e) => update("normalize", e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent-cyan)]" />
                <span className="text-sm font-medium">Normalize (z-score)</span>
            </label>

            {/* Filter */}
            <div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" checked={config.apply_filter} onChange={(e) => update("apply_filter", e.target.checked)}
                        className="w-4 h-4 accent-[var(--accent-cyan)]" />
                    <span className="text-sm font-medium">Wavelet Filter</span>
                </label>
                {config.apply_filter && (
                    <div>
                        <label className="text-xs text-[var(--text-secondary)] block mb-1">Scale: {config.filter_scale.toFixed(1)}</label>
                        <input type="range" min={0.1} max={5.0} step={0.1} value={config.filter_scale}
                            onChange={(e) => update("filter_scale", parseFloat(e.target.value))} className="w-full" />
                    </div>
                )}
            </div>
        </div>
    );
}
