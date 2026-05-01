// src/app/layout.tsx
// Layout general: envuelve todas las paginas y muestra la cabecera comun

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PT4 Front",
  description: "Practica 4 - Twitter clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="layout">
        <Header />
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
