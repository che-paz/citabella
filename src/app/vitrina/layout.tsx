import { Fraunces, Outfit } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-vitrina-display",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-vitrina-sans",
  display: "swap",
});

export default function VitrinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${sans.variable}`}>{children}</div>
  );
}
