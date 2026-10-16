'use client';

import React, { useState } from 'react';
import {
  Crosshair,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Activity,
  Ruler,
  Magnet,
  Trash2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface ToolBarProps {
  onToggleIndicatorsModal?: () => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onToggleIndicatorsModal,
  activeTool,
  setActiveTool,
}) => {
  const [magnetActive, setMagnetActive] = useState(false);

  const tools = [
    { id: 'crosshair', icon: Crosshair, label: 'Crosshair Mode' },
    { id: 'trendline', icon: TrendingUp, label: 'Trend Line Tool' },
    { id: 'fibonacci', icon: Layers, label: 'Fibonacci Levels' },
    { id: 'position', icon: ArrowUpRight, label: 'Risk/Reward Long-Short Position' },
    { id: 'indicators', icon: Activity, label: 'Technical Indicators', onClick: onToggleIndicatorsModal },
    { id: 'measure', icon: Ruler, label: 'Price Measure Tool' },
    { id: 'ai_confluence', icon: Sparkles, label: 'AI Confluence Signals' },
  ];

  return (
    <aside className="w-12 bg-[#131722] border-r border-[#242938] flex flex-col items-center py-2.5 space-y-1 select-none z-20 shrink-0">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            title={t.label}
            onClick={() => {
              if (t.onClick) {
                t.onClick();
              } else {
                setActiveTool(t.id);
              }
            }}
            className={`w-9 h-9 rounded flex items-center justify-center transition-colors relative group ${
              isActive
                ? 'bg-[#2962ff] text-white shadow-md'
                : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#1f2433]'
            }`}
          >
            <Icon size={18} />
            {/* Tooltip */}
            <span className="absolute left-12 bg-[#1e222d] text-white text-xs px-2 py-1 rounded border border-[#2d3446] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
              {t.label}
            </span>
          </button>
        );
      })}

      <div className="w-6 h-[1px] bg-[#242938] my-1.5" />

      {/* Magnet Mode */}
      <button
        title="Magnet Mode (Snaps to OHLC)"
        onClick={() => setMagnetActive(!magnetActive)}
        className={`w-9 h-9 rounded flex items-center justify-center transition-colors relative group ${
          magnetActive
            ? 'bg-[#089981]/20 text-[#089981] border border-[#089981]/40'
            : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#1f2433]'
        }`}
      >
        <Magnet size={18} />
        <span className="absolute left-12 bg-[#1e222d] text-white text-xs px-2 py-1 rounded border border-[#2d3446] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
          Magnet Snapping
        </span>
      </button>

      {/* Clear tool */}
      <button
        title="Clear Chart Annotations"
        className="w-9 h-9 rounded flex items-center justify-center text-[#848e9c] hover:text-[#f23645] hover:bg-[#1f2433] transition-colors relative group"
      >
        <Trash2 size={18} />
        <span className="absolute left-12 bg-[#1e222d] text-white text-xs px-2 py-1 rounded border border-[#2d3446] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
          Clear Drawings
        </span>
      </button>

      <div className="mt-auto flex flex-col items-center space-y-1">
        <button
          title="Chart Settings"
          className="w-9 h-9 rounded flex items-center justify-center text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#1f2433] transition-colors"
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>
    </aside>
  );
};
