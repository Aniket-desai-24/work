import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

interface Portfolio {
  id: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  buyDate: Date;
}

interface PortfolioSimulatorProps {
  currentStock?: string;
  currentPrice?: number;
}

export default function PortfolioSimulator({ currentStock, currentPrice }: PortfolioSimulatorProps) {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [newTrade, setNewTrade] = useState({
    symbol: currentStock || '',
    quantity: '',
    price: currentPrice?.toString() || ''
  });

  // Simulate price updates for portfolio tracking
  useEffect(() => {
    const updatePrices = () => {
      setPortfolio(prev => prev.map(holding => {
        const priceChange = (Math.random() - 0.5) * 0.02; // ±2% random change
        const newPrice = holding.currentPrice * (1 + priceChange);
        const currentValue = newPrice * holding.quantity;
        const pnl = currentValue - (holding.buyPrice * holding.quantity);
        const pnlPercent = (pnl / (holding.buyPrice * holding.quantity)) * 100;

        return {
          ...holding,
          currentPrice: Number(newPrice.toFixed(2)),
          totalValue: Number(currentValue.toFixed(2)),
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2))
        };
      }));
    };

    const interval = setInterval(updatePrices, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update totals when portfolio changes
  useEffect(() => {
    const investment = portfolio.reduce((sum, holding) => sum + (holding.buyPrice * holding.quantity), 0);
    const value = portfolio.reduce((sum, holding) => sum + holding.totalValue, 0);
    const pnl = value - investment;

    setTotalInvestment(investment);
    setTotalValue(value);
    setTotalPnL(pnl);
  }, [portfolio]);

  // Update form when current stock changes
  useEffect(() => {
    if (currentStock) {
      setNewTrade(prev => ({
        ...prev,
        symbol: currentStock,
        price: currentPrice?.toString() || prev.price
      }));
    }
  }, [currentStock, currentPrice]);

  const addToPortfolio = () => {
    if (!newTrade.symbol || !newTrade.quantity || !newTrade.price) return;

    const quantity = parseInt(newTrade.quantity);
    const price = parseFloat(newTrade.price);

    if (quantity <= 0 || price <= 0) return;

    const newHolding: Portfolio = {
      id: Date.now().toString(),
      symbol: newTrade.symbol.toUpperCase(),
      quantity,
      buyPrice: price,
      currentPrice: price,
      totalValue: quantity * price,
      pnl: 0,
      pnlPercent: 0,
      buyDate: new Date()
    };

    setPortfolio(prev => [...prev, newHolding]);
    setNewTrade({ symbol: '', quantity: '', price: '' });
  };

  const removeFromPortfolio = (id: string) => {
    setPortfolio(prev => prev.filter(holding => holding.id !== id));
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Portfolio Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Investment</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalValue)}</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">P&L</p>
            <div className="flex items-center justify-center gap-1">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-chart-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-chart-2" />
              )}
              <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
                {formatCurrency(Math.abs(totalPnL))}
              </p>
            </div>
          </div>
        </div>

        {/* Add Trade Form */}
        <div className="space-y-3 p-4 bg-secondary rounded-lg">
          <h4 className="font-medium text-foreground">Add Virtual Trade</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Symbol (e.g., RELIANCE)"
              value={newTrade.symbol}
              onChange={(e) => setNewTrade(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="bg-background"
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newTrade.quantity}
              onChange={(e) => setNewTrade(prev => ({ ...prev, quantity: e.target.value }))}
              className="bg-background"
            />
            <Input
              type="number"
              placeholder="Price (₹)"
              step="0.01"
              value={newTrade.price}
              onChange={(e) => setNewTrade(prev => ({ ...prev, price: e.target.value }))}
              className="bg-background"
            />
            <Button onClick={addToPortfolio} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Portfolio Holdings */}
        {portfolio.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Your Holdings</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Buy Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((holding) => (
                    <TableRow key={holding.id}>
                      <TableCell className="font-medium">{holding.symbol}</TableCell>
                      <TableCell>{holding.quantity}</TableCell>
                      <TableCell>{formatCurrency(holding.buyPrice)}</TableCell>
                      <TableCell>{formatCurrency(holding.currentPrice)}</TableCell>
                      <TableCell>{formatCurrency(holding.totalValue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={holding.pnl >= 0 ? "default" : "destructive"}
                            className={holding.pnl >= 0 ? "bg-chart-1 text-chart-1-foreground" : "bg-chart-2 text-chart-2-foreground"}
                          >
                            {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                          </Badge>
                          <span className={`text-xs ${holding.pnlPercent >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
                            ({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromPortfolio(holding.id)}
                          className="text-chart-2 hover:text-chart-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No holdings yet. Add your first virtual trade above!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}