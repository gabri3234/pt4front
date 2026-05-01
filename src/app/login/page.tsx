"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register } from "@/lib/api";
import { saveToken } from "@/lib/auth";

type Mode = "login" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function switchMode(m: Mode) {
    setMode(m); setError(""); setEmail(""); setPassword(""); setUsername("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register" && !username.trim()) { setError("El nombre de usuario es obligatorio"); return; }
    if (!email.trim() || !password.trim()) { setError("Rellena todos los campos"); return; }
    setLoading(true);
    try {
      const result = mode === "login"
        ? await login(email.trim(), password)
        : await register(username.trim(), email.trim(), password);
      saveToken(result.token);
      router.push(searchParams.get("redirect") || "/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al conectar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "380px", margin: "60px auto 0" }}>
      <h1 style={{ fontSize: "20px", marginBottom: "20px" }}>NebrijaSocial</h1>
      <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", marginBottom: "20px" }}>
        {(["login", "register"] as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{
            flex: 1, background: "none", border: "none", borderRadius: 0,
            borderBottom: mode === m ? "2px solid #111" : "2px solid transparent",
            padding: "10px", fontWeight: mode === m ? "bold" : "normal", cursor: "pointer",
          }}>
            {m === "login" ? "Iniciar sesion" : "Crear cuenta"}
          </button>
        ))}
      </div>
      {error && <p className="form-error" style={{ marginBottom: "12px" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="form-group">
            <label>Usuario</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" />
        </div>
        <div className="form-group">
          <label>Contrasena</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "11px" }}>
          {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Registrarme"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
