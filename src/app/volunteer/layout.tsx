import type { Metadata } from 'next';

/**
 * このフォームは、お願いした方に個別に URL をお渡しして使う。
 * 検索結果から不特定多数に見つかることは想定していないため noindex にする。
 * （ルートレイアウトは index: true なので、ここで打ち消す）
 */
export const metadata: Metadata = {
  title: 'お手伝いのお願い',
  robots: { index: false, follow: false },
};

export default function VolunteerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
