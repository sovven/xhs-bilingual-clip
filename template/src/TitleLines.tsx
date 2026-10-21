import React from "react";
import { TITLE } from "./config";

export const BLUE = "#8fd3ff";

// "[金英哲]式英语" → 方括号内高亮
const Line: React.FC<{ text: string; style: React.CSSProperties }> = ({ text, style }) => (
  <div style={style}>
    {text.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) =>
      p.startsWith("[") ? <span key={i} style={{ color: BLUE }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>,
    )}
  </div>
);

export const TitleLines: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <>{TITLE.map((t, i) => <Line key={i} text={t} style={style} />)}</>
);
