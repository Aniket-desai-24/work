import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react';

interface AIRecommendationTrack {
  id: string;
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice?: number;
  predictedAt: Date;
  actualOutcome?: 'CORRECT' | 'INCORRECT' | 'PARTIAL';
  actualPrice?: number;
  daysToTarget?: number;
  returnGenerated?: number;
}

interface AccuracyMetrics {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  avgConfidence: number;
  avgReturn: number;
  bestStreak: number;
  currentStreak: number;
}

interface PerformanceByConfidence {
  confidenceRange: string;
  accuracy: number;
  count: number;
}

export default function AccuracyTracker() {
  const [recommendations, setRecommendations] = useState<AIRecommendationTrack[]>([]);
  const [metrics, setMetrics] = useState<AccuracyMetrics>({
    totalPredictions: 0,
    correctPredictions: 0,
    accuracy: 0,
    avgConfidence: 0,
    avgReturn: 0,
    bestStreak: 0,
    currentStreak: 0
  });
  const [performanceByConfidence, setPerformanceByConfidence] = useState<PerformanceByConfidence[]>([]);

  // Load and generate mock historical data
  useEffect(() => {
    generateMockRecommendations();
  }, []);

  const generateMockRecommendations = () => {
    const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN'];
    const mockRecommendations: AIRecommendationTrack[] = [];

    for (let i = 0; i < 50; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const recommendation: 'BUY' | 'SELL' | 'HOLD' = ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)] as any;
      const confidence = Math.floor(Math.random() * 40) + 60; // 60-100% confidence
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const predictedAt = new Date();
      predictedAt.setDate(predictedAt.getDate() - daysAgo);

      // Simulate accuracy based on confidence (higher confidence = higher accuracy)
      const accuracyProbability = (confidence - 50) / 50; // Convert to 0-1 scale
      const isCorrect = Math.random() < accuracyProbability;

      const targetPrice = 1000 + Math.random() * 2000;
      const actualPrice = targetPrice + (Math.random() - 0.5) * 200;
      const returnGenerated = recommendation === 'BUY' ? 
        (isCorrect ? Math.random() * 15 + 2 : -(Math.random() * 8 + 1)) :
        recommendation === 'SELL' ?
        (isCorrect ? Math.random() * 10 + 1 : -(Math.random() * 12 + 2)) :
        (Math.random() - 0.5) * 4; // HOLD has smaller movements

      mockRecommendations.push({
        id: `rec_${i}`,
        symbol,
        recommendation,
        confidence,
        targetPrice,
        predictedAt,
        actualOutcome: isCorrect ? 'CORRECT' : 'INCORRECT',
        actualPrice,
        daysToTarget: Math.floor(Math.random() * 10) + 1,
        returnGenerated
      });
    }

    // Sort by date (newest first)
    mockRecommendations.sort((a, b) => b.predictedAt.getTime() - a.predictedAt.getTime());
    setRecommendations(mockRecommendations);

    // Calculate metrics
    calculateMetrics(mockRecommendations);
    calculatePerformanceByConfidence(mockRecommendations);
  };

  const calculateMetrics = (recs: AIRecommendationTrack[]) => {
    const total = recs.length;
    const correct = recs.filter(r => r.actualOutcome === 'CORRECT').length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const avgConfidence = total > 0 ? recs.reduce((sum, r) => sum + r.confidence, 0) / total : 0;
    const avgReturn = total > 0 ? recs.reduce((sum, r) => sum + (r.returnGenerated || 0), 0) / total : 0;

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (const rec of recs) {
      if (rec.actualOutcome === 'CORRECT') {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
        if (currentStreak === 0) currentStreak = tempStreak;
      } else {
        tempStreak = 0;
        currentStreak = 0;
      }
    }

    setMetrics({
      totalPredictions: total,
      correctPredictions: correct,
      accuracy: Number(accuracy.toFixed(1)),
      avgConfidence: Number(avgConfidence.toFixed(1)),
      avgReturn: Number(avgReturn.toFixed(2)),
      bestStreak,
      currentStreak
    });
  };

  const calculatePerformanceByConfidence = (recs: AIRecommendationTrack[]) => {
    const ranges = [
      { min: 60, max: 70, label: '60-70%' },
      { min: 70, max: 80, label: '70-80%' },
      { min: 80, max: 90, label: '80-90%' },
      { min: 90, max: 100, label: '90-100%' }
    ];

    const performance = ranges.map(range => {
      const recsInRange = recs.filter(r => r.confidence >= range.min && r.confidence < range.max);
      const correct = recsInRange.filter(r => r.actualOutcome === 'CORRECT').length;
      const accuracy = recsInRange.length > 0 ? (correct / recsInRange.length) * 100 : 0;

      return {
        confidenceRange: range.label,
        accuracy: Number(accuracy.toFixed(1)),
        count: recsInRange.length
      };
    });

    setPerformanceByConfidence(performance);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-chart-1';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-chart-2';
  };

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-chart-1 text-chart-1-foreground';
    if (accuracy >= 60) return 'bg-yellow-500 text-yellow-50';
    return 'bg-chart-2 text-chart-2-foreground';
  };

  const getRecommendationIcon = (rec: 'BUY' | 'SELL' | 'HOLD') => {
    switch (rec) {
      case 'BUY': return <TrendingUp className="h-3 w-3 text-chart-1" />;
      case 'SELL': return <TrendingDown className="h-3 w-3 text-chart-2" />;
      default: return <div className="h-3 w-3 bg-muted-foreground rounded-full" />;
    }
  };

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

  // Data for accuracy trend chart
  const accuracyTrend = recommendations
    .slice(0, 30)
    .reverse()
    .map((rec, index) => {
      const recsUpToThis = recommendations.slice(0, index + 1);
      const correct = recsUpToThis.filter(r => r.actualOutcome === 'CORRECT').length;
      const accuracy = (correct / recsUpToThis.length) * 100;
      
      return {
        date: rec.predictedAt.toLocaleDateString(),
        accuracy: Number(accuracy.toFixed(1)),
        prediction: index + 1
      };
    });

  // Pie chart data for recommendation distribution
  const recommendationDistribution = [
    { name: 'BUY', value: recommendations.filter(r => r.recommendation === 'BUY').length, color: 'hsl(var(--chart-1))' },
    { name: 'SELL', value: recommendations.filter(r => r.recommendation === 'SELL').length, color: 'hsl(var(--chart-2))' },
    { name: 'HOLD', value: recommendations.filter(r => r.recommendation === 'HOLD').length, color: 'hsl(var(--chart-3))' }
  ];

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          AI Accuracy Tracker
          <Badge variant="secondary" className={getAccuracyBadgeColor(metrics.accuracy)}>
            {metrics.accuracy}% Accurate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Total Predictions</p>
            <p className="text-2xl font-bold text-foreground">{metrics.totalPredictions}</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            <p className={`text-2xl font-bold ${getAccuracyColor(metrics.accuracy)}`}>
              {metrics.accuracy}%
            </p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Avg Return</p>
            <div className="flex items-center justify-center gap-1">
              {metrics.avgReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-chart-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-chart-2" />
              )}
              <p className={`text-2xl font-bold ${metrics.avgReturn >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
                {metrics.avgReturn >= 0 ? '+' : ''}{metrics.avgReturn}%
              </p>
            </div>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Best Streak</p>
            <div className="flex items-center justify-center gap-1">
              <Award className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-foreground">{metrics.bestStreak}</p>
            </div>
          </div>
        </div>

        {/* Accuracy Trend Chart */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Accuracy Trend (Last 30 Predictions)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="prediction" className="fill-muted-foreground" />
                <YAxis domain={[0, 100]} className="fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value) => [`${value}%`, 'Accuracy']}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance by Confidence Level */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Performance by Confidence Level</h4>
            <div className="space-y-3">
              {performanceByConfidence.map((perf) => (
                <div key={perf.confidenceRange} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{perf.confidenceRange} Confidence</span>
                    <span className={getAccuracyColor(perf.accuracy)}>
                      {perf.accuracy}% ({perf.count} predictions)
                    </span>
                  </div>
                  <Progress value={perf.accuracy} className="w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Recommendation Distribution</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendationDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {recommendationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              {recommendationDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Recent AI Predictions</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Target Price</TableHead>
                  <TableHead>Actual Price</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.slice(0, 10).map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.symbol}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation)}
                        <Badge 
                          variant="secondary"
                          className={
                            rec.recommendation === 'BUY' ? "bg-chart-1 text-chart-1-foreground" :
                            rec.recommendation === 'SELL' ? "bg-chart-2 text-chart-2-foreground" :
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {rec.recommendation}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{rec.confidence}%</TableCell>
                    <TableCell>{rec.targetPrice ? formatCurrency(rec.targetPrice) : '-'}</TableCell>
                    <TableCell>{rec.actualPrice ? formatCurrency(rec.actualPrice) : '-'}</TableCell>
                    <TableCell>
                      {rec.returnGenerated !== undefined && (
                        <span className={rec.returnGenerated >= 0 ? 'text-chart-1' : 'text-chart-2'}>
                          {rec.returnGenerated >= 0 ? '+' : ''}{rec.returnGenerated.toFixed(1)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={rec.actualOutcome === 'CORRECT' ? 
                          "bg-chart-1 text-chart-1-foreground" : 
                          "bg-chart-2 text-chart-2-foreground"}
                      >
                        {rec.actualOutcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rec.predictedAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 bg-secondary rounded-lg">
          <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            AI Performance Insights
          </h5>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              🎯 <strong>Current Accuracy:</strong> The AI model is performing {' '}
              <span className={getAccuracyColor(metrics.accuracy)}>
                {metrics.accuracy >= 70 ? 'excellently' : metrics.accuracy >= 60 ? 'well' : 'below expectations'}
              </span> with {metrics.accuracy}% accuracy over {metrics.totalPredictions} predictions.
            </p>
            <p className="text-muted-foreground">
              📈 <strong>Return Performance:</strong> Average return per prediction is {' '}
              <span className={metrics.avgReturn >= 0 ? 'text-chart-1' : 'text-chart-2'}>
                {metrics.avgReturn >= 0 ? '+' : ''}{metrics.avgReturn}%
              </span>, with a current winning streak of {metrics.currentStreak} predictions.
            </p>
            <p className="text-muted-foreground">
              🔮 <strong>Confidence Calibration:</strong> Higher confidence predictions (90-100%) show {' '}
              {performanceByConfidence.find(p => p.confidenceRange === '90-100%')?.accuracy || 0}% accuracy,
              validating the AI's confidence scoring system.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}