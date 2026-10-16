package models

import "time"

// Candle represents an OHLCV candlestick bar
type Candle struct {
	Time   int64   `json:"time"`   // UNIX timestamp in seconds
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

// IndicatorValues stores calculated indicators for the latest candle
type IndicatorValues struct {
	EMA9       float64 `json:"ema9"`
	EMA21      float64 `json:"ema21"`
	EMA50      float64 `json:"ema50"`
	EMA200     float64 `json:"ema200"`
	RSI        float64 `json:"rsi"`
	MACD       float64 `json:"macd"`
	MACDSignal float64 `json:"macd_signal"`
	MACDHist   float64 `json:"macd_hist"`
	BBUpper    float64 `json:"bb_upper"`
	BBMiddle   float64 `json:"bb_middle"`
	BBLower    float64 `json:"bb_lower"`
	ATR        float64 `json:"atr"`
}

// SignalAction represents the trading alert action
type SignalAction string

const (
	ActionStrongBuy  SignalAction = "STRONG_BUY"
	ActionBuy        SignalAction = "BUY"
	ActionNeutral    SignalAction = "NEUTRAL"
	ActionSell       SignalAction = "SELL"
	ActionStrongSell SignalAction = "STRONG_SELL"
)

// InstitutionalChecklist represents the 5 verified quant filters
type InstitutionalChecklist struct {
	HTFTrendAligned      bool `json:"htf_trend_aligned"`
	LiquiditySweepFound  bool `json:"liquidity_sweep_found"`
	VolumeDeltaConfirmed bool `json:"volume_delta_confirmed"`
	MarketRegimeTrending bool `json:"market_regime_trending"`
	RiskRewardAcceptable bool `json:"risk_reward_acceptable"`
}

// Signal represents a multi-confluence trading prediction
type Signal struct {
	ID               string                 `json:"id"`
	Symbol           string                 `json:"symbol"`
	Timeframe        string                 `json:"timeframe"`
	Action           SignalAction           `json:"action"`
	OrderType        string                 `json:"order_type"`        // "BUY_STOP", "LIMIT_BUY", "MARKET_BUY", "SELL_STOP", "MARKET_SELL"
	TriggerPrice     float64                `json:"trigger_price"`     // Price where entry confirms (e.g. 80910)
	TradeAdvice      string                 `json:"trade_advice"`      // Actionable 1-line guidance
	LiquiditySweep   string                 `json:"liquidity_sweep"`   // Liquidity sweep analysis (e.g. "Sweep at $80,400")
	MarketRegime     string                 `json:"market_regime"`     // "STRONG_TREND", "WEAK_TREND", "CHOPPY_RANGE"
	FVGZone          string                 `json:"fvg_zone"`          // Fair Value Gap institutional imbalance zone
	ValidationStatus string                 `json:"validation_status"` // "WAITING_TRIGGER", "TRIGGERED", "INVALIDATED"
	ConfluenceScore  float64                `json:"confluence_score"`  // 0.0 - 100.0%
	EntryPrice       float64                `json:"entry_price"`
	StopLoss         float64                `json:"stop_loss"`
	TakeProfit1      float64                `json:"take_profit_1"`
	TakeProfit2      float64                `json:"take_profit_2"`
	TakeProfit3      float64                `json:"take_profit_3"`
	RiskRewardRatio  string                 `json:"risk_reward_ratio"`
	WinProbability   float64                `json:"win_probability"` // Quant model confidence (60-85%)
	Checklist        InstitutionalChecklist `json:"checklist"`
	Factors          []string               `json:"factors"`
	Indicators       IndicatorValues        `json:"indicators"`
	NewsSentiment    float64                `json:"news_sentiment"` // -1.0 to +1.0
	Timestamp        time.Time              `json:"timestamp"`
}

// NewsItem represents financial/crypto news with sentiment analysis
type NewsItem struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Source         string    `json:"source"`
	URL            string    `json:"url"`
	PublishedAt    time.Time `json:"published_at"`
	Sentiment      string    `json:"sentiment"` // "BULLISH", "BEARISH", "NEUTRAL"
	SentimentScore float64   `json:"sentiment_score"` // -1.0 to +1.0
	ImpactFactor   string    `json:"impact_factor"` // "HIGH", "MEDIUM", "LOW"
	Summary        string    `json:"summary"`
	Tags           []string  `json:"tags"`
}

// MarketOverview stores general ticker status
type MarketOverview struct {
	Symbol       string       `json:"symbol"`
	Name         string       `json:"name"`
	Type         string       `json:"type"` // "crypto" or "stock"
	Price        float64      `json:"price"`
	Change24h    float64      `json:"change_24h"`
	High24h      float64      `json:"high_24h"`
	Low24h       float64      `json:"low_24h"`
	Volume24h    float64      `json:"volume_24h"`
	SignalAction SignalAction `json:"signal_action"`
	Score        float64      `json:"score"`
}

// WSMessage format for broadcasting to UI
type WSMessage struct {
	Type      string      `json:"type"` // "TICK", "CANDLE", "SIGNAL", "NEWS"
	Symbol    string      `json:"symbol,omitempty"`
	Data      interface{} `json:"data"`
	Timestamp int64       `json:"timestamp"`
}
