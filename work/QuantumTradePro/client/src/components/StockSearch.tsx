import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp } from 'lucide-react';

interface StockSearchProps {
  onStockSelect?: (symbol: string) => void;
  selectedStock?: string;
}

export default function StockSearch({ onStockSelect, selectedStock }: StockSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Popular Indian stocks from NSE/BSE
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.' },
    { symbol: 'INFY', name: 'Infosys Ltd.' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.' },
    { symbol: 'ITC', name: 'ITC Ltd.' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd.' }
  ];

  const handleSearch = () => {
    if (searchTerm.trim() && onStockSelect) {
      onStockSelect(searchTerm.toUpperCase());
      console.log(`Searching for stock: ${searchTerm}`);
    }
  };

  const handlePopularStock = (symbol: string) => {
    if (onStockSelect) {
      onStockSelect(symbol);
      console.log(`Selected popular stock: ${symbol}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="bg-card border-card-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5" />
            Stock Selection
          </h2>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-background border-input"
              data-testid="input-stock-search"
            />
            <Button 
              onClick={handleSearch}
              className="bg-primary text-primary-foreground hover-elevate"
              data-testid="button-analyze-stock"
            >
              Analyze Stock
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Popular Stocks:</p>
            <div className="flex flex-wrap gap-2">
              {popularStocks.map(stock => (
                <Button
                  key={stock.symbol}
                  variant={selectedStock === stock.symbol ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePopularStock(stock.symbol)}
                  className="text-xs hover-elevate"
                  data-testid={`button-stock-${stock.symbol.toLowerCase()}`}
                >
                  {stock.symbol}
                </Button>
              ))}
            </div>
          </div>

          {selectedStock && (
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium" data-testid="text-selected-stock">
                Analyzing: {selectedStock}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}