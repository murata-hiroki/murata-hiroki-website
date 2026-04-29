export type Post = {
  title: string;
  link: string;
  date: string;
  excerpt: string;
  image: string | null;
};

const FEED_URL = "https://www.go2senkyo.com/seijika/198578/posts.rss";
const POST_BASE_URL = "https://www.go2senkyo.com/seijika/198578/posts";
const REVALIDATE_SECONDS = 3600;

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(s: string): string {
  return decodeEntities(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function pickTag(itemXml: string, tag: string): string {
  const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1]).trim() : "";
}

function formatDate(rfc2822: string): string {
  const d = new Date(rfc2822);
  if (isNaN(d.getTime())) return rfc2822;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n).trimEnd() + "…";
}

function absolutizeLink(link: string): string {
  if (!link) return POST_BASE_URL;
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  if (link.startsWith("/seijika/")) return `https://www.go2senkyo.com${link}`;
  return `${POST_BASE_URL}${link.startsWith("/") ? link : `/${link}`}`;
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "murata-hiroki-website" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export async function getPosts(limit = 4): Promise<Post[]> {
  const res = await fetch(FEED_URL, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { "User-Agent": "murata-hiroki-website" },
  });
  if (!res.ok) return [];
  const xml = await res.text();

  const items = (xml.match(/<item[\s\S]*?<\/item>/g) ?? []).slice(0, limit);

  const parsed = items.map((raw) => {
    const title = stripHtml(pickTag(raw, "title"));
    const link = absolutizeLink(stripHtml(pickTag(raw, "link")));
    const pubDate = pickTag(raw, "pubDate");
    const description = stripHtml(pickTag(raw, "description"));
    return {
      title,
      link,
      date: formatDate(pubDate),
      excerpt: truncate(description, 80),
    };
  });

  const images = await Promise.all(parsed.map((p) => fetchOgImage(p.link)));

  return parsed.map((p, i) => ({ ...p, image: images[i] }));
}
