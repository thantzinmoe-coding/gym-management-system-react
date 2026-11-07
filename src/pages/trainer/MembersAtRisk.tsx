import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChurnRiskTable } from '@/components/analytics/ChurnRiskTable';
import { analyticsService, errorMessage, type ChurnMemberList } from '@/services/analyticsService';

export default function MembersAtRisk() {
  const navigate = useNavigate();
  const [list, setList] = useState<ChurnMemberList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService
      .getMyMembersAtRisk()
      .then(setList)
      .catch((err) => setError(errorMessage(err, 'Could not load churn predictions.')));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Members at Risk</h1>
        <p className="text-muted-foreground">
          Your members who may stop coming soon. A quick check-in can make the difference.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your members</CardTitle>
          <CardDescription>
            {list ? `${list.total} active members scored as of ${list.as_of}` : 'Loading…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !list ? (
            <Skeleton className="h-64" />
          ) : (
            <ChurnRiskTable
              members={list.members}
              actionLabel="Message"
              onAction={(m) => navigate(`/trainer/chat?userId=${m.user_id}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
