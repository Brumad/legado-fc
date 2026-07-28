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
  const imageUrl = `${protocol}://${host}/og-v2.png`;

  return {
    title: "Legado FC — Temporada Viva",
    description:
      "Simulador de vida e carreira no futebol com múltiplos saves, temporada completa, mercado e partidas interativas.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — Temporada Viva",
      description:
        "Crie seu atleta, dispute uma temporada viva e decida os lances que mudam uma carreira.",
      type: "website",
      images: [{ url: imageUrl, width: 1672, height: 941, alt: "Legado FC — Temporada Viva" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — Temporada Viva",
      description: "Três carreiras. Uma temporada viva. Nenhuma partida igual.",
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
