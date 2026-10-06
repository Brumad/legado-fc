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
    title: "Legado FC 0.5.1 — Nova Interface de Carreira",
    description:
      "Nova interface de carreira do Legado FC com hub responsivo, decisões, treino, vida, finanças, mercado e mundo, preservando a fundação jogável 0.5.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.5.1 — Nova Interface de Carreira",
      description:
        "A carreira agora possui uma interface de jogo unificada e responsiva sobre o Match Core independente criado na 0.5.0.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.5.1 — Nova Interface de Carreira" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.5.1 — Nova Interface de Carreira",
      description: "Nova central de carreira, telas secundárias harmonizadas e validação real em mobile, tablet e desktop.",
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
