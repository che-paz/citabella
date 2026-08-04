import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gota+Check — Agenda para salones",
  description:
    "Agenda clara, link de reserva para tus clientas y presencia web para salones, maquillistas y barberías en Guatemala y Centroamérica.",
  metadataBase: new URL("https://gotacheck.app"),
  openGraph: {
    title: "Gota+Check — Agenda para salones",
    description:
      "Deja de pelear con WhatsApp y el papel. Agenda, reserva pública y vitrina para tu salón.",
    url: "https://gotacheck.app",
    siteName: "Gota+Check",
    locale: "es_GT",
    type: "website",
    images: [{ url: "/og.png", width: 512, height: 512, alt: "Gota+Check" }],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${syne.variable} ${manrope.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
