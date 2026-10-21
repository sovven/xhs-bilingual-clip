---
name: xhs-bilingual-clip
description: 把 YouTube/Shorts 上的韩综（或其他外语）短视频片段，做成小红书竖屏双语字幕视频，版式参考外研社韩语：黑底 9:16、顶部两行大标题（关键词浅蓝）、中间原片、下方黄色原声字幕 + 白色中文字幕、重点表达词卡。同时输出 3:4 封面、小红书文案，以及给剪映/Aegisub 修改用的分层素材（底片、分轨 SRT、可编辑 ASS）。当用户给出视频链接并说"做成小红书""外研社那种格式""加双语字幕"时使用。
---

# 小红书双语字幕短视频（外研社韩语版式）

模板在本 skill 的 `template/`（Remotion 4 项目）。每条视频复制一份模板到新文件夹再改。

## 工具（Windows，装在 D 盘）
- yt-dlp：`D:\Tools\yt-dlp\yt-dlp.exe`
- whisper.cpp：`D:\Tools\whisper\bin\Release\whisper-cli.exe` + `D:\Tools\whisper\ggml-large-v3-turbo-q5_0.bin`
- ffmpeg（full build，需要在 PATH 里）
- Node 22+；Remotion 依赖用 `npm i` 安装，或者把 node_modules 做成 junction 指向已有项目
- 字体：把 `C:\Windows\Fonts\NotoSansSC-VF.ttf`、`NotoSansKR-VF.ttf` 复制到 `public/fonts/`

缺少的工具要先问用户能不能下载，装到 `D:\Tools`，不要装在 C 盘。

## 流程
1. **下载**：`yt-dlp -f "bv*[height>=1080]+ba/b" --merge-output-format mp4 -o original.mp4 <url>`
2. **看内容**：用 `ffmpeg -vf "fps=2,...,tile=4x4"` 加时间戳拼成联系表，读懂剧情和画面里烧录的字幕。
3. **裁画面**：Shorts 搬运视频通常上下是纯色底加标题。先运行 `node scripts/detect-crop.mjs original.mp4` 得到 crop 参数，再执行
   `ffmpeg -i original.mp4 -vf "crop=..." -c:v libx264 -crf 14 -pix_fmt yuv420p -c:a aac -b:a 256k public/clip.mp4`。
   把 clip 的高度和时长写进 `src/config.ts`（`VIDEO_H`、`TOTAL`）。
4. **听写**：`ffmpeg -i original.mp4 -vn -ac 1 -ar 16000 audio16k.wav`，然后
   `whisper-cli -m <model> -f audio16k.wav -l ko -ojf -osrt --prompt "<节目名、人名、关键词>"`。
   如果有 YouTube 自动字幕，可以在浏览器里打开播放器的字幕，从网络请求里拿 timedtext json3（直接请求需要 pot 参数），用来交叉核对。
   **三方核对**：Whisper、YouTube ASR、画面烧录字幕对照着定稿。听不清的句子宁可删掉，也不要编，并在交付时告诉用户。
4b. **原片自带字幕？** `node scripts/burned-subs.mjs public/clip.mp4 audio16k.json data/burned.json`（Windows 自带 OCR，免费，约 40 秒）。
   - `mode=zh`：原片有准确的韩语台词字幕 → config 设 `SUB_MODE = "zh"`，**只加中文字幕**，时间轴直接用 burned.json 的 segments（和原片字幕同步出现/消失；OCR 漏掉的句子已用 Whisper 时间补上）。
   - `mode=bilingual`：没有台词字幕（或只有综艺花字）→ 照常做韩中双语。
5. **写字幕**：编辑 `src/cues.ts`。`orig` 是原声（韩语/英语照实写），`zh` 是中文；每条控制在 1–2 行，可以用 `\n` 手动换行。
   `steps` 用来让文字逐个出现（比如逐字母喊）。`CARDS` 是重点表达：字幕里原地给这个词加高亮下划线，中文下面再加一行小字注释（不弹框）。`match` 填字幕里实际出现的写法（比如"잘못 걸렸"），每条至少显示 2.5 秒。
