'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  TrendingUp,
  TrendingDown,
  Wifi,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { MarketOverview, Signal } from '@/types/market';
import { soundAlert } from '@/lib/audio';

interface HeaderProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  timeframe: string;
  onSelectTimeframe: (tf: string) => void;
  activeIndicators: {
    ema: boolean;
    rsi: boolean;
    macd: boolean;
    bb: boolean;
  };
  onToggleIndicator: (key: 'ema' | 'rsi' | 'macd' | 'bb') => void;
  marketData: MarketOverview | null;
  activeSignal: Signal | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const symbolsList = [
  { symbol: 'BTCUSDT', name: 'BTC/USDT', type: 'crypto' },
  { symbol: 'ETHUSDT', name: 'ETH/USDT', type: 'crypto' },
  { symbol: 'SOLUSDT', name: 'SOL/USDT', type: 'crypto' },
  { symbol: 'BNBUSDT', name: 'BNB/USDT', type: 'crypto' },
  { symbol: 'DOGEUSDT', name: 'DOGE/USDT', type: 'crypto' },
  { symbol: 'AAPL', name: 'AAPL (Apple)', type: 'stock' },
  { symbol: 'NVDA', name: 'NVDA (Nvidia)', type: 'stock' },
  { symbol: 'TSLA', name: 'TSLA (Tesla)', type: 'stock' },
];

