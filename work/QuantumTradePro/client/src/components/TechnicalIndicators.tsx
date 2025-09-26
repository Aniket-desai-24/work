import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, BarChart3, Activity, Loader2 } from 'lucide-react';
import { TechnicalIndicators as TechnicalIndicatorsType, StockPrice } from '@shared/schema';

interface TechnicalIndicatorsProps {
  symbol: string;
}

export default function TechnicalIndicators({ symbol }: TechnicalIndicatorsProps) {
  const { data: technicalData, isLoading: techLoading } = useQuery<TechnicalIndicatorsType>({
    queryKey: ['/api/stock', symbol, 'technical'],
    enabled: !!symbol,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: stockData } = useQuery<StockPrice>({
    queryKey: ['/api/stock', symbol],
    enabled: !!symbol,
  });

  if (techLoading || !technicalData) {
    return (
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const { rsi, macd, movingAverages, bollingerBands } = technicalData;
  const currentPrice = stockData?.price || 0;
  
  const getRSIStatus = () => {
    if (rsi >= 70) return { status: 'Overbought', color: 'text-chart-2' };
    if (rsi <= 30) return { status: 'Oversold', color: 'text-chart-1' };
    return { status: 'Neutral', color: 'text-muted-foreground' };
  };

  const getMACDStatus = () => {
    const isBullish = macd.value > macd.signal;
    return {
      status: isBullish ? 'Bullish' : 'Bearish',
      color: isBullish ? 'text-chart-1' : 'text-chart-2',
      icon: isBullish ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
    };
  };

  const getMAStatus = (ma: number) => {
    const isAbove = currentPrice > ma;
    return {
      status: isAbove ? 'Above' : 'Below',
      color: isAbove ? 'text-chart-1' : 'text-chart-2'
    };
  };

  const rsiStatus = getRSIStatus();
  const macdStatus = getMACDStatus();

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSI Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">RSI (14)</h4>
            <Badge variant="outline" className={rsiStatus.color}>
              {rsiStatus.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current RSI</span>
              <span className="font-mono font-medium" data-testid="text-rsi-value">
                {rsi.toFixed(1)}
              </span>
            </div>
            <Progress value={rsi} className="h-2" data-testid="progress-rsi" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Oversold (30)</span>
              <span>Neutral (50)</span>
              <span>Overbought (70)</span>
            </div>
          </div>
        </div>

        {/* MACD Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">MACD</h4>
            <Badge variant="outline" className={`flex items-center gap-1 ${macdStatus.color}`}>
              {macdStatus.icon}
              {macdStatus.status}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">MACD</p>
              <p className="font-mono font-medium" data-testid="text-macd-value">
                {macd.value.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Signal</p>
              <p className="font-mono font-medium" data-testid="text-macd-signal">
                {macd.signal.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Histogram</p>
              <p className={`font-mono font-medium ${macd.histogram >= 0 ? 'text-chart-1' : 'text-chart-2'}`} data-testid="text-macd-histogram">
                {macd.histogram.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Moving Averages Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Moving Averages
          </h4>
          <div className="space-y-2">
            {Object.entries(movingAverages).map(([key, value]) => {
              const period = key.replace('ma', '');
              const status = getMAStatus(value);
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">MA{period}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium" data-testid={`text-${key}`}>
                      ${value.toFixed(2)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${status.color}`}
                    >
                      {status.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bollinger Bands Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Bollinger Bands</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Upper Band</span>
              <span className="font-mono font-medium text-chart-2" data-testid="text-bb-upper">
                ${bollingerBands.upper.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Middle Band (SMA)</span>
              <span className="font-mono font-medium" data-testid="text-bb-middle">
                ${bollingerBands.middle.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Lower Band</span>
              <span className="font-mono font-medium text-chart-1" data-testid="text-bb-lower">
                ${bollingerBands.lower.toFixed(2)}
              </span>
            </div>
            <div className="mt-3 p-2 bg-secondary/30 rounded text-center">
              <p className="text-xs text-muted-foreground">
                Price is {currentPrice > bollingerBands.middle ? 'above' : 'below'} the middle band
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Technical indicators are based on historical price data and should be used with other analysis methods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}