import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CARDS, CUES, type Card } from "./cues";
import { ACCENT, CREDIT, SUB_MODE, TOTAL, VIDEO_H } from "./config";

// 视频里必须写素材出处
if (!CREDIT.trim()) throw new Error("config.ts 的 CREDIT 必填：视频里必须标注素材出处");
import { TitleLines } from "./TitleLines";
export { TOTAL };

export const W = 1080;
export const H = 1920;
export const FPS = 30;


// 版面（参考外研社韩语竖屏：黑底 + 顶部两行大标题 + 中间原片 + 下方黄韩白中字幕）
const TITLE_TOP = 120;
const VIDEO_TOP = 440;

const SUB_TOP = VIDEO_TOP + VIDEO_H + 40;

const BLUE = "#8fd3ff";
const YELLOW = "#ffde3b";

const ZH = "'NotoSC', 'Microsoft YaHei', sans-serif";
const KO = "'NotoKR', 'NotoSC', 'Malgun Gothic', sans-serif";

// title/video=false 用于导出剪映分层素材：底片（无标题字幕）、透明标题 PNG
export type Props = { cards: boolean; subtitles: boolean; title?: boolean; video?: boolean };

export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("NotoSC", `url(${staticFile("fonts/NotoSansSC-VF.ttf")})`, { weight: "100 900" }),
      new FontFace("NotoKR", `url(${staticFile("fonts/NotoSansKR-VF.ttf")})`, { weight: "100 900" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const Title: React.FC = () => {
  const line: React.CSSProperties = {
    fontFamily: ZH,
    fontWeight: 900,
    fontSize: 104,
    lineHeight: 1.22,
    letterSpacing: 4,
    color: "#fff",
    textAlign: "center",
  };
  return (
    <div style={{ position: "absolute", top: TITLE_TOP, left: 0, width: W }}>
      <TitleLines style={line} />
    </div>
  );
};

const Credit: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: VIDEO_TOP - 50,
      left: 0,
      width: W,
      textAlign: "center",
      fontFamily: ZH,
      fontWeight: 500,
      fontSize: 22,
      letterSpacing: 2,
      color: "#8a8a8a",
    }}
  >
    {CREDIT}
  </div>
);

// 重点词：字幕里原地高亮（下划色条）+ 中文下面一行轻注释，不再弹框
// CARDS 里可写 match（字幕里实际出现的写法，如 "잘못 걸렸"）；不写就用 word 去掉 "다"/括号 后的词干去匹配
const stemOf = (c: Card) => c.match || c.word.replace(/\(.*?\)/g, "").replace(/다$/, "").trim();
const markWord = (text: string, card: Card | undefined) => {
  if (!card) return text;
  const stem = stemOf(card);
  const i = stem ? text.indexOf(stem) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ backgroundImage: `linear-gradient(transparent 78%, ${ACCENT} 78%, ${ACCENT} 92%, transparent 92%)` }}>{text.slice(i, i + stem.length)}</span>
      {text.slice(i + stem.length)}
    </>
  );
};

const Gloss: React.FC<{ card: Card; t: number }> = ({ card, t }) => {
  const k = Math.min(1, (t - card.start) / 0.3, (card.end - t) / 0.2);
  return (
    <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16, opacity: k, transform: `translateY(${(1 - Math.min(1, (t - card.start) / 0.3)) * 8}px)` }}>
      <span style={{ fontFamily: KO, fontWeight: 800, fontSize: 36, color: ACCENT }}>{card.word}</span>
      <span style={{ fontFamily: ZH, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,.62)" }}>{card.mean}</span>
    </div>
  );
};

const Subtitle: React.FC<{ t: number; showCards: boolean }> = ({ t, showCards }) => {
  const cue = CUES.find((c) => t >= c.start && t < c.end);
  const card = showCards ? CARDS.find((c) => t >= c.start && t < c.end) : undefined;
  if (!cue && !card) return null;
  const orig = cue ? (cue.steps ? cue.steps.filter(([, at]) => t >= at).map(([s]) => s).join("") : cue.orig) : "";
  return (
    <div style={{ position: "absolute", top: SUB_TOP, left: 50, width: W - 100, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      {cue && SUB_MODE === "bilingual" && (
        <div style={{ fontFamily: KO, fontWeight: 900, fontSize: cue.steps ? 84 : 58, lineHeight: 1.32, letterSpacing: cue.steps ? 10 : 0, color: YELLOW, whiteSpace: "pre-line", wordBreak: "keep-all" }}>
          {markWord(orig, card)}
        </div>
      )}
      {cue && (
        <div style={{ marginTop: SUB_MODE === "bilingual" ? 14 : 0, fontFamily: ZH, fontWeight: 700, fontSize: SUB_MODE === "bilingual" ? 46 : 52, lineHeight: 1.4, color: "#fff", whiteSpace: "pre-line" }}>
          {cue.zh}
        </div>
      )}
      {card && <Gloss card={card} t={t} />}
    </div>
  );
};

export const KimVideo: React.FC<Props> = ({ cards, subtitles, title = true, video = true }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: video ? "#000" : "transparent" }}>
      {title && <Title />}
      {video && <Credit />}
      {video && (
        <div style={{ position: "absolute", top: VIDEO_TOP, left: 0, width: W, height: VIDEO_H, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile("clip.mp4")} style={{ width: W, height: VIDEO_H }} />
      </div>
      )}
      {subtitles && <Subtitle t={t} showCards={cards} />}
    </AbsoluteFill>
  );
};
