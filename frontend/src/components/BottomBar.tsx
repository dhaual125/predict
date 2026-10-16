'use client';

import React from 'react';
import { Cpu, Activity, Clock, ShieldCheck } from 'lucide-react';

interface BottomBarProps {
  symbol: string;
  price: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({ symbol, price }) => {
  return (
    <footer className="h-7 bg-[#131722] border-t border-[#242938] px-3 flex items-center justify-between text-[11px] text-[#848e9c] font-mono select-none shrink-0 z-30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
          <span className="text-[#e6ebf2]">Binance Stream Active</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1">
          <Cpu size={12} className="text-[#2962ff]" />
          <span>Antigravity Quant AI v1.0</span>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          <ShieldCheck size={12} className="text-[#089981]" />
          <span>TimescaleDB & Redis Engine</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-[#e6ebf2]">
          {symbol}: <span className="font-bold">${price ? price.toLocaleString() : '---'}</span>
        </div>
        <div className="flex items-center space-x-1 text-[#848e9c]">
          <Clock size={11} />
          <span>UTC+05:30</span>
        </div>
      </div>
    </footer>
  );
};
