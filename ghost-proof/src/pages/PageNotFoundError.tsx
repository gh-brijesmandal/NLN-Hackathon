import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function PageNotFoundError() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tick, setTick] = useState(true);
  const [glitch, setGlitch] = useState(false);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setTick(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Random glitch bursts
  useEffect(() => {
    function burst() {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
      setTimeout(burst, 2500 + Math.random() * 3000);
    }
    const id = setTimeout(burst, 1200);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] overflow-hidden select-none">

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        }}
      />

      {/* Radial glow behind everything */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,245,90,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Corner decoration — top-left */}
      <div className="absolute top-6 left-7 font-mono text-[11px] text-white/[0.12] leading-relaxed z-20">
        <div>GHOST-PROOF OS v1.0</div>
        <div>KERNEL: ghost-kernel-404</div>
      </div>

      {/* Corner decoration — top-right */}
      <div className="absolute top-6 right-7 font-mono text-[11px] text-white/[0.12] text-right z-20">
        <div>SYS: ROUTE_NOT_FOUND</div>
        <div>ERR: 0x00000404</div>
      </div>

      {/* Main content */}
      <div className={`relative z-20 flex flex-col items-center gap-0 transition-transform duration-75 ${glitch ? '[transform:translate(2px,-1px)]' : ''}`}>

        {/* Ghost SVG — pure CSS animated */}
        <div className="relative mb-2" style={{ animation: 'float 3.5s ease-in-out infinite' }}>
          <svg
            width="90" height="100" viewBox="0 0 90 100"
            className={`transition-all duration-75 ${glitch ? 'opacity-80' : 'opacity-100'}`}
          >
            {/* Ghost body */}
            <path
              d="M10 55 Q10 10 45 10 Q80 10 80 55 L80 90 Q70 80 60 90 Q50 80 45 90 Q40 80 30 90 Q20 80 10 90 Z"
              fill="none"
              stroke="#c8f55a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Eyes */}
            <circle cx="33" cy="48" r="5" fill="#c8f55a" opacity="0.9" />
            <circle cx="57" cy="48" r="5" fill="#c8f55a" opacity="0.9" />
            {/* Pupils */}
            <circle cx="35" cy="49" r="2" fill="#0a0a0f" />
            <circle cx="59" cy="49" r="2" fill="#0a0a0f" />
            {/* Glitch line when glitching */}
            {glitch && (
              <line x1="10" y1="55" x2="80" y2="55" stroke="#c8f55a" strokeWidth="1.5" opacity="0.4" />
            )}
          </svg>

          {/* Ghost glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(200,245,90,0.12) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
        </div>

        {/* 404 number */}
        <div
          className={`font-display font-black leading-none text-[#c8f55a] relative ${glitch ? '[filter:drop-shadow(3px_0_0_rgba(255,100,100,0.7))_drop-shadow(-3px_0_0_rgba(100,200,255,0.7))]' : ''}`}
          style={{ fontSize: 'clamp(80px, 18vw, 130px)', letterSpacing: '-0.04em' }}
        >
          404
        </div>

        {/* Subtitle */}
        <div className="font-display font-bold text-white/80 text-xl tracking-tight mt-1 mb-6">
          This route got ghosted.
        </div>

        {/* Terminal readout */}
        <div className="w-[420px] max-w-[90vw] bg-[#13131a] border border-white/[0.08] rounded-xl overflow-hidden mb-8">
          {/* Terminal title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.08] bg-[#0f0f16]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
            <span className="ml-2 text-[11px] font-mono text-white/30">ghost-proof — bash</span>
          </div>
          {/* Terminal body */}
          <div className="px-5 py-4 font-mono text-[12px] leading-relaxed space-y-1">
            <div className="text-white/30">$ navigate <span className="text-brand-accent">{location.pathname}</span></div>
            <div className="text-red-400">ERR  route_resolver: no match found</div>
            <div className="text-amber-400/80">WARN this page may have been ghosted</div>
            <div className="text-white/30">     or it never existed to begin with</div>
            <div className="flex items-center gap-1 text-[#c8f55a] mt-2">
              <span>$</span>
              <span className="opacity-60">suggest: </span>
              <span>cd /dashboard</span>
              <span
                className="inline-block w-[7px] h-[14px] bg-[#c8f55a] ml-0.5 align-middle"
                style={{ opacity: tick ? 1 : 0, transition: 'opacity 0.05s' }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#c8f55a] text-[#0a0a0f] text-[12px] font-mono font-semibold px-6 py-3 rounded-lg hover:opacity-88 active:scale-[0.97] transition-all"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-[12px] font-mono text-white/40 border border-white/[0.08] px-5 py-3 rounded-lg hover:border-white/[0.18] hover:text-white/70 active:scale-[0.97] transition-all"
          >
            Go back
          </button>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-[11px] font-mono text-white/20 text-center leading-relaxed">
          ghost probability: 100% &nbsp;·&nbsp; days since last seen: ∞ &nbsp;·&nbsp; action: archive
        </div>
      </div>

      {/* Bottom-right watermark */}
      <div className="absolute bottom-6 right-7 font-mono text-[10px] text-white/[0.08] z-20">
        GHOST-PROOF / ERR_ROUTE_NOT_FOUND
      </div>

      {/* Float + glitch keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @font-face {}
      `}</style>
    </div>
  );
}