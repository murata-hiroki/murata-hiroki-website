import type { Metadata } from "next";
import { Noto_Sans_JP, Klee_One, Inter, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Loader from "@/components/Loader";
import HokokukaiModal from "@/components/HokokukaiModal";
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

const SITE_URL = "https://murata-hiroki.jp";
const SITE_NAME = "村田 ひろき | 大阪維新の会 松原市政対策委員";
const DESCRIPTION =
  "松原市出身、25歳。元システムエンジニアとして培ったIT・デジタルの経験を活かし、大阪維新の会 松原市政対策委員として政治活動に取り組んでいます。子育て・教育・行政DXを軸に、地域全体で子どもを育てる松原市を目指します。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | 村田 ひろき",
  },
  description: DESCRIPTION,
  keywords: [
    "村田ひろき",
    "村田 ひろき",
    "大阪維新の会",
    "松原市",
    "松原市政",
    "松原市政対策委員",
    "政治活動",
    "子育て政策",
    "教育政策",
    "行政DX",
    "松原青年会議所",
    "南河内",
    "河内天美",
    "河内松原",
    "システムエンジニア",
  ],
  authors: [{ name: "村田 ひろき", url: SITE_URL }],
  creator: "村田 ひろき",
  publisher: "村田 ひろき",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "村田 ひろき",
  alternateName: ["むらた ひろき", "Hiroki Murata"],
  url: SITE_URL,
  image: `${SITE_URL}/assets/portrait.png`,
  jobTitle: "大阪維新の会 松原市政対策委員",
  worksFor: {
    "@type": "Organization",
    name: "大阪維新の会",
    url: "https://oneosaka.jp/",
  },
  memberOf: [
    {
      "@type": "Organization",
      name: "大阪維新の会",
      url: "https://oneosaka.jp/",
    },
    {
      "@type": "Organization",
      name: "松原青年会議所",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "松原市",
    addressRegion: "大阪府",
    addressCountry: "JP",
  },
  birthPlace: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "松原市",
      addressRegion: "大阪府",
      addressCountry: "JP",
    },
  },
  description: DESCRIPTION,
  sameAs: [
    // SNS アカウントが確定したらここに追加
    // "https://www.instagram.com/...",
    // "https://x.com/...",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "ja",
  publisher: {
    "@type": "Person",
    name: "村田 ひろき",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "村田ひろきはどのような人物ですか?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "2000年生まれの25歳。大阪府松原市出身。元システムエンジニアで、現在は大阪維新の会 松原市政対策委員、松原青年会議所 理事として、地域に根ざした政治活動を行っています。",
      },
    },
    {
      "@type": "Question",
      name: "大阪維新の会 松原市政対策委員とはどのような役職ですか?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "大阪維新の会が松原市の市政課題に取り組むために設置している役職で、地域の声を党および市政につなぐ役割を担います。",
      },
    },
    {
      "@type": "Question",
      name: "政策の3本柱は何ですか?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "「子育て世帯への直接支援」「若い世代が残る・戻ってくるまちづくり」「アップデートし続ける市政へ」の3つです。地域全体で子どもを育てる思想を軸に構成されています。",
      },
    },
    {
      "@type": "Question",
      name: "村田ひろきのビジョンは何ですか?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "南河内で1番、教育水準が高く、子育てしやすいまちにすることです。",
      },
    },
    {
      "@type": "Question",
      name: "経歴を教えてください。",
      acceptedAnswer: {
        "@type": "Answer",
        text: "大阪府松原市生まれ。天美南小学校・松原第二中学校卒業。高校卒業後、建設会社に1年間勤務した後、IT業界に転じて東京でシステムエンジニアとして約4年間経験を積みました。2023年に松原市へ戻り、現在は政治活動・地域活動に従事しています。",
      },
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body>
        <Loader />
        {children}
        <HokokukaiModal />
      </body>
      <GoogleAnalytics gaId="G-QXXZPFEQWD" />
    </html>
  );
}
