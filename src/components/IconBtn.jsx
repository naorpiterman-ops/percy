import React from 'react';
import { colors, radius, spacing } from '../styles/theme';

export default function IconBtn({
  icon,
  onClick,
  variant = 'secondary',
  disabled = false,
  title = '',
  style = {},
  ...props
}) {
  const size = 36;

  const variants = {
    primary: {
      background: colors.primary,
      color: colors.bg,
    },
    secondary: {
      background: colors.fill1,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
    },
  };

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    borderRadius: radius.md,
    border: variants[variant].border || 'none',
    background: variants[variant].background,
    color: variants[variant].color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontSize: 18,
    lineHeight: 1,
    transition: 'all 0.2s ease',
    padding: 0,
    ...style,
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {icon}
    </button>
  );
}
