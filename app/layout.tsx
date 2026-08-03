import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechCore | Sistema de Recepción',
  description:
    'Gestión y recepción de equipos tecnológicos para reparación y flipping.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
