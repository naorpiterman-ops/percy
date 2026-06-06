import React from 'react';
import { colors, typography, spacing } from '../styles/theme';

export default function Tab({
  label,
  isActive = false,
  onClick,
  icon = null,
  style = {},
  ...props
}) {
  const baseStyle = {
    flex: 1,
    padding: `${spacing[2]} ${spacing[3]}`,
    borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`,
    background: 'transparent',
    color: isActive ? colors.primary : colors.textSecondary,
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    border: 'none',
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
