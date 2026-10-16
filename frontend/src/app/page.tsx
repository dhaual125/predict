'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { ToolBar } from '@/components/ToolBar';
import { TradingChart } from '@/components/TradingChart';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { BottomBar } from '@/components/BottomBar';
import { Candle, MarketOverview, NewsItem, Signal } from '@/types/market';
import { soundAlert } from '@/lib/audio';

const API_BASE = 'http://localhost:8080';
const WS_BASE = 'ws://localhost:8080/ws';

export default function TerminalPage() {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [activeTool, setActiveTool] = useState<string>('crosshair');
  const [activeIndicators, setActiveIndicators] = useState({
    ema: true,
    rsi: true,
    macd: true,
    bb: true,
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [latestTick, setLatestTick] = useState<Candle | null>(null);
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [markets, setMarkets] = useState<MarketOverview[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const prevSignalAction = useRef<string>('');

  // 1. Initial REST Fetch for Candlesticks, News, and Markets
  useEffect(() => {
    let isCancelled = false;

    const fetchInitialData = async () => {
      try {
        // Fetch Klines
        const klineRes = await fetch(`${API_BASE}/api/klines?symbol=${symbol}&interval=${timeframe}&limit=120`);
        if (klineRes.ok && !isCancelled) {
          const klineData = await klineRes.json();
          if (klineData.candles && klineData.candles.length > 0) {
            const map = new Map<number, Candle>();
            klineData.candles.forEach((c: Candle) => {
              if (c && typeof c.time === 'number') map.set(c.time, c);
            });
            const clean = Array.from(map.values()).sort((a, b) => a.time - b.time);
            setCandles(clean);
            const latest = clean[clean.length - 1];
            setCurrentPrice(latest.close);
            setLatestTick(latest);
          }
        }

        // Fetch Confluence Signal
        const sigRes = await fetch(`${API_BASE}/api/signals?symbol=${symbol}&timeframe=${timeframe}`);
        if (sigRes.ok && !isCancelled) {
          const sigData = await sigRes.json();
          setActiveSignal(sigData);

          if (sigData.action !== prevSignalAction.current) {
            if (sigData.action === 'STRONG_BUY' || sigData.action === 'BUY') {
              soundAlert.playBuyAlert();
            } else if (sigData.action === 'STRONG_SELL' || sigData.action === 'SELL') {
              soundAlert.playSellAlert();
            }
            prevSignalAction.current = sigData.action;
          }
        }

        // Fetch News
        const newsRes = await fetch(`${API_BASE}/api/news`);
        if (newsRes.ok && !isCancelled) {
          const newsData = await newsRes.json();
          setNews(newsData || []);
        }

        // Fetch Markets
        const marketsRes = await fetch(`${API_BASE}/api/markets`);
        if (marketsRes.ok && !isCancelled) {
          const marketsData = await marketsRes.json();
          setMarkets(marketsData || []);
        }
      } catch (err) {
        console.warn('Backend REST connecting...', err);
      }
    };

    fetchInitialData();

    return () => {
      isCancelled = true;
    };
  }, [symbol, timeframe]);

  // 2. Real-time WebSocket connection to Go Backend
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWS = () => {
      try {
        ws = new WebSocket(WS_BASE);

        ws.onopen = () => {
          console.log('[Go WS] Connected to Market Hub');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'TICK') {
              const tick = msg.data as MarketOverview;
              setMarkets((prev) =>
                prev.map((m) => (m.symbol === tick.symbol ? { ...m, price: tick.price } : m))
              );

              // If stock ticker, update live candle
              if (tick.symbol === symbol && tick.type === 'stock') {
                setCurrentPrice(tick.price);
                setLatestTick((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    close: tick.price,
                    high: Math.max(prev.high, tick.price),
                    low: Math.min(prev.low, tick.price),
                    volume: prev.volume + 5,
                  };
                });
              }
            } else if (msg.type === 'SIGNAL') {
              const sig = msg.data as Signal;
              if (sig.symbol === symbol) {
                setActiveSignal(sig);
                if (sig.action !== prevSignalAction.current) {
                  if (sig.action === 'STRONG_BUY' || sig.action === 'BUY') {
                    soundAlert.playBuyAlert();
                  } else if (sig.action === 'STRONG_SELL' || sig.action === 'SELL') {
                    soundAlert.playSellAlert();
                  }
                  prevSignalAction.current = sig.action;
                }
              }
            } else if (msg.type === 'NEWS') {
              setNews(msg.data || []);
            }
          } catch (e) {
            console.error('[Go WS] Parse error', e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWS, 3000);
        };
        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [symbol]);

  // 3. Direct Real-Time Binance Live Candlestick WebSocket Stream for Crypto
  useEffect(() => {
    // Only connect for crypto symbols
    const isCrypto = symbol.endsWith('USDT');
    if (!isCrypto) return;

    let binanceWS: WebSocket | null = null;
    const streamName = `${symbol.toLowerCase()}@kline_${timeframe}`;
    const url = `wss://stream.binance.com:9443/ws/${streamName}`;

    try {
      binanceWS = new WebSocket(url);

      binanceWS.onopen = () => {
        console.log(`[Binance WS] Connected to live ${symbol} ${timeframe} stream`);
      };

      binanceWS.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.k) {
            const k = data.k;
            const liveCandle: Candle = {
              time: Math.floor(k.t / 1000), // UNIX seconds
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };

            // Real-time sub-second candle update
            setLatestTick(liveCandle);
            setCurrentPrice(liveCandle.close);

            // Update market overview price
            setMarkets((prev) =>
              prev.map((m) => (m.symbol === symbol ? { ...m, price: liveCandle.close } : m))
            );

            // If candle closed (k.x === true), safely update historical candles array
            if (k.x) {
              setCandles((prev) => {
                const map = new Map<number, Candle>();
                prev.forEach((c) => map.set(c.time, c));
                map.set(liveCandle.time, liveCandle);
                return Array.from(map.values()).sort((a, b) => a.time - b.time);
              });
            }
          }
        } catch (e) {
          console.error('[Binance WS] Error parsing message', e);
        }
      };

      binanceWS.onerror = (e) => {
        console.warn('[Binance WS] Stream error, fallback to Go backend stream', e);
      };
    } catch (e) {
      console.warn('[Binance WS] Connection failed', e);
    }

    return () => {
      if (binanceWS) {
        binanceWS.close();
      }
    };
  }, [symbol, timeframe]);

  const toggleIndicator = (key: 'ema' | 'rsi' | 'macd' | 'bb') => {
    setActiveIndicators((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const currentMarket = markets.find((m) => m.symbol === symbol) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e1118] text-[#e6ebf2] overflow-hidden">
      {/* 1. TradingView Top Header */}
      <Header
        currentSymbol={symbol}
        onSelectSymbol={setSymbol}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
        activeIndicators={activeIndicators}
        onToggleIndicator={toggleIndicator}
        marketData={currentMarket}
        activeSignal={activeSignal}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* 2. Middle Work Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <ToolBar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
        />

        {/* Center Canvas Chart with Live Real-Time Candlestick Updates */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e1118]">
          <TradingChart
            symbol={symbol}
            timeframe={timeframe}
            candles={candles}
            latestTick={latestTick}
            activeSignal={activeSignal}
            activeIndicators={activeIndicators}
          />
        </div>

        {/* Right Sidebar (Signals, News Sentiment, Watchlist, Alert Feed) */}
        <Sidebar
          activeSignal={activeSignal}
          news={news}
          markets={markets}
          selectedSymbol={symbol}
          onSelectSymbol={setSymbol}
          currentPrice={currentPrice}
        />
      </main>

      {/* 3. Bottom Status Bar */}
      <BottomBar symbol={symbol} price={currentPrice} />
    </div>
  );
}
