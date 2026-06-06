import React from 'react';
import { colors, gradients } from '../styles/theme';

export default function PercyLogo({ variant = 'tile', size = 'md', animate = false }) {
  // variant: 'tile' (app icon), 'coin' (shekel coin), 'full' (coin + wordmark)
  // size: 'sm', 'md', 'lg'
  // animate: true for spinning coin animation

  const sizes = {
    xs: { tile: 40, coin: 40, fontSize: 16, wordSize: 20, gap: 8 },
    sm: { tile: 54, coin: 56, fontSize: 24, wordSize: 24, gap: 12 },
    md: { tile: 76, coin: 76, fontSize: 31, wordSize: 34, gap: 16 },
    lg: { tile: 96, coin: 96, fontSize: 40, wordSize: 44, gap: 20 },
  };

  const s = sizes[size];

  const tileStyle = {
    width: s.tile,
    height: s.tile,
    borderRadius: 22,
    background: gradients.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: colors.shadowGlow,
    color: '#fff',
    fontSize: size === 'sm' ? 24 : size === 'md' ? 32 : 42,
  };

  const coinStyle = {
    position: 'relative',
    width: s.coin,
    height: s.coin,
    borderRadius: '50%',
    background: gradients.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: colors.shadowGlow,
    flexShrink: 0,
    animation: animate ? 'spin 1.2s ease-in-out infinite' : 'none',
  };

  const rimStyle = {
    position: 'absolute',
    inset: 7,
    border: '1.6px dashed rgba(255,255,255,0.45)',
    borderRadius: '50%',
  };

  const notchStyle = {
    position: 'absolute',
    top: '50%',
    width: s.coin * 0.145,
    height: s.coin * 0.145,
    borderRadius: '50%',
    background: colors.bg,
    transform: 'translateY(-50%)',
  };

  const shekelStyle = {
    position: 'relative',
    color: '#fff',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: s.fontSize,
    fontWeight: 700,
    lineHeight: 1,
    transform: 'translateY(1px)',
  };

  const wordmarkStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const wordStyle = {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: s.wordSize,
    fontWeight: 800,
    color: colors.textPrimary,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  };

  // Spinning coin with shekel symbol
  const Coin = () => (
    <div style={coinStyle}>
      <style>{`
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
      <div style={rimStyle} />
      <span style={{ ...notchStyle, left: -s.coin * 0.07 }} />
      <span style={{ ...notchStyle, right: -s.coin * 0.07 }} />
      <span style={shekelStyle}>₪</span>
    </div>
  );

  // App icon tile (voucher/ticket mark - Lucide ticket icon)
  const Tile = () => (
    <div style={tileStyle}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size === 'sm' ? 28 : size === 'md' ? 40 : 52}
        height={size === 'sm' ? 28 : size === 'md' ? 40 : 52}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#fff' }}
      >
        <circle cx="6" cy="5" r="1" />
        <circle cx="6" cy="19" r="1" />
        <path d="M6 6v12" />
        <path d="M12 5h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-8" />
        <path d="M12 9h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-8" />
        <path d="M12 13h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-8" />
      </svg>
    </div>
  );

  if (variant === 'tile') return <Tile />;
  if (variant === 'coin') return <Coin />;

  // Full logo: coin + wordmark
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: s.gap,
    }}>
      <Coin />
      <div style={wordmarkStyle}>
        <div style={wordStyle}>Percy</div>
      </div>
    </div>
  );
}
