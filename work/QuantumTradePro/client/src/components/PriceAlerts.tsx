import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Trash2, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  alertType: 'above' | 'below';
  isActive: boolean;
  isTriggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

interface PriceAlertsProps {
  currentStock?: string;
  currentPrice?: number;
}

export default function PriceAlerts({ currentStock, currentPrice }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: currentStock || '',
    targetPrice: '',
    alertType: 'above' as 'above' | 'below'
  });
  const [notifications, setNotifications] = useState<string[]>([]);

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      const parsed = JSON.parse(savedAlerts);
      setAlerts(parsed.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
      })));
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Update form when current stock changes
  useEffect(() => {
    if (currentStock) {
      setNewAlert(prev => ({
        ...prev,
        symbol: currentStock
      }));
    }
  }, [currentStock]);

  // Check for triggered alerts
  useEffect(() => {
    const checkAlerts = async () => {
      const updatedAlerts = [...alerts];
      let hasUpdates = false;

      for (let i = 0; i < updatedAlerts.length; i++) {
        const alert = updatedAlerts[i];
        
        if (!alert.isActive || alert.isTriggered) continue;

        try {
          // Fetch current price for the stock
          const response = await fetch(`/api/stock/${alert.symbol}`);
          if (response.ok) {
            const data = await response.json();
            const currentPrice = data.price;
            
            // Update current price
            updatedAlerts[i] = { ...alert, currentPrice };

            // Check if alert should be triggered
            const shouldTrigger = 
              (alert.alertType === 'above' && currentPrice >= alert.targetPrice) ||
              (alert.alertType === 'below' && currentPrice <= alert.targetPrice);

            if (shouldTrigger) {
              updatedAlerts[i] = {
                ...updatedAlerts[i],
                isTriggered: true,
                triggeredAt: new Date()
              };

              // Add notification
              const alertMessage = `🔔 ${alert.symbol} is now ${alert.alertType} ₹${alert.targetPrice}! Current: ₹${currentPrice.toFixed(2)}`;
              setNotifications(prev => [alertMessage, ...prev.slice(0, 4)]); // Keep only 5 notifications

              hasUpdates = true;

              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification('Price Alert Triggered!', {
                  body: alertMessage,
                  icon: '/favicon.ico'
                });
              }
            } else {
              hasUpdates = true;
            }
          }
        } catch (error) {
          console.error(`Error checking alert for ${alert.symbol}:`, error);
        }
      }

      if (hasUpdates) {
        setAlerts(updatedAlerts);
      }
    };

    const interval = setInterval(checkAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [alerts]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return;

    const targetPrice = parseFloat(newAlert.targetPrice);
    if (targetPrice <= 0) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      targetPrice,
      currentPrice: currentPrice || 0,
      alertType: newAlert.alertType,
      isActive: true,
      isTriggered: false,
      createdAt: new Date()
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: '', targetPrice: '', alertType: 'above' });
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, isActive: !alert.isActive, isTriggered: false }
        : alert
    ));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

  const getAlertIcon = (alert: PriceAlert) => {
    if (alert.isTriggered) return <CheckCircle className="h-4 w-4 text-chart-1" />;
    if (!alert.isActive) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    return alert.alertType === 'above' ? 
      <TrendingUp className="h-4 w-4 text-chart-1" /> : 
      <TrendingDown className="h-4 w-4 text-chart-2" />;
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.isTriggered) return 'Triggered';
    if (!alert.isActive) return 'Paused';
    return 'Active';
  };

  const getStatusColor = (alert: PriceAlert) => {
    if (alert.isTriggered) return 'bg-chart-1 text-chart-1-foreground';
    if (!alert.isActive) return 'bg-muted text-muted-foreground';
    return 'bg-primary text-primary-foreground';
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Price Alerts
            {alerts.filter(a => a.isActive && !a.isTriggered).length > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {alerts.filter(a => a.isActive && !a.isTriggered).length} Active
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Clear Notifications
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <div key={index} className="p-3 bg-chart-1/10 border border-chart-1/20 rounded-lg text-sm">
                {notification}
              </div>
            ))}
          </div>
        )}

        {/* Add Alert Form */}
        <div className="space-y-3 p-4 bg-secondary rounded-lg">
          <h4 className="font-medium text-foreground">Create New Alert</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Symbol (e.g., RELIANCE)"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="bg-background"
            />
            <Select
              value={newAlert.alertType}
              onValueChange={(value: 'above' | 'below') => setNewAlert(prev => ({ ...prev, alertType: value }))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above Price</SelectItem>
                <SelectItem value="below">Below Price</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Target Price (₹)"
              step="0.01"
              value={newAlert.targetPrice}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
              className="bg-background"
            />
            <Button onClick={addAlert} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              Add Alert
            </Button>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Your Alerts</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Target Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((alert) => (
                    <TableRow key={alert.id} className={alert.isTriggered ? 'bg-chart-1/5' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert)}
                          {alert.symbol}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {alert.alertType === 'above' ? (
                            <TrendingUp className="h-3 w-3 text-chart-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-chart-2" />
                          )}
                          <span className="capitalize">{alert.alertType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(alert.targetPrice)}</TableCell>
                      <TableCell>
                        <div>
                          {formatCurrency(alert.currentPrice)}
                          {alert.isTriggered && alert.triggeredAt && (
                            <div className="text-xs text-chart-1">
                              Triggered {alert.triggeredAt.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(alert)}>
                          {getAlertStatus(alert)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {alert.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAlert(alert.id)}
                            className="text-primary hover:text-primary"
                          >
                            {alert.isActive ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAlert(alert.id)}
                            className="text-chart-2 hover:text-chart-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No price alerts set</p>
            <p className="text-sm mt-1">Create alerts to get notified when stocks reach your target prices</p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
          <p>💡 <strong>Pro Tip:</strong> Alerts check prices every 10 seconds and can send browser notifications if enabled.</p>
          <p className="mt-1">Set multiple alerts for the same stock with different target prices for better trading strategy.</p>
        </div>
      </CardContent>
    </Card>
  );
}