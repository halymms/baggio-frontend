import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import './globals.scss';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: "Baggio Imóveis - Sistema de Análise",
  description: "Sistema de Análise da Baggio Imóveis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`}>
        {children}
      </body>
    </html>
  );
}
