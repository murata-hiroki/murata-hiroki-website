import { getPosts } from "@/lib/posts";

const thumbClasses = ["a", "b", "c", "d"] as const;

export default async function Activity() {
  const posts = await getPosts(4);

  return (
    <section className="activity" id="activity">
      <div className="activity-head">
        <div>
          <span className="sec-kicker">活動報告</span>
          <h2>最新の活動</h2>
          <p>日々の活動や地域の取り組みを発信しています。</p>
        </div>
        <a
          href="https://www.go2senkyo.com/seijika/198578/posts"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-green"
        >
          一覧を見る <span className="arrow-circle">→</span>
        </a>
      </div>

      {posts.length > 0 ? (
        <div className="activity-grid">
          {posts.map((post, i) => (
            <a
              key={post.link || i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="activity-card"
            >
              <div
                className={`activity-thumb ${thumbClasses[i % thumbClasses.length]}`}
                data-label={post.date}
              >
                {post.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image} alt="" loading="lazy" />
                )}
              </div>
              <div className="activity-body">
                <div className="activity-meta">
                  <span className="date">{post.date}</span>
                  <span className="tag">活動報告</span>
                </div>
                <div className="activity-title">{post.title}</div>
                <p className="activity-excerpt">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "var(--ink-mute)", padding: "20px 40px" }}>
          活動報告は現在準備中です。
        </p>
      )}
    </section>
  );
}
