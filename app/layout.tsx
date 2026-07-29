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
  const imageUrl = `${protocol}://${host}/og-v6.png`;

  return {
    title: "Legado FC 0.4.3 — Universo em Campo",
    description:
      "O fechamento da fase 0.4.x: doze táticas, briefing jogável, abordagens do atleta, rivalidades adaptativas, lesões com recuperação e memória completa das partidas.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC 0.4.3 — Universo em Campo",
      description:
        "Doze estilos táticos, escolhas antes do apito, adversários adaptativos e uma carreira que guarda cada relatório.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC 0.4.3 — Universo em Campo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC 0.4.3 — Universo em Campo",
      description: "Do briefing ao legado: cada adversário pensa, reage e deixa memória na carreira.",
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
