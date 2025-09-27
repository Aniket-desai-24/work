import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp } from 'lucide-react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Indian market hours: NSE/BSE 9:15 AM to 3:30 PM IST (Monday to Friday)
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const hour = istTime.getHours();
      const minute = istTime.getMinutes();
      const day = istTime.getDay();
      
      const isWeekday = day >= 1 && day <= 5; // Monday to Friday
      const isAfterMarketOpen = hour > 9 || (hour === 9 && minute >= 15); // After 9:15 AM
      const isBeforeMarketClose = hour < 15 || (hour === 15 && minute <= 30); // Before 3:30 PM
      const isDuringMarketHours = isAfterMarketOpen && isBeforeMarketClose;
      
      setMarketStatus(isWeekday && isDuringMarketHours ? 'open' : 'closed');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-b border-card-border bg-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Stock Analyzer</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-muted-foreground">
              {currentTime.toLocaleString('en-IN', {
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata',
                timeZoneName: 'short'
              })}
            </span>
          </div>
          
          <Badge 
            variant={marketStatus === 'open' ? 'default' : 'secondary'}
            className={`${marketStatus === 'open' 
              ? 'bg-chart-1 text-chart-1-foreground' 
              : 'bg-muted text-muted-foreground'
            }`}
            data-testid={`status-market-${marketStatus}`}
          >
            Market {marketStatus === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}