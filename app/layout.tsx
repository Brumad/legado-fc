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
  const imageUrl = `${protocol}://${host}/og-v7.png`;

  return {
    title: "Legado FC 0.5.4 — Visual Retrô e Apresentação da Partida",
    description:
      "Futebol 2D com sprites procedurais originais, animações arcade, estádio estilizado, replay, HUD retrô e câmeras configuráveis.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.5.4 — Visual Retrô e Apresentação da Partida",
      description:
        "A 0.5.4 dá identidade visual própria à partida sem alterar a simulação validada na 0.5.3.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.5.4 — Visual Retrô e Apresentação da Partida" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.5.4 — Visual Retrô e Apresentação da Partida",
      description: "Sprites originais, três câmeras, qualidade ajustável, replay e HUD arcade validados em desktop e mobile.",
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
