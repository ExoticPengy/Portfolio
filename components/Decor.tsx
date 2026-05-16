const DECO = [
  { text: "PLAY·PLAY·PLAY",     t: "translate(-50%, -50%) translate3d(-820px, -380px, -500px) rotateY(28deg)" },
  { text: "READY · START · GO", t: "translate(-50%, -50%) translate3d(880px, 360px, -500px) rotateY(-30deg)" },
  { text: "STAGE · SELECT",     t: "translate(-50%, -50%) translate3d(-720px, 460px, -550px) rotateY(22deg) rotateX(8deg)" },
];

export default function Decor() {
  return (
    <>
      {DECO.map((d) => (
        <div key={d.text} className="deco" style={{ transform: d.t }}>
          {d.text}
        </div>
      ))}
    </>
  );
}
