import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  GitCompare,
  Cpu,
  BrainCircuit,
  FileSearch,
  TrendingUp,
  Layers,
  Scale,
  UserCheck,
  Bot,
  History,
  FileSpreadsheet,
  Boxes,
  FlaskConical,
  Trophy,
  Database,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo } from './Logo';

export type PageId =
  | 'dashboard'
  | 'inspection'
  | 'comparison'
  | 'intelligence'
  | 'explainable'
  | 'rootcause'
  | 'predictive'
  | 'batch'
  | 'decision'
  | 'review'
  | 'copilot'
  | 'history'
  | 'reports'
  | 'twin'
  | 'synthetic'
  | 'judge'
  | 'model'
  | 'settings'
  | 'about';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
}) => {
  const navSections = [
    {
      group: 'Core Inspection',
      items: [
        { id: 'dashboard', label: '1. Home Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'inspection', label: '2. AI Wafer Inspection', icon: <ScanEye className="w-4 h-4" /> },
        { id: 'comparison', label: '3. Smart Comparison', icon: <GitCompare className="w-4 h-4" /> },
        { id: 'intelligence', label: '4. Wafer Intelligence', icon: <Cpu className="w-4 h-4" /> },
        { id: 'history', label: '12. Inspection History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      group: 'Quality Intelligence',
      items: [
        { id: 'explainable', label: '5. Explainable AI', icon: <BrainCircuit className="w-4 h-4" /> },
        { id: 'rootcause', label: '6. Root Cause Hypotheses', icon: <FileSearch className="w-4 h-4" /> },
        { id: 'predictive', label: '7. Predictive Quality', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'batch', label: '8. Batch Analytics', icon: <Layers className="w-4 h-4" /> },
        { id: 'decision', label: '9. Decision Support', icon: <Scale className="w-4 h-4" /> },
      ],
    },
    {
      group: 'Governance & Collaboration',
      items: [
        { id: 'review', label: '10. Human Review', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'copilot', label: '11. AI Copilot', icon: <Bot className="w-4 h-4" /> },
        { id: 'reports', label: '13. Reports (PDF/CSV)', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'twin', label: '14. Batch Digital Twin', icon: <Boxes className="w-4 h-4" /> },
      ],
    },
    {
      group: 'Simulation & System',
      items: [
        { id: 'synthetic', label: '15. Synthetic Defect Lab', icon: <FlaskConical className="w-4 h-4" /> },
        { id: 'judge', label: '16. Judge Mode (Demo Tour)', icon: <Trophy className="w-4 h-4" /> },
        { id: 'model', label: '17. Model & Dataset', icon: <Database className="w-4 h-4" /> },
        { id: 'settings', label: '18. Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'about', label: '19. About SEMI NEX AI', icon: <Info className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-navy-950/95 border-r border-slate-800/80 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? '-translate-x-full md:translate-x-0 w-20' : 'translate-x-0 w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed ? (
          <Logo size="md" />
        ) : (
          <div className="mx-auto">
            <Logo size="sm" showSubtitle={false} />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-navy-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 custom-scroll">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <h5 className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
                {sec.group}
              </h5>
            )}
            {sec.items.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id as PageId)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/80 border border-transparent'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <span className={active ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Mode */}
      <div className="p-3 border-t border-slate-800/80 bg-navy-900/40">
        {!collapsed ? (
          <div className="flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Platform</span>
              <span className="text-cyan-400 font-bold">SEMI NEX AI</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Dataset</span>
              <span className="text-slate-300 font-semibold">WM-811K</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="WM-811K Engine Active">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
