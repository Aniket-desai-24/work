import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stockService } from "./stockService";
import { aiService } from "./aiService";
import { stockSymbolSchema, timeframeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stock data routes
  app.get('/api/stock/:symbol', async (req, res) => {
    try {
      const symbol = stockSymbolSchema.parse(req.params.symbol.toUpperCase());
      
      // Try to get cached data first
      let stockPrice = await storage.getStockPrice(symbol);
      
      // If no cached data or data is old (> 1 minute), fetch new data
      const isStale = !stockPrice || 
        (Date.now() - stockPrice.lastUpdated.getTime()) > 60000;
      
      if (isStale) {
        const freshData = await stockService.getCurrentPrice(symbol);
        if (freshData) {
          await storage.setStockPrice(freshData);
          stockPrice = freshData;
        }
      }
      
      if (!stockPrice) {
        return res.status(404).json({ error: 'Stock not found' });
      }
      
      res.json(stockPrice);
    } catch (error) {
      console.error('Error fetching stock price:', error);
      res.status(400).json({ error: 'Invalid stock symbol' });
    }
  });

  app.get('/api/stock/:symbol/history/:timeframe', async (req, res) => {
    try {
      const symbol = stockSymbolSchema.parse(req.params.symbol.toUpperCase());
      const timeframe = timeframeSchema.parse(req.params.timeframe);
      
      // Try to get cached historical data
      let historicalPrices = await storage.getHistoricalPrices(symbol, timeframe);
      
      // If no cached data, fetch new data
      if (historicalPrices.length === 0) {
        historicalPrices = await stockService.getHistoricalPrices(symbol, timeframe);
        if (historicalPrices.length > 0) {
          await storage.setHistoricalPrices(symbol, timeframe, historicalPrices);
        }
      }
      
      res.json(historicalPrices);
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      res.status(400).json({ error: 'Invalid parameters' });
    }
  });

  app.get('/api/stock/:symbol/technical', async (req, res) => {
    try {
      const symbol = stockSymbolSchema.parse(req.params.symbol.toUpperCase());
      
      // Try to get cached technical indicators
      let indicators = await storage.getTechnicalIndicators(symbol);
      
      // If no cached data or data is old (> 5 minutes), calculate new indicators
      const isStale = !indicators || 
        (Date.now() - indicators.lastUpdated.getTime()) > 300000;
      
      if (isStale) {
        // Get historical prices to calculate indicators
        const historicalPrices = await storage.getHistoricalPrices(symbol, '1M');
        if (historicalPrices.length === 0) {
          // Fetch fresh historical data if not cached
          const freshPrices = await stockService.getHistoricalPrices(symbol, '1M');
          if (freshPrices.length > 0) {
            await storage.setHistoricalPrices(symbol, '1M', freshPrices);
            indicators = stockService.calculateTechnicalIndicators(freshPrices, symbol);
            await storage.setTechnicalIndicators(indicators);
          }
        } else {
          indicators = stockService.calculateTechnicalIndicators(historicalPrices, symbol);
          await storage.setTechnicalIndicators(indicators);
        }
      }
      
      if (!indicators) {
        return res.status(404).json({ error: 'Technical indicators not available' });
      }
      
      res.json(indicators);
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      res.status(400).json({ error: 'Invalid stock symbol' });
    }
  });

  app.get('/api/stock/:symbol/news', async (req, res) => {
    try {
      const symbol = stockSymbolSchema.parse(req.params.symbol.toUpperCase());
      
      // Try to get cached news
      let news = await storage.getNews(symbol);
      
      // If no cached news, fetch fresh news
      if (news.length === 0) {
        news = await stockService.getStockNews(symbol);
        if (news.length > 0) {
          await storage.setNews(symbol, news);
        }
      }
      
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(400).json({ error: 'Invalid stock symbol' });
    }
  });

  app.get('/api/stock/:symbol/recommendation', async (req, res) => {
    try {
      const symbol = stockSymbolSchema.parse(req.params.symbol.toUpperCase());
      
      // Check if we have a cached recommendation (< 1 hour old)
      let recommendation = await storage.getAIRecommendation(symbol);
      const isStale = !recommendation || 
        (Date.now() - recommendation.generatedAt.getTime()) > 3600000; // 1 hour
      
      if (isStale) {
        // Gather all required data for AI analysis
        const stockPrice = await storage.getStockPrice(symbol);
        const technicalIndicators = await storage.getTechnicalIndicators(symbol);
        const news = await storage.getNews(symbol);
        
        // If we don't have the required data, fetch it first
        if (!stockPrice) {
          const freshPrice = await stockService.getCurrentPrice(symbol);
          if (freshPrice) {
            await storage.setStockPrice(freshPrice);
          }
        }
        
        if (!technicalIndicators) {
          const historicalPrices = await stockService.getHistoricalPrices(symbol, '1M');
          if (historicalPrices.length > 0) {
            const indicators = stockService.calculateTechnicalIndicators(historicalPrices, symbol);
            await storage.setTechnicalIndicators(indicators);
          }
        }
        
        if (news.length === 0) {
          const freshNews = await stockService.getStockNews(symbol);
          if (freshNews.length > 0) {
            await storage.setNews(symbol, freshNews);
          }
        }
        
        // Get the updated data for AI analysis
        const finalStockPrice = await storage.getStockPrice(symbol);
        const finalTechnicalIndicators = await storage.getTechnicalIndicators(symbol);
        const finalNews = await storage.getNews(symbol);
        
        if (finalStockPrice && finalTechnicalIndicators) {
          // Generate AI recommendation
          recommendation = await aiService.generateRecommendation(
            symbol,
            finalStockPrice,
            finalTechnicalIndicators,
            finalNews
          );
          
          // Cache the recommendation
          await storage.setAIRecommendation(recommendation);
        }
      }
      
      if (!recommendation) {
        return res.status(404).json({ error: 'AI recommendation not available' });
      }
      
      res.json(recommendation);
    } catch (error) {
      console.error('Error fetching AI recommendation:', error);
      res.status(400).json({ error: 'Invalid stock symbol' });
    }
  });

  app.get('/api/stock/:symbol/fundamentals', async (req, res) => {
    try {
      const symbol = stockSymbolSchema.parse(req.params.symbol.toUpperCase());
      
      const fundamentalData = await stockService.getFundamentalData(symbol);
      
      if (!fundamentalData) {
        return res.status(404).json({ error: 'Fundamental data not available' });
      }
      
      res.json(fundamentalData);
    } catch (error) {
      console.error('Error fetching fundamental data:', error);
      res.status(400).json({ error: 'Invalid stock symbol' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
