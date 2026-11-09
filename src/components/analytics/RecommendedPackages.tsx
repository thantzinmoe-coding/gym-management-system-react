import { useEffect, useState } from 'react';
import { Sparkles, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyticsService, type PackageRecommendation } from '@/services/analyticsService';
import { usePending } from '@/hooks/use-pending';

interface Props {
  onBook: (packageId: number) => void | Promise<void>;
  disabled?: boolean;
}

/** "Recommended for you" strip on the member's Book Packages page. Hidden on any error,
 *  so the booking page keeps working when the analytics service is down. */
export function RecommendedPackages({ onBook, disabled }: Props) {
  const [recs, setRecs] = useState<PackageRecommendation[] | null>(null);
  const pending = usePending();

  useEffect(() => {
    analyticsService
      .getMyRecommendations(3)
      .then((r) => setRecs(r.recommendations))
      .catch(() => setRecs([]));
  }, []);

  if (!recs || recs.length === 0) return null;

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for you
        </CardTitle>
        <CardDescription>Picked from your goal, your training times and member feedback.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {recs.map((r) => (
          <div key={r.package_id} className="flex flex-col rounded-lg border p-4">
            <div className="font-semibold">{r.name}</div>
            <div className="mt-1 space-y-1 text-sm text-muted-foreground">
              {r.trainer_name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {r.trainer_name}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {r.start_date} → {r.end_date}
              </div>
            </div>
            <ul className="mt-3 flex-1 list-disc space-y-0.5 pl-4 text-sm">
              {r.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold tabular-nums">${r.price.toFixed(0)}</span>
              <Button size="sm" disabled={disabled} loading={pending.isPending(r.package_id)} onClick={() => pending.run(r.package_id, async () => { await onBook(r.package_id); })}>
                Book
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
