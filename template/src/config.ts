// 每条视频只改这里（再加 src/cues.ts 里的字幕）。
// 标题：两行，[方括号] 内的字高亮为浅蓝。两行字数一样、不加标点，才能左右对齐。
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
// 高亮色：标题方括号里的字、封面关键词。随便换，比如 #8FD3FF 浅蓝 / #C6F432 荧光绿 / #FFDE3B 黄 / #FF7AB6 粉
export const ACCENT = "#8fd3ff";
// reels 封面左上角的小字品牌（留空就不显示）
export const COVER_BRAND = "";
// 字幕模式：bilingual 韩中双语 / zh 只加中文（原片自带准确韩语字幕时用；由 scripts/burned-subs.mjs 自动判断）
export const SUB_MODE: "bilingual" | "zh" = "bilingual";
