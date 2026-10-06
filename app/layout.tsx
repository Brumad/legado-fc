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
    title: "Legado FC 0.5.0 — Fundação Jogável",
    description:
      "Fundação da nova gameplay jogável do Legado FC, preservando carreira, mundo, consequências e compatibilidade com saves 0.4.3.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.5.0 — Fundação Jogável",
      description:
        "A carreira existente agora convive com um Match Core independente, determinístico e preparado para a gameplay 2D jogável.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.5.0 — Fundação Jogável" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.5.0 — Fundação Jogável",
      description: "A carreira foi preservada; a nova fundação de gameplay já está pronta.",
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
