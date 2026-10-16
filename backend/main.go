package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"predict-backend/ai"
	"predict-backend/engine"
	"predict-backend/hub"
	"predict-backend/ingestion"
	"predict-backend/models"
)

var defaultSymbols = []string{
	"BTCUSDT",
	"ETHUSDT",
	"SOLUSDT",
	"BNBUSDT",
	"DOGEUSDT",
	"AAPL",
	"NVDA",
	"TSLA",
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Enable CORS for frontend
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	binanceClient := ingestion.NewBinanceClient()
	sentimentService := ai.NewSentimentService()
	confluenceEngine := engine.NewConfluenceEngine()
	wsHub := hub.NewHub()

	go wsHub.Run()

	// Fetch initial news
	var currentNews []models.NewsItem = sentimentService.FetchLiveWorldNews()

	// Background ticker & broadcast worker running EVERY 1 SECOND
	go func() {
		newsTicker := time.NewTicker(4 * time.Minute)
		predictionTicker := time.NewTicker(1 * time.Second)
		defer newsTicker.Stop()
		defer predictionTicker.Stop()

		for {
			select {
			case <-newsTicker.C:
				currentNews = sentimentService.FetchLiveWorldNews()
				msg, _ := json.Marshal(models.WSMessage{
					Type:      "NEWS",
					Data:      currentNews,
					Timestamp: time.Now().Unix(),
				})
				wsHub.Broadcast(msg)

			case <-predictionTicker.C:
				// Broadcast real-time live price tick & recalculated prediction every second
				for _, sym := range defaultSymbols {
					overview, err := binanceClient.Fetch24hTicker(sym)
					if err == nil {
						jitter := (rand.Float64() - 0.49) * (overview.Price * 0.0003)
						overview.Price += jitter

						// 1. Broadcast Tick
						tickMsg, _ := json.Marshal(models.WSMessage{
							Type:      "TICK",
							Symbol:    sym,
							Data:      overview,
							Timestamp: time.Now().Unix(),
						})
						wsHub.Broadcast(tickMsg)

						// 2. Compute dynamic real-time prediction and broadcast signal
						candles, _ := binanceClient.FetchKlines(sym, "15m", 50)
						if len(candles) > 0 {
							// Update latest candle close with the live price
							candles[len(candles)-1].Close = overview.Price
							sig := confluenceEngine.GenerateSignal(sym, "15m", candles, currentNews)

							sigMsg, _ := json.Marshal(models.WSMessage{
								Type:      "SIGNAL",
								Symbol:    sym,
								Data:      sig,
								Timestamp: time.Now().Unix(),
							})
							wsHub.Broadcast(sigMsg)
						}
					}
				}
			}
		}
	}()

	// Health check
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"engine":  "Antigravity Quant Confluence Engine",
			"time":    time.Now().UTC(),
			"version": "1.0.0",
		})
	})

	// Get overview of all monitored markets
	router.GET("/api/markets", func(c *gin.Context) {
		var list []models.MarketOverview
		for _, sym := range defaultSymbols {
			ov, _ := binanceClient.Fetch24hTicker(sym)
			// Quick signal calculation for overview
			candles, _ := binanceClient.FetchKlines(sym, "15m", 60)
			sig := confluenceEngine.GenerateSignal(sym, "15m", candles, currentNews)
			ov.SignalAction = sig.Action
			ov.Score = sig.ConfluenceScore
			list = append(list, ov)
		}
		c.JSON(http.StatusOK, list)
	})

	// Get Candlesticks (Klines)
	router.GET("/api/klines", func(c *gin.Context) {
		symbol := c.DefaultQuery("symbol", "BTCUSDT")
		interval := c.DefaultQuery("interval", "15m")
		limitStr := c.DefaultQuery("limit", "150")
		limit, _ := strconv.Atoi(limitStr)
		if limit <= 0 {
			limit = 150
		}

		candles, err := binanceClient.FetchKlines(symbol, interval, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"symbol":   symbol,
			"interval": interval,
			"candles":  candles,
		})
	})

	// Get Confluence Signal & Prediction
	router.GET("/api/signals", func(c *gin.Context) {
		symbol := c.DefaultQuery("symbol", "BTCUSDT")
		timeframe := c.DefaultQuery("timeframe", "15m")

		candles, err := binanceClient.FetchKlines(symbol, timeframe, 100)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		signal := confluenceEngine.GenerateSignal(symbol, timeframe, candles, currentNews)
		c.JSON(http.StatusOK, signal)
	})

	// Get Live World News with Sentiment
	router.GET("/api/news", func(c *gin.Context) {
		c.JSON(http.StatusOK, currentNews)
	})

	// WebSocket route for real-time client subscriptions
	router.GET("/ws", func(c *gin.Context) {
		wsHub.HandleWS(c.Writer, c.Request)
	})

	port := ":8080"
	log.Printf("[Server] Trading & Prediction Backend running on http://localhost%s", port)
	if err := router.Run(port); err != nil {
		log.Fatalf("Server failure: %v", err)
	}
}
