export type SignalAction = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface Candle {
  time: number; // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  rsi: number;
  macd: number;
  macd_signal: number;
  macd_hist: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  atr: number;
}

export interface InstitutionalChecklist {
  htf_trend_aligned: boolean;
  liquidity_sweep_found: boolean;
  volume_delta_confirmed: boolean;
  market_regime_trending: boolean;
  risk_reward_acceptable: boolean;
}

export interface Signal {
  id: string;
  symbol: string;
  timeframe: string;
  action: SignalAction;
  order_type: string;
  trigger_price: number;
  trade_advice: string;
  liquidity_sweep: string;
  market_regime?: string;
  fvg_zone?: string;
  validation_status: string;
  confluence_score: number;
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  take_profit_3: number;
  risk_reward_ratio: string;
  win_probability: number;
  checklist?: InstitutionalChecklist;
  factors: string[];
  indicators: IndicatorValues;
  news_sentiment: number;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentiment_score: number;
  impact_factor: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  tags: string[];
}

export interface MarketOverview {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  price: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  signal_action: SignalAction;
  score: number;
}
