import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeckCraft AI — Professional Presentation Builder",
  description: "Create stunning, professional presentations in seconds. Upload files or chat to build contextual decks for consulting, tech, business, VC pitches, and more.",
  keywords: "presentation builder, pptx creator, pitch deck, consulting deck, business presentation, AI presentations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
