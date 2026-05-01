"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeToken, getUserIdFromToken } from "@/lib/auth";
import { getMe, User } from "@/lib/api";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const id = getUserIdFromToken();
    if (!id) return;
    getMe().then((data) => setUser(data.user)).catch(() => removeToken());
  }, []);

  function handleLogout() {
    removeToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="header">
      <Link href="/" style={{ fontWeight: "bold", fontSize: "16px", color: "#111", textDecoration: "none" }}>
        NebrijaSocial
      </Link>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {user ? (
          <>
            <Link href={`/profile/${user._id}`} style={{ fontSize: "14px" }}>@{user.username}</Link>
            <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: "13px", padding: "5px 12px" }}>Salir</button>
          </>
        ) : (
          <Link href="/login" style={{ fontSize: "14px" }}>Iniciar sesion</Link>
        )}
      </div>
    </header>
  );
}
