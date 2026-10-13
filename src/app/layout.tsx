import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar // Campus Prediction Market & Meetup Platform",
  description:
    "High-throughput campus prediction market with live anonymous discussion and local-first 24-hour split-key meetup protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="min-h-screen bg-black text-neutral-100 antialiased selection:bg-[#00F0FF] selection:text-black">
        {children}
      </body>
    </html>
  );
}
