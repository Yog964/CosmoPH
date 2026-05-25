import Link from "next/link";

export default function Home() {
  const features = [
    { icon: "🛰️", title: "Upload CMB Maps", desc: "Upload HEALPix FITS maps or select from pre-loaded Planck datasets" },
    { icon: "⚙️", title: "Preprocessing", desc: "Interactive masking, patch extraction, normalization, and wavelet filtering" },
    { icon: "🔬", title: "Persistent Homology", desc: "Compute persistence diagrams, Betti curves, and persistence images" },
    { icon: "📊", title: "Gaussianity Tests", desc: "Compare real CMB against Gaussian null via Wasserstein distance" },
    { icon: "🤖", title: "ML Classification", desc: "Classify inflation models: single-field, multi-field, non-Bunch-Davies" },
    { icon: "📦", title: "Export Results", desc: "Download plots, CSV data, JSON results, and ZIP bundles" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-20 md:py-32 text-center animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/5 text-[var(--accent-cyan)] text-sm font-medium mb-6">
          ✦ Topological Data Analysis for Cosmology
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <span className="gradient-text">Cosmo</span>PH
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-10 leading-relaxed">
          Detect primordial non-Gaussianity in Cosmic Microwave Background maps through{" "}
          <span className="text-white font-medium">persistent homology</span> — right in your browser.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/upload" className="btn-primary text-lg px-8 py-4">
            📁 Upload Data
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
          End-to-End <span className="gradient-text">TDA Pipeline</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
          How It <span className="gradient-text">Works</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {[
            { step: "01", title: "Upload or Select", desc: "Choose a pre-loaded Planck CMB patch or upload your own FITS map." },
            { step: "02", title: "Configure & Preprocess", desc: "Apply masks, select patch region, set scale, and normalize." },
            { step: "03", title: "Compute Topology", desc: "Run persistent homology to extract topological features (H₀, H₁)." },
            { step: "04", title: "Analyze & Export", desc: "Visualize results, compare with Gaussian null, and export everything." },
          ].map((s, i) => (
            <div key={i} className="glass-card flex-1 text-center">
              <div className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.step}</div>
              <h4 className="font-semibold mb-1">{s.title}</h4>
              <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="glass-card max-w-2xl mx-auto animate-pulse-glow">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Ready to explore the early universe?</h2>
          <p className="text-[var(--text-secondary)] mb-6">No installation needed. Run TDA on CMB maps directly in your browser.</p>
          <Link href="/upload" className="btn-primary">Start Exploring →</Link>
        </div>
      </section>
    </div>
  );
}
