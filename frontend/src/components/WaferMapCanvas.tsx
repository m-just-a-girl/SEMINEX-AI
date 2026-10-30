import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Crosshair } from 'lucide-react';

interface WaferMapCanvasProps {
  matrix: number[][];
  densityMap?: number[][];
  size?: number;
  interactive?: boolean;
  showCoordinates?: boolean;
  title?: string;
  subtitle?: string;
}

export const WaferMapCanvas: React.FC<WaferMapCanvasProps> = ({
  matrix,
  densityMap,
  size = 340,
  interactive = true,
  showCoordinates = true,
  title,
  subtitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showDensity, setShowDensity] = useState<boolean>(false);
  const [hoverDie, setHoverDie] = useState<{ x: number; y: number; val: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !matrix || matrix.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = matrix.length;
    const cols = matrix[0].length;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#060B17';
    ctx.fillRect(0, 0, size, size);

    // Coordinate transformation
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-size / 2, -size / 2);

    const cellW = size / cols;
    const cellH = size / rows;

    // Draw wafer circular boundary guide
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.47;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Notch / flat orientation line (standard semiconductor wafer alignment mark)
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY - radius);
    ctx.lineTo(centerX + 8, centerY - radius);
    ctx.stroke();

    // Render dies
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = matrix[r][c];
        if (val === 0) continue; // background outside wafer boundary

        const px = c * cellW;
        const py = r * cellH;

        if (showDensity && densityMap && densityMap.length > 0) {
          // Map (r, c) to density grid (whether densityMap is 10x10 or full resolution)
          const dr = Math.min(densityMap.length - 1, Math.floor((r / rows) * densityMap.length));
          const dc = Math.min(densityMap[dr].length - 1, Math.floor((c / cols) * densityMap[dr].length));
          const rawDensity = densityMap[dr]?.[dc] ?? 0;
          const intensity = rawDensity > 1 ? rawDensity / 100 : rawDensity;

          if (val === 2) {
            ctx.fillStyle = '#EF4444'; // Defect die
          } else if (intensity > 0.02) {
            // Hotspot gradient: cyan -> amber -> orange -> red
            if (intensity > 0.5) {
              ctx.fillStyle = `rgba(249, 115, 22, ${Math.min(0.95, intensity * 0.9 + 0.15)})`;
            } else if (intensity > 0.2) {
              ctx.fillStyle = `rgba(245, 158, 11, ${Math.min(0.85, intensity * 0.8 + 0.1)})`;
            } else {
              ctx.fillStyle = `rgba(6, 182, 212, ${Math.min(0.7, intensity * 0.7 + 0.1)})`;
            }
          } else {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'; // Passing baseline
          }
        } else {
          // Standard categorical wafer map
          if (val === 1) {
            ctx.fillStyle = '#10B981'; // Passing die
          } else if (val === 2) {
            ctx.fillStyle = '#EF4444'; // Failing / Defect die
          }
        }

        ctx.fillRect(px + 0.5, py + 0.5, cellW - 0.9, cellH - 0.9);
      }
    }

    // Highlight hovered die
    if (hoverDie && hoverDie.x >= 0 && hoverDie.x < cols && hoverDie.y >= 0 && hoverDie.y < rows) {
      const hx = hoverDie.x * cellW;
      const hy = hoverDie.y * cellH;
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hx - 1, hy - 1, cellW + 1, cellH + 1);
    }

    ctx.restore();
  }, [matrix, densityMap, size, zoomLevel, showDensity, hoverDie]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !matrix || matrix.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Map mouse position from screen pixels through canvas zoom transform to wafer grid
    const scaleFactor = canvas.width / rect.width;
    const rawX = (e.clientX - rect.left) * scaleFactor;
    const rawY = (e.clientY - rect.top) * scaleFactor;

    const centerX = size / 2;
    const centerY = size / 2;
    const waferX = (rawX - centerX) / zoomLevel + centerX;
    const waferY = (rawY - centerY) / zoomLevel + centerY;

    const rows = matrix.length;
    const cols = matrix[0].length;
    const cellW = size / cols;
    const cellH = size / rows;

    const col = Math.floor(waferX / cellW);
    const row = Math.floor(waferY / cellH);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      setHoverDie({ x: col, y: row, val: matrix[row][col] });
    } else {
      setHoverDie(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverDie(null);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {(title || subtitle) && (
        <div className="w-full flex items-center justify-between mb-2 px-1">
          <div>
            {title && <h4 className="text-sm font-semibold text-slate-200">{title}</h4>}
            {subtitle && <p className="text-[11px] font-mono text-slate-400">{subtitle}</p>}
          </div>
          {interactive && densityMap && (
            <button
              onClick={() => setShowDensity(!showDensity)}
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                showDensity
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                  : 'bg-navy-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle derived spatial-density overlay"
            >
              <Layers className="w-3 h-3" />
              <span>{showDensity ? 'Density Map' : 'Die Map'}</span>
            </button>
          )}
        </div>
      )}

      {/* Wafer Canvas Frame */}
      <div className="relative p-2 rounded-xl bg-navy-900/90 border border-slate-800 shadow-xl group">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="rounded-lg cursor-crosshair block"
          style={{ width: size, height: size }}
        />

        {/* Hover Coordinate Pill */}
        {showCoordinates && hoverDie && (
          <div className="absolute top-4 left-4 pointer-events-none px-2 py-1 rounded bg-navy-950/90 border border-cyan-500/30 text-[10px] font-mono text-slate-200 backdrop-blur-sm shadow-md">
            Die [X:{hoverDie.x}, Y:{hoverDie.y}]:{' '}
            <span
              className={`font-semibold ${
                hoverDie.val === 2
                  ? 'text-red-400'
                  : hoverDie.val === 1
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {hoverDie.val === 2 ? 'DEFECT DIE' : hoverDie.val === 1 ? 'PASSING DIE' : 'OUTSIDE WAFER'}
            </span>
          </div>
        )}

        {/* Controls Overlay */}
        {interactive && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity bg-navy-950/90 p-1 rounded-lg border border-slate-700/60 shadow">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1 rounded text-slate-300 hover:text-cyan-400 hover:bg-navy-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              className="p-1 rounded text-slate-300 hover:text-cyan-400 hover:bg-navy-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded text-slate-300 hover:text-cyan-400 hover:bg-navy-800"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Pass (1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            <span>Fail (2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-700 inline-block" />
            <span>Outside (0)</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500">
          {matrix ? `${matrix.length}x${matrix[0]?.length || 0} Dies` : ''}
        </span>
      </div>

      {showDensity && (
        <p className="text-[10px] font-mono text-cyan-400/80 mt-1 italic text-center">
          * Derived wafer-map spatial analysis — not ground-truth defect segmentation.
        </p>
      )}
    </div>
  );
};
