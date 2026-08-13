import { useState } from "react";
import type { TrainingScore } from "../../../types/admin";

const W = 560;
const H = 260;
const PAD = { top: 20, right: 20, bottom: 40, left: 36 };
const MAX = 10;

function ScoreChart({ data }: { data: TrainingScore[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const y = (v: number) => PAD.top + plotH - (v / MAX) * plotH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.avgScore)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z`;

  return (
    <article className="ui-card">
      <h3 className="text-lg">Đánh giá Năng lực Trainee</h3>
      <p className="mt-1 text-sm text-muted">Điểm trung bình qua các buổi Training</p>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 w-full" role="img" aria-label="Biểu đồ đường điểm trung bình trainee qua các buổi training">
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[2.5, 5, 7.5, 10].map((v) => (
          <line key={v} x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="currentColor" className="text-muted" strokeOpacity="0.35" strokeWidth="1" />
        ))}

        <path d={areaPath} fill="url(#scoreFill)" />
        <path d={linePath} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <g key={d.session} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={x(i) - plotW / data.length / 2} y={PAD.top} width={plotW / data.length} height={plotH} fill="transparent" />
            <circle cx={x(i)} cy={y(d.avgScore)} r={hover === i ? 7 : 5} fill="#7C3AED" stroke="currentColor" className="text-background" strokeWidth="2" style={{ transition: "r 200ms ease-in-out" }} />
            {hover === i && (
              <g>
                <rect x={x(i) - 40} y={y(d.avgScore) - 44} width={80} height={30} rx="8" fill="currentColor" className="text-foreground" />
                <text x={x(i)} y={y(d.avgScore) - 24} textAnchor="middle" className="fill-background text-[11px] font-medium">
                  {d.avgScore.toFixed(1)} / 10
                </text>
              </g>
            )}
            <text x={x(i)} y={H - 14} textAnchor="middle" className="fill-muted text-[12px]">
              {d.session}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}

export default ScoreChart;
