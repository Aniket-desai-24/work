import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Minus, Shield, Clock, Loader2, RefreshCw } from 'lucide-react';
import { AIRecommendation as AIRecommendationType } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

interface AIRecommendationProps {
  symbol: string;
}

export default function AIRecommendation({ symbol }: AIRecommendationProps) {
  const { data: aiRecommendation, isLoading, error, refetch } = useQuery<AIRecommendationType>({
    queryKey: ['/api/stock', symbol, 'recommendation'],
    enabled: !!symbol,
    refetchInterval: 3600000, // Refetch every hour
    retry: 2,
  });

  const handleRefresh = () => {
    // Invalidate and refetch the recommendation
    queryClient.invalidateQueries({ queryKey: ['/api/stock', symbol, 'recommendation'] });
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-card-border border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Recommendation for {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Analyzing market data and generating AI recommendation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !aiRecommendation) {
    return (
      <Card className="bg-card border-card-border border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Recommendation for {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground text-center">Unable to generate AI recommendation</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { recommendation, confidence, riskLevel, timeHorizon, reasoning, targetPrice, currentPrice } = aiRecommendation;
  
  const getRecommendationColor = () => {
    switch (recommendation) {
      case 'BUY': return 'bg-chart-1 text-white';
      case 'SELL': return 'bg-chart-2 text-white';
      case 'HOLD': return 'bg-muted text-muted-foreground';
    }
  };

  const getRecommendationIcon = () => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp className="h-5 w-5" />;
      case 'SELL': return <TrendingDown className="h-5 w-5" />;
      case 'HOLD': return <Minus className="h-5 w-5" />;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low': return 'bg-chart-1 text-white';
      case 'Medium': return 'bg-chart-4 text-white';
      case 'High': return 'bg-chart-2 text-white';
    }
  };

  const upside = targetPrice ? ((targetPrice - currentPrice) / currentPrice) * 100 : 0;

  return (
    <Card className="bg-card border-card-border border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Recommendation for {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              className={`text-lg px-4 py-2 font-bold ${getRecommendationColor()}`}
              data-testid="badge-ai-recommendation"
            >
              {getRecommendationIcon()}
              {recommendation}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Confidence Score</p>
            <p className="text-2xl font-bold font-mono text-primary" data-testid="text-confidence-score">
              {confidence}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className="font-medium">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" data-testid="progress-confidence" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Badge className={`mb-2 ${getRiskColor()}`}>
              <Shield className="h-3 w-3 mr-1" />
              {riskLevel}
            </Badge>
            <p className="text-xs text-muted-foreground">Risk Level</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              <Clock className="h-3 w-3 mr-1" />
              {timeHorizon}
            </Badge>
            <p className="text-xs text-muted-foreground">Time Horizon</p>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="mb-2 font-mono">
              {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
            </Badge>
            <p className="text-xs text-muted-foreground">Upside Potential</p>
          </div>
        </div>

        {(recommendation !== 'HOLD' || targetPrice) && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="font-mono font-bold text-foreground" data-testid="text-ai-current-price">
                ₹{currentPrice.toFixed(2)}
              </p>
            </div>
            {targetPrice && (
              <div>
                <p className="text-sm text-muted-foreground">Target Price</p>
                <p className="font-mono font-bold text-primary" data-testid="text-ai-target-price">
                  ₹{targetPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">AI Analysis Reasoning:</h4>
            <Button 
              onClick={handleRefresh} 
              variant="ghost" 
              size="sm"
              className="text-xs"
              data-testid="button-refresh-recommendation"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          <ul className="space-y-2">
            {reasoning.map((reason, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-sm text-muted-foreground"
                data-testid={`text-reasoning-${index}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not be considered as financial advice. Always do your own research before making investment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}