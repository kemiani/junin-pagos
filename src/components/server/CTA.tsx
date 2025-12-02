export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-500" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Listo para empezar?
        </h2>
        <p className="text-cyan-100 text-lg mb-8">
          Unite a la red de pagos del interior
        </p>
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 bg-white text-cyan-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
        >
          Quiero sumarme
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
