type Item = {
  year: string;
  current?: boolean;
  title: string;
  body?: string;
  list?: string[];
};

const items: Item[] = [
  { year: "2000", title: "松原市に生まれる" },
  { year: "2019", title: "高校を卒業、建設会社に就職" },
  {
    year: "2020",
    title: "IT業界へ。東京でシステムエンジニアとして従事",
    body: "業務用クラウドサービスの開発・導入提案に従事。",
  },
  { year: "2023", title: "地元・松原市に戻る" },
  {
    year: "現在",
    current: true,
    title: "地域に根ざした活動を展開",
    list: [
      "大阪維新の会 松原市政対策委員",
      "松原青年会議所 理事",
      "地域活動・勉強会・駅頭活動を継続中",
    ],
  },
];

export default function Chronicle() {
  return (
    <section className="chronicle" id="chronicle">
      <div className="chronicle-inner">
        <div className="chronicle-head">
          <span className="icon" aria-hidden>📋</span>
          <h2>年譜</h2>
          <span className="en">CHRONICLE</span>
        </div>

        <div className="timeline">
          {items.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-year">
                {item.current ? <span className="current">{item.year}</span> : item.year}
              </div>
              <div className="timeline-body">
                <h3>{item.title}</h3>
                {item.body && <p>{item.body}</p>}
                {item.list && (
                  <ul>
                    {item.list.map((li, j) => (
                      <li key={j}>{li}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
