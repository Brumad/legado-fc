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
    title: "Legado FC 0.5.2 — Partida 2D Jogável",
    description:
      "Primeira partida 2D realmente jogável do Legado FC, com controle do atleta da carreira, bola, passe, chute, desarme, IA, câmera, reinícios e suporte a teclado e toque.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.5.2 — Partida 2D Jogável",
      description:
        "A carreira agora entra diretamente em um campo 2D jogável, preservando a interface 0.5.1 e o modo rápido legado como fallback.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.5.2 — Partida 2D Jogável" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.5.2 — Partida 2D Jogável",
      description: "Campo 2D, 22 jogadores, controles arcade, câmera dinâmica e partidas completas validadas em desktop e mobile.",
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
