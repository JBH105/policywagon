import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoveragePrincipal",
  description: "CoveragePrincipal website migration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.5f25f77644c1c82f0be4.css" />
      </head>
      <body>
        {children}
        <Script src="/legal-sidebar.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
