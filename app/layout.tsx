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
    title: "Legado FC 0.5.5 — Faltas e Escanteios em 3D",
    description:
      "Futebol 2D com sprites procedurais originais, animações arcade, estádio estilizado, replay, HUD retrô e câmeras configuráveis.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.5.5 — Faltas e Escanteios em 3D",
      description:
        "A 0.5.5 adiciona faltas diretas, faltas levantadas e escanteios jogáveis em 3D real, preservando a partida 2D e o Match Core.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.5.5 — Faltas e Escanteios em 3D" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.5.5 — Faltas e Escanteios em 3D",
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
