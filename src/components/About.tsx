export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-grid">
        <div>
          <span className="sec-kicker">私の想い</span>
          <h2>
            育ててもらった、このまちに、恩返しを。
          </h2>
          <p>平成12年(2000年)、松原で生まれ育ちました。天美南小学校・松原第二中学校を卒業し、高校までこのまちで過ごしました。</p>
          <p>高校卒業後は東京へ。建設の現場で1年間汗を流したあと、ITの世界に進み、システムエンジニアとしてシステムの開発や導入提案に携わってきました。</p>
          <p>東京で働きながら、帰省するたびに考えていました。「自分を育ててくれたこのまちに、私は何が返せるんだろう」と。仕事がフルリモートになったことをきっかけに、2023年、松原に戻ってきました。</p>
          <p>戻ってからは、松原青年会議所や、地元・天美のボランティア団体「池内誠友会」に参加し、地域の行事に関わってきました。数えきれないほどの場面で、私のほうが、たくさんの方に育てていただいています。</p>
          <p>育ててもらったこのまちに、恩返しがしたい。地域全体で子どもを育てる松原を、皆さんと一緒につくっていきます。</p>
          <div className="cta-row">
            <a href="#chronicle" className="btn-outline-green">
              詳しく見る <span className="arrow-circle">→</span>
            </a>
          </div>
        </div>
        <div className="about-visual">
          <div className="img big" data-label="松原市役所" />
          <div className="img a" data-label="ハートフルAMAMI" />
          <div className="img b" data-label="河内天美駅前" />
          <div className="img c" data-label="河内松原駅" />
        </div>
      </div>
    </section>
  );
}
