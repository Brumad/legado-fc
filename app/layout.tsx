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
  const imageUrl = `${protocol}://${host}/og-v5.png`;

  return {
    title: "Legado FC — Vida e Legado",
    description:
      "Viva uma carreira completa dentro e fora de campo: 12 países, ligas simuladas por inteiro, finanças, relações, patrocínios e decisões com consequências.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — Vida e Legado",
      description:
        "A atualização 0.3.3 transforma sua carreira em uma vida: 24 ligas, 505 clubes, partidas interativas e decisões fora de campo.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC — Vida e Legado" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — Vida e Legado",
      description: "Doze países. Vinte e quatro ligas. Uma carreira e uma vida inteira.",
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
