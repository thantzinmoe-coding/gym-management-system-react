import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MemberChurn, RiskLevel } from '@/services/analyticsService';

const LEVEL_STYLES: Record<RiskLevel, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return <Badge variant="outline">n/a</Badge>;
  return (
    <Badge variant="outline" className={LEVEL_STYLES[level]}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
}

const stat = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined ? '—' : v.toFixed(digits);

interface Props {
  members: MemberChurn[];
  onAction?: (member: MemberChurn) => void;
  actionLabel?: string;
}

export function ChurnRiskTable({ members, onAction, actionLabel = 'Reach out' }: Props) {
  const [level, setLevel] = useState<RiskLevel | 'all'>('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      members.filter(
        (m) =>
          (level === 'all' || m.risk_level === level) &&
          (!query || (m.name ?? `#${m.user_id}`).toLowerCase().includes(query.toLowerCase())),
      ),
    [members, level, query],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'high', 'medium', 'low'] as const).map((l) => (
          <Button
            key={l}
            size="sm"
            variant={level === l ? 'default' : 'outline'}
            onClick={() => setLevel(l)}
          >
            {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
          </Button>
        ))}
        <Input
          className="ml-auto w-full sm:w-64"
          placeholder="Search member"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">Risk</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Why</TableHead>
              <TableHead className="text-right">Last visit</TableHead>
              <TableHead className="text-right">Visits (30d)</TableHead>
              {onAction && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={onAction ? 7 : 6} className="py-8 text-center text-muted-foreground">
                  No members match this filter.
                </TableCell>
              </TableRow>
            )}
            {rows.map((m) => (
              <TableRow key={m.user_id}>
                <TableCell className="font-medium">{m.name ?? `Member #${m.user_id}`}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.risk === null ? '—' : `${Math.round(m.risk * 100)}%`}
                </TableCell>
                <TableCell>
                  <RiskBadge level={m.risk_level} />
                </TableCell>
                <TableCell>
                  <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
                    {m.reasons.length === 0 && <li>No strong warning signs</li>}
                    {m.reasons.map((r) => (
                      <li key={r.feature}>{r.text}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {stat(m.stats.days_since_last_visit)} days ago
                </TableCell>
                <TableCell className="text-right tabular-nums">{stat(m.stats.visits_30d)}</TableCell>
                {onAction && (
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onAction(m)}>
                      {actionLabel}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
