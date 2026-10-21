import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./Video";
import { ACCENT, COVER_BRAND, COVER_HOOK, TITLE, VIDEO_H } from "./config";
import { TitleLines } from "./TitleLines";

// 小红书 3:4 封面，三种常见高互动版式：
//  band   黑底两行大标题 + 原片画面 + 黄韩白中钩子（外研社同款）
//  poster 大字报：画面铺满，底部超大描边字，信息流里最抢眼
//  card   韩中对照卡：上半画面，下半白卡写一句韩语 + 中文（学习类账号常用）
//  reels  Reels 款（参考 offtheclock / 1ma2c）：画面铺满，下方两行粗白字 + 高亮关键词 + 小字副标题
export type CoverStyle = "band" | "poster" | "card" | "reels";

const YELLOW = ACCENT;
const ZH = "'NotoSC', 'Microsoft YaHei', sans-serif";
const KO = "'NotoKR', 'NotoSC', sans-serif";
const plain = (t: string) => t.replace(/[[\]]/g, "");
const stroke = (w: number, c = "#000") => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: "stroke fill" }) as React.CSSProperties;

const Band: React.FC = () => {
  const line: React.CSSProperties = { fontFamily: ZH, fontWeight: 900, fontSize: 112, lineHeight: 1.2, letterSpacing: 4, color: "#fff", textAlign: "center" };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: 70, width: 1080 }}>
        <TitleLines style={line} />
      </div>
      <Img src={staticFile("cover_frame.png")} style={{ position: "absolute", top: 390, left: 0, width: 1080, height: VIDEO_H }} />
      <div style={{ position: "absolute", top: 390 + VIDEO_H + 36, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: KO, fontWeight: 900, fontSize: 70, color: YELLOW }}>{COVER_HOOK.orig}</div>
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 50, color: "#fff", marginTop: 10 }}>{COVER_HOOK.zh}</div>
      </div>
    </AbsoluteFill>
  );
};

const Poster: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile("cover_frame.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1440, objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.85) 78%)" }} />
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 90 }}>
      <div style={{ fontFamily: KO, fontWeight: 900, fontSize: 58, color: YELLOW, ...stroke(10) }}>{COVER_HOOK.orig}</div>
      {TITLE.map((t, i) => (
        <div key={i} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 150, lineHeight: 1.08, color: i === 0 ? "#fff" : YELLOW, ...stroke(16) }}>
          {plain(t)}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

const Card: React.FC = () => (
  <AbsoluteFill style={{ background: "#f6f3ec" }}>
    <Img src={staticFile("cover_frame.png")} style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 900, objectFit: "cover" }} />
    <div style={{ position: "absolute", top: 40, left: 50, right: 50 }}>
      {TITLE.map((t, i) => (
        <div key={i} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 92, lineHeight: 1.12, color: "#fff", ...stroke(12) }}>
          {plain(t)}
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: 960, left: 60, right: 60 }}>
      <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 40, color: "#d93a2b", letterSpacing: 6 }}>今日韩语</div>
      <div style={{ fontFamily: KO, fontWeight: 900, fontSize: 100, lineHeight: 1.2, color: "#111", marginTop: 18 }}>{COVER_HOOK.orig}</div>
      <div style={{ height: 6, width: 120, background: "#111", margin: "26px 0" }} />
      <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 60, color: "#444" }}>{COVER_HOOK.zh}</div>
    </div>
  </AbsoluteFill>
);

const hl = (t: string) =>
  t.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) => (p.startsWith("[") ? <span key={i} style={{ color: ACCENT }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>));

// 参考 offtheclock.mag / 1ma2c：字号克制、左对齐、留白多，只高亮关键词；小品牌字在上，小副标题在下
const Reels: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile("cover_frame.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1440, objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.45) 70%, rgba(0,0,0,.72) 100%)" }} />
    <div style={{ position: "absolute", left: 72, right: 72, bottom: 150 }}>
      {COVER_BRAND && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,.9)", marginBottom: 22, letterSpacing: -0.3 }}>{COVER_BRAND}</div>}
      {TITLE.map((t, i) => (
        <div key={i} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 64, lineHeight: 1.32, color: "#fff", textShadow: "0 1px 10px rgba(0,0,0,.3)" }}>{hl(t)}</div>
      ))}
      <div style={{ fontFamily: KO, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,.75)", marginTop: 18 }}>{COVER_HOOK.orig}</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC<{ style?: CoverStyle }> = ({ style = "band" }) => {
  useFonts();
  return style === "poster" ? <Poster /> : style === "card" ? <Card /> : style === "reels" ? <Reels /> : <Band />;
};
