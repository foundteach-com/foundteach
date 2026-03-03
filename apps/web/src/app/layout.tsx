import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ScrollObserver from "@/components/ScrollObserver";

const dinNextRounded = localFont({
  src: [
    {
      path: "../../public/fonts/DIN Next Rounded LT Pro Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/DIN Next Rounded LT Pro Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/DIN Next Rounded LT Pro Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-din-next",
});

export const metadata: Metadata = {
  title: "FoundTeach • Servicios de Ingeniería de Software",
  description:
    "Desarrollo de aplicaciones, consultoría tecnológica y soluciones digitales a medida.",
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
      <body className={`${dinNextRounded.variable}`}>
        <ScrollObserver />
        {children}
      </body>
    </html>
  );
}
