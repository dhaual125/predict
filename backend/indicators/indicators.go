package indicators

import (
	"fmt"
	"math"
	"predict-backend/models"
)

// CalculateEMA computes Exponential Moving Average for period N
func CalculateEMA(candles []models.Candle, period int) []float64 {
	n := len(candles)
	if n < period {
		return make([]float64, n)
	}

	result := make([]float64, n)
	multiplier := 2.0 / float64(period+1)

	// Initial SMA as starting point
	var sum float64
	for i := 0; i < period; i++ {
		sum += candles[i].Close
	}
	result[period-1] = sum / float64(period)

	for i := period; i < n; i++ {
		result[i] = (candles[i].Close-result[i-1])*multiplier + result[i-1]
	}

	return result
}

// CalculateRSI computes Relative Strength Index (standard 14 periods)
func CalculateRSI(candles []models.Candle, period int) []float64 {
	n := len(candles)
	result := make([]float64, n)
	if n <= period {
		return result
	}

	var gainSum, lossSum float64
	for i := 1; i <= period; i++ {
		change := candles[i].Close - candles[i-1].Close
		if change > 0 {
			gainSum += change
		} else {
			lossSum -= change
		}
	}

	avgGain := gainSum / float64(period)
	avgLoss := lossSum / float64(period)

	if avgLoss == 0 {
		result[period] = 100.0
	} else {
		rs := avgGain / avgLoss
		result[period] = 100.0 - (100.0 / (1.0 + rs))
	}

	for i := period + 1; i < n; i++ {
		change := candles[i].Close - candles[i-1].Close
		var gain, loss float64
		if change > 0 {
			gain = change
		} else {
			loss = -change
		}

		avgGain = (avgGain*float64(period-1) + gain) / float64(period)
		avgLoss = (avgLoss*float64(period-1) + loss) / float64(period)

		if avgLoss == 0 {
			result[i] = 100.0
		} else {
			rs := avgGain / avgLoss
			result[i] = 100.0 - (100.0 / (1.0 + rs))
		}
	}

	return result
}

// CalculateMACD calculates MACD line, Signal line (9 EMA of MACD), and Histogram
func CalculateMACD(candles []models.Candle, fastPeriod, slowPeriod, signalPeriod int) ([]float64, []float64, []float64) {
	n := len(candles)
	fastEMA := CalculateEMA(candles, fastPeriod)
	slowEMA := CalculateEMA(candles, slowPeriod)

	macdLine := make([]float64, n)
	for i := 0; i < n; i++ {
		macdLine[i] = fastEMA[i] - slowEMA[i]
	}

	// Pseudo-candles for calculating signal EMA on the MACD line
	macdCandles := make([]models.Candle, n)
	for i := 0; i < n; i++ {
		macdCandles[i] = models.Candle{Close: macdLine[i]}
	}
	signalLine := CalculateEMA(macdCandles, signalPeriod)

	histogram := make([]float64, n)
	for i := 0; i < n; i++ {
		histogram[i] = macdLine[i] - signalLine[i]
	}

	return macdLine, signalLine, histogram
}

// CalculateBollingerBands returns Upper, Middle (SMA 20), and Lower bands with 2.0 std dev
func CalculateBollingerBands(candles []models.Candle, period int, stdDevMultiplier float64) ([]float64, []float64, []float64) {
	n := len(candles)
	upper := make([]float64, n)
	middle := make([]float64, n)
	lower := make([]float64, n)

	if n < period {
		return upper, middle, lower
	}

	for i := period - 1; i < n; i++ {
		var sum float64
		for j := i - period + 1; j <= i; j++ {
			sum += candles[j].Close
		}
		mean := sum / float64(period)
		middle[i] = mean

		var varianceSum float64
		for j := i - period + 1; j <= i; j++ {
			diff := candles[j].Close - mean
			varianceSum += diff * diff
		}
		stdDev := math.Sqrt(varianceSum / float64(period))

		upper[i] = mean + (stdDevMultiplier * stdDev)
		lower[i] = mean - (stdDevMultiplier * stdDev)
	}

	return upper, middle, lower
}

// CalculateATR computes Average True Range for dynamic volatility stop-loss sizing
func CalculateATR(candles []models.Candle, period int) []float64 {
	n := len(candles)
	atr := make([]float64, n)
	if n < 2 {
		return atr
	}

	tr := make([]float64, n)
	tr[0] = candles[0].High - candles[0].Low
	for i := 1; i < n; i++ {
		hl := candles[i].High - candles[i].Low
		hc := math.Abs(candles[i].High - candles[i-1].Close)
		lc := math.Abs(candles[i].Low - candles[i-1].Close)
		tr[i] = math.Max(hl, math.Max(hc, lc))
	}

	if n < period {
		return atr
	}

	var sum float64
	for i := 0; i < period; i++ {
		sum += tr[i]
	}
	atr[period-1] = sum / float64(period)

	for i := period; i < n; i++ {
		atr[i] = (atr[i-1]*float64(period-1) + tr[i]) / float64(period)
	}

	return atr
}

