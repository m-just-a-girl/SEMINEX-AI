import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
  };

  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md" />
        
        {/* SVG Silicon Wafer + Shield + Circuit Symbol */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform hover:scale-105 duration-300"
        >
          {/* Outer Wafer Boundary */}
          <circle cx="50" cy="50" r="46" fill="#0B1528" stroke="#00F0FF" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          
          {/* Silicon Grid / Die Array Traces */}
          <path d="M22 50H78 M50 22V78 M32 32H68 M32 68H68 M32 32V68 M68 32V68" stroke="#0891B2" strokeWidth="1" opacity="0.4" />
          
          {/* Central AI Precision Core */}
          <polygon points="50,28 69,39 69,61 50,72 31,61 31,39" fill="#0E2347" stroke="#22D3EE" strokeWidth="1.5" />
          
          {/* Glowing Center Die Node */}
          <circle cx="50" cy="50" r="5" fill="#00F0FF" />
          <circle cx="50" cy="50" r="11" fill="none" stroke="#00F0FF" strokeWidth="1.2" opacity="0.8" />
          
          {/* Notch / Flat Indicator */}
          <line x1="46" y1="4" x2="54" y2="4" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-wider text-white ${s.text}`}>
            SEMI<span className="text-cyan-400">NEX</span>
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            AI
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-slate-400 font-mono tracking-widest uppercase mt-0.5 ${s.sub}`}>
            Semiconductor Quality Intel
          </span>
        )}
      </div>
    </div>
  );
};
