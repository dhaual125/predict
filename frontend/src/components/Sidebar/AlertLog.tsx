'use client';

import React from 'react';
import { Bell, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck } from 'lucide-react';
import { Signal } from '@/types/market';

interface AlertItem {
  id: string;
  symbol: string;
  action: string;
  price: number;
  score: number;
  time: string;
}

interface AlertLogProps {
  alerts: AlertItem[];
  onSelectAlertSymbol: (symbol: string) => void;
}

export const AlertLog: React.FC<AlertLogProps> = ({ alerts, onSelectAlertSymbol }) => {
  return (
    <div className="flex flex-col h-full text-xs select-none p-3 overflow-y-auto space-y-2">
      <div className="flex items-center justify-between text-[#848e9c] text-[11px] mb-1">
        <span className="flex items-center gap-1 font-semibold text-[#e6ebf2]">
          <Bell size={12} className="text-[#2962ff]" /> Active Alert Trigger Log
        </span>
        <span className="text-[10px]">{alerts.length} signals</span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-4 text-center text-[#848e9c]">Listening for high-confluence breakout triggers...</div>
      ) : (
        alerts.map((al) => {
          const isBuy = al.action.includes('BUY');
          return (
            <button
              key={al.id}
              onClick={() => onSelectAlertSymbol(al.symbol)}
              className="w-full text-left bg-[#181d28] hover:bg-[#202636] p-2.5 rounded-lg border border-[#242938] hover:border-[#333d52] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-1">
                  {isBuy ? (
                    <ArrowUpRight size={14} className="text-[#089981]" />
                  ) : (
                    <ArrowDownRight size={14} className="text-[#f23645]" />
                  )}
                  {al.symbol}
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isBuy
                      ? 'bg-[#089981]/20 text-[#089981] border border-[#089981]/40'
                      : 'bg-[#f23645]/20 text-[#f23645] border border-[#f23645]/40'
                  }`}
                >
                  {al.action}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#848e9c]">
                <span>
                  Price: <strong className="text-white">${al.price.toLocaleString()}</strong>
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Clock size={10} />
                  {al.time}
                </span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};
