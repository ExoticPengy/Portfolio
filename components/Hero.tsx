type Props = { fading: boolean };

export default function Hero({ fading }: Props) {
  return (
    <div className={`hero ${fading ? "fading" : ""}`}>
      <div className="eyebrow">NOW PLAYING</div>
      <h1 className="name">CHONG<br />MING&nbsp;LI</h1>
      <div className="tag">
        DEV <span className="sep">×</span> DATA SCIENTIST
      </div>
      <div className="cta">
        <span className="chev">▶</span> SELECT A STAGE
      </div>
    </div>
  );
}
