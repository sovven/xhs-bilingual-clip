# xhs-bilingual-clip

把韩综（或其他外语）短视频片段做成**小红书竖屏双语字幕视频**的 Claude Code skill，版式参考外研社韩语：

- 黑底 9:16，顶部两行大标题，关键词浅蓝
- 中间原片，下方黄色原声字幕 + 白色中文字幕
- 底部"重点表达"词卡
- 另外输出 3:4 封面、小红书文案，以及剪映/Aegisub 可修改的分层素材（底片、分轨 SRT、可编辑 ASS）

流程：yt-dlp 下载 → 自动识别画面区域并裁切 → whisper.cpp 听写，和 YouTube 字幕、画面字幕三方核对 → Remotion 出片。

## 安装
```bash
git clone https://github.com/sovven/xhs-bilingual-clip ~/.claude/skills/xhs-bilingual-clip
```
然后对 Claude 说："把这个视频做成小红书双语字幕：<链接>"。详见 [SKILL.md](SKILL.md)。

`template/` 里附带一个完整示例（金英哲《Radio Star》"Scoot over" 片段的字幕和词卡）。视频素材和字体不在仓库里。
