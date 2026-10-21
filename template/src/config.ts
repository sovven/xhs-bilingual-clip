// 每条视频只改这里（再加 src/cues.ts 里的字幕）。
// 标题：两行，[方括号] 内的字高亮为浅蓝。两行字数一样、不加标点，才能左右对齐。
export const TITLE = ["[金英哲]式英语", "口语全靠[气势]"];
// 出处（显示在画面上方的小灰字）
export const CREDIT = "素材：MBC《Radio Star》第985期";
// 片长（秒），= public/clip.mp4 的时长
export const TOTAL = 78.17;
// public/clip.mp4 的高度（宽固定 1080）
export const VIDEO_H = 762;
// 封面：public/cover_frame.png + 黄色原文钩子 + 白色中文钩子
export const COVER_HOOK = { orig: "절대 주눅 들면 안 돼요!", zh: "被说 Scoot over？听不懂就问到底" };
