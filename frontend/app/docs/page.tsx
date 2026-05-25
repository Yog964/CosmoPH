export default function DocsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="gradient-text">Documentation</span>
            </h1>

            <div className="space-y-8">
                {/* TDA Overview */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">What is Topological Data Analysis?</h2>
                    <p className="text-[var(--text-secondary)] mb-3">
                        Topological Data Analysis (TDA) uses algebraic topology to study the &quot;shape&quot; of data.
                        Unlike traditional statistics that focus on individual points, TDA captures global geometric
                        and topological features—connected components, loops, voids—that persist across multiple scales.
                    </p>
                    <p className="text-[var(--text-secondary)]">
                        The key tool is <strong className="text-white">persistent homology</strong>, which tracks how
                        topological features appear (are &quot;born&quot;) and disappear (&quot;die&quot;) as we vary a scale parameter.
                    </p>
                </div>

                {/* Persistence Diagrams */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">📊 Persistence Diagrams</h2>
                    <p className="text-[var(--text-secondary)] mb-3">
                        A persistence diagram is a scatter plot where each point represents a topological feature:
                    </p>
                    <ul className="text-[var(--text-secondary)] list-disc list-inside space-y-1 ml-4">
                        <li><strong className="text-[var(--accent-cyan)]">x-axis (Birth)</strong>: The scale at which the feature first appears</li>
                        <li><strong className="text-[var(--accent-cyan)]">y-axis (Death)</strong>: The scale at which the feature disappears</li>
                        <li><strong className="text-[var(--accent-cyan)]">H₀</strong>: Connected components (clusters)</li>
                        <li><strong className="text-[var(--accent-cyan)]">H₁</strong>: Loops/holes in the data</li>
                    </ul>
                    <p className="text-[var(--text-secondary)] mt-3">
                        Points far from the diagonal represent persistent (significant) features.
                        Points near the diagonal are topological noise.
                    </p>
                </div>

                {/* Betti Curves */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">📈 Betti Curves</h2>
                    <p className="text-[var(--text-secondary)]">
                        Betti curves show how the number of topological features changes with the filtration threshold.
                        β₀(ε) counts connected components at scale ε, β₁(ε) counts loops.
                        Comparing Betti curves between real CMB and Gaussian simulations reveals non-Gaussian topology.
                    </p>
                </div>

                {/* CMB + Non-Gaussianity */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">🌌 CMB Non-Gaussianity</h2>
                    <p className="text-[var(--text-secondary)] mb-3">
                        The Cosmic Microwave Background (CMB) is the oldest light in the universe (~380,000 years after the Big Bang).
                        Standard inflation predicts the CMB is nearly Gaussian, but different inflation models produce
                        different levels of <strong className="text-white">non-Gaussianity</strong> characterized by the parameter <strong className="text-white">f_NL</strong>.
                    </p>
                    <p className="text-[var(--text-secondary)]">
                        CosmoPH uses TDA to detect subtle topological signatures that traditional methods (bispectrum, Minkowski functionals) might miss.
                    </p>
                </div>

                {/* Wasserstein Distance */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">📐 Wasserstein Distance</h2>
                    <p className="text-[var(--text-secondary)]">
                        The Wasserstein distance measures how different two persistence diagrams are.
                        We compare the real CMB diagram against several Gaussian random field diagrams.
                        A large Wasserstein distance suggests the CMB patch has non-Gaussian topological features.
                    </p>
                </div>

                {/* API Reference */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">🔌 API Endpoints</h2>
                    <div className="space-y-2 font-mono text-sm">
                        {[
                            ["GET", "/health", "Server health check"],
                            ["GET", "/api/datasets", "List available datasets"],
                            ["POST", "/api/upload", "Upload a FITS file"],
                            ["POST", "/api/preprocess", "Start preprocessing"],
                            ["POST", "/api/compute-tda", "Run TDA computation"],
                            ["GET", "/api/results/{job_id}", "Get results"],
                            ["GET", "/api/export/{job_id}", "Download results ZIP"],
                            ["POST", "/api/demo", "Run demo pipeline"],
                        ].map(([method, path, desc], i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                                <span className={`badge ${method === "GET" ? "badge-completed" : "badge-running"}`}>{method}</span>
                                <code className="text-[var(--accent-cyan)]">{path}</code>
                                <span className="text-[var(--text-secondary)]">— {desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Start */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-4">🚀 Quick Start</h2>
                    <ol className="text-[var(--text-secondary)] list-decimal list-inside space-y-2 ml-4">
                        <li>Go to the <strong className="text-white">Demo</strong> page for a one-click experience</li>
                        <li>Or <strong className="text-white">Upload</strong> a FITS map / select a sample dataset</li>
                        <li>Configure preprocessing (mask, patch size, filter)</li>
                        <li>Run TDA analysis to get persistence diagrams + Betti curves</li>
                        <li>Compare against Gaussian null hypothesis</li>
                        <li>Export results as ZIP (PNG + CSV + JSON)</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
