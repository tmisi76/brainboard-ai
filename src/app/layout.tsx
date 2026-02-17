import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainBoard AI - Intelligens Whiteboard",
  description:
    "AI-alapú vizuális gondolattérkép és jegyzetelő alkalmazás. Szervezd és kapcsold össze gondolataidat egy végtelen vásznon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
