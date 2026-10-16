'use client';

import React, { useState } from 'react';
import { Newspaper, ExternalLink, Zap, Clock } from 'lucide-react';
import { NewsItem } from '@/types/market';

interface NewsFeedProps {
  news: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  const [filter, setFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'HIGH'>('ALL');

  const filteredNews = news.filter((item) => {
    if (filter === 'BULLISH') return item.sentiment === 'BULLISH';
    if (filter === 'BEARISH') return item.sentiment === 'BEARISH';
    if (filter === 'HIGH') return item.impact_factor === 'HIGH';
    return true;
  });

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 p-2.5 bg-[#181d28] border-b border-[#242938]">
        {(['ALL', 'BULLISH', 'BEARISH', 'HIGH'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
              filter === tab
                ? 'bg-[#2962ff] text-white'
                : 'text-[#848e9c] hover:text-[#e6ebf2] hover:bg-[#222736]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredNews.length === 0 ? (
          <div className="p-4 text-center text-[#848e9c]">No news matching this filter.</div>
        ) : (
          filteredNews.map((item) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-[#181d28] hover:bg-[#1f2535] p-3 rounded-lg border border-[#242938] hover:border-[#384259] transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isBullish
                          ? 'bg-[#089981]/20 text-[#089981] border border-[#089981]/40'
                          : isBearish
                          ? 'bg-[#f23645]/20 text-[#f23645] border border-[#f23645]/40'
                          : 'bg-[#848e9c]/20 text-[#848e9c] border border-[#848e9c]/40'
                      }`}
                    >
                      {item.sentiment}
                    </span>

                    {item.impact_factor === 'HIGH' && (
                      <span className="flex items-center space-x-0.5 text-[9px] font-semibold text-[#ff9800] bg-[#ff9800]/15 px-1.5 py-0.5 rounded border border-[#ff9800]/30">
                        <Zap size={10} />
                        <span>HIGH IMPACT</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-[#848e9c] flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="font-medium text-[#e6ebf2] group-hover:text-[#2962ff] transition-colors leading-snug line-clamp-2 mb-1.5">
                  {item.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848e9c]">
                  <span>{item.source}</span>
                  <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
};