6. **标题和出处**：`CREDIT` **必填**（视频里必须标出处，没写会直接报错），格式“素材：<平台/频道>《节目名》<期数>”。在 `src/config.ts` 里写 `TITLE`，两行，`[方括号]` 内的字高亮。**两行字数相同、不加标点**，否则左右对不齐。`CREDIT` 填素材出处。
7. **检查**：先抽几帧看版式，`npx remotion still src/index.ts Kim work/f.png --frame=N`，确认没问题再渲染整片。
8. **出片**：
   - `npx remotion render src/index.ts Kim out/成片.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=256k`
   - 封面：先挑一帧人物清楚、**没有烧录大字幕**的画面，`ffmpeg -ss <秒> -i public/clip.mp4 -frames:v 1 public/cover_frame.png`；在 config 里设置 `COVER_HOOK`、`COVER_STYLE`、`ACCENT`，然后运行 `npx remotion still src/index.ts Cover out/封面_3比4.png`
     - `band` 黑底大标题（外研社同款）· `poster` 大字报 · `card` 韩中对照卡 · `reels` Reels 款（参考 Instagram 的 offtheclock.mag、1ma2c：画面铺满，底部两行粗白字，关键词用高亮色，下面一行斜体小字）
     - `ACCENT` 是高亮色，可以随意换：浅蓝 #8FD3FF / 荧光绿 #C6F432 / 黄 #FFDE3B / 粉 #FF7AB6
   - `npm run srt` 生成双语 SRT；`npm run pack` 生成剪映素材（见下）
9. **文案**：写 `out/小红书文案.txt`，包括标题、正文（剧情钩子 + 视频里的表达词汇表 + 互动提问）、素材出处和话题标签。

## 剪映 / 其他软件修改
`npm run pack` 会输出 `out/剪映素材/`：
- `底片_无标题无字幕.mp4`：黑底 + 原片 + 出处，带原声
- `原声字幕.srt`、`中文字幕.srt`：在剪映里点"文本 → 本地字幕 → 导入"，会变成两条字幕轨，可以分别设黄色/白色，逐句修改
- `全部文字.ass`：标题、双语字幕、词卡，全部是可编辑的文字，带颜色和位置。可以用 Aegisub 打开编辑，PotPlayer 预览，达芬奇/Pr 也能导入。改完后可以用 `ffmpeg -i 底片.mp4 -vf "subtitles=全部文字.ass:fontsdir=public/fonts" ...` 压回视频
- `标题_透明.png`：标题图层（图片，不能改字；要改字就在剪映里重新打，样式见 `标题与样式.txt`）

剪映的工程文件是加密的，没法直接生成工程。

## 版式参数（1080×1920）
标题从 y=120 开始，104px，粗细 900；原片从 y=440 开始，宽 1080；原声字幕在原片下方 40px，黄色 #FFDE3B，58px，粗细 900；中文字幕白色，46px，粗细 700；词卡在 y≈1556；高亮色浅蓝 #8FD3FF。y>1700 的区域会被小红书的界面挡住，不要放内容。

## 选片
- 不做：体育（比赛、运动员、奥运）、政治/时政、负面社会新闻。
- 优先 60 秒以内的 Shorts。常见来源：엠빅뉴스、WassupMan、숏박스、너덜트、지구오락실、유퀴즈、百想艺术大赏获奖感言、街头采访。
- 配套工作台：KCLIP Studio（发现 → AI 推荐 → 一键制作）。

## 注意
- 不要使用外研社（或其他机构）的 logo、账号名做水印或片尾，除非用户确认自己就是该账号的运营。
- 素材版权归原节目方，交付时提醒用户有被投诉或限流的风险。