const timeframesList = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const Header: React.FC<HeaderProps> = ({
  currentSymbol,
  onSelectSymbol,
  timeframe,
  onSelectTimeframe,
  activeIndicators,
  onToggleIndicator,
  marketData,
  activeSignal,
  soundEnabled,
  onToggleSound,
}) => {
  const isBullish = (marketData?.change_24h || 0) >= 0;

  const getActionBadge = () => {
    if (!activeSignal) return null;
    const action = activeSignal.action;
    const score = activeSignal.confluence_score;

    const label = activeSignal.order_type && activeSignal.order_type !== 'NO_TRADE' && activeSignal.order_type !== 'WAITING_DATA'
      ? activeSignal.order_type.replace('_', ' ')
      : action.replace('_', ' ');

    if (action === 'STRONG_BUY' || action === 'BUY') {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#089981]/15 border border-[#089981]/40 text-[#089981] text-xs font-semibold glow-bull">
          <span className="w-2 h-2 rounded-full bg-[#089981] animate-ping" />
          <span>{label}</span>
          <span className="opacity-80">({score}%)</span>
        </div>
      );
    }
    if (action === 'STRONG_SELL' || action === 'SELL') {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#f23645]/15 border border-[#f23645]/40 text-[#f23645] text-xs font-semibold glow-bear">
          <span className="w-2 h-2 rounded-full bg-[#f23645] animate-ping" />
          <span>{label}</span>
          <span className="opacity-80">({score}%)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#848e9c]/15 border border-[#848e9c]/40 text-[#848e9c] text-xs font-semibold">
        <span>NEUTRAL</span>
        <span className="opacity-80">({score}%)</span>
      </div>
    );
  };

  return (
    <header className="h-14 bg-[#131722] border-b border-[#242938] px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left Section: Brand & Symbol Selector */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#2962ff] to-[#089981] flex items-center justify-center font-black text-white text-xs shadow-md">
            AG
          </div>
          <span className="font-bold text-sm tracking-wide hidden md:inline text-white">
            TradingView<span className="text-[#2962ff] font-mono">.AI</span>
          </span>
        </div>

        <div className="h-5 w-[1px] bg-[#242938]" />

        {/* Symbol Selector Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-2 bg-[#1e222d] hover:bg-[#252a38] text-white px-3 py-1.5 rounded border border-[#2c3345] transition-colors font-medium text-xs">
            <span>{currentSymbol}</span>
            <span className="text-[10px] uppercase px-1 py-0.5 rounded bg-[#2b3345] text-[#848e9c]">
              {symbolsList.find((s) => s.symbol === currentSymbol)?.type || 'crypto'}
            </span>
            <ChevronDown size={14} className="text-[#848e9c]" />
          </button>

          <div className="absolute left-0 mt-1 w-48 bg-[#1e222d] border border-[#2c3345] rounded-md shadow-xl py-1 hidden group-hover:block z-50">
            {symbolsList.map((item) => (
              <button
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#2a3040] transition-colors ${
                  currentSymbol === item.symbol ? 'text-[#2962ff] font-semibold bg-[#222838]' : 'text-[#e6ebf2]'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-[10px] uppercase text-[#848e9c]">{item.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Ticker Metrics */}
        {marketData && (
          <div className="hidden lg:flex items-center space-x-4 pl-1 text-xs">
            <div className="flex items-center space-x-1 font-mono font-semibold">
              <span className={isBullish ? 'text-[#089981]' : 'text-[#f23645]'}>
                ${marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] ${
                  isBullish ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isBullish ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {isBullish ? '+' : ''}
                {marketData.change_24h.toFixed(2)}%
              </span>
            </div>

            <div className="text-[#848e9c] hidden xl:flex items-center space-x-3 text-[11px]">
              <div>
                24h H: <span className="text-[#e6ebf2] font-mono">${marketData.high_24h.toLocaleString()}</span>
              </div>
              <div>
                24h L: <span className="text-[#e6ebf2] font-mono">${marketData.low_24h.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Timeframes & Indicator Toggles */}
      <div className="flex items-center space-x-1.5">
        {/* Timeframe Buttons */}
        <div className="flex items-center bg-[#1e222d] p-0.5 rounded border border-[#2c3345]">
          {timeframesList.map((tf) => (
            <button
              key={tf}
              onClick={() => onSelectTimeframe(tf)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                timeframe === tf
                  ? 'bg-[#2962ff] text-white font-semibold'
                  : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#252a38]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="h-5 w-[1px] bg-[#242938] hidden sm:block" />

        {/* Indicators Quick Pills */}
        <div className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onToggleIndicator('ema')}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              activeIndicators.ema
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                : 'text-[#848e9c] border-[#2c3345] hover:text-[#e6ebf2]'
            }`}
          >
            EMA
          </button>
          <button
            onClick={() => onToggleIndicator('rsi')}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              activeIndicators.rsi
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                : 'text-[#848e9c] border-[#2c3345] hover:text-[#e6ebf2]'
            }`}
          >
            RSI
          </button>
          <button
            onClick={() => onToggleIndicator('macd')}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              activeIndicators.macd
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                : 'text-[#848e9c] border-[#2c3345] hover:text-[#e6ebf2]'
            }`}
          >
            MACD
          </button>
          <button
            onClick={() => onToggleIndicator('bb')}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              activeIndicators.bb
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                : 'text-[#848e9c] border-[#2c3345] hover:text-[#e6ebf2]'
            }`}
          >
            BB
          </button>
        </div>
      </div>

      {/* Right Section: AI Confluence Badge, Audio Chime Toggle, Live Ping */}
      <div className="flex items-center space-x-3">
        {getActionBadge()}

        {/* Audio Alerts Button */}
        <button
          onClick={() => {
            soundAlert.enabled = !soundEnabled;
            onToggleSound();
          }}
          title={soundEnabled ? 'Audio Signals Active (Click to Mute)' : 'Audio Signals Muted'}
          className={`p-1.5 rounded transition-colors ${
            soundEnabled
              ? 'text-[#089981] bg-[#089981]/15 hover:bg-[#089981]/25 border border-[#089981]/30'
              : 'text-[#848e9c] hover:text-[#e6ebf2] bg-[#1e222d] border border-[#2c3345]'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Live Network Status */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-[#848e9c] bg-[#1e222d] px-2 py-1 rounded border border-[#2c3345]">
          <Wifi size={12} className="text-[#089981]" />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
};
