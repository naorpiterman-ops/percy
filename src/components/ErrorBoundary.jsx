import { Component } from "react";
import { colors } from "../styles/theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          background: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          color: colors.textPrimary,
          fontFamily: "'DM Sans', sans-serif",
          flexDirection: "column",
          gap: 20,
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Something went wrong</div>
          <div style={{
            fontSize: 13,
            color: colors.textSecondary,
            maxWidth: 300,
            textAlign: "center",
            fontFamily: "monospace",
            background: colors.fill1,
            padding: 16,
            borderRadius: 12,
            wordBreak: "break-all",
          }}>
            {this.state.error?.message}
          </div>
          <button onClick={() => window.location.reload()} style={{
            padding: "12px 24px",
            background: colors.primary,
            color: colors.bg,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
            fontFamily: "inherit",
          }}>
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
