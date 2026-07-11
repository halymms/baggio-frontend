import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { Providers } from '@/components/Providers';
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
    <html lang="pt-BR">
      <body className={`${poppins.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
