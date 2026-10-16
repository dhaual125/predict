'use client';

import React from 'react';
import { MarketOverview } from '@/types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistProps {
  markets: MarketOverview[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  currentPrice: number;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  markets,
  selectedSymbol,
  onSelectSymbol,
  currentPrice,
}) => {
  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Ticker List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#242938]">
        {markets.map((m) => {
          const isSelected = m.symbol === selectedSymbol;
          const isUp = m.change_24h >= 0;
          const displayPrice = isSelected && currentPrice ? currentPrice : m.price;

          return (
            <button
              key={m.symbol}
              onClick={() => onSelectSymbol(m.symbol)}
              className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors ${
                isSelected ? 'bg-[#222736] border-l-2 border-[#2962ff]' : 'hover:bg-[#181d28]'
              }`}
            >
              <div>
                <div className="font-bold text-[#e6ebf2] flex items-center space-x-1.5">
                  <span>{m.symbol}</span>
                  <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-[#131722] text-[#848e9c]">
                    {m.type}
                  </span>
                </div>
                <div className="text-[10px] text-[#848e9c] truncate max-w-[110px]">{m.name}</div>
              </div>

              <div className="text-right font-mono">
                <div className="font-semibold text-white">
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div
                  className={`text-[10px] flex items-center justify-end ${
                    isUp ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isUp ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {isUp ? '+' : ''}
                  {m.change_24h.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini Order Book Depth Ladder */}
      <div className="border-t border-[#242938] bg-[#131722] p-2.5 font-mono text-[10px]">
        <div className="text-[#848e9c] font-sans font-semibold mb-1.5 flex justify-between">
          <span>Order Book Depth</span>
          <span className="text-[9px] text-[#2962ff]">Real-Time</span>
        </div>

        {/* Asks (Red) */}
        <div className="space-y-0.5 mb-1.5">
          <div className="flex justify-between text-[#f23645]">
            <span>${(currentPrice * 1.002).toFixed(2)}</span>
            <span className="text-[#848e9c]">1.428 BTC</span>
          </div>
          <div className="flex justify-between text-[#f23645]">
            <span>${(currentPrice * 1.001).toFixed(2)}</span>
            <span className="text-[#848e9c]">0.895 BTC</span>
          </div>
        </div>

        {/* Current Mid */}
        <div className="py-1 px-1.5 rounded bg-[#1e222d] font-bold text-center text-white mb-1.5">
          ${currentPrice ? currentPrice.toFixed(2) : '---'}
        </div>

        {/* Bids (Green) */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[#089981]">
            <span>${(currentPrice * 0.999).toFixed(2)}</span>
            <span className="text-[#848e9c]">1.120 BTC</span>
          </div>
          <div className="flex justify-between text-[#089981]">
            <span>${(currentPrice * 0.998).toFixed(2)}</span>
            <span className="text-[#848e9c]">2.340 BTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
