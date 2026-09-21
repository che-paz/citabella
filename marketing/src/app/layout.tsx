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
    "Agenda desde Q100/mes con 30 días de prueba. Vitrina con dominio desde Q3,500. Para salones, maquillistas y barberías en Guatemala y Centroamérica.",
  metadataBase: new URL("https://gotacheck.app"),
  openGraph: {
    title: "Gota+Check — Agenda para salones",
    description:
      "Agenda Q100/mes (30 días de prueba) y vitrina con dominio Q3,500. Sin el caos del WhatsApp.",
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
