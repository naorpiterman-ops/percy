import React from 'react';
import { colors, typography, radius, spacing } from '../styles/theme';

export default function Chip({
  label,
  isActive = false,
  onClick,
  icon = null,
  style = {},
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: `${spacing[1]} ${spacing[3]}`,
    borderRadius: radius.pill,
    border: `1px solid ${isActive ? colors.primary : colors.border}`,
    background: isActive ? colors.primaryGlow : colors.fill1,
    color: isActive ? colors.primary : colors.textSecondary,
    fontSize: typography.bodySm.fontSize,
    fontWeight: 500,
    fontFamily: typography.bodySm.fontFamily,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
