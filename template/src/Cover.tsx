import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./Video";
import { COVER_HOOK, VIDEO_H } from "./config";
import { TitleLines } from "./TitleLines";

// 小红书 3:4 封面：同款大标题 + 原片 "Scoot over" 画面 + 一句钩子
const BLUE = "#8fd3ff";
const YELLOW = "#ffde3b";
const ZH = "'NotoSC', 'Microsoft YaHei', sans-serif";
const KO = "'NotoKR', 'NotoSC', sans-serif";

export const Cover: React.FC = () => {
  useFonts();
  const line: React.CSSProperties = {
    fontFamily: ZH,
    fontWeight: 900,
    fontSize: 112,
    lineHeight: 1.2,
    letterSpacing: 4,
    color: "#fff",
    textAlign: "center",
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: 70, width: 1080 }}>
        <TitleLines style={line} />
      </div>
      <Img src={staticFile("cover_frame.png")} style={{ position: "absolute", top: 390, left: 0, width: 1080, height: VIDEO_H }} />
      <div style={{ position: "absolute", top: 1188, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: KO, fontWeight: 900, fontSize: 70, color: YELLOW }}>{COVER_HOOK.orig}</div>
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 50, color: "#fff", marginTop: 10 }}>
          {COVER_HOOK.zh}
        </div>
      </div>
    </AbsoluteFill>
  );
};
