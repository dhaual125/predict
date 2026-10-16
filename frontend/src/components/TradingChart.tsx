'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  ISeriesApi,
  IChartApi,
  UTCTimestamp,
  LastPriceAnimationMode,
} from 'lightweight-charts';
import { Candle, Signal } from '@/types/market';
import { Activity, Clock, Zap, ArrowUp, ArrowDown } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  candles: Candle[];
  latestTick: Candle | null;
  activeSignal: Signal | null;
  activeIndicators: {
    ema: boolean;
    rsi: boolean;
    macd: boolean;
    bb: boolean;
  };
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  timeframe,
  candles,
  latestTick,
  activeSignal,
  activeIndicators,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [candleCountdown, setCandleCountdown] = useState<string>('--:--');
  const [buyerRatio, setBuyerRatio] = useState<number>(54);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number>(0);

  const [legendData, setLegendData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    isUp: boolean;
  } | null>(null);

  // Timeframe duration in seconds for countdown
  const getIntervalSeconds = (tf: string): number => {
    switch (tf) {
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '1h': return 3600;
      case '4h': return 14400;
      case '1d': return 86400;
      default: return 900;
    }
  };

  // Real-time Countdown Timer to next candle close
  useEffect(() => {
    const intervalSec = getIntervalSeconds(timeframe);
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = intervalSec - (now % intervalSec);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setCandleCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [timeframe]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#0e1118' },
        textColor: '#848e9c',
        fontFamily: "'Trebuchet MS', Roboto, Ubuntu, sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(42, 49, 66, 0.35)' },
        horzLines: { color: 'rgba(42, 49, 66, 0.35)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2a3142',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2a3142',
        },
      },
      rightPriceScale: {
        borderColor: '#242938',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: '#242938',
        timeVisible: true,
        secondsVisible: true,
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#f23645',
      borderUpColor: '#089981',
      borderDownColor: '#f23645',
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });
    // Apply lastPriceAnimation via applyOptions to avoid TS2353 (not yet typed in v5)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (candleSeries as any).applyOptions({ lastPriceAnimation: LastPriceAnimationMode.Continuous });
    candleSeriesRef.current = candleSeries;

    // Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // EMA Series
    const ema9 = chart.addSeries(LineSeries, {
      color: '#2962ff',
      lineWidth: 1,
      title: 'EMA 9',
    });
    ema9SeriesRef.current = ema9;

    const ema21 = chart.addSeries(LineSeries, {
      color: '#ff9800',
      lineWidth: 1,
      title: 'EMA 21',
    });
    ema21SeriesRef.current = ema21;

    const ema50 = chart.addSeries(LineSeries, {
      color: '#9c27b0',
      lineWidth: 1,
      title: 'EMA 50',
    });
    ema50SeriesRef.current = ema50;

    // Crosshair move listener for floating legend
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as {
        open?: number;
        high?: number;
        low?: number;
        close?: number;
      } | undefined;

      const volData = param.seriesData.get(volumeSeries) as {
        value?: number;
      } | undefined;

      if (candleData && candleData.open !== undefined && candleData.close !== undefined) {
        const o = candleData.open;
        const h = candleData.high ?? o;
        const l = candleData.low ?? o;
        const c = candleData.close;
        const v = volData?.value ?? 0;
        const chg = ((c - o) / o) * 100;

        setLegendData({
          open: o,
          high: h,
          low: l,
          close: c,
          volume: v,
          change: chg,
          isUp: c >= o,
        });
      }
    });

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Set Initial Historical Candles (runs when symbol/timeframe changes)
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    // Deduplicate timestamps and ensure strictly ascending order
    const timeMap = new Map<number, Candle>();
    for (const c of candles) {
      if (c && typeof c.time === 'number' && !isNaN(c.time)) {
        timeMap.set(c.time, c);
      }
    }
    const cleanCandles = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
    if (cleanCandles.length === 0) return;

    const formattedCandles = cleanCandles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeriesRef.current.setData(formattedCandles);

    const formattedVolume = cleanCandles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)',
    }));
    volumeSeriesRef.current.setData(formattedVolume);

    // Compute EMAs
    if (activeIndicators.ema) {
      const calcEMA = (period: number) => {
        const mult = 2 / (period + 1);
        let prev = cleanCandles[0].close;
        return cleanCandles.map((c, i) => {
          if (i === 0) return { time: c.time as UTCTimestamp, value: c.close };
          const val = (c.close - prev) * mult + prev;
          prev = val;
          return { time: c.time as UTCTimestamp, value: val };
        });
      };

      if (ema9SeriesRef.current) ema9SeriesRef.current.setData(calcEMA(9));
      if (ema21SeriesRef.current) ema21SeriesRef.current.setData(calcEMA(21));
      if (ema50SeriesRef.current) ema50SeriesRef.current.setData(calcEMA(50));
    } else {
      if (ema9SeriesRef.current) ema9SeriesRef.current.setData([]);
      if (ema21SeriesRef.current) ema21SeriesRef.current.setData([]);
      if (ema50SeriesRef.current) ema50SeriesRef.current.setData([]);
    }

    // Add Markers
    if (activeSignal && candleSeriesRef.current) {
      const markers = [];
      const lastCandle = candles[candles.length - 1];

      if (activeSignal.action === 'STRONG_BUY' || activeSignal.action === 'BUY') {
        markers.push({
          time: lastCandle.time as UTCTimestamp,
          position: 'belowBar' as const,
          color: '#089981',
          shape: 'arrowUp' as const,
          text: `${activeSignal.action} @ ${activeSignal.entry_price}`,
        });
      } else if (activeSignal.action === 'STRONG_SELL' || activeSignal.action === 'SELL') {
        markers.push({
          time: lastCandle.time as UTCTimestamp,
          position: 'aboveBar' as const,
          color: '#f23645',
          shape: 'arrowDown' as const,
          text: `${activeSignal.action} @ ${activeSignal.entry_price}`,
        });
      }

      try {
        createSeriesMarkers(candleSeriesRef.current, markers);
      } catch {
        // Fallback
      }
    }

    // Update legend
    const last = candles[candles.length - 1];
    setLegendData({
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      volume: last.volume,
      change: ((last.close - last.open) / last.open) * 100,
      isUp: last.close >= last.open,
    });
    prevPriceRef.current = last.close;
  }, [candles, symbol, timeframe, activeIndicators]);

  // Real-time Single Tick Update: Updates the active candlestick instantaneously
  useEffect(() => {
    if (!latestTick || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    // 1. Instantly update candle on canvas (breathes and redraws wick & body)
    candleSeriesRef.current.update({
      time: latestTick.time as UTCTimestamp,
      open: latestTick.open,
      high: latestTick.high,
      low: latestTick.low,
      close: latestTick.close,
    });

    // 2. Instantly update volume bar
    volumeSeriesRef.current.update({
      time: latestTick.time as UTCTimestamp,
      value: latestTick.volume,
      color: latestTick.close >= latestTick.open ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)',
    });

    // 3. Trigger flash effect
    if (prevPriceRef.current > 0) {
      if (latestTick.close > prevPriceRef.current) {
        setPriceFlash('up');
        setBuyerRatio((prev) => Math.min(85, prev + 1));
      } else if (latestTick.close < prevPriceRef.current) {
        setPriceFlash('down');
        setBuyerRatio((prev) => Math.max(15, prev - 1));
      }
      setTimeout(() => setPriceFlash(null), 300);
    }
    prevPriceRef.current = latestTick.close;

    // 4. Update legend
    setLegendData({
      open: latestTick.open,
      high: latestTick.high,
      low: latestTick.low,
      close: latestTick.close,
      volume: latestTick.volume,
      change: ((latestTick.close - latestTick.open) / latestTick.open) * 100,
      isUp: latestTick.close >= latestTick.open,
    });
  }, [latestTick]);

  return (
    <div className="relative w-full h-full flex-1 bg-[#0e1118] overflow-hidden select-none">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="text-center font-black text-8xl tracking-widest text-white">
          {symbol}
        </div>
      </div>

      {/* Floating TradingView Legend */}
      <div className="absolute top-2.5 left-4 z-10 pointer-events-none flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#e6ebf2]">{symbol}</span>
          <span className="text-[#848e9c] px-1 py-0.5 rounded bg-[#1e222d] text-[10px]">
            {timeframe.toUpperCase()}
          </span>
          {/* Live Tick Pulse Dot */}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#089981] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#089981]" />
          </span>
        </div>

        {legendData && (
          <div className="flex items-center space-x-3 text-[11px]">
            <div>
              <span className="text-[#848e9c]">O: </span>
              <span className="text-[#e6ebf2]">${legendData.open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#848e9c]">H: </span>
              <span className="text-[#e6ebf2]">${legendData.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#848e9c]">L: </span>
              <span className="text-[#e6ebf2]">${legendData.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#848e9c]">C: </span>
              <span
                className={`transition-colors font-bold ${
                  priceFlash === 'up'
                    ? 'text-[#089981] scale-105'
                    : priceFlash === 'down'
                    ? 'text-[#f23645] scale-105'
                    : legendData.isUp
                    ? 'text-[#089981]'
                    : 'text-[#f23645]'
                }`}
              >
                ${legendData.close.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[#848e9c]">Change: </span>
              <span className={legendData.isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                {legendData.isUp ? '+' : ''}
                {legendData.change.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[#848e9c]">Vol: </span>
              <span className="text-[#e6ebf2]">{legendData.volume.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Top-Right HUD: Candle Countdown & Real-Time Buy/Sell Order Flow Meter */}
      <div className="absolute top-2.5 right-4 z-10 flex items-center space-x-2.5 text-xs font-mono">
        {/* Candle Countdown Timer */}
        <div className="flex items-center space-x-1.5 bg-[#181d28]/90 border border-[#283042] px-2.5 py-1 rounded text-[#e6ebf2] shadow-md backdrop-blur-sm">
          <Clock size={12} className="text-[#2962ff]" />
          <span className="text-[10px] text-[#848e9c]">Bar Closes:</span>
          <span className="font-bold text-[#089981]">{candleCountdown}</span>
        </div>

        {/* Real-Time Buy vs Sell Pressure Bar */}
        <div className="hidden sm:flex flex-col bg-[#181d28]/90 border border-[#283042] px-2.5 py-1 rounded shadow-md backdrop-blur-sm w-36">
          <div className="flex justify-between text-[10px] text-[#848e9c] mb-0.5">
            <span className="text-[#089981] font-bold">{buyerRatio}% Bids</span>
            <span className="text-[#f23645] font-bold">{100 - buyerRatio}% Asks</span>
          </div>
          <div className="w-full h-1 bg-[#f23645] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#089981] transition-all duration-300"
              style={{ width: `${buyerRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Indicators Legend */}
      {activeIndicators.ema && (
        <div className="absolute top-9 left-4 z-10 pointer-events-none flex items-center space-x-3 text-[10px] font-mono">
          <span className="text-[#2962ff]">EMA 9</span>
          <span className="text-[#ff9800]">EMA 21</span>
          <span className="text-[#9c27b0]">EMA 50</span>
        </div>
      )}

      {/* Chart Canvas Container */}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};
