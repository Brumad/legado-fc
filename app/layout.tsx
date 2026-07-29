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
    title: "Legado FC 0.4.3 — Consequências",
    description:
      "Escolhas que atravessam partidas e temporadas: personalidade dinâmica, consequências persistentes, cobranças futuras, treinador, elenco, saúde, família e mercado.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.4.3 — Consequências",
      description:
        "Suas decisões agora mudam desempenho, fadiga, lesões, disciplina, relações, contratos e acontecimentos futuros.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.4.3 — Consequências" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.4.3 — Consequências",
      description: "Toda escolha deixa uma marca — dentro e fora do campo.",
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
