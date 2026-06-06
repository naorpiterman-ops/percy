import React from 'react';
import { colors } from '../styles/theme';

export default function BottomNav({
  activeTab,
  onTabChange,
}) {
  const renderIcon = (tabId) => {
    if (tabId === 'wallet') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="14" rx="1.5" />
          <line x1="4" y1="10" x2="20" y2="10" />
          <line x1="16" y1="14" x2="16" y2="14.01" />
        </svg>
      );
    } else if (tabId === 'stats') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="13" width="3" height="8" rx="0.5" />
          <rect x="10" y="8" width="3" height="13" rx="0.5" />
          <rect x="17" y="4" width="3" height="17" rx="0.5" />
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  };

  const tabs = [
    { id: 'wallet', label: 'ארנק' },
    { id: 'add', label: 'הוספת קופון' },
    { id: 'stats', label: 'סטטיסטיקה' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: colors.surface,
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0 20px',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              color: isActive ? colors.primary : '#FFFFFF',
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
          >
            <span style={{
              fontSize: tab.id === 'add' ? 28 : 24,
              fontWeight: tab.id === 'add' ? 300 : 400,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
            }}>
              {renderIcon(tab.id)}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
