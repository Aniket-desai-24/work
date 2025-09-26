import { 
  StockPrice, 
  HistoricalPrice, 
  TechnicalIndicators, 
  NewsItem 
} from "@shared/schema";
import yahooFinance from 'yahoo-finance2';

// This service handles external API calls for stock data
// TODO: In production, this would use real APIs like Alpha Vantage, IEX Cloud, or Yahoo Finance

export class StockService {
  private indianAPIUrl = 'http://indian-stock-api.herokuapp.com'; // Free Indian stock API
  private alphaVantageUrl = 'https://www.alphavantage.co/query';
  private alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;

  async getCurrentPrice(symbol: string): Promise<StockPrice | null> {
    try {
      // Try Yahoo Finance first (most reliable)
      const yahooData = await this.fetchYahooFinanceData(symbol);
      if (yahooData) {
        return yahooData;
      }

      // Fallback to Indian stock API
      const realData = await this.fetchRealIndianStockData(symbol);
      if (realData) {
        return realData;
      }

      // Fallback to realistic mock data for Indian stocks
      const price = this.getRealisticPrice(symbol);
      const change = (Math.random() - 0.5) * (price * 0.05); // Max 5% change
      
      const stockData: StockPrice = {
        symbol,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(((change / (price - change)) * 100).toFixed(2)),
        volume: Math.floor(Math.random() * 50000000) + 10000000,
        marketCap: price * Math.floor(Math.random() * 10000000000) + 50000000000,
        high52w: Number((price * 1.3).toFixed(2)),
        low52w: Number((price * 0.7).toFixed(2)),
        previousClose: Number((price - change).toFixed(2)),
        openPrice: Number((price + (Math.random() - 0.5) * (price * 0.01)).toFixed(2)),
        lastUpdated: new Date()
      };

      return stockData;
    } catch (error) {
      console.error(`Error fetching current price for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchYahooFinanceData(symbol: string): Promise<StockPrice | null> {
    try {
      // Convert symbol to Yahoo Finance format for NSE stocks
      const yahooSymbol = `${symbol}.NS`;
      
      const quote = await yahooFinance.quote(yahooSymbol);
      
      console.log(`Yahoo Finance response for ${yahooSymbol}:`, { 
        hasQuote: !!quote, 
        hasPrice: quote?.regularMarketPrice, 
        symbol: quote?.symbol 
      });
      
      if (quote && quote.regularMarketPrice) {
        const price = quote.regularMarketPrice;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        
        return {
          symbol,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          volume: quote.regularMarketVolume || 0,
          marketCap: quote.marketCap || 0,
          high52w: quote.fiftyTwoWeekHigh || 0,
          low52w: quote.fiftyTwoWeekLow || 0,
          previousClose: quote.regularMarketPreviousClose || price,
          openPrice: quote.regularMarketOpen || price,
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      console.log(`Yahoo Finance API failed for ${symbol}:`, error instanceof Error ? error.message : error);
    }
    return null;
  }

  private async fetchRealIndianStockData(symbol: string): Promise<StockPrice | null> {
    try {
      // Use deployed Heroku instance of the Indian stock API
      const response = await fetch(`https://indian-stock-api.onrender.com/nse/get_quote_info?companyName=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data && data.data.pChange !== undefined) {
        const quote = data.data;
        return {
          symbol,
          price: parseFloat(quote.lastPrice) || 0,
          change: parseFloat(quote.change) || 0,
          changePercent: parseFloat(quote.pChange) || 0,
          volume: parseInt(quote.totalTradedVolume) || 0,
          marketCap: parseFloat(quote.marketCap) || 0,
          high52w: parseFloat(quote.yearHigh) || 0,
          low52w: parseFloat(quote.yearLow) || 0,
          previousClose: parseFloat(quote.previousClose) || 0,
          openPrice: parseFloat(quote.open) || 0,
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      console.log(`Real API failed for ${symbol}, using fallback data`);
    }
    return null;
  }

  private getRealisticPrice(symbol: string): number {
    const stockPrices: Record<string, { base: number; range: number }> = {
      'RELIANCE': { base: 2850, range: 200 },
      'TCS': { base: 4200, range: 300 },
      'INFY': { base: 1750, range: 150 },
      'HDFCBANK': { base: 1680, range: 120 },
      'ICICIBANK': { base: 1200, range: 100 },
      'HINDUNILVR': { base: 2400, range: 180 },
      'ITC': { base: 480, range: 40 },
      'SBIN': { base: 850, range: 80 },
      'BHARTIARTL': { base: 1550, range: 120 },
      'LT': { base: 3600, range: 250 }
    };
    
    const stock = stockPrices[symbol] || { base: 1500, range: 100 };
    return stock.base + (Math.random() - 0.5) * stock.range;
  }

  async getHistoricalPrices(symbol: string, timeframe: string): Promise<HistoricalPrice[]> {
    try {
      // TODO: Replace with real API call
      // Generate mock historical data
      const days = this.getTimeframeDays(timeframe);
      const prices: HistoricalPrice[] = [];
      // Base prices for Indian stocks
      const getIndianBasePrice = (symbol: string) => {
        const basePrices: Record<string, number> = {
          'RELIANCE': 2850, 'TCS': 4200, 'INFY': 1750, 'HDFCBANK': 1680,
          'ICICIBANK': 1200, 'HINDUNILVR': 2400, 'ITC': 480, 'SBIN': 850,
          'BHARTIARTL': 1550, 'LT': 3600
        };
        return basePrices[symbol] || 1500;
      };
      
      let basePrice = getIndianBasePrice(symbol);

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const volatility = 0.02; // 2% daily volatility
        const change = (Math.random() - 0.5) * volatility * basePrice;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.floor(Math.random() * 50000000) + 20000000;

        prices.push({
          date: date.toISOString().split('T')[0],
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume
        });

        basePrice = close; // Use close as next day's base
      }

      return prices;
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }
  }

  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 30;
    }
  }

  calculateTechnicalIndicators(prices: HistoricalPrice[], symbol: string): TechnicalIndicators {
    const closes = prices.map(p => p.close);
    const volumes = prices.map(p => p.volume);
    
    return {
      symbol,
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      movingAverages: {
        ma20: this.calculateSMA(closes, 20),
        ma50: this.calculateSMA(closes, 50),
        ma200: this.calculateSMA(closes, Math.min(200, closes.length))
      },
      bollingerBands: this.calculateBollingerBands(closes),
      lastUpdated: new Date()
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Default neutral RSI
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    const gains = changes.slice(-period).filter(c => c > 0);
    const losses = changes.slice(-period).filter(c => c < 0).map(c => Math.abs(c));
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    
    // Simplified MACD calculation for demo
    return {
      value: Number(macdLine.toFixed(2)),
      signal: Number((macdLine * 0.8).toFixed(2)),
      histogram: Number((macdLine * 0.2).toFixed(2))
    };
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    
    const k = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * k) + (ema * (1 - k));
    }
    
    return ema;
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) {
      period = prices.length;
    }
    
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  }

  private calculateBollingerBands(prices: number[], period: number = 20): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: Number((sma + (stdDev * 2)).toFixed(2)),
      middle: Number(sma.toFixed(2)),
      lower: Number((sma - (stdDev * 2)).toFixed(2))
    };
  }

  async getStockNews(symbol: string): Promise<NewsItem[]> {
    try {
      // TODO: Replace with real news API call
      // Mock news data for demonstration
      // Indian market focused news
      const getIndianStockNews = (symbol: string): NewsItem[] => {
        const companyNews: Record<string, NewsItem[]> = {
          'RELIANCE': [
            {
              id: '1',
              headline: `Reliance Industries Q4 Results: Net Profit Surges 12% YoY to ₹19,299 Crore`,
              summary: `RIL reports strong quarterly results driven by robust performance in retail and telecom segments.`,
              source: 'Economic Times',
              timestamp: '2 hours ago',
              sentiment: 'positive' as const,
              url: '#'
            }
          ],
          'TCS': [
            {
              id: '1',
              headline: `TCS Wins Major Digital Transformation Deal Worth $1.2 Billion`,
              summary: `Tata Consultancy Services secures multi-year contract with Fortune 500 company for cloud migration.`,
              source: 'Business Standard',
              timestamp: '3 hours ago',
              sentiment: 'positive' as const,
              url: '#'
            }
          ],
          'INFY': [
            {
              id: '1',
              headline: `Infosys Raises FY25 Revenue Guidance on Strong Client Demand`,
              summary: `Company increases annual revenue growth guidance to 3-4% in constant currency terms.`,
              source: 'Mint',
              timestamp: '1 hour ago',
              sentiment: 'positive' as const,
              url: '#'
            }
          ]
        };

        const defaultNews: NewsItem[] = [
          {
            id: '1',
            headline: `${symbol} Shows Strong Performance in NSE Trading Session`,
            summary: `The stock demonstrated resilience amid market volatility with healthy trading volumes.`,
            source: 'Moneycontrol',
            timestamp: '2 hours ago',
            sentiment: 'positive' as const,
            url: '#'
          },
          {
            id: '2',
            headline: `Nifty 50 Index Movement Affects ${symbol} Trading Pattern`,
            summary: `Market sentiment and sector rotation impact individual stock performance.`,
            source: 'CNBC-TV18',
            timestamp: '4 hours ago',
            sentiment: 'neutral' as const,
            url: '#'
          },
          {
            id: '3',
            headline: `FII Activity and ${symbol}: Foreign Institutional Investor Impact Analysis`,
            summary: `Recent FII flows and their correlation with large-cap stock movements in Indian markets.`,
            source: 'Zee Business',
            timestamp: '6 hours ago',
            sentiment: 'neutral' as const,
            url: '#'
          }
        ];

        return companyNews[symbol] || defaultNews;
      };

      const mockNews = getIndianStockNews(symbol);

      return mockNews;
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      return [];
    }
  }
}

export const stockService = new StockService();