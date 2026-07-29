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
  const imageUrl = `${protocol}://${host}/og-v6.png`;

  return {
    title: "Legado FC — Partidas 2.0",
    description:
      "Partidas táticas e dinâmicas com cartões, impedimentos, substituições, lesões, fadiga, estatísticas completas e um mercado de carreira vivo.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — Partidas 2.0",
      description:
        "A atualização 0.4.2 transforma cada jogo com estilos táticos, postura pelo placar, disciplina, fadiga e lances próprios para cada posição.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC — Partidas 2.0" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — Partidas 2.0",
      description: "Tática, contexto, disciplina e decisões: mil partidas, mil histórias diferentes.",
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
