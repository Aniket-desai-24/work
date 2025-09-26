import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, BarChart3, Calendar } from 'lucide-react';

interface PriceChartProps {
  symbol: string;
  // Mock chart data - TODO: replace with real chart integration
}

export default function PriceChart({ symbol }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  
  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y'];
  
  // Mock price data for demonstration - TODO: replace with real chart library
  const mockPricePoints = [
    175.20, 178.45, 176.80, 182.30, 185.45, 188.90, 184.20, 187.60, 185.45
  ];
  
  const isPositive = mockPricePoints[mockPricePoints.length - 1] > mockPricePoints[0];

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    console.log(`Chart timeframe changed to: ${tf}`);
  };

  const handleChartTypeToggle = () => {
    const newType = chartType === 'line' ? 'candlestick' : 'line';
    setChartType(newType);
    console.log(`Chart type changed to: ${newType}`);
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {symbol} Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleChartTypeToggle}
              className="hover-elevate"
              data-testid="button-chart-type"
            >
              {chartType === 'line' ? <LineChart className="h-4 w-4 mr-1" /> : <BarChart3 className="h-4 w-4 mr-1" />}
              {chartType === 'line' ? 'Line' : 'Candlestick'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {timeframes.map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange(tf)}
              className="text-xs hover-elevate"
              data-testid={`button-timeframe-${tf.toLowerCase()}`}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Mock Chart Container */}
        <div className="relative h-64 bg-secondary/20 rounded-lg border border-border overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <Badge 
              variant="secondary" 
              className={`${isPositive ? 'text-chart-1' : 'text-chart-2'}`}
            >
              {timeframe} • {isPositive ? '+' : ''}{isPositive ? '5.8%' : '-2.3%'}
            </Badge>
          </div>
          
          {/* Mock Chart Visualization */}
          <div className="flex items-end justify-between h-full p-4 pt-12">
            {mockPricePoints.map((price, index) => (
              <div
                key={index}
                className={`w-2 rounded-t transition-all duration-300 hover:opacity-80 ${
                  chartType === 'line' 
                    ? (isPositive ? 'bg-chart-1' : 'bg-chart-2')
                    : index % 2 === 0 
                      ? 'bg-chart-1' 
                      : 'bg-chart-2'
                }`}
                style={{
                  height: `${((price - Math.min(...mockPricePoints)) / 
                    (Math.max(...mockPricePoints) - Math.min(...mockPricePoints))) * 180 + 20}px`
                }}
                data-testid={`chart-bar-${index}`}
              />
            ))}
          </div>
          
          {/* Chart Overlay Info */}
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
            Last updated: just now
          </div>
          
          {/* Mock Grid Lines */}
          <div className="absolute inset-4 pointer-events-none">
            <div className="w-full h-full opacity-10">
              <div className="border-t border-border absolute w-full top-1/4"></div>
              <div className="border-t border-border absolute w-full top-1/2"></div>
              <div className="border-t border-border absolute w-full top-3/4"></div>
            </div>
          </div>
        </div>

        {/* Chart Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">High</p>
            <p className="font-mono font-medium text-chart-1" data-testid="text-chart-high">
              ${Math.max(...mockPricePoints).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Low</p>
            <p className="font-mono font-medium text-chart-2" data-testid="text-chart-low">
              ${Math.min(...mockPricePoints).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Avg Volume</p>
            <p className="font-mono font-medium" data-testid="text-chart-volume">
              45.2M
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Volatility</p>
            <p className="font-mono font-medium" data-testid="text-chart-volatility">
              2.8%
            </p>
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            📊 Interactive chart with real-time data would be integrated here using Chart.js or TradingView widgets
          </p>
        </div>
      </CardContent>
    </Card>
  );
}