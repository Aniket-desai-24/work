import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, IndianRupee, Loader2 } from 'lucide-react';
import { StockPrice as StockPriceType } from '@shared/schema';

interface StockPriceProps {
  symbol: string;
  onPriceUpdate?: (price: number) => void;
}

export default function StockPrice({ symbol, onPriceUpdate }: StockPriceProps) {
  const { data: stockData, isLoading, error } = useQuery<StockPriceType>({
    queryKey: ['/api/stock', symbol],
    enabled: !!symbol,
    refetchInterval: 60000, // Refetch every minute
  });

  // Call onPriceUpdate when stockData changes
  useEffect(() => {
    if (stockData?.price && onPriceUpdate) {
      onPriceUpdate(stockData.price);
    }
  }, [stockData?.price, onPriceUpdate]);

  if (isLoading) {
    return (
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-primary" />
            {symbol} Stock Price
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stockData) {
    return (
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-primary" />
            {symbol} Stock Price
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Unable to load stock data</p>
        </CardContent>
      </Card>
    );
  }

  const { 
    price, 
    change, 
    changePercent, 
    volume, 
    marketCap, 
    high52w, 
    low52w, 
    previousClose, 
    openPrice 
  } = stockData;
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  const formatPrice = (value: number) => `₹${value.toFixed(2)}`;
  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `₹${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `₹${(value / 1e6).toFixed(2)}M`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const getChangeIcon = () => {
    if (isPositive) return <ArrowUp className="h-4 w-4" />;
    if (isNegative) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = () => {
    if (isPositive) return 'text-chart-1';
    if (isNegative) return 'text-chart-2';
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <IndianRupee className="h-6 w-6 text-primary" />
          {symbol} Stock Price
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-foreground" data-testid="text-stock-price">
              {formatPrice(price)}
            </span>
            <Badge 
              variant="secondary" 
              className={`flex items-center gap-1 ${getChangeColor()}`}
              data-testid="badge-price-change"
            >
              {getChangeIcon()}
              {formatPrice(Math.abs(change))} ({Math.abs(changePercent).toFixed(2)}%)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time price • Last updated: just now
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="font-mono text-sm font-medium" data-testid="text-open-price">
              {formatPrice(openPrice)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Previous Close</p>
            <p className="font-mono text-sm font-medium" data-testid="text-previous-close">
              {formatPrice(previousClose)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="font-mono text-sm font-medium" data-testid="text-volume">
              {volume.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-mono text-sm font-medium" data-testid="text-market-cap">
              {formatLargeNumber(marketCap)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">52W High</p>
            <p className="font-mono text-sm font-medium text-chart-1" data-testid="text-52w-high">
              {formatPrice(high52w)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">52W Low</p>
            <p className="font-mono text-sm font-medium text-chart-2" data-testid="text-52w-low">
              {formatPrice(low52w)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}