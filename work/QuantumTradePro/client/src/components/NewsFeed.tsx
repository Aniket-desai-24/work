import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { NewsItem } from '@shared/schema';

interface NewsFeedProps {
  symbol: string;
}

export default function NewsFeed({ symbol }: NewsFeedProps) {
  const { data: news = [], isLoading } = useQuery<NewsItem[]>({
    queryKey: ['/api/stock', symbol, 'news'],
    enabled: !!symbol,
    refetchInterval: 900000, // Refetch every 15 minutes
  });
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingDown className="h-3 w-3" />;
      case 'neutral': return <Minus className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-chart-1 text-white';
      case 'negative': return 'bg-chart-2 text-white';
      case 'neutral': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleNewsClick = (newsId: string, url?: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      setExpandedNews(expandedNews === newsId ? null : newsId);
    }
    console.log(`News clicked: ${newsId}`);
  };

  const sentimentCounts = news.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            {symbol} News & Sentiment
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {news.length} articles
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-chart-1/10 rounded">
            <p className="text-xs text-muted-foreground">Positive</p>
            <p className="font-bold text-chart-1" data-testid="text-sentiment-positive">
              {sentimentCounts.positive || 0}
            </p>
          </div>
          <div className="text-center p-2 bg-muted/20 rounded">
            <p className="text-xs text-muted-foreground">Neutral</p>
            <p className="font-bold text-muted-foreground" data-testid="text-sentiment-neutral">
              {sentimentCounts.neutral || 0}
            </p>
          </div>
          <div className="text-center p-2 bg-chart-2/10 rounded">
            <p className="text-xs text-muted-foreground">Negative</p>
            <p className="font-bold text-chart-2" data-testid="text-sentiment-negative">
              {sentimentCounts.negative || 0}
            </p>
          </div>
        </div>

        {/* News Articles */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-border rounded-lg hover-elevate cursor-pointer transition-all"
                onClick={() => handleNewsClick(item.id, item.url)}
                data-testid={`news-item-${item.id}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                      {item.headline}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge 
                        className={`${getSentimentColor(item.sentiment)} text-xs`}
                      >
                        {getSentimentIcon(item.sentiment)}
                        {item.sentiment}
                      </Badge>
                      {item.url && item.url !== '#' && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {item.source}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                  </div>

                  {expandedNews === item.id && (
                    <div className="mt-3 p-3 bg-secondary/20 rounded border-l-2 border-primary">
                      <p className="text-sm text-muted-foreground">
                        {item.summary} This would show the full article content in a real implementation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="hover-elevate"
            data-testid="button-load-more-news"
            onClick={() => console.log('Load more news clicked')}
          >
            Load More News
          </Button>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            📰 Real-time news integration would connect to financial news APIs like News API or Alpha Vantage
          </p>
        </div>
      </CardContent>
    </Card>
  );
}