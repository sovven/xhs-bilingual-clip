// 找竖屏搬运视频里"中间画面"的上下边界（上下是纯色底+标题的那种 Shorts）。
// 用法：node scripts/detect-crop.mjs original.mp4  → 打印 ffmpeg 的 crop 参数
import { execFileSync } from "node:child_process";

const src = process.argv[2];
if (!src) throw new Error("usage: node scripts/detect-crop.mjs <video>");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", src]));
const { width: W, height: H } = probe.streams[0];
const dur = Number(probe.format.duration);

// 在 5 个时间点取每行平均亮度；画面区域的行亮度随时间变化，底色行几乎不变
const rows = [];
for (const k of [0.15, 0.35, 0.5, 0.65, 0.85]) {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-ss", String(dur * k), "-i", src, "-frames:v", "1", "-vf", "format=gray", "-f", "rawvideo", "-"], { maxBuffer: W * H * 2 });
  rows.push(Array.from({ length: H }, (_, y) => { let s = 0; for (let x = 0; x < W; x++) s += buf[y * W + x]; return s / W; }));
}
const varies = Array.from({ length: H }, (_, y) => {
  const v = rows.map((r) => r[y]);
  return Math.max(...v) - Math.min(...v) > 6;
});
// 最长的连续"变化"区段 = 画面
let best = [0, 0], cur = -1;
for (let y = 0; y <= H; y++) {
  if (y < H && varies[y]) { if (cur < 0) cur = y; }
  else if (cur >= 0) { if (y - cur > best[1] - best[0]) best = [cur, y]; cur = -1; }
}
// 各收 2 行，避开边缘过渡；高度取偶数
const top = best[0] + 2;
let h = best[1] - 2 - top;
h -= h % 2;
console.log(`crop=${W}:${h}:0:${top}`);
