import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CARDS, CUES } from "./cues";
import { CREDIT, PALETTE, PALETTES, SUB_MODE, TITLE, TOTAL, VIDEO_H } from "./config";

// 视频里必须写素材出处
if (!CREDIT.trim()) throw new Error("config.ts 的 CREDIT 必填：视频里必须标注素材出处");
import { TitleLines } from "./TitleLines";
export { TOTAL };

export const W = 1080;
export const H = 1920;
export const FPS = 30;


// 版面（参考外研社韩语竖屏：黑底 + 顶部两行大标题 + 中间原片 + 下方黄韩白中字幕）
// 小红书安全区：顶部 150px 状态栏/作者栏，底部 440px（y>1480）文案和互动栏，右侧 140px 点赞收藏图标
export const SAFE = { top: 150, bottom: 1480, side: 140 };
const TITLE_TOP = SAFE.top;
const SUB_SPACE = SUB_MODE === "zh" ? 130 : 200;
const CARD_H = 84;
const titleBottom = (size: number) => TITLE_TOP + Math.round(size * 1.22 * TITLE.length);
// 原片宽 1080 原尺寸显示，不裁切不缩放；放得下就字幕+词卡排在下方
// 放不下（YT 模式）：标题缩小、原片上移，字幕叠在原片上，但一定在安全线以内
const YT = titleBottom(104) + 28 + 30 + 18 + VIDEO_H + 24 + SUB_SPACE > SAFE.bottom;
const TITLE_SIZE = YT ? 80 : 104;
const TITLE_BOTTOM = titleBottom(TITLE_SIZE);
// 间距：标题底 → 出处小字 → 原片，避免出处贴着/压住标题；YT 模式收紧，给字幕腾位置
const CREDIT_TOP = TITLE_BOTTOM + (YT ? 10 : 28);
const VIDEO_TOP = CREDIT_TOP + (YT ? 30 : 48);
const SHOW_H = VIDEO_H; // 原片原尺寸，不缩小不裁切
const SHOW_W = Math.round((W * SHOW_H) / VIDEO_H);
// YT 模式：中文字幕贴着安全线 1480 往上排（单行），词卡放到原片左上角
const SUB_TOP = YT ? SAFE.bottom - 76 : VIDEO_TOP + SHOW_H + 24;
const CARD_TOP = YT ? VIDEO_TOP + 28 : SUB_TOP + SUB_SPACE;

const PAL = PALETTES[PALETTE];
const YELLOW = PAL.accent;

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
    fontSize: TITLE_SIZE,
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
      top: CREDIT_TOP,
      left: 0,
      width: W,
      textAlign: "center",
      fontFamily: ZH,
      fontWeight: 500,
      fontSize: 22,
      letterSpacing: 1,
      color: "#8a8a8a",
    }}
  >
    {CREDIT}
  </div>
);

const Subtitle: React.FC<{ t: number }> = ({ t }) => {
  const cue = CUES.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const orig = cue.steps
    ? cue.steps.filter(([, at]) => t >= at).map(([s]) => s).join("")
    : cue.orig;
  return (
    <div
      style={{
        position: "absolute",
        top: SUB_TOP,
        left: SAFE.side,
        width: W - SAFE.side * 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {SUB_MODE === "bilingual" && <div
        style={{
          fontFamily: KO,
          fontWeight: 900,
          fontSize: cue.steps ? 76 : 52,
          lineHeight: 1.32,
          letterSpacing: cue.steps ? 10 : 0,
          color: YELLOW,
          whiteSpace: "pre-line",
          wordBreak: "keep-all",
        }}
      >
        {orig}
      </div>}
      <div
        style={{
          marginTop: SUB_MODE === "bilingual" ? 14 : 0,
          fontFamily: ZH,
          fontWeight: 700,
          fontSize: SUB_MODE === "bilingual" ? 40 : 46,
          lineHeight: 1.4,
          color: PAL.zh,
          whiteSpace: "pre-line",
          ...(YT ? { background: "rgba(8,8,8,0.72)", borderRadius: 6, padding: "2px 14px 4px", fontWeight: 500, fontSize: 42, color: "#fff" } : {}),
        }}
      >
        {cue.zh}
      </div>
    </div>
  );
};

const VocabCard: React.FC<{ t: number }> = ({ t }) => {
  const card = CARDS.find((c) => t >= c.start && t < c.end);
  if (!card) return null;
  const inT = t - card.start;
  const outT = card.end - t;
  const k = Math.min(1, inT / 0.25, outT / 0.2);
  const y = interpolate(Math.min(1, inT / 0.25), [0, 1], [18, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: CARD_TOP,
        left: YT ? 36 : 0,
        width: YT ? W - 36 - SAFE.side : W,
        display: "flex",
        justifyContent: YT ? "flex-start" : "center",
        opacity: k,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* 深色磨砂玻璃：保留玻璃质感，压在亮画面上也要一眼看清 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          maxWidth: "100%",
          padding: "14px 28px 16px",
          borderRadius: 24,
          background: "linear-gradient(180deg, rgba(28,28,30,0.72), rgba(10,10,12,0.66))",
          backdropFilter: "blur(26px) saturate(170%)",
          WebkitBackdropFilter: "blur(26px) saturate(170%)",
          border: "1.5px solid rgba(255,255,255,0.32)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontFamily: KO, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: YELLOW, whiteSpace: "nowrap" }}>{card.word}</div>
        <div style={{ width: 2, height: 36, background: "rgba(255,255,255,0.35)" }} />
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, lineHeight: 1.2, color: "#fff", whiteSpace: "nowrap" }}>{card.mean}</div>
      </div>
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
        <div style={{ position: "absolute", top: VIDEO_TOP, left: (W - SHOW_W) / 2, width: SHOW_W, height: SHOW_H, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile("clip.mp4")} style={{ width: SHOW_W, height: SHOW_H }} />
      </div>
      )}
      {subtitles && <Subtitle t={t} />}
      {cards && <VocabCard t={t} />}
    </AbsoluteFill>
  );
};
