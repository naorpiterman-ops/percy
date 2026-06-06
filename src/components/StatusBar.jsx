import React from 'react';
import { colors, typography, spacing } from '../styles/theme';

export default function StatusBar({
  showStatus = true,
  activeVouchersCount = 0,
  expiringCount = 0,
  style = {},
}) {
  let statusColor = colors.active;
  let statusText = '✓ All good';

  if (expiringCount > 0) {
    statusColor = colors.danger;
    statusText = `⚠️ ${expiringCount} expiring`;
  } else if (activeVouchersCount > 0) {
    statusColor = colors.active;
    statusText = `✓ ${activeVouchersCount} active`;
  }

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[2]} ${spacing[4]}`,
    background: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    ...style,
  };

  const textStyle = {
    fontSize: typography.bodySm.fontSize,
    color: statusColor,
    fontFamily: typography.bodySm.fontFamily,
    fontWeight: 500,
  };

  const dotStyle = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: statusColor,
  };

  return showStatus ? (
    <div style={baseStyle}>
      <span style={dotStyle} />
      <span style={textStyle}>{statusText}</span>
    </div>
  ) : null;
}
