import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SunSpot — Terrasses ensoleillées à Paris",
  description: "Trouvez une terrasse à Paris en plein soleil, maintenant ou à n'importe quelle heure.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
