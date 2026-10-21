// 导出剪映可编辑的分层素材到 out/剪映素材/：
//   底片_无标题无字幕.mp4  黑底 + 原片 + 出处（带原声）
//   标题_透明.png          1080x1920 透明底，直接叠在最上层
//   原声字幕.srt / 中文字幕.srt / 双语字幕.srt   剪映：文本 → 本地字幕 → 导入
//   重点表达.srt           词卡文字，也可当字幕轨导入
//   全部文字.ass           标题+双语字幕+词卡，带颜色和位置，Aegisub/PotPlayer/达芬奇可打开编辑
//   标题与样式.txt         标题文字、颜色、位置，方便在剪映里重打
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { CARDS, CUES } from "../src/cues.ts";
import { TITLE } from "../src/config.ts";

const OUT = "out/剪映素材";
mkdirSync(OUT, { recursive: true });

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const one = (s) => s.replace(/\n/g, " ");
const srt = (items, text) =>
  "\ufeff" + items.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${text(c)}\n`).join("\n");

writeFileSync(`${OUT}/原声字幕.srt`, srt(CUES, (c) => one(c.orig)));
writeFileSync(`${OUT}/中文字幕.srt`, srt(CUES, (c) => one(c.zh)));
writeFileSync(`${OUT}/双语字幕.srt`, srt(CUES, (c) => `${one(c.orig)}\n${one(c.zh)}`));
writeFileSync(`${OUT}/重点表达.srt`, srt(CARDS, (c) => `重点表达  ${c.word}  ${c.mean}`));
writeFileSync(
  `${OUT}/标题与样式.txt`,
  [
    "画布 1080x1920（9:16），黑底",
    "标题两行（思源黑体/Noto Sans SC Heavy，104px，白色，关键词浅蓝 #8FD3FF，居中，顶部约 y=120）",
    ...TITLE.map((t, i) => `  第${i + 1}行：${t}（方括号内的字用浅蓝）`),
    "原片位置：y=440 起，高 762（底片里已经摆好）",
    "原声字幕：黄色 #FFDE3B，粗体约 58px，原片下方 40px 居中",
    "中文字幕：白色，粗体约 46px，在原声字幕下方",
    "",
    "剪映导入：文本 → 本地字幕 → 导入 原声字幕.srt 和 中文字幕.srt（会变成两条字幕轨，分别设样式）",
  ].join("\n"),
);

// ASS：所有文字都可编辑。颜色 &HBBGGRR&
const at = (s) => { const cs = Math.round(s * 100); const p = (n) => String(n).padStart(2, "0"); return `${Math.floor(cs / 360000)}:${p(Math.floor(cs / 6000) % 60)}:${p(Math.floor(cs / 100) % 60)}.${p(cs % 100)}`; };
const BS = String.fromCharCode(92); // 反斜杠，ASS 标签用
const tag = (t) => `{${BS}${t}}`;
const hl = (t) => t.replace(/\[([^\]]+)\]/g, `${tag("c&HFFD38F&")}$1${tag("c&HFFFFFF&")}`);
const br = (t) => t.split("\n").join(`${BS}N`);
const END = Math.max(...CUES.map((c) => c.end)) + 1;
const ev = (a, b, style, text) => `Dialogue: 0,${at(a)},${at(b)},${style},,0,0,0,,${text}`;
const ass = [
  "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0", "",
  "[V4+ Styles]",
  "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
  "Style: 标题,Noto Sans SC Black,104,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,4,0,1,0,0,8,40,40,120,1",
  "Style: 原声,Noto Sans KR Black,58,&H003BDEFF,&H003BDEFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,8,50,50,1242,1",
  "Style: 中文,Noto Sans SC Bold,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,8,50,50,1335,1",
  "Style: 词卡,Noto Sans SC Bold,36,&H00FFFFFF,&H00FFFFFF,&H003A3A3A,&H00121212,-1,0,0,0,100,100,0,0,3,10,0,8,50,50,1570,1",
  "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ev(0, END, "标题", tag("an8") + tag("pos(540,120)") + TITLE.map(hl).join(`${BS}N`)),
  ...CUES.map((c) => ev(c.start, c.end, "原声", br(c.orig))),
  ...CUES.map((c) => ev(c.start, c.end, "中文", br(c.zh))),
  ...CARDS.map((c) => ev(c.start, c.end, "词卡", `${tag("c&H3BDEFF&")}重点表达  ${c.word}${tag("c&HFFFFFF&")}  ${c.mean}`)),
].join("\n");
writeFileSync(`${OUT}/全部文字.ass`, "﻿" + ass);

const r = (cmd) => execSync(cmd, { stdio: "inherit" });
r(`npx remotion still src/index.ts Kim "${OUT}/标题_透明.png" --frame=0 --image-format=png --props="{\\"cards\\":false,\\"subtitles\\":false,\\"title\\":true,\\"video\\":false}" --log=error`);
r(`npx remotion render src/index.ts Kim "${OUT}/底片_无标题无字幕.mp4" --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=256k --props="{\\"cards\\":false,\\"subtitles\\":false,\\"title\\":false,\\"video\\":true}" --log=error`);
console.log("done →", OUT);
