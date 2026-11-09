import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, TrendingDown, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ChurnRiskTable } from '@/components/analytics/ChurnRiskTable';
import {
  analyticsService,
  errorMessage,
  type ChurnMemberList,
  type ChurnSummary,
} from '@/services/analyticsService';

export default function ChurnRisk() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ChurnSummary | null>(null);
  const [list, setList] = useState<ChurnMemberList | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([
        analyticsService.getChurnSummary(),
        analyticsService.getAtRiskMembers(200),
      ]);
      setSummary(s);
      setList(l);
    } catch (err) {
      setError(errorMessage(err, 'Could not load churn predictions.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retrain = async () => {
    setRetraining(true);
    try {
      await analyticsService.retrainModel();
      toast({ title: 'Model retrained', description: 'Scores now use the latest data.' });
      await load();
    } catch (err) {
      toast({ title: 'Retraining failed', description: errorMessage(err, 'Please try again later.'), variant: 'destructive' });
    } finally {
      setRetraining(false);
    }
  };

  const cards = summary
    ? [
        { label: 'High risk', value: summary.by_level.high, icon: AlertTriangle, tone: 'text-red-600' },
        { label: 'Medium risk', value: summary.by_level.medium, icon: TrendingDown, tone: 'text-amber-600' },
        { label: 'Active members scored', value: summary.scored_members, icon: Users, tone: 'text-primary' },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Churn Risk</h1>
          <p className="text-muted-foreground">
            Members likely to stop coming in the next 30 days, and why.
          </p>
        </div>
        <Button variant="outline" onClick={retrain} disabled={retraining || loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Retraining…' : 'Retrain model'}
        </Button>
      </div>

      {summary?.synthetic_model && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="py-3 text-sm text-amber-900">
            This model was trained on <strong>synthetic demo data</strong>. Treat scores as a
            demonstration until it is retrained on real attendance history.
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {loading && !summary
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)
          : cards.map((c) => (
              <Card key={c.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                  <c.icon className={`h-4 w-4 ${c.tone}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{c.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members by risk</CardTitle>
          <CardDescription>
            {summary && (
              <>
                As of {summary.as_of} · model{' '}
                <Badge variant="secondary">{summary.model_version}</Badge> · risk is the chance of no
                visit in the next 30 days
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !list ? (
            <Skeleton className="h-64" />
          ) : (
            <ChurnRiskTable
              members={list?.members ?? []}
              actionLabel="Send message"
              onAction={() => navigate('/admin/send-notification')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
