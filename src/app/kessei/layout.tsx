import type { Metadata } from 'next';

/**
 * 村田ひろき後援会 総決起大会の参加申込フォーム。
 * 案内状の QR から入る導線が主で、検索結果から不特定多数に拾われる想定ではない。
 * 告示前の政治活動という性質もあり、ボランティアフォームと同様 noindex にする。
 * （公開の可否・index 方針は事務所／村田本人の確認後に判断する）
 */
export const metadata: Metadata = {
  title: '村田ひろき後援会 総決起大会 参加申込',
  robots: { index: false, follow: false },
};

export default function KesseiLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
