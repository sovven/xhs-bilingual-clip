import React from "react";
import { Composition } from "remotion";
import { Cover } from "./Cover";
import { COVER_STYLE } from "./config";
import { FPS, H, KimVideo, TOTAL, W } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Kim"
      component={KimVideo}
      durationInFrames={Math.round(TOTAL * FPS)}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ cards: true, subtitles: true }}
    />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ style: COVER_STYLE }} />
  </>
);
