import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X, TrendingUp, BarChart3 } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  rsi: number;
}

interface StockComparisonProps {
  currentStock?: string;
}

export default function StockComparison({ currentStock }: StockComparisonProps) {
  const [compareStocks, setCompareStocks] = useState<StockData[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  // Add current stock automatically if provided
  useEffect(() => {
    if (currentStock && !compareStocks.find(stock => stock.symbol === currentStock)) {
      fetchStockData(currentStock);
    }
  }, [currentStock, compareStocks]);

  const fetchStockData = async (symbol: string) => {
    setLoading(true);
    try {
      // Fetch stock data from our API
      const [priceRes, technicalRes] = await Promise.all([
        fetch(`/api/stock/${symbol}`),
        fetch(`/api/stock/${symbol}/technical`)
      ]);

      if (priceRes.ok && technicalRes.ok) {
        const priceData = await priceRes.json();
        const technicalData = await technicalRes.json();

        const stockData: StockData = {
          symbol: symbol.toUpperCase(),
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
          volume: priceData.volume,
          marketCap: priceData.marketCap,
          peRatio: 18.5 + (Math.random() - 0.5) * 10, // Mock P/E ratio
          rsi: technicalData.rsi
        };

        setCompareStocks(prev => {
          const exists = prev.find(stock => stock.symbol === symbol.toUpperCase());
          if (exists) return prev;
          return [...prev, stockData];
        });
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const addStock = () => {
    if (newSymbol.trim() && compareStocks.length < 5) {
      fetchStockData(newSymbol.trim());
      setNewSymbol('');
    }
  };

  const removeStock = (symbol: string) => {
    setCompareStocks(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `₹${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `₹${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value);
  };

  const getBestPerformer = (metric: keyof StockData) => {
    if (compareStocks.length === 0) return null;
    
    let best = compareStocks[0];
    for (const stock of compareStocks) {
      if (typeof stock[metric] === 'number' && typeof best[metric] === 'number') {
        if (metric === 'rsi') {
          // For RSI, closer to 50 is better (not overbought/oversold)
          if (Math.abs((stock[metric] as number) - 50) < Math.abs((best[metric] as number) - 50)) {
            best = stock;
          }
        } else {
          if ((stock[metric] as number) > (best[metric] as number)) {
            best = stock;
          }
        }
      }
    }
    return best.symbol;
  };

  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return { status: 'Overbought', color: 'text-chart-2' };
    if (rsi < 30) return { status: 'Oversold', color: 'text-chart-1' };
    return { status: 'Neutral', color: 'text-muted-foreground' };
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Stock Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Stock Form */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter stock symbol (e.g., INFY, TCS)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && addStock()}
            className="bg-background"
          />
          <Button 
            onClick={addStock} 
            disabled={loading || !newSymbol.trim() || compareStocks.length >= 5}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {compareStocks.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Comparing {compareStocks.length} stock{compareStocks.length > 1 ? 's' : ''} 
            {compareStocks.length >= 5 && ' (Maximum reached)'}
          </p>
        )}

        {/* Comparison Table */}
        {compareStocks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change %</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>P/E Ratio</TableHead>
                  <TableHead>RSI</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compareStocks.map((stock) => {
                  const rsiStatus = getRSIStatus(stock.rsi);
                  return (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {stock.symbol}
                          {getBestPerformer('marketCap') === stock.symbol && (
                            <Badge variant="secondary" className="bg-chart-1 text-chart-1-foreground text-xs">
                              Largest
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(stock.price)}</div>
                          {getBestPerformer('price') === stock.symbol && (
                            <div className="text-xs text-chart-1">Highest Price</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={stock.changePercent >= 0 ? "default" : "destructive"}
                          className={stock.changePercent >= 0 ? "bg-chart-1 text-chart-1-foreground" : "bg-chart-2 text-chart-2-foreground"}
                        >
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </Badge>
                        {getBestPerformer('changePercent') === stock.symbol && (
                          <div className="text-xs text-chart-1 mt-1">Best Performer</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {(stock.volume / 1000000).toFixed(1)}M
                        {getBestPerformer('volume') === stock.symbol && (
                          <div className="text-xs text-chart-1">Highest Volume</div>
                        )}
                      </TableCell>
                      <TableCell>{formatLargeNumber(stock.marketCap)}</TableCell>
                      <TableCell>
                        {stock.peRatio.toFixed(1)}
                        {getBestPerformer('peRatio') === stock.symbol && (
                          <div className="text-xs text-chart-1">Highest P/E</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{stock.rsi.toFixed(1)}</div>
                          <div className={`text-xs ${rsiStatus.color}`}>
                            {rsiStatus.status}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStock(stock.symbol)}
                          className="text-chart-2 hover:text-chart-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Add stocks to compare their performance side by side</p>
            <p className="text-sm mt-1">Perfect for making informed investment decisions</p>
          </div>
        )}

        {/* Quick Analysis */}
        {compareStocks.length > 1 && (
          <div className="space-y-3 p-4 bg-secondary rounded-lg">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Best Performer: </span>
                <span className="font-medium text-chart-1">
                  {getBestPerformer('changePercent')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Highest Volume: </span>
                <span className="font-medium text-foreground">
                  {getBestPerformer('volume')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Largest Market Cap: </span>
                <span className="font-medium text-foreground">
                  {getBestPerformer('marketCap')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Most Balanced RSI: </span>
                <span className="font-medium text-foreground">
                  {getBestPerformer('rsi')}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}