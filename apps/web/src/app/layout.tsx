import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ScrollObserver from "@/components/ScrollObserver";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoundTeach • Servicios de Ingeniería de Software",
  description: "Desarrollo de aplicaciones, consultoría tecnológica y soluciones digitales a medida.",
  icons: {
    icon: "/favicon.png",
    apple: "/logo_foundteach.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${instrumentSans.variable} ${jetBrainsMono.variable}`}>
        <ScrollObserver />
        {children}
      </body>
    </html>
  );
}
