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
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "Legado FC — Sua história entra em campo",
    description:
      "Protótipo jogável de um simulador de vida e carreira no futebol, com partidas minuto a minuto e melhores momentos interativos.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — Sua história entra em campo",
      description:
        "Crie seu atleta, acompanhe a partida e decida os lances que mudam uma carreira.",
      type: "website",
      images: [{ url: imageUrl, width: 1672, height: 941, alt: "Legado FC — Sua história entra em campo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — Sua história entra em campo",
      description: "Uma carreira inteira. Um lance de cada vez.",
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
