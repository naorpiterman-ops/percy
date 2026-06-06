import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { colors, gradients } from "../styles/theme";
import PercyLogo from "./PercyLogo";

export default function LoginScreen() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [mode,     setMode]     = useState("signin");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");

  async function handleSubmit() {
    if (!email || !password) { setError("אנא הזן דוא״ל וסיסמה"); return; }
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("חשבון נוצר! מתחבר אותך...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.06)",
    color: colors.textPrimary, fontSize: 15, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", background: colors.bg, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 32px", fontFamily: "'DM Sans', sans-serif",
      width: "100%", maxWidth: 480, margin: "0 auto",
    }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <PercyLogo variant="coin" size="md" />
          <div style={{ fontSize: 32, fontWeight: 800, color: colors.textPrimary }}>Percy</div>
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          style={inp} type="email" placeholder="כתובת דוא״ל"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          style={inp} type="password" placeholder="סיסמה (לפחות 6 תווים)"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />

        {error   && <div style={{ color: colors.danger, fontSize: 13, textAlign: "center" }}>{error}</div>}
        {message && <div style={{ color: colors.active, fontSize: 13, textAlign: "center" }}>{message}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          padding: "16px", borderRadius: 16, border: "none",
          background: gradients.primary, color: colors.bg,
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          opacity: loading ? 0.6 : 1, fontFamily: "inherit",
        }}>
          {loading ? "אנא המתן..." : mode === "signup" ? "יצור חשבון" : "התחבר"}
        </button>

        <button onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} style={{
          background: "none", border: "none", color: colors.primary,
          fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: "8px",
        }}>
          {mode === "signin" ? "אין לך חשבון? הירשם" : "כבר יש לך חשבון? התחבר"}
        </button>
      </div>
    </div>
  );
}
