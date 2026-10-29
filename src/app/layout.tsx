import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanz-Manager",
  description: "Budgets, Kategorien und Ausgaben im Blick",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
