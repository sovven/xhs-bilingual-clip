// 每条视频只改这里（再加 src/cues.ts 里的字幕）。
// 标题：两行，[方括号] 内的字用配色的强调色。两行字数一样、不加标点，才能左右对齐。
export const TITLE = ["[金英哲]式英语", "口语全靠[气势]"];
// 出处（必填！显示在原片上方的小灰字）。格式："素材：<平台/频道>《节目名》<期数>"
export const CREDIT = "素材：MBC《Radio Star》第985期";
// 片长（秒），= public/clip.mp4 的时长
export const TOTAL = 78.17;
// public/clip.mp4 的高度（宽固定 1080）
export const VIDEO_H = 762;
// 封面：public/cover_frame.png + 黄色原文钩子 + 白色中文钩子
export const COVER_HOOK = { orig: "절대 주눅 들면 안 돼요!", zh: "被说 Scoot over？听不懂就问到底" };
// 封面版式：band 黑底大标题 / poster 大字报 / card 韩中对照卡
export const COVER_STYLE: "band" | "poster" | "card" | "reels" = "band";
// 黑底配色预设。规律（参考小红书黑底配色笔记）：
// 1. 黑底上不用纯饱和色，用低饱和、高明度的柔和色；2. 一套只用一个色温；
// 3. 中文字幕用偏暖的米白，不用纯白，和强调色更协调。
// accent=标题关键词/原声字幕/单词胶囊底色，zh=中文字幕，ink=胶囊上的字
export const PALETTES = {
  yellow: { name: "字幕黄", accent: "#ffde3b", zh: "#ffffff", ink: "#111111" },
  apricot: { name: "奶油杏", accent: "#f6c790", zh: "#f2e2c1", ink: "#2b1e10" },
  mint: { name: "薄荷", accent: "#a3ede5", zh: "#f4f2e6", ink: "#0f2e2b" },
  rose: { name: "雾粉", accent: "#f2b3c3", zh: "#f7ecef", ink: "#3a1420" },
  haze: { name: "灰蓝", accent: "#b0c8d3", zh: "#f3e3d3", ink: "#1a2a33" },
} as const;
export type PaletteId = keyof typeof PALETTES;

// 配色预设：yellow 字幕黄 / apricot 奶油杏 / mint 薄荷 / rose 雾粉 / haze 灰蓝（见 palettes.ts）
export const PALETTE: PaletteId = "yellow";
export const ACCENT = PALETTES[PALETTE].accent;
// reels 封面左上角的小字品牌（留空就不显示）
export const COVER_BRAND = "";
// 字幕模式：bilingual 韩中双语 / zh 只加中文（原片自带准确韩语字幕时用；由 scripts/burned-subs.mjs 自动判断）
export const SUB_MODE: "bilingual" | "zh" = "bilingual";
