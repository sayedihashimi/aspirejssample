import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js - Weather",
  description: "A Next.js sample integrated with .NET Aspire",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
