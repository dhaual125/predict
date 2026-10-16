'use client';

import React, { useState } from 'react';
import { Sparkles, Newspaper, List, Bell } from 'lucide-react';
import { SignalPanel } from './SignalPanel';
import { NewsFeed } from './NewsFeed';
import { Watchlist } from './Watchlist';
import { AlertLog } from './AlertLog';
import { MarketOverview, NewsItem, Signal } from '@/types/market';

interface SidebarProps {
  activeSignal: Signal | null;
  news: NewsItem[];
  markets: MarketOverview[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  currentPrice: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSignal,
  news,
  markets,
  selectedSymbol,
  onSelectSymbol,
  currentPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'signals' | 'news' | 'watchlist' | 'alerts'>('signals');

  const alerts = [
    {
      id: 'al-1',
      symbol: selectedSymbol,
      action: activeSignal?.action || 'BUY',
      price: currentPrice || 67500,
      score: activeSignal?.confluence_score || 82,
      time: 'Just now',
    },
    {
      id: 'al-2',
      symbol: 'ETHUSDT',
      action: 'BUY',
      price: 2640.5,
      score: 74,
      time: '12m ago',
    },
    {
      id: 'al-3',
      symbol: 'SOLUSDT',
      action: 'STRONG_BUY',
      price: 158.2,
      score: 89,
      time: '24m ago',
    },
    {
      id: 'al-4',
      symbol: 'NVDA',
      action: 'BUY',
      price: 138.4,
      score: 79,
      time: '48m ago',
    },
  ];

  return (
    <aside className="w-80 md:w-96 bg-[#131722] border-l border-[#242938] flex flex-col h-full select-none z-20 shrink-0">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-around bg-[#181d28] border-b border-[#242938] p-1">
        <button
          onClick={() => setActiveTab('signals')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'signals'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#222736]'
          }`}
        >
          <Sparkles size={13} />
          <span>AI Signals</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors relative ${
            activeTab === 'news'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#222736]'
          }`}
        >
          <Newspaper size={13} />
          <span>News & AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'watchlist'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#222736]'
          }`}
        >
          <List size={13} />
          <span>Watchlist</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'alerts'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#222736]'
          }`}
        >
          <Bell size={13} />
          <span>Alerts</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'signals' && (
          <SignalPanel signal={activeSignal} currentPrice={currentPrice} />
        )}
        {activeTab === 'news' && <NewsFeed news={news} />}
        {activeTab === 'watchlist' && (
          <Watchlist
            markets={markets}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={onSelectSymbol}
            currentPrice={currentPrice}
          />
        )}
        {activeTab === 'alerts' && (
          <AlertLog alerts={alerts} onSelectAlertSymbol={onSelectSymbol} />
        )}
      </div>
    </aside>
  );
};
