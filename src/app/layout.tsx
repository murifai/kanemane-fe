import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; // Removed Geist, Geist_Mono
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanemane",
  description: "Personal Finance Manager",
  icons: {
    icon: "/assets/logo.svg",
    shortcut: "/assets/logo.svg",
    apple: "/assets/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
