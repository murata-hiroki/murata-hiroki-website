import type { Metadata } from "next";
import { Noto_Sans_JP, Klee_One, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const kleeOne = Klee_One({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "村田 ひろき | 松原",
  description:
    "若さと行動力で、皆さまの声を市政に届け、松原の明日をもっと良くしていきます。",
  openGraph: {
    title: "村田 ひろき | 松原",
    description:
      "若さと行動力で、皆さまの声を市政に届け、松原の明日をもっと良くしていきます。",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${kleeOne.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
