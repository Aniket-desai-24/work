import { useState } from 'react';
import Header from './Header';
import StockSearch from './StockSearch';
import StockPrice from './StockPrice';
import AIRecommendation from './AIRecommendation';
import TechnicalIndicators from './TechnicalIndicators';
import PriceChart from './PriceChart';
import NewsFeed from './NewsFeed';
import FundamentalMetrics from './FundamentalMetrics';
import PortfolioSimulator from './PortfolioSimulator';
import StockComparison from './StockComparison';
import PriceAlerts from './PriceAlerts';
import BacktestingEngine from './BacktestingEngine';
import AccuracyTracker from './AccuracyTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TradingDashboard() {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [currentPrice, setCurrentPrice] = useState<number>();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Selection and Price */}
          <div className="lg:col-span-1 space-y-6">
            <StockSearch 
              selectedStock={selectedStock}
              onStockSelect={setSelectedStock}
            />
            <StockPrice 
              symbol={selectedStock} 
              onPriceUpdate={setCurrentPrice}
            />
          </div>
          
          {/* Middle Column - AI Recommendation */}
          <div className="lg:col-span-2">
            <AIRecommendation symbol={selectedStock} />
          </div>
        </div>

        {/* Chart and Technical Analysis Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PriceChart symbol={selectedStock} />
          <TechnicalIndicators symbol={selectedStock} />
        </div>

        {/* News and Fundamentals Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <NewsFeed symbol={selectedStock} />
          <FundamentalMetrics symbol={selectedStock} />
        </div>

        {/* Advanced Features Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            🚀 Advanced Trading Features
          </h2>
          
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="backtest">Backtest</TabsTrigger>
              <TabsTrigger value="accuracy">AI Track</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="space-y-4">
              <PortfolioSimulator 
                currentStock={selectedStock}
                currentPrice={currentPrice}
              />
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <StockComparison currentStock={selectedStock} />
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-4">
              <PriceAlerts 
                currentStock={selectedStock}
                currentPrice={currentPrice}
              />
            </TabsContent>
            
            <TabsContent value="backtest" className="space-y-4">
              <BacktestingEngine currentStock={selectedStock} />
            </TabsContent>
            
            <TabsContent value="accuracy" className="space-y-4">
              <AccuracyTracker />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Notice */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            🚀 AI Stock Analyzer - Complete Indian Market Trading Platform
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ✅ Real API Integration • Portfolio Simulation • Price Alerts • Backtesting • AI Accuracy Tracking
          </p>
        </div>
      </div>
    </div>
  );
}