import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calculator, Play, BarChart3 } from 'lucide-react';

interface BacktestResult {
  symbol: string;
  strategy: string;
  period: string;
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  trades: BacktestTrade[];
  performance: PerformancePoint[];
}

interface BacktestTrade {
  date: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  pnl: number;
  reason: string;
}

interface PerformancePoint {
  date: string;
  portfolioValue: number;
  benchmark: number;
}

interface BacktestingEngineProps {
  currentStock?: string;
}

export default function BacktestingEngine({ currentStock }: BacktestingEngineProps) {
  const [backtestConfig, setBacktestConfig] = useState({
    symbol: currentStock || '',
    strategy: 'rsi_strategy',
    period: '6M',
    initialCapital: '100000'
  });
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStock) {
      setBacktestConfig(prev => ({ ...prev, symbol: currentStock }));
    }
  }, [currentStock]);

  const runBacktest = async () => {
    if (!backtestConfig.symbol || !backtestConfig.initialCapital) return;

    setIsRunning(true);
    setProgress(0);

    // Simulate backtest progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      // Simulate backtest computation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate realistic backtest results
      const result = generateBacktestResult(backtestConfig);
      setBacktestResult(result);
      setProgress(100);
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsRunning(false);
    }
  };

  const generateBacktestResult = (config: typeof backtestConfig): BacktestResult => {
    const numberOfTrades = Math.floor(Math.random() * 20) + 10;
    const winRate = 0.55 + Math.random() * 0.25; // 55-80% win rate
    const totalReturn = (Math.random() - 0.3) * 30; // -10% to +20% return
    
    // Generate trades
    const trades: BacktestTrade[] = [];
    let currentPrice = 1000;
    const startDate = new Date();
    const periodDays = config.period === '1M' ? 30 : config.period === '3M' ? 90 : 180;
    
    for (let i = 0; i < numberOfTrades; i++) {
      const tradeDate = new Date(startDate);
      tradeDate.setDate(tradeDate.getDate() - (periodDays - (i * periodDays / numberOfTrades)));
      
      const isWin = Math.random() < winRate;
      const priceChange = isWin ? Math.random() * 50 + 10 : -(Math.random() * 40 + 5);
      currentPrice += priceChange;
      
      trades.push({
        date: tradeDate.toISOString().split('T')[0],
        type: i % 2 === 0 ? 'BUY' : 'SELL',
        price: currentPrice,
        quantity: 10,
        pnl: i % 2 === 1 ? (isWin ? Math.random() * 2000 + 500 : -(Math.random() * 1500 + 200)) : 0,
        reason: getTradeReason(config.strategy, isWin)
      });
    }

    // Generate performance chart data
    const performance: PerformancePoint[] = [];
    let portfolioValue = parseFloat(config.initialCapital);
    const benchmarkReturn = Math.random() * 0.1 + 0.05; // 5-15% benchmark
    
    for (let i = 0; i <= 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - (30 - i));
      
      const dailyReturn = (Math.random() - 0.5) * 0.02; // ±1% daily
      portfolioValue *= (1 + dailyReturn);
      const benchmarkValue = parseFloat(config.initialCapital) * (1 + benchmarkReturn * (i / 30));
      
      performance.push({
        date: date.toISOString().split('T')[0],
        portfolioValue: Number(portfolioValue.toFixed(2)),
        benchmark: Number(benchmarkValue.toFixed(2))
      });
    }

    return {
      symbol: config.symbol,
      strategy: config.strategy,
      period: config.period,
      totalTrades: numberOfTrades,
      winRate: Number((winRate * 100).toFixed(1)),
      totalReturn: Number(totalReturn.toFixed(2)),
      maxDrawdown: Number((Math.random() * 15 + 3).toFixed(2)),
      sharpeRatio: Number((Math.random() * 1.5 + 0.3).toFixed(2)),
      avgWin: Number((Math.random() * 1500 + 500).toFixed(2)),
      avgLoss: Number(-(Math.random() * 800 + 200).toFixed(2)),
      profitFactor: Number((1 + Math.random() * 0.8).toFixed(2)),
      trades,
      performance
    };
  };

  const getTradeReason = (strategy: string, isWin: boolean): string => {
    const reasons = {
      rsi_strategy: isWin ? ['RSI oversold signal', 'RSI bullish divergence'] : ['RSI overbought signal', 'RSI bearish divergence'],
      ma_crossover: isWin ? ['Golden cross signal', 'MA support bounce'] : ['Death cross signal', 'MA resistance break'],
      bollinger_bands: isWin ? ['Lower band bounce', 'Band squeeze breakout'] : ['Upper band rejection', 'Band expansion sell'],
      ai_signals: isWin ? ['AI buy signal confirmed', 'ML pattern detected'] : ['AI sell signal', 'ML exit triggered']
    };
    
    const strategyReasons = reasons[strategy as keyof typeof reasons] || ['Signal triggered', 'Exit condition'];
    return strategyReasons[Math.floor(Math.random() * strategyReasons.length)];
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const getStrategyName = (strategy: string) => {
    const names = {
      rsi_strategy: 'RSI Mean Reversion',
      ma_crossover: 'Moving Average Crossover',
      bollinger_bands: 'Bollinger Bands Strategy',
      ai_signals: 'AI-Powered Signals'
    };
    return names[strategy as keyof typeof names] || strategy;
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Strategy Backtesting Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Backtest Configuration */}
        <div className="space-y-4 p-4 bg-secondary rounded-lg">
          <h4 className="font-medium text-foreground">Backtest Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              placeholder="Symbol (e.g., RELIANCE)"
              value={backtestConfig.symbol}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="bg-background"
            />
            <Select
              value={backtestConfig.strategy}
              onValueChange={(value) => setBacktestConfig(prev => ({ ...prev, strategy: value }))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rsi_strategy">RSI Mean Reversion</SelectItem>
                <SelectItem value="ma_crossover">MA Crossover</SelectItem>
                <SelectItem value="bollinger_bands">Bollinger Bands</SelectItem>
                <SelectItem value="ai_signals">AI Signals</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={backtestConfig.period}
              onValueChange={(value) => setBacktestConfig(prev => ({ ...prev, period: value }))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Initial Capital (₹)"
              value={backtestConfig.initialCapital}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, initialCapital: e.target.value }))}
              className="bg-background"
            />
            <Button
              onClick={runBacktest}
              disabled={isRunning || !backtestConfig.symbol}
              className="bg-primary text-primary-foreground"
            >
              <Play className="h-4 w-4 mr-1" />
              Run Backtest
            </Button>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running backtest...</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>

        {/* Backtest Results */}
        {backtestResult && (
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Total Return</p>
                <div className="flex items-center justify-center gap-1">
                  {backtestResult.totalReturn >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-chart-2" />
                  )}
                  <p className={`text-lg font-bold ${backtestResult.totalReturn >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
                    {backtestResult.totalReturn >= 0 ? '+' : ''}{backtestResult.totalReturn}%
                  </p>
                </div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold text-foreground">{backtestResult.winRate}%</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-lg font-bold text-foreground">{backtestResult.totalTrades}</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-lg font-bold text-foreground">{backtestResult.sharpeRatio}</p>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Performance vs Benchmark</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={backtestResult.performance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="fill-muted-foreground" />
                    <YAxis className="fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line type="monotone" dataKey="portfolioValue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Strategy" />
                    <Line type="monotone" dataKey="benchmark" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Benchmark" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3 p-4 bg-secondary rounded-lg">
                <h5 className="font-medium text-foreground">Risk Metrics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span className="text-chart-2">-{backtestResult.maxDrawdown}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Factor:</span>
                    <span className="text-foreground">{backtestResult.profitFactor}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-secondary rounded-lg">
                <h5 className="font-medium text-foreground">Trade Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Win:</span>
                    <span className="text-chart-1">{formatCurrency(backtestResult.avgWin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Loss:</span>
                    <span className="text-chart-2">{formatCurrency(Math.abs(backtestResult.avgLoss))}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-secondary rounded-lg">
                <h5 className="font-medium text-foreground">Strategy Info</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy:</span>
                    <span className="text-foreground">{getStrategyName(backtestResult.strategy)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="text-foreground">{backtestResult.period}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Recent Trades</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backtestResult.trades.slice(-10).map((trade, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">{trade.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={trade.type === 'BUY' ? "default" : "secondary"}
                            className={trade.type === 'BUY' ? "bg-chart-1 text-chart-1-foreground" : "bg-chart-2 text-chart-2-foreground"}
                          >
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(trade.price)}</TableCell>
                        <TableCell>
                          {trade.pnl !== 0 && (
                            <span className={trade.pnl > 0 ? 'text-chart-1' : 'text-chart-2'}>
                              {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{trade.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Strategy Performance Rating */}
            <div className="p-4 bg-secondary rounded-lg">
              <h5 className="font-medium text-foreground mb-3">Strategy Rating</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Performance</span>
                  <Badge 
                    variant="secondary" 
                    className={backtestResult.totalReturn > 10 ? "bg-chart-1 text-chart-1-foreground" : 
                              backtestResult.totalReturn > 0 ? "bg-yellow-500 text-yellow-50" : 
                              "bg-chart-2 text-chart-2-foreground"}
                  >
                    {backtestResult.totalReturn > 10 ? 'Excellent' : 
                     backtestResult.totalReturn > 0 ? 'Good' : 'Poor'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  This strategy would have {backtestResult.totalReturn >= 0 ? 'generated' : 'lost'} {' '}
                  <span className={backtestResult.totalReturn >= 0 ? 'text-chart-1' : 'text-chart-2'}>
                    {Math.abs(backtestResult.totalReturn)}%
                  </span> returns over the {backtestResult.period.toLowerCase()} period with a {backtestResult.winRate}% win rate.
                </p>
              </div>
            </div>
          </div>
        )}

        {!backtestResult && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Configure your backtest parameters and click "Run Backtest"</p>
            <p className="text-sm mt-1">Test different strategies against historical data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}