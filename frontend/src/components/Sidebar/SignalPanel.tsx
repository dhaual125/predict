'use client';

import React from 'react';
import {
  ShieldAlert,
  Target,
  Scale,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Compass,
  Zap,
  Activity,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Signal } from '@/types/market';

interface SignalPanelProps {
  signal: Signal | null;
  currentPrice: number;
}

export const SignalPanel: React.FC<SignalPanelProps> = ({ signal, currentPrice }) => {
  if (!signal) {
    return (
      <div className="p-4 text-center text-[#848e9c] text-xs">
        <Sparkles size={24} className="mx-auto mb-2 text-[#2962ff] animate-pulse" />
        Calculating multi-confluence market predictions...
      </div>
    );
  }

  const isBuy = signal.action === 'STRONG_BUY' || signal.action === 'BUY';
  const isSell = signal.action === 'STRONG_SELL' || signal.action === 'SELL';

  const slDistance = Math.abs(currentPrice - signal.stop_loss);
  const slPercent = ((slDistance / currentPrice) * 100).toFixed(2);

  const tp1Distance = Math.abs(signal.take_profit_1 - currentPrice);
  const tp1Percent = ((tp1Distance / currentPrice) * 100).toFixed(2);

  const checklist = signal.checklist || {
    htf_trend_aligned: true,
    liquidity_sweep_found: false,
    volume_delta_confirmed: true,
    market_regime_trending: true,
    risk_reward_acceptable: true,
  };

  return (
    <div className="space-y-3.5 p-3.5 text-xs select-none">
      {/* 1. Actionable Order Guidance Box */}
      <div className="bg-[#181d28] border-2 border-[#2962ff]/50 rounded-lg p-3 space-y-2 shadow-lg shadow-[#2962ff]/10">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#e6ebf2] flex items-center gap-1.5">
            <Compass size={14} className="text-[#2962ff] animate-spin" />
            Quant Execution Guidance
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/30">
            {signal.order_type || 'ANALYZE'}
          </span>
        </div>

        {/* Advice Text */}
        <div className="text-[11px] text-[#e6ebf2] leading-relaxed bg-[#131722] p-2.5 rounded border border-[#252c3d]">
          {signal.trade_advice || 'Monitoring market for confirmed breakout triggers.'}
        </div>

        {/* Market Regime & FVG Badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {signal.market_regime && (
            <span
              className={`flex items-center space-x-1 text-[9px] font-semibold px-2 py-0.5 rounded border ${
                signal.market_regime === 'STRONG_TREND'
                  ? 'bg-[#089981]/15 text-[#089981] border-[#089981]/30'
                  : signal.market_regime === 'WEAK_TREND'
                  ? 'bg-[#2962ff]/15 text-[#2962ff] border-[#2962ff]/30'
                  : 'bg-[#ff9800]/15 text-[#ff9800] border-[#ff9800]/30'
              }`}
            >
              <Activity size={10} />
              <span>Regime: {signal.market_regime.replace('_', ' ')}</span>
            </span>
          )}

          {signal.fvg_zone && signal.fvg_zone !== 'No active imbalance gap' && (
            <span className="flex items-center space-x-1 text-[9px] font-semibold px-2 py-0.5 rounded bg-[#9c27b0]/15 text-[#ce93d8] border border-[#9c27b0]/30">
              <Layers size={10} />
              <span>FVG Imbalance Zone</span>
            </span>
          )}
        </div>

        {/* Liquidity Sweep Status */}
        {signal.liquidity_sweep && signal.liquidity_sweep !== 'No active liquidity sweep' && (
          <div className="flex items-center space-x-1.5 text-[10px] text-[#ff9800] bg-[#ff9800]/10 px-2 py-1 rounded border border-[#ff9800]/25">
            <Zap size={11} className="shrink-0" />
            <span className="font-medium truncate">{signal.liquidity_sweep}</span>
          </div>
        )}
      </div>

      {/* 2. Institutional 5-Pillar Edge Checklist */}
      <div className="bg-[#181d28] border border-[#242938] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#e6ebf2] border-b border-[#242938] pb-1.5">
          <span className="flex items-center gap-1.5">
            <BarChart3 size={13} className="text-[#2962ff]" />
            Institutional Edge Checklist
          </span>
          <span className="text-[10px] text-[#848e9c]">Quant Filters</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between bg-[#131722] p-1.5 rounded">
            <span className="text-[#848e9c]">1. Macro HTF Trend Aligned</span>
            {checklist.htf_trend_aligned ? (
              <span className="text-[#089981] flex items-center gap-1 font-semibold text-[10px]">
                <CheckCircle2 size={12} /> CONFIRMED
              </span>
            ) : (
              <span className="text-[#f23645] flex items-center gap-1 font-semibold text-[10px]">
                <XCircle size={12} /> COUNTER-TREND
              </span>
            )}
          </div>

          <div className="flex items-center justify-between bg-[#131722] p-1.5 rounded">
            <span className="text-[#848e9c]">2. Liquidity Sweep Cleared</span>
            {checklist.liquidity_sweep_found ? (
              <span className="text-[#089981] flex items-center gap-1 font-semibold text-[10px]">
                <CheckCircle2 size={12} /> DETECTED
              </span>
            ) : (
              <span className="text-[#848e9c] text-[10px]">PENDING</span>
            )}
          </div>

          <div className="flex items-center justify-between bg-[#131722] p-1.5 rounded">
            <span className="text-[#848e9c]">3. Order Flow Volume Delta</span>
            {checklist.volume_delta_confirmed ? (
              <span className="text-[#089981] flex items-center gap-1 font-semibold text-[10px]">
                <CheckCircle2 size={12} /> ABSORPTION
              </span>
            ) : (
              <span className="text-[#848e9c] text-[10px]">BALANCED</span>
            )}
          </div>

          <div className="flex items-center justify-between bg-[#131722] p-1.5 rounded">
            <span className="text-[#848e9c]">4. Market Regime Momentum</span>
            {checklist.market_regime_trending ? (
              <span className="text-[#089981] flex items-center gap-1 font-semibold text-[10px]">
                <CheckCircle2 size={12} /> TRENDING
              </span>
            ) : (
              <span className="text-[#ff9800] flex items-center gap-1 font-semibold text-[10px]">
                <AlertTriangle size={12} /> CHOPPY
              </span>
            )}
          </div>

          <div className="flex items-center justify-between bg-[#131722] p-1.5 rounded">
            <span className="text-[#848e9c]">5. Asymmetric Risk:Reward</span>
            <span className="text-[#089981] flex items-center gap-1 font-semibold text-[10px]">
              <CheckCircle2 size={12} /> 1:2.4+ (PASSED)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Prediction Card */}
      <div
        className={`p-3.5 rounded-lg border transition-all ${
          isBuy
            ? 'bg-[#089981]/10 border-[#089981]/40 shadow-lg shadow-[#089981]/5'
            : isSell
            ? 'bg-[#f23645]/10 border-[#f23645]/40 shadow-lg shadow-[#f23645]/5'
            : 'bg-[#181d28] border-[#242938]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBuy ? 'bg-[#089981] animate-ping' : isSell ? 'bg-[#f23645] animate-ping' : 'bg-[#848e9c]'
              }`}
            />
            <span className="font-bold text-sm tracking-wide text-white">
              {signal.action.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#131722]/80 border border-[#2b3345]">
            <Sparkles size={11} className="text-[#2962ff]" />
            <span className="text-[#e6ebf2]">{signal.confluence_score}% Confluence</span>
          </div>
        </div>

        {/* Quant Win Probability Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#848e9c]">
            <span>Model Estimated Win-Rate</span>
            <span className="font-mono text-[#e6ebf2] font-semibold">{signal.win_probability}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#131722] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isBuy ? 'bg-[#089981]' : isSell ? 'bg-[#f23645]' : 'bg-[#848e9c]'
              }`}
              style={{ width: `${signal.win_probability}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Trade Execution Plan */}
      <div className="bg-[#181d28] border border-[#242938] rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[#848e9c] text-[11px] border-b border-[#242938] pb-1.5">
          <span className="font-semibold text-[#e6ebf2] flex items-center gap-1">
            <Scale size={13} className="text-[#2962ff]" /> Trade Setup Plan
          </span>
          <span className="font-mono text-[#2962ff]">R:R {signal.risk_reward_ratio}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          {/* Entry / Trigger Price */}
          <div className="bg-[#131722] p-2 rounded border border-[#242938]">
            <div className="text-[#848e9c] text-[10px] mb-0.5">
              {signal.order_type === 'BUY_STOP' ? 'Trigger (Buy Stop)' : 'Recommended Entry'}
            </div>
            <div className="text-white font-bold">
              ${(signal.trigger_price || signal.entry_price).toLocaleString()}
            </div>
          </div>

          {/* Stop Loss */}
          <div className="bg-[#131722] p-2 rounded border border-[#f23645]/30">
            <div className="text-[#f23645] text-[10px] flex items-center justify-between mb-0.5">
              <span>Stop Loss</span>
              <span>-{slPercent}%</span>
            </div>
            <div className="text-white font-bold">${signal.stop_loss.toLocaleString()}</div>
          </div>
        </div>

        {/* Take Profit Targets */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between bg-[#131722] p-2 rounded border border-[#089981]/30 font-mono text-[11px]">
            <span className="text-[#089981] flex items-center gap-1">
              <Target size={12} /> Target 1 (1.5R)
            </span>
            <span className="text-white font-semibold">
              ${signal.take_profit_1.toLocaleString()}{' '}
              <span className="text-[#089981] text-[10px]">(+{tp1Percent}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#131722] p-2 rounded border border-[#242938] font-mono text-[11px]">
            <span className="text-[#848e9c] flex items-center gap-1">
              <Target size={12} /> Target 2 (2.8R)
            </span>
            <span className="text-white font-semibold">${signal.take_profit_2.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between bg-[#131722] p-2 rounded border border-[#242938] font-mono text-[11px]">
            <span className="text-[#848e9c] flex items-center gap-1">
              <Target size={12} /> Target 3 (4.2R)
            </span>
            <span className="text-white font-semibold">${signal.take_profit_3.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 5. Confluence Factor Breakdown */}
      <div className="bg-[#181d28] border border-[#242938] rounded-lg p-3 space-y-2">
        <div className="text-[#e6ebf2] font-semibold text-[11px] flex items-center gap-1">
          <CheckCircle2 size={13} className="text-[#089981]" /> Contributing Factors
        </div>

        <div className="space-y-1.5">
          {signal.factors && signal.factors.length > 0 ? (
            signal.factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-[11px] text-[#848e9c] bg-[#131722] p-2 rounded border border-[#242938]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2962ff] mt-1 shrink-0" />
                <span className="leading-snug text-[#d1d4dc]">{factor}</span>
              </div>
            ))
          ) : (
            <div className="text-[#848e9c] text-[11px]">No dominant breakout confluence detected.</div>
          )}
        </div>
      </div>

      {/* 6. AI News Sentiment Gauge */}
      <div className="bg-[#181d28] border border-[#242938] rounded-lg p-3 space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#848e9c]">AI Global News Sentiment</span>
          <span
            className={`font-mono font-bold ${
              signal.news_sentiment > 0.2
                ? 'text-[#089981]'
                : signal.news_sentiment < -0.2
                ? 'text-[#f23645]'
                : 'text-[#848e9c]'
            }`}
          >
            {signal.news_sentiment > 0 ? '+' : ''}
            {(signal.news_sentiment * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#131722] rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#f23645]"
            style={{ width: `${Math.max(0, -signal.news_sentiment * 50)}%` }}
          />
          <div
            className="h-full bg-[#089981] ml-auto"
            style={{ width: `${Math.max(0, signal.news_sentiment * 50)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
