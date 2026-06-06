import React, { useState } from 'react';
import { colors, typography, radius, spacing, statusConfig } from '../styles/theme';
import Badge from './Badge';

export default function VoucherCard({
  voucher,
  onClick,
  onFavoriteToggle,
  onMarkUsed,
  onDelete,
  isExpired = false,
  isExpiringSoon = false,
  daysLeft = 0,
}) {
  const [swiped, setSwiped] = useState(false);
  const [startX, setStartX] = useState(0);

  const progress = Math.min(100, Math.max(0, (voucher.remaining / voucher.amount) * 100));

  const cardStyle = {
    background: colors.fill1,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    padding: spacing[4],
    boxShadow: colors.shadowCard,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    opacity: isExpired ? 0.6 : 1,
    marginBottom: spacing[3],
    borderLeft: `4px solid ${voucher.color || colors.primary}`,
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  };

  const storeStyle = {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    fontFamily: typography.h4.fontFamily,
    color: colors.textPrimary,
    margin: 0,
  };

  const amountStyle = {
    fontSize: typography.displayLg.fontSize,
    fontWeight: typography.displayLg.fontWeight,
    fontFamily: typography.displayLg.fontFamily,
    color: colors.textPrimary,
    margin: 0,
    letterSpacing: typography.displayLg.letterSpacing,
  };

  const currencyStyle = {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.primary,
    marginRight: spacing[1],
  };

  const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
    fontSize: typography.bodySm.fontSize,
    color: colors.textSecondary,
  };

  const progressBarStyle = {
    width: '100%',
    height: 6,
    background: colors.fill2,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing[3],
  };

  const progressFillStyle = {
    height: '100%',
    width: `${progress}%`,
    background: isExpired ? colors.used : colors.primary,
    transition: 'width 0.3s ease',
  };

  const badgesStyle = {
    display: 'flex',
    gap: spacing[1],
    flexWrap: 'wrap',
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 50) {
      setSwiped(diff < 0); // swiped left
    }
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div style={headerStyle}>
        <div>
          <h3 style={storeStyle}>{voucher.store}</h3>
          <div style={amountStyle}>
            <span style={currencyStyle}>₪</span>
            {voucher.remaining.toFixed(1)}
          </div>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            padding: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(voucher.id);
          }}
        >
          {voucher.favorite ? '★' : '☆'}
        </button>
      </div>

      <div style={progressBarStyle}>
        <div style={progressFillStyle} />
      </div>

      <div style={metaStyle}>
        <span>{voucher.category}</span>
        {isExpired && <Badge status="used" />}
        {isExpiringSoon && daysLeft > 0 && (
          <Badge status="partial" label={`${daysLeft}d left`} />
        )}
      </div>

      {swiped && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          gap: spacing[2],
          padding: spacing[2],
          background: 'rgba(239,68,68,0.1)',
          zIndex: 10,
        }}>
          <button
            style={{
              padding: spacing[2],
              borderRadius: radius.md,
              background: colors.danger,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(voucher.id);
              setSwiped(false);
            }}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
