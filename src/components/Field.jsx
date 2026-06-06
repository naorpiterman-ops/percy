import React, { useState } from 'react';
import { colors, typography, radius, spacing } from '../styles/theme';

export default function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
  error = '',
  icon = null,
  monospace = false,
  style = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const labelStyle = {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    letterSpacing: typography.label.letterSpacing,
    textTransform: typography.label.textTransform,
    color: colors.textSecondary,
    fontFamily: typography.label.fontFamily,
  };

  const inputStyle = {
    padding: `${spacing[2]} ${spacing[3]}`,
    borderRadius: radius.md,
    border: `1px solid ${focused ? colors.primaryBorder : colors.border}`,
    background: focused ? colors.primaryGlow : colors.fill1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontFamily: monospace ? typography.code.fontFamily : typography.body.fontFamily,
    letterSpacing: monospace ? typography.code.letterSpacing : 'normal',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'all 0.2s ease',
    fontWeight: monospace ? 700 : 400,
    ...style,
  };

  const errorStyle = {
    fontSize: typography.caption.fontSize,
    color: colors.danger,
    fontFamily: typography.caption.fontFamily,
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
          {...props}
        />
        {icon && (
          <span
            style={{
              position: 'absolute',
              right: spacing[2],
              color: colors.textSecondary,
              fontSize: 16,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
