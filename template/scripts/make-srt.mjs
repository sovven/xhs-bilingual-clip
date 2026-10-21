// 从 src/cues.ts 生成双语 SRT（原声一行 + 中文一行），方便在剪映里改字幕
import { writeFileSync } from "node:fs";
import { CUES } from "../src/cues.ts";

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const oneLine = (s) => s.replace(/\n/g, " ");
const srt = CUES.map(
  (c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${oneLine(c.orig)}\n${oneLine(c.zh)}\n`,
).join("\n");
writeFileSync("out/双语字幕.srt", "\ufeff" + srt);
console.log(`wrote ${CUES.length} cues`);
