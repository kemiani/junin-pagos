export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div 
        className="absolute bottom-1/3 -right-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-3xl" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern" />
    </div>
  );
}
