import React from 'react';
import { colors, typography, radius, spacing, statusConfig } from '../styles/theme';

export default function Badge({
  status = 'active',
  label,
  size = 'md',
  style = {},
}) {
  const config = statusConfig[status] || statusConfig.active;
  const sizeStyles = {
    sm: { padding: `${spacing[1]} ${spacing[2]}`, fontSize: typography.micro.fontSize },
    md: { padding: `${spacing[1]} ${spacing[3]}`, fontSize: typography.caption.fontSize },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    ...sizeStyles[size],
    borderRadius: radius.pill,
    background: config.bg,
    color: config.color,
    fontWeight: 500,
    fontFamily: typography.caption.fontFamily,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span style={baseStyle}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: config.dot,
        }}
      />
      {label || config.label}
    </span>
  );
}