// CalculateADX computes Average Directional Index (standard 14 period) to detect Market Regime
func CalculateADX(candles []models.Candle, period int) float64 {
	n := len(candles)
	if n < period+1 {
		return 20.0
	}

	var plusDM, minusDM, trSum float64
	for i := 1; i <= period; i++ {
		highDiff := candles[i].High - candles[i-1].High
		lowDiff := candles[i-1].Low - candles[i].Low

		if highDiff > lowDiff && highDiff > 0 {
			plusDM += highDiff
		}
		if lowDiff > highDiff && lowDiff > 0 {
			minusDM += lowDiff
		}

		tr := math.Max(candles[i].High-candles[i].Low,
			math.Max(math.Abs(candles[i].High-candles[i-1].Close),
				math.Abs(candles[i].Low-candles[i-1].Close)))
		trSum += tr
	}

	if trSum == 0 {
		return 20.0
	}

	plusDI := 100.0 * (plusDM / trSum)
	minusDI := 100.0 * (minusDM / trSum)
	diDiff := math.Abs(plusDI - minusDI)
	diSum := plusDI + minusDI
	if diSum == 0 {
		return 20.0
	}

	dx := 100.0 * (diDiff / diSum)
	return math.Round(dx*10) / 10
}

// DetectFVG locates Fair Value Gap institutional imbalance zones in recent bars
func DetectFVG(candles []models.Candle) (string, bool) {
	n := len(candles)
	if n < 3 {
		return "None", false
	}

	// Check last 6 candles for active unfilled Fair Value Gaps
	for i := n - 1; i >= n-5 && i >= 2; i-- {
		// Bullish FVG: candle 1 high < candle 3 low
		if candles[i-2].High < candles[i].Low {
			gapSize := candles[i].Low - candles[i-2].High
			if gapSize > (candles[i].Close * 0.001) {
				return fmt.Sprintf("Bullish FVG at $%.2f - $%.2f (Support Imbalance)", candles[i-2].High, candles[i].Low), true
			}
		}
		// Bearish FVG: candle 1 low > candle 3 high
		if candles[i-2].Low > candles[i].High {
			gapSize := candles[i-2].Low - candles[i].High
			if gapSize > (candles[i].Close * 0.001) {
				return fmt.Sprintf("Bearish FVG at $%.2f - $%.2f (Resistance Imbalance)", candles[i].High, candles[i-2].Low), true
			}
		}
	}
	return "No active imbalance gap", false
}

// CalculateVolumeDelta estimates aggressive buyer volume vs seller volume
func CalculateVolumeDelta(candles []models.Candle, bars int) (float64, float64) {
	n := len(candles)
	if n < bars {
		bars = n
	}

	var buyVol, sellVol float64
	for i := n - bars; i < n; i++ {
		totalVol := candles[i].Volume
		hlRange := candles[i].High - candles[i].Low
		if hlRange == 0 {
			buyVol += totalVol * 0.5
			sellVol += totalVol * 0.5
			continue
		}
		// Approximate buy pressure from close location relative to candle range
		buyFraction := (candles[i].Close - candles[i].Low) / hlRange
		buyVol += totalVol * buyFraction
		sellVol += totalVol * (1.0 - buyFraction)
	}

	total := buyVol + sellVol
	if total == 0 {
		return 50.0, 50.0
	}
	return math.Round((buyVol/total)*1000) / 10, math.Round((sellVol/total)*1000) / 10
}

// ComputeLatestIndicators calculates all indicator values for the most recent candle
func ComputeLatestIndicators(candles []models.Candle) models.IndicatorValues {
	n := len(candles)
	if n < 30 {
		return models.IndicatorValues{}
	}

	ema9 := CalculateEMA(candles, 9)
	ema21 := CalculateEMA(candles, 21)
	ema50 := CalculateEMA(candles, 50)
	ema200 := CalculateEMA(candles, 200)
	rsi := CalculateRSI(candles, 14)
	macd, signal, hist := CalculateMACD(candles, 12, 26, 9)
	upper, mid, lower := CalculateBollingerBands(candles, 20, 2.0)
	atr := CalculateATR(candles, 14)

	lastIdx := n - 1

	return models.IndicatorValues{
		EMA9:       ema9[lastIdx],
		EMA21:      ema21[lastIdx],
		EMA50:      ema50[lastIdx],
		EMA200:     ema200[lastIdx],
		RSI:        rsi[lastIdx],
		MACD:       macd[lastIdx],
		MACDSignal: signal[lastIdx],
		MACDHist:   hist[lastIdx],
		BBUpper:    upper[lastIdx],
		BBMiddle:   mid[lastIdx],
		BBLower:    lower[lastIdx],
		ATR:        atr[lastIdx],
	}
}

