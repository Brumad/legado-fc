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
    title: "Legado FC 0.5.3 — Futebol, Controles e Criação de Atleta",
    description:
      "Gameplay 2D com IA tática, joystick analógico mobile, duração e dificuldade configuráveis, regras reais em campo e criação de atleta redesenhada.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.5.3 — Futebol, Controles e Criação de Atleta",
      description:
        "A 0.5.3 aprofunda o futebol jogável com táticas, dificuldade real, regras de campo, controles mobile analógicos e creator responsivo.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.5.3 — Futebol, Controles e Criação de Atleta" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.5.3 — Futebol, Controles e Criação de Atleta",
      description: "Campo 2D, 12 estilos táticos, joystick analógico, dificuldade real, creator renovado e partidas validadas em desktop e mobile.",
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
