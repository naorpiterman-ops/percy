// Spinning coin loader — Percy mascot
export default function SpinnerCoin({ size = 64 }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0A0A0F",
      gap: 20,
    }}>
      <style>{`
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes coinGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(199,206,234,0.4)); }
          50%       { filter: drop-shadow(0 0 18px rgba(199,206,234,0.8)); }
        }
      `}</style>
      <div style={{
        width: size,
        height: size,
        animation: "coinSpin 1.2s ease-in-out infinite, coinGlow 2s ease-in-out infinite",
        transformStyle: "preserve-3d",
        perspective: 400,
      }}>
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#C7CEEA" />
          <circle cx="32" cy="32" r="26" fill="#9FA8C7" />
          <circle cx="32" cy="32" r="22" fill="#C7CEEA" />
          {/* P letter for Percy */}
          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
            fontSize="22" fontWeight="800" fill="#0A0A0F" fontFamily="DM Sans, sans-serif">
            P
          </text>
          {/* Coin rim highlights */}
          <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <div style={{
        fontSize: 13,
        color: "#C7CEEA",
        fontWeight: 600,
        letterSpacing: "0.08em",
        fontFamily: "'DM Sans', sans-serif",
        opacity: 0.7,
      }}>
        PERCY
      </div>
    </div>
  );
}
