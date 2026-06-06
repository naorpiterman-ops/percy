import React from 'react';
import { colors, typography, radius, spacing } from '../styles/theme';

export default function SummaryCard({
  icon,
  label,
  value,
  subtext = '',
  style = {},
}) {
  const baseStyle = {
    padding: spacing[4],
    borderRadius: radius.lg,
    background: colors.fill1,
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadowCard,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    ...style,
  };

  const iconStyle = {
    fontSize: 24,
    lineHeight: 1,
  };

  const labelStyle = {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    fontFamily: typography.caption.fontFamily,
    fontWeight: 500,
  };

  const valueStyle = {
    fontSize: typography.displayLg.fontSize,
    fontWeight: typography.displayLg.fontWeight,
    fontFamily: typography.displayLg.fontFamily,
    color: colors.textPrimary,
    letterSpacing: typography.displayLg.letterSpacing,
  };

  const subtextStyle = {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    fontFamily: typography.bodySm.fontFamily,
    fontWeight: 400,
  };

  return (
    <div style={baseStyle}>
      {icon && <span style={iconStyle}>{icon}</span>}
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
      {subtext && <span style={subtextStyle}>{subtext}</span>}
    </div>
  );
}
