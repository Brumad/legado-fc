import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og-v4.png`;

  return {
    title: "Legado FC — Mundo Profissional",
    description:
      "Construa uma carreira em 12 países, prepare cada partida pelo calendário e decida faltas, escanteios, dribles e outros lances únicos.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — Mundo Profissional",
      description:
        "Do futebol de bairro ao mercado internacional: 24 ligas, 288 clubes e partidas interativas.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC — Mundo Profissional" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — Mundo Profissional",
      description: "Doze países. Vinte e quatro ligas. Uma carreira sem fronteiras.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${sora.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  );
}
