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
    title: "Legado FC — O Mundo Continua",
    description:
      "Um universo persistente com 2.750 jogadores da IA evoluindo, transferindo-se, envelhecendo e construindo uma história temporada após temporada.",
    applicationName: "Legado FC",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Legado FC — O Mundo Continua",
      description:
        "A atualização 0.4.1 cria um mundo vivo: transferências, promessas, aposentadorias, campeões globais e arquivo permanente.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Legado FC — O Mundo Continua" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Legado FC — O Mundo Continua",
      description: "Doze países. 2.750 atletas. Um mundo que continua sem esperar.",
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
