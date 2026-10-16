# Antigravity AI™ | TradingView-Grade Market Prediction & Analysis Platform

A high-performance **Crypto & Stock Market Prediction Terminal** featuring:
- **Backend**: Golang microservice streaming real-time public market data (Binance WebSocket & REST), calculating technical indicators (EMA, RSI, MACD, Bollinger Bands, ATR), and running multi-confluence scoring algorithms with AI news sentiment.
- **Frontend**: Next.js 16 + TypeScript with **TradingView Lightweight Charts v5**, live Buy/Sell signal markers, dark obsidian minimal UI, audio chimes, and depth order book.

---

## 🚀 Running the Project

### 1. Start the Go Backend
```bash
cd predict/backend
go run .
```
- Server runs on: `http://localhost:8080`
- WebSocket stream on: `ws://localhost:8080/ws`
- Health check: `http://localhost:8080/api/health`
- Live Signals: `http://localhost:8080/api/signals?symbol=BTCUSDT`
- Klines: `http://localhost:8080/api/klines?symbol=BTCUSDT&interval=15m`
- World News Feed: `http://localhost:8080/api/news`

### 2. Start the Next.js Frontend
```bash
cd predict/frontend
npm run dev
```
- Open your browser at: `http://localhost:3000`

---

## 🧠 The Multi-Confluence Signal Algorithm

The prediction engine scores each market setup on a **0 to 100% Confluence Scale**:

```
Confluence Score = (Technical Trend × 0.45) + (Volume Influx × 0.25) + (AI News Sentiment × 0.30)
```

1. **Trend & Structure**:
   - EMA 9/21/50 alignment and 200 EMA macro filter.
2. **Momentum & Volatility**:
   - RSI Oversold (< 32) & Overbought (> 68) mean reversion detection.
   - MACD histogram momentum expansion.
   - Bollinger Band liquidity sweeps and volatility contractions.
3. **AI World News Sentiment**:
   - Reads global headlines (CryptoPanic API + financial RSS).
   - Generates sentiment score (-1.0 to +1.0) with impact weighting (HIGH, MEDIUM, LOW).
   - Compatible with Google Gemini Flash API (`GEMINI_API_KEY`) and local financial heuristics.
4. **Automated Risk Management**:
   - Calculates dynamic **Entry Price**, **Stop Loss (ATR-based)**, and **Take Profit 1, 2, 3** targets with 1:2.4+ Risk-to-Reward ratio.

---

## 🎨 UI & Features (TradingView Standard)

- **TradingView Canvas Chart**: Official `lightweight-charts` v5 engine with OHLCV candlesticks and volume histogram.
- **Dynamic Chart Markers**: BUY and SELL arrow markers positioned directly on chart candles.
- **Audio Chime System**: Web Audio API harmonic sound synthesizers for Buy / Sell alerts (no external MP3 files needed).
- **Dockable Sidebar Tabs**:
  - `AI Signals`: Detailed setup plan, win-rate probability, and factors.
  - `News & AI`: Live headlines with sentiment badges and impact tags.
  - `Watchlist`: Quick ticker switcher with real-time order book depth.
  - `Alerts`: Live chronological trigger log.
