/**
 * LINE へ送る返信メッセージを組み立てる。
 *
 * 背景: 相談は LIFF フォーム(/koe)から送られ、その内容は LINE のトーク画面には残らない。
 * そのため返信だけを push すると受け手は「何への返事か」が分からない。
 * → 必ず「何の声への返事か」が分かるよう、元の相談内容を引用して同梱する。
 *
 * サーバー(api/reply)と管理画面(プレビュー)で同じ文面になるよう、ここを唯一の出所にする。
 *
 * ※ 公職選挙法: この定型文に NG 語（選挙/投票/候補/当選 等）を入れないこと。
 */
const ORIGINAL_MAX = 300;

export function composeReply(
  originalMessage: string | null | undefined,
  reply: string,
): string {
  const original = (originalMessage ?? '').trim();
  const quoted =
    original.length > ORIGINAL_MAX
      ? `${original.slice(0, ORIGINAL_MAX)}…`
      : original;

  const lines = [
    '村田ひろきです。',
    '「声を届ける」よりいただいたご意見へのお返事です。',
  ];

  if (quoted) {
    lines.push('', '▼ いただいたご意見', quoted);
  }

  lines.push('', '▼ お返事', reply.trim());

  return lines.join('\n');
}
