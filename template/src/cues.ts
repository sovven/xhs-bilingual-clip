// 逐句字幕：orig = 原声（韩语/英语），zh = 中文。时间单位秒，对齐 public/clip.mp4。
// 听写来源：Whisper large-v3-turbo + YouTube 自动字幕 + MBC 画面字幕三方核对。

export type Cue = {
  start: number;
  end: number;
  orig: string;
  zh: string;
  // 逐个出现的片段（用于 L! A! R! G! E!），[文字, 出现时间]
  steps?: [string, number][];
};

export const CUES: Cue[] = [
  { start: 0.0, end: 2.1, orig: "Scoot over.", zh: "往里挪一挪。" },
  { start: 2.2, end: 3.8, orig: "'Scoot over'를 딱 들었는데", zh: "一听到 scoot over" },
  { start: 3.8, end: 6.1, orig: "scoot? 스쿠터? scoot이 뭐지?", zh: "scoot？滑板车？scoot 是啥？" },
  { start: 6.1, end: 9.4, orig: "over 하는데, 딱 느낌이 그냥\n'저리로 가' 같은 거예요.", zh: "再加个 over，感觉就像在说“去那边”。" },
  { start: 9.5, end: 11.7, orig: "근데 제가 그냥 가면", zh: "可我要是就这么乖乖走开" },
  { start: 11.7, end: 14.3, orig: "너무 눈물이 날 정도로\n시카고에서 속상할 것 같아서", zh: "在芝加哥得憋屈得想哭" },
  { start: 14.3, end: 17.0, orig: "진짜 또박또박 했어요, 제 영어를.", zh: "于是我一字一句、清清楚楚地说起了英语。" },
  { start: 17.4, end: 19.4, orig: "Excuse me, what did you say?", zh: "不好意思，您说什么？" },
  { start: 19.4, end: 21.9, orig: "Would you say once again, please?", zh: "能请您再说一遍吗？" },
  { start: 22.0, end: 24.3, orig: "I didn't understand what you mean.", zh: "我没听懂您的意思。" },
  { start: 24.4, end: 26.9, orig: "그니까 이분이 약간… '아, 진짜…'", zh: "这位就有点……“啊，真是……”" },
  { start: 27.2, end: 28.95, orig: "I said, scoot over!", zh: "我说了，往里挪！" },
  { start: 29.1, end: 30.6, orig: "What do you mean, 'scoot over'?", zh: "scoot over 是什么意思？" },
  { start: 30.6, end: 32.1, orig: "I'm (an) English learner.", zh: "我还在学英语呢。" },
  { start: 32.1, end: 33.8, orig: "I've never heard that before.", zh: "这个说法我以前没听过。" },
  { start: 33.8, end: 34.95, orig: "So would you say once again, please?", zh: "所以能请您再说一遍吗？" },
  { start: 35.0, end: 37.1, orig: "잘못 걸렸다, 잘못 걸렸어!", zh: "这回可惹错人了！" },
  { start: 37.3, end: 39.5, orig: "There's a line and then…", zh: "那边在排队，然后……" },
  { start: 39.5, end: 40.4, orig: "No, no, no.", zh: "不不不，" },
  { start: 40.4, end: 42.7, orig: "I mean, what do you mean, 'scoot over'?", zh: "我是说，scoot over 是什么意思？" },
  { start: 42.8, end: 44.15, orig: "Would you say once again, please?", zh: "能请您再说一遍吗？" },
  { start: 44.2, end: 45.5, orig: "계속 했더니 이분도 짜증 나지.", zh: "我一直这么问，人家也烦了呗。" },
  { start: 45.6, end: 47.2, orig: "I'm so sorry about that!", zh: "哎哟，真是抱歉哈！" },
  { start: 47.3, end: 50.9, orig: "무례하긴 한데, 그게 약간\n'야, 됐어. 비켜. 저리로 가. 다음!'이야.", zh: "虽然没礼貌，但意思差不多就是：\n“行了，让开，去那边，下一位”" },
  { start: 51.6, end: 53.7, orig: "미국 나갈 때 여러분,\n절대 주눅 들면 안 될 것 같아요.", zh: "各位去美国的时候，千万别发怵。" },
  { start: 53.9, end: 58.3, orig: "I have… a… L… L… Large coke?", zh: "我……有……一杯大……大杯可乐？" },
  { start: 58.5, end: 60.7, orig: "@#%!… 라… 롸… 아르… 라지 콕?", zh: "（叽里咕噜）……拉……啦……Large coke？" },
  { start: 61.0, end: 62.4, orig: "그렇게까지요?", zh: "至于这样吗？" },
  { start: 63.9, end: 66.3, orig: "왜냐면 사실 햄버거 시키는데", zh: "因为点汉堡的时候，" },
  { start: 66.3, end: 68.6, orig: "콜라인 거 알면서 'Sorry, I don't get it.'", zh: "明知道你说的是可乐，还装“抱歉，没听懂”。" },
  { start: 68.7, end: 69.75, orig: "저는 그때 그렇게 했어요.", zh: "我当时就这么干的——" },
  { start: 69.8, end: 71.05, orig: "Can I have a large coke?", zh: "我要一杯大杯可乐。" },
  { start: 71.05, end: 71.6, orig: "Sorry?", zh: "什么？" },
  {
    start: 71.65,
    end: 77.4,
    orig: "L! A! R! G! E!",
    zh: "（一个字母一个字母地喊）大——杯——！",
    steps: [
      ["L!", 71.65],
      [" A!", 72.3],
      [" R!", 72.98],
      [" G!", 73.66],
      [" E!", 74.38],
    ],
  },
];

// 重点表达卡片
export type Card = { start: number; end: number; word: string; mean: string };

export const CARDS: Card[] = [
  { start: 2.2, end: 9.4, word: "scoot over", mean: "往里挪一挪（口语，略显不客气）" },
  { start: 14.3, end: 17.3, word: "또박또박", mean: "一字一句地、清清楚楚地" },
  { start: 35.0, end: 38.0, word: "잘못 걸리다", mean: "惹错人、碰上硬茬" },
  { start: 44.2, end: 47.2, word: "짜증(이) 나다", mean: "心烦、不耐烦" },
  { start: 47.3, end: 51.0, word: "무례하다", mean: "无礼、没礼貌" },
  { start: 51.6, end: 54.6, word: "주눅(이) 들다", mean: "发怵、畏缩、怯场" },
  { start: 63.9, end: 68.6, word: "시키다", mean: "（点餐时）点" },
];
