import Groq from "groq-sdk";
import { 
  AIRecommendation, 
  StockPrice, 
  TechnicalIndicators, 
  NewsItem 
} from "@shared/schema";

export class AIService {
  private groq: Groq | null;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    } else {
      console.warn('GROQ_API_KEY not provided, AI recommendations will use fallback logic');
      this.groq = null;
    }
  }

  async generateRecommendation(
    symbol: string,
    stockPrice: StockPrice,
    technicalIndicators: TechnicalIndicators,
    news: NewsItem[]
  ): Promise<AIRecommendation> {
    try {
      // If no Groq API key is available, use fallback recommendation
      if (!this.groq) {
        return this.generateFallbackRecommendation(symbol, stockPrice, technicalIndicators);
      }

      const prompt = this.buildAnalysisPrompt(symbol, stockPrice, technicalIndicators, news);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional financial analyst and stock trading expert. Analyze the provided stock data and generate clear, actionable trading recommendations. Always respond in valid JSON format with the exact structure requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Low temperature for consistent financial analysis
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const aiResponse = JSON.parse(content);
      
      return {
        symbol,
        recommendation: aiResponse.recommendation || 'HOLD',
        confidence: Math.min(Math.max(aiResponse.confidence || 50, 0), 100),
        riskLevel: aiResponse.riskLevel || 'Medium',
        timeHorizon: aiResponse.timeHorizon || 'Medium',
        reasoning: Array.isArray(aiResponse.reasoning) ? aiResponse.reasoning : [aiResponse.reasoning || 'Analysis completed'],
        targetPrice: aiResponse.targetPrice,
        currentPrice: stockPrice.price,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating AI recommendation:', error);
      
      // Fallback recommendation based on simple technical analysis
      return this.generateFallbackRecommendation(symbol, stockPrice, technicalIndicators);
    }
  }

  private buildAnalysisPrompt(
    symbol: string,
    stockPrice: StockPrice,
    technicalIndicators: TechnicalIndicators,
    news: NewsItem[]
  ): string {
    const newssentiment = this.calculateNewsSentiment(news);
    
    return `
Please analyze ${symbol} stock and provide a trading recommendation in JSON format:

CURRENT STOCK DATA:
- Current Price: $${stockPrice.price.toFixed(2)}
- Change: ${stockPrice.change >= 0 ? '+' : ''}${stockPrice.change.toFixed(2)} (${stockPrice.changePercent.toFixed(2)}%)
- Volume: ${stockPrice.volume.toLocaleString()}
- Market Cap: $${(stockPrice.marketCap / 1e9).toFixed(1)}B
- 52W High/Low: $${stockPrice.high52w.toFixed(2)} / $${stockPrice.low52w.toFixed(2)}
- Previous Close: $${stockPrice.previousClose.toFixed(2)}

TECHNICAL INDICATORS:
- RSI: ${technicalIndicators.rsi.toFixed(1)} ${technicalIndicators.rsi >= 70 ? '(Overbought)' : technicalIndicators.rsi <= 30 ? '(Oversold)' : '(Neutral)'}
- MACD: Value=${technicalIndicators.macd.value.toFixed(2)}, Signal=${technicalIndicators.macd.signal.toFixed(2)}
- Moving Averages: MA20=$${technicalIndicators.movingAverages.ma20.toFixed(2)}, MA50=$${technicalIndicators.movingAverages.ma50.toFixed(2)}, MA200=$${technicalIndicators.movingAverages.ma200.toFixed(2)}
- Bollinger Bands: Upper=$${technicalIndicators.bollingerBands.upper.toFixed(2)}, Middle=$${technicalIndicators.bollingerBands.middle.toFixed(2)}, Lower=$${technicalIndicators.bollingerBands.lower.toFixed(2)}

NEWS SENTIMENT: ${newssentiment}

RECENT NEWS HEADLINES:
${news.slice(0, 3).map(item => `- ${item.headline} (${item.sentiment})`).join('\n')}

Based on this comprehensive analysis, provide a recommendation in this EXACT JSON format:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "riskLevel": "Low|Medium|High",
  "timeHorizon": "Short|Medium|Long",
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "targetPrice": 0.00
}

Consider:
1. Technical indicators (RSI, MACD, moving averages, Bollinger bands)
2. Price momentum and volume patterns
3. News sentiment and market conditions  
4. Risk-reward ratio
5. Support and resistance levels

Provide specific, actionable reasoning for your recommendation.`;
  }

  private calculateNewsSentiment(news: NewsItem[]): string {
    if (news.length === 0) return 'Neutral - No recent news';
    
    const sentimentCounts = news.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = news.length;
    const positive = sentimentCounts.positive || 0;
    const negative = sentimentCounts.negative || 0;
    const neutral = sentimentCounts.neutral || 0;
    
    if (positive > negative && positive > neutral) {
      return `Positive (${positive}/${total} positive articles)`;
    } else if (negative > positive && negative > neutral) {
      return `Negative (${negative}/${total} negative articles)`;
    } else {
      return `Mixed/Neutral (${positive} pos, ${negative} neg, ${neutral} neutral)`;
    }
  }

  private generateFallbackRecommendation(
    symbol: string,
    stockPrice: StockPrice,
    technicalIndicators: TechnicalIndicators
  ): AIRecommendation {
    const { rsi, macd, movingAverages } = technicalIndicators;
    const { price, changePercent } = stockPrice;
    
    let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reasoning: string[] = [];
    
    // Simple technical analysis logic
    if (rsi < 30 && macd.value > macd.signal && price > movingAverages.ma20) {
      recommendation = 'BUY';
      confidence = 75;
      reasoning = [
        'RSI indicates oversold conditions',
        'MACD showing bullish crossover',
        'Price above 20-day moving average'
      ];
    } else if (rsi > 70 && macd.value < macd.signal && changePercent < -2) {
      recommendation = 'SELL';
      confidence = 70;
      reasoning = [
        'RSI indicates overbought conditions',
        'MACD showing bearish crossover',
        'Significant price decline'
      ];
    } else {
      reasoning = [
        'Mixed technical signals',
        'Market conditions uncertain',
        'Recommend waiting for clearer trend'
      ];
    }
    
    return {
      symbol,
      recommendation,
      confidence,
      riskLevel: confidence > 70 ? 'Medium' : 'High',
      timeHorizon: 'Short',
      reasoning,
      currentPrice: price,
      generatedAt: new Date()
    };
  }

  async generateIntradayRecommendation(
    symbol: string,
    stockPrice: StockPrice,
    technicalIndicators: TechnicalIndicators,
    news: NewsItem[]
  ): Promise<AIRecommendation> {
    try {
      if (!this.groq) {
        return this.generateIntradayFallbackRecommendation(symbol, stockPrice, technicalIndicators);
      }

      const prompt = this.buildIntradayAnalysisPrompt(symbol, stockPrice, technicalIndicators, news);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional intraday trader. Analyze data for same-day trading opportunities focusing on short-term movements, volume, and entry/exit points for profitable intraday trades. Generate buy/sell signals for today's market. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const aiResponse = JSON.parse(content);
      
      return {
        symbol,
        recommendation: aiResponse.recommendation || 'HOLD',
        confidence: Math.min(Math.max(aiResponse.confidence || 50, 0), 100),
        riskLevel: aiResponse.riskLevel || 'Medium',
        timeHorizon: 'Short', // Always short for intraday
        reasoning: Array.isArray(aiResponse.reasoning) ? aiResponse.reasoning : [aiResponse.reasoning || 'Intraday analysis completed'],
        targetPrice: aiResponse.targetPrice,
        currentPrice: stockPrice.price,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating intraday AI recommendation:', error);
      return this.generateIntradayFallbackRecommendation(symbol, stockPrice, technicalIndicators);
    }
  }

  async generateMorningRecommendations(symbols: string[]): Promise<{ symbol: string; action: 'BUY' | 'SELL' | 'WATCH'; reason: string; targetPrice?: number }[]> {
    const currentHour = new Date().getHours();
    const recommendations = [];
    
    for (const symbol of symbols) {
      // This would typically fetch current data for each symbol
      // For now, providing structure for morning recommendations
      const morningSignal = this.getMorningMarketSignal(symbol, currentHour);
      recommendations.push(morningSignal);
    }
    
    return recommendations;
  }

  private buildIntradayAnalysisPrompt(
    symbol: string,
    stockPrice: StockPrice,
    technicalIndicators: TechnicalIndicators,
    news: NewsItem[]
  ): string {
    const currentTime = new Date();
    const marketTime = currentTime.getHours();
    const isMarketOpen = marketTime >= 9 && marketTime <= 15;
    
    return `INTRADAY TRADING ANALYSIS for ${symbol}:

MARKET STATUS: ${isMarketOpen ? 'OPEN' : 'CLOSED'}
TIME: ${currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

STOCK DATA:
- Current Price: ₹${stockPrice.price}
- Change: ${stockPrice.change >= 0 ? '+' : ''}${stockPrice.change} (${stockPrice.changePercent}%)
- Volume: ${stockPrice.volume.toLocaleString()} ${stockPrice.volume > 1000000 ? '(HIGH VOLUME)' : '(NORMAL)'}
- Open: ₹${stockPrice.openPrice}
- Previous Close: ₹${stockPrice.previousClose}

INTRADAY TECHNICAL SIGNALS:
- RSI: ${technicalIndicators.rsi} ${technicalIndicators.rsi > 70 ? '(Overbought - Sell Signal)' : technicalIndicators.rsi < 30 ? '(Oversold - Buy Signal)' : '(Neutral)'}
- MACD: ${technicalIndicators.macd.value} vs Signal: ${technicalIndicators.macd.signal}
- Price vs 20MA: ₹${technicalIndicators.movingAverages.ma20} ${stockPrice.price > technicalIndicators.movingAverages.ma20 ? '(Above - Bullish)' : '(Below - Bearish)'}
- Bollinger Position: Upper ₹${technicalIndicators.bollingerBands.upper}, Lower ₹${technicalIndicators.bollingerBands.lower}

NEWS SENTIMENT: ${this.calculateNewsSentiment(news)}

INTRADAY STRATEGY FOCUS:
1. Entry point for today's trade
2. Realistic target: 1-3% profit
3. Stop loss: 0.5-1% maximum loss
4. Exit before market close (3:30 PM)
5. Volume confirmation for trades

Respond with JSON:
{
  "recommendation": "BUY/SELL/HOLD",
  "confidence": 0-100,
  "riskLevel": "Low/Medium/High",
  "targetPrice": number,
  "stopLoss": number,
  "entryPrice": number,
  "expectedProfit": "1-3%",
  "tradingWindow": "morning/afternoon/all-day",
  "reasoning": ["specific", "intraday", "trading", "reasons"]
}`;
  }

  private generateIntradayFallbackRecommendation(
    symbol: string,
    stockPrice: StockPrice,
    technicalIndicators: TechnicalIndicators
  ): AIRecommendation {
    const price = stockPrice.price;
    const rsi = technicalIndicators.rsi;
    const changePercent = stockPrice.changePercent;
    const volume = stockPrice.volume;
    
    let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reasoning: string[] = [];
    
    // Intraday-specific logic
    if (rsi < 35 && changePercent < -1.5 && volume > 500000) {
      recommendation = 'BUY';
      confidence = 70;
      reasoning = [
        'Oversold with price drop - intraday bounce opportunity',
        'Good volume confirms the move',
        'Target 1-2% profit with 0.5% stop loss',
        'Morning dip buying strategy'
      ];
    } else if (rsi > 65 && changePercent > 1.5 && volume > 500000) {
      recommendation = 'SELL';
      confidence = 65;
      reasoning = [
        'Overbought after rally - profit booking opportunity',
        'High volume shows momentum exhaustion',
        'Target 1-2% from current levels',
        'Afternoon profit taking strategy'
      ];
    } else if (Math.abs(changePercent) < 0.5 && volume < 300000) {
      reasoning = [
        'Low volatility and volume - avoid trading',
        'Wait for clear breakout or breakdown',
        'No profitable intraday opportunity',
        'Better to stay on sidelines'
      ];
    } else {
      reasoning = [
        'Mixed signals for intraday trading',
        'Monitor for volume spike and momentum',
        'Wait for clearer technical setup',
        'Risk-reward not favorable currently'
      ];
    }
    
    return {
      symbol,
      recommendation,
      confidence,
      riskLevel: confidence > 65 ? 'Medium' : 'High',
      timeHorizon: 'Short',
      reasoning,
      currentPrice: price,
      targetPrice: recommendation === 'BUY' ? price * 1.015 : recommendation === 'SELL' ? price * 0.985 : undefined,
      generatedAt: new Date()
    };
  }

  private getMorningMarketSignal(symbol: string, currentHour: number): { symbol: string; action: 'BUY' | 'SELL' | 'WATCH'; reason: string; targetPrice?: number } {
    // Simple morning market logic - this would be enhanced with real data
    if (currentHour >= 9 && currentHour <= 11) {
      return {
        symbol,
        action: 'WATCH',
        reason: 'Morning session - monitor for breakout patterns and volume spikes'
      };
    } else if (currentHour >= 11 && currentHour <= 13) {
      return {
        symbol,
        action: 'BUY',
        reason: 'Mid-day opportunity - look for dip buying if fundamentals are strong'
      };
    } else {
      return {
        symbol,
        action: 'WATCH',
        reason: 'Outside optimal trading window - wait for next session'
      };
    }
  }
}

export const aiService = new AIService();