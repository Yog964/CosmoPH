export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-[var(--text-secondary)] text-sm">
                        © 2026 <span className="gradient-text font-semibold">CosmoPH</span>. Topological Data Analysis for Cosmology.
                    </div>
                    <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
                        <a href="https://github.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
                        <a href="/docs" className="hover:text-white transition-colors">Documentation</a>
                        <a href="https://arxiv.org" target="_blank" rel="noopener" className="hover:text-white transition-colors">arXiv Paper</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
