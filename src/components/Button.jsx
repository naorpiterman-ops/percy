import React from 'react';
import { colors, typography, radius, spacing, gradients } from '../styles/theme';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon = null,
  onClick,
  style = {},
  ...props
}) {
  const sizes = {
    sm: { padding: `${spacing[1]} ${spacing[3]}`, fontSize: typography.bodySm.fontSize },
    md: { padding: `${spacing[2]} ${spacing[4]}`, fontSize: typography.body.fontSize },
    lg: { padding: `${spacing[3]} ${spacing[5]}`, fontSize: typography.h4.fontSize },
  };

  const variants = {
    primary: {
      background: gradients.primary,
      color: colors.bg,
      border: 'none',
      boxShadow: colors.shadowGlow,
    },
    secondary: {
      background: colors.fill1,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      boxShadow: 'none',
    },
    danger: {
      background: colors.danger,
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
    },
  };

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    ...sizes[size],
    ...variants[variant],
    borderRadius: radius.md,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    fontFamily: typography.body.fontFamily,
    width: fullWidth ? '100%' : 'auto',
    border: variants[variant].border,
    ...style,
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = variants[variant].opacity || 0.8;
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.opacity = 1;
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
