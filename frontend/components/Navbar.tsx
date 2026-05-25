"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5" style={{ background: "rgba(5,5,16,0.85)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                            style={{ background: "linear-gradient(135deg, #00d4ff, #8b5cf6)" }}>
                            ✦
                        </div>
                        <span className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            <span className="gradient-text">Cosmo</span>PH
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.href} href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${pathname === link.href
                                        ? "bg-white/10 text-[var(--accent-cyan)]"
                                        : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                                    }`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
                        {open ? "✕" : "☰"}
                    </button>
                </div>

                {/* Mobile nav */}
                {open && (
                    <div className="md:hidden pb-4 space-y-1">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                                className={`block px-4 py-2 rounded-lg text-sm ${pathname === link.href ? "bg-white/10 text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"}`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
