import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-Chain DApp Demo",
  description: "DApp with Ethereum, TON and Solana wallet integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
