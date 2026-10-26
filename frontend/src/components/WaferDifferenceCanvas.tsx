import React, { useRef, useEffect } from 'react';

interface WaferDifferenceCanvasProps {
  differenceMap: number[][];
  size?: number;
}

export const WaferDifferenceCanvas: React.FC<WaferDifferenceCanvasProps> = ({
  differenceMap,
  size = 340,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !differenceMap || differenceMap.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = differenceMap.length;
    const cols = differenceMap[0].length;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#060B17';
    ctx.fillRect(0, 0, size, size);

    const cellW = size / cols;
    const cellH = size / rows;

    // Draw wafer boundary
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.47, 0, Math.PI * 2);
    ctx.stroke();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = differenceMap[r][c];
        const px = c * cellW;
        const py = r * cellH;

        if (val === 0) {
          // Identical / no defect delta
          continue;
        } else if (val === 1) {
          // Reference only (Resolved in Comparison) -> Blue / Cyan
          ctx.fillStyle = '#00F0FF';
        } else if (val === 2) {
          // Comparison only (New defect appeared) -> Orange / Red
          ctx.fillStyle = '#F97316';
        } else if (val === 3) {
          // Persistent defect (Present in both) -> Bright Crimson
          ctx.fillStyle = '#EF4444';
        }

        ctx.fillRect(px + 0.5, py + 0.5, cellW - 0.9, cellH - 0.9);
      }
    }
  }, [differenceMap, size]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-2 rounded-xl bg-navy-900/90 border border-slate-800 shadow-xl">
        <canvas ref={canvasRef} style={{ width: size, height: size }} className="rounded-lg block" />
      </div>
      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF] inline-block" />
          <span>Resolved in Cmp (1)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F97316] inline-block" />
          <span>New in Cmp (2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444] inline-block" />
          <span>Persistent (3)</span>
        </div>
      </div>
    </div>
  );
};
