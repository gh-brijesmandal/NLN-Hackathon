import { useEffect, useState } from "react";

export function NotFound() {
  const [glitch, setGlitch] = useState(false);
  const [floatY, setFloatY] = useState(0);

  useEffect(() => {
    // Glitch effect interval
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000);

    // Float animation via JS for smooth loop
    let frame: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      setFloatY(Math.sin(t * 1.2) * 12);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      clearInterval(glitchInterval);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div style={styles.root}>
      {/* Scanline overlay */}
      <div style={styles.scanlines} />

      {/* Noise grain overlay */}
      <div style={styles.grain} />

      {/* Ambient glow blobs */}
      <div style={{ ...styles.blob, ...styles.blobTeal }} />
      <div style={{ ...styles.blob, ...styles.blobGreen }} />

      <div style={styles.container}>
        {/* Ghost SVG */}
        <div
          style={{
            ...styles.ghostWrapper,
            transform: `translateY(${floatY}px)`,
          }}
        >
          <svg
            width="160"
            height="180"
            viewBox="0 0 160 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={styles.ghostSvg}
          >
            {/* Ghost glow filter */}
            <defs>
              <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="softglow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ghost body */}
            <path
              d="M80 10 C40 10 18 42 18 80 L18 148 L32 136 L46 148 L60 136 L74 148 L80 140 L86 148 L100 136 L114 148 L128 136 L142 148 L142 80 C142 42 120 10 80 10Z"
              fill="#1a2a2a"
              stroke="#2fffcf"
              strokeWidth="2"
              filter="url(#glow)"
              opacity="0.95"
            />

            {/* Ghost inner highlight */}
            <path
              d="M80 22 C50 22 30 48 30 80 L30 130 L80 130 L130 130 L130 80 C130 48 110 22 80 22Z"
              fill="#0f1e1e"
              opacity="0.5"
            />

            {/* Left eye */}
            <ellipse cx="60" cy="78" rx="12" ry="14" fill="#2fffcf" filter="url(#softglow)" />
            <ellipse cx="60" cy="78" rx="6" ry="7" fill="#0a1414" />
            <ellipse cx="57" cy="75" rx="2" ry="2" fill="#2fffcf" opacity="0.8" />

            {/* Right eye */}
            <ellipse cx="100" cy="78" rx="12" ry="14" fill="#2fffcf" filter="url(#softglow)" />
            <ellipse cx="100" cy="78" rx="6" ry="7" fill="#0a1414" />
            <ellipse cx="97" cy="75" rx="2" ry="2" fill="#2fffcf" opacity="0.8" />

            {/* Wavy bottom */}
            <path
              d="M18 148 Q25 138 32 148 Q39 158 46 148 Q53 138 60 148 Q67 158 74 148 Q77 143 80 140 Q83 143 86 148 Q93 158 100 148 Q107 138 114 148 Q121 158 128 148 Q135 138 142 148"
              stroke="#2fffcf"
              strokeWidth="2"
              fill="none"
              filter="url(#softglow)"
            />

            {/* Ghost tag */}
            <rect x="52" y="105" width="56" height="20" rx="4" fill="#0f2e2e" stroke="#2fffcf" strokeWidth="1" opacity="0.8" />
            <text x="80" y="119" textAnchor="middle" fill="#2fffcf" fontSize="9" fontFamily="monospace" letterSpacing="1">GHOSTED</text>
          </svg>
        </div>

        {/* 404 heading with glitch */}
        <div style={styles.errorCodeWrapper}>
          <span
            style={{
              ...styles.errorCode,
              ...(glitch ? styles.errorCodeGlitch : {}),
            }}
            data-text="404"
          >
            404
          </span>
        </div>

        <p style={styles.title}>Page not found</p>

        <p style={styles.subtitle}>
          Looks like this page got{" "}
          <span style={styles.ghostedBadge}>ghosted</span>
          . It applied, but never heard back.
        </p>

        <div style={styles.divider} />

        <div style={styles.actions}>
          <a href="/" style={styles.primaryBtn}>
            ← Back to Dashboard
          </a>
          <a href="/applications" style={styles.secondaryBtn}>
            View Applications
          </a>
        </div>

        <p style={styles.footer}>
          GhostTracker · tracking the silence since 2024
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 2%); }
          30% { transform: translate(-1%, 4%); }
          40% { transform: translate(2%, -1%); }
          50% { transform: translate(-3%, 1%); }
          60% { transform: translate(1%, 3%); }
          70% { transform: translate(-2%, -2%); }
          80% { transform: translate(3%, -3%); }
          90% { transform: translate(-1%, 2%); }
        }

        @keyframes glitch {
          0% { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
          10% { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
          20% { clip-path: inset(60% 0 20% 0); transform: translate(-3px, 0); }
          30% { clip-path: inset(80% 0 5% 0); transform: translate(3px, 0); }
          100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
        }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(47, 255, 207, 0.3); }
          50% { border-color: rgba(47, 255, 207, 0.8); }
        }

        .ghost-btn-primary:hover {
          background: rgba(47, 255, 207, 0.15) !important;
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(47, 255, 207, 0.3) !important;
        }

        .ghost-btn-secondary:hover {
          background: rgba(47, 255, 207, 0.06) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#0b1414",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Space Mono', monospace",
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  grain: {
    position: "absolute",
    inset: "-50%",
    width: "200%",
    height: "200%",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
    opacity: 0.04,
    animation: "grain 0.5s steps(1) infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blobTeal: {
    width: 400,
    height: 400,
    background: "rgba(47, 255, 207, 0.06)",
    top: "-100px",
    right: "-80px",
  },
  blobGreen: {
    width: 300,
    height: 300,
    background: "rgba(16, 200, 120, 0.05)",
    bottom: "-60px",
    left: "-60px",
  },
  container: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "48px 32px",
    maxWidth: 520,
    width: "100%",
  },
  ghostWrapper: {
    marginBottom: 16,
    transition: "transform 0.05s linear",
    willChange: "transform",
  },
  ghostSvg: {
    filter: "drop-shadow(0 0 24px rgba(47, 255, 207, 0.35))",
  },
  errorCodeWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  errorCode: {
    fontSize: "clamp(88px, 16vw, 128px)",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    color: "#2fffcf",
    letterSpacing: "-4px",
    lineHeight: 1,
    textShadow: "0 0 40px rgba(47, 255, 207, 0.5), 0 0 80px rgba(47, 255, 207, 0.2)",
    display: "block",
    position: "relative",
  },
  errorCodeGlitch: {
    animation: "glitch 0.15s steps(1) forwards",
    color: "#fff",
    textShadow: "3px 0 #2fffcf, -3px 0 #ff2f7a",
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    color: "#e0f5ef",
    margin: "4px 0 12px",
    letterSpacing: "0.02em",
  },
  subtitle: {
    fontSize: 14,
    color: "#5a7a72",
    lineHeight: 1.7,
    margin: "0 0 28px",
    maxWidth: 360,
  },
  ghostedBadge: {
    display: "inline-block",
    background: "rgba(47, 255, 207, 0.08)",
    border: "1px solid rgba(47, 255, 207, 0.3)",
    color: "#2fffcf",
    borderRadius: 4,
    padding: "1px 7px",
    fontSize: 12,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.05em",
    animation: "pulse-border 2.5s ease-in-out infinite",
  },
  divider: {
    width: 48,
    height: 1,
    background: "rgba(47, 255, 207, 0.2)",
    marginBottom: 28,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 40,
  },
  primaryBtn: {
    display: "inline-block",
    padding: "11px 24px",
    background: "rgba(47, 255, 207, 0.08)",
    border: "1px solid rgba(47, 255, 207, 0.5)",
    color: "#2fffcf",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.03em",
  } as React.CSSProperties,
  secondaryBtn: {
    display: "inline-block",
    padding: "11px 24px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#4a6a62",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.03em",
  } as React.CSSProperties,
  footer: {
    fontSize: 11,
    color: "#2a3e3a",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "'Space Mono', monospace",
  },
};
