"use client";

/** Fixed depth layer: slow blobs + vignette — sits behind scroll content */
export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,107,255,0.14),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e18]/90 via-[#050508] to-[#020203]" />

      <div
        className="animate-float-slow absolute -left-[20%] top-[15%] h-[min(90vw,420px)] w-[min(90vw,420px)] rounded-full bg-[#2D6BFF]/18 blur-[100px]"
      />
      <div
        className="animate-float-slow-alt absolute -right-[15%] top-[40%] h-[min(70vw,340px)] w-[min(70vw,340px)] rounded-full bg-[#1e3a8a]/30 blur-[90px]"
      />
      <div className="absolute bottom-0 left-1/2 h-[40vh] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(45,107,255,0.08),transparent_70%)]" />

      <div className="grain-overlay fixed inset-0 opacity-[0.055]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
