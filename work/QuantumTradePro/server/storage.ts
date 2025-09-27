import { 
  type User, 
  type InsertUser, 
  type StockPrice,
  type HistoricalPrice,
  type TechnicalIndicators,
  type NewsItem,
  type AIRecommendation 
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Stock data methods
  getStockPrice(symbol: string): Promise<StockPrice | undefined>;
  setStockPrice(stockPrice: StockPrice): Promise<void>;
  getHistoricalPrices(symbol: string, timeframe: string): Promise<HistoricalPrice[]>;
  setHistoricalPrices(symbol: string, timeframe: string, prices: HistoricalPrice[]): Promise<void>;
  getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | undefined>;
  setTechnicalIndicators(indicators: TechnicalIndicators): Promise<void>;
  getNews(symbol: string): Promise<NewsItem[]>;
  setNews(symbol: string, news: NewsItem[]): Promise<void>;
  getAIRecommendation(symbol: string): Promise<AIRecommendation | undefined>;
  setAIRecommendation(recommendation: AIRecommendation): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stockPrices: Map<string, StockPrice>;
  private historicalPrices: Map<string, Map<string, HistoricalPrice[]>>;
  private technicalIndicators: Map<string, TechnicalIndicators>;
  private news: Map<string, NewsItem[]>;
  private aiRecommendations: Map<string, AIRecommendation>;

  constructor() {
    this.users = new Map();
    this.stockPrices = new Map();
    this.historicalPrices = new Map();
    this.technicalIndicators = new Map();
    this.news = new Map();
    this.aiRecommendations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStockPrice(symbol: string): Promise<StockPrice | undefined> {
    return this.stockPrices.get(symbol);
  }

  async setStockPrice(stockPrice: StockPrice): Promise<void> {
    this.stockPrices.set(stockPrice.symbol, stockPrice);
  }

  async getHistoricalPrices(symbol: string, timeframe: string): Promise<HistoricalPrice[]> {
    const symbolData = this.historicalPrices.get(symbol);
    return symbolData?.get(timeframe) || [];
  }

  async setHistoricalPrices(symbol: string, timeframe: string, prices: HistoricalPrice[]): Promise<void> {
    if (!this.historicalPrices.has(symbol)) {
      this.historicalPrices.set(symbol, new Map());
    }
    this.historicalPrices.get(symbol)!.set(timeframe, prices);
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | undefined> {
    return this.technicalIndicators.get(symbol);
  }

  async setTechnicalIndicators(indicators: TechnicalIndicators): Promise<void> {
    this.technicalIndicators.set(indicators.symbol, indicators);
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    return this.news.get(symbol) || [];
  }

  async setNews(symbol: string, news: NewsItem[]): Promise<void> {
    this.news.set(symbol, news);
  }

  async getAIRecommendation(symbol: string): Promise<AIRecommendation | undefined> {
    return this.aiRecommendations.get(symbol);
  }

  async setAIRecommendation(recommendation: AIRecommendation): Promise<void> {
    this.aiRecommendations.set(recommendation.symbol, recommendation);
  }
}

export const storage = new MemStorage();
