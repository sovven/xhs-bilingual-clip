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
import { CREDIT, PALETTE, PALETTES, SUB_MODE, TOTAL, VIDEO_H } from "./config";

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
const VIDEO_TOP = 460;
// 原片最高显示 680，超出的部分 cover 裁掉左右，给字幕和词卡留位置
const SHOW_H = Math.min(VIDEO_H, 680);
const SUB_TOP = VIDEO_TOP + SHOW_H + 32;
// 词卡排在字幕下方：双语最多 2 行韩 + 1 行中，只中文约 2 行；词卡底边不能超过 SAFE.bottom
const CARD_TOP = Math.min(SAFE.bottom - 76, SUB_TOP + (SUB_MODE === "zh" ? 140 : 220));

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
        left: 0,
        width: W,
        display: "flex",
        justifyContent: "center",
        opacity: k,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* 单词放在强调色圆角胶囊里，右边是释义；不加“重点表达”标签 */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: W - SAFE.side * 2 }}>
        <div
          style={{
            fontFamily: KO,
            fontWeight: 800,
            fontSize: 40,
            color: PAL.ink,
            background: YELLOW,
            borderRadius: 999,
            padding: "6px 26px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {card.word}
        </div>
        <div style={{ fontFamily: ZH, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: PAL.zh }}>{card.mean}</div>
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
        <div style={{ position: "absolute", top: VIDEO_TOP, left: 0, width: W, height: SHOW_H, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile("clip.mp4")} style={{ width: W, height: SHOW_H, objectFit: "cover" }} />
      </div>
      )}
      {subtitles && <Subtitle t={t} />}
      {cards && <VocabCard t={t} />}
    </AbsoluteFill>
  );
};
