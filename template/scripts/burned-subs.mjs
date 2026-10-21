// 检测原片有没有"烧录的台词字幕"，并取出每句的精确出现/消失时间。
// 用法：node scripts/burned-subs.mjs public/clip.mp4 [whisper.json] [data/burned.json]
// 输出 { mode: "zh" | "bilingual", stats, segments: [{start, end, text, matched}] }
//   mode=zh：原片字幕就是台词 → 只加中文字幕，时间轴直接用 segments（跟原片字幕同步）
//   mode=bilingual：原片没有台词字幕（或只是综艺花字）→ 照常加韩中双语
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const [clip, whisperPath, out = "data/burned.json"] = process.argv.slice(2);
if (!clip) throw new Error("usage: node scripts/burned-subs.mjs <clip.mp4> [whisper.json] [out.json]");
const FPS = 5;
const tmp = path.resolve("work/ocr_frames");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(path.dirname(out), { recursive: true });

// 1) 抽下半画面（字幕区），放大 2 倍、灰度、加对比度，提高识别率
execFileSync("ffmpeg", ["-v", "error", "-i", clip, "-vf", `fps=${FPS},crop=iw:ih*0.5:0:ih*0.5,scale=iw*2:-1,format=gray,eq=contrast=1.4`, path.join(tmp, "%05d.png")]);

// 2) Windows OCR（韩语）
const ocrJson = path.join(tmp, "ocr.json");
execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.resolve("scripts/ocr.ps1"), tmp, "ko", ocrJson], { stdio: "inherit" });
const ocr = JSON.parse(readFileSync(ocrJson, "utf8").replace(/^﻿/, ""));
let frames = Object.keys(ocr).sort().map((k, i) => ({ t: i / FPS, text: (ocr[k] || "").trim() }));

// 只保留韩文字符做比较
const norm = (s) => (s.match(/[가-힣]/g) || []).join("");
const bigrams = (s) => { const b = new Map(); for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); b.set(k, (b.get(k) || 0) + 1); } return b; };
const dice = (a, b) => {
  if (a.length < 2 || b.length < 2) return a && a === b ? 1 : 0;
  const A = bigrams(a), B = bigrams(b);
  let inter = 0, n = 0;
  for (const [k, v] of A) { inter += Math.min(v, B.get(k) || 0); n += v; }
  for (const v of B.values()) n += v;
  return (2 * inter) / n;
};

// 常驻文字（台标、节目 logo、顶部标题）：在超过 25% 的帧里都出现的行，整行去掉
const NL = "\n";
const lineKey = (l) => norm(l) || l.replace(/\s/g, "");
const freq = new Map();
for (const f of frames) for (const k of new Set(f.text.split(NL).map(lineKey).filter(Boolean))) freq.set(k, (freq.get(k) || 0) + 1);
const isStatic = (l) => {
  const k = lineKey(l);
  if (!k) return true;
  for (const [s, n] of freq) if (n > frames.length * 0.25 && (s === k || dice(s, k) > 0.6)) return true;
  return false;
};
frames = frames.map((f) => ({ ...f, text: f.text.split(NL).filter((l) => !isStatic(l) && norm(l).length >= 2).join(NL) }));

// 3) 文字相同（相似度 ≥ 0.6）的连续帧合并成一句
const segs = [];
for (const f of frames) {
  const k = norm(f.text);
  const last = segs[segs.length - 1];
  if (k.length >= 2 && last && dice(norm(last.text), k) >= 0.6 && f.t - last.end < 0.5) { // 0.5 秒内闪断的同一句也合并
    last.end = f.t + 1 / FPS;
    if (k.length > norm(last.text).length) last.text = f.text; // 取识别最完整的一帧
  } else if (k.length >= 2) {
    segs.push({ start: f.t, end: f.t + 1 / FPS, text: f.text });
  }
}
let segments = segs.filter((s) => s.end - s.start >= 0.4).map((s) => ({ ...s, start: +s.start.toFixed(2), end: +s.end.toFixed(2) }));

// 4) 和 Whisper 听写对比：字幕内容 ≈ 台词 → mode=zh
let mode = "bilingual", stats = { segments: segments.length };
if (whisperPath && existsSync(whisperPath)) {
  const w = JSON.parse(readFileSync(whisperPath, "utf8")).transcription.map((s) => ({ start: s.offsets.from / 1000, end: s.offsets.to / 1000, text: norm(s.text) }));
  const speech = w.reduce((a, s) => a + (s.text ? s.end - s.start : 0), 0) || 1;
  for (const s of segments) {
    const near = w.filter((x) => x.end >= s.start - 1.5 && x.start <= s.end + 1.5).map((x) => x.text).join("");
    s.matched = +dice(norm(s.text), near).toFixed(2) >= 0.35 || norm(near).includes(norm(s.text));
  }
  const matched = segments.filter((s) => s.matched);
  // 判断依据：有多少句"说出来的台词"在画面上找得到对应字幕（台标、花字等噪声不影响）
  const spoken = w.filter((x) => x.text.length >= 2);
  const hit = spoken.filter((x) => matched.some((s) => s.end > x.start - 0.5 && s.start < x.end + 0.5));
  const speechMatch = spoken.length ? hit.length / spoken.length : 0;
  stats = { ocrSegments: segments.length, matched: matched.length, spoken: spoken.length, speechMatch: +speechMatch.toFixed(2) };
  if (speechMatch >= 0.4) mode = "zh";
  if (mode === "zh") segments = matched; // 只保留真正的台词字幕，丢掉台标/花字
  // OCR 漏掉的台词：用 Whisper 的时间补上（标记 fromWhisper，给翻译时参考）
  if (mode === "zh") {
    for (const x of w) {
      if (!x.text) continue;
      const covered = segments.some((s) => s.end > x.start + 0.2 && s.start < x.end - 0.2);
      if (!covered) segments.push({ start: +x.start.toFixed(2), end: +x.end.toFixed(2), text: "", matched: false, fromWhisper: true });
    }
    segments.sort((a, b) => a.start - b.start);
  }
}

writeFileSync(out, JSON.stringify({ mode, stats, segments }, null, 2));
console.log(`mode=${mode}`, JSON.stringify(stats));
