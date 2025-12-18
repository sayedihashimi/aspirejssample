import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Forecast - Next.js with Aspire",
  description: "A Next.js sample integrated with .NET Aspire",
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
