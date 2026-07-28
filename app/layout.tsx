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
  const imageUrl = `${protocol}://${host}/og-v3.png`;

  return {
    title: "Legado FC — Novos Caminhos",
    description:
      "Escolha entre quatro países, oito ligas e diferentes origens em um simulador de carreira com acesso, rebaixamento e partidas equilibradas.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — Novos Caminhos",
      description:
        "Comece no Brasil, Argentina, Portugal ou Inglaterra e construa seu caminho entre duas divisões.",
      type: "website",
      images: [{ url: imageUrl, width: 1672, height: 941, alt: "Legado FC — Novos Caminhos" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — Novos Caminhos",
      description: "Quatro países. Oito ligas. Um caminho para construir.",
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
