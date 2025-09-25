import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "Manage Toko - Sistem Manajemen Toko Online",
  description: "Sistem manajemen toko online dengan tracking real-time untuk stok, penjualan, dan laporan keuntungan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
