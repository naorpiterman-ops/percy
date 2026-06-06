import React from 'react';
import { colors, typography, radius, spacing } from '../styles/theme';
import Button from './Button';

export default function ConfirmModal({
  isOpen = false,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}) {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: spacing[4],
  };

  const modalStyle = {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[6],
    maxWidth: 360,
    boxShadow: colors.shadowRaised,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
  };

  const titleStyle = {
    fontSize: typography.h3.fontSize,
    fontFamily: typography.h3.fontFamily,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  };

  const messageStyle = {
    fontSize: typography.body.fontSize,
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    lineHeight: 1.5,
  };

  const buttonsStyle = {
    display: 'flex',
    gap: spacing[3],
    justifyContent: 'flex-end',
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 style={titleStyle}>{title}</h2>
          <p style={messageStyle}>{message}</p>
        </div>
        <div style={buttonsStyle}>
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
