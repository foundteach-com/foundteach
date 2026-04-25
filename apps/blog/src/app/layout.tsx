import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoundTeach Blog",
  description: "El blog oficial de FoundTeach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="container">
          <header className="main-header">
            <h1>Blog FoundTeach</h1>
            <p>Descubre las últimas novedades, artículos y tutoriales.</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
