import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, CheckCircle, XCircle, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { attendanceService, type TrainerAttendanceRecord } from '@/services/attendanceService';
import { authService } from '@/services/authService';

const formatTime = (time: string | null) => {
  if (!time || time === '00:00') return '—';
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m);
  return format(d, 'hh:mm a');
};

/** The member's own check-ins, recorded by the front desk (Admin → Manage Attendance). */
export default function ViewAttendance() {
  const user = authService.getCurrentUser();
  const [records, setRecords] = useState<TrainerAttendanceRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    if (!user?.id) return;
    attendanceService
      .getTrainerAttendanceRecords(Number(user.id)) // same endpoint serves members' own records
      .then((data) => setRecords([...data].sort((a, b) => b.date.localeCompare(a.date))))
      .catch((err) => setError(err?.message || 'Could not load your attendance.'));
  }, [user?.id]);

  const monthRecords = useMemo(
    () => (records ?? []).filter((r) => r.date.startsWith(selectedMonth)),
    [records, selectedMonth],
  );
  const visits = monthRecords.filter((r) => r.status === 'present').length;
  const absences = monthRecords.filter((r) => r.status === 'absent').length;
  const lastVisit = (records ?? []).find((r) => r.status === 'present');

  const cards = [
    { title: 'Visits', value: visits, note: 'In the selected month', icon: CheckCircle, tone: 'text-green-600' },
    { title: 'Absences', value: absences, note: 'Recorded in the selected month', icon: XCircle, tone: 'text-red-600' },
    {
      title: 'Last visit',
      value: lastVisit ? format(parseISO(lastVisit.date), 'MMM d, yyyy') : '—',
      note: lastVisit ? `Checked in at ${formatTime(lastVisit.timeIn)}` : 'No visits recorded yet',
      icon: History,
      tone: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Your gym check-ins, as recorded at the front desk</p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.tone}`} />
            </CardHeader>
            <CardContent>
              {records === null && !error ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className={`text-2xl font-bold ${c.tone}`}>{c.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{c.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your check-in and check-out times</CardDescription>
          <div className="flex items-center space-x-4">
            <label htmlFor="month-filter" className="text-sm font-medium">Month:</label>
            <Input id="month-filter" type="month" value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {records === null && !error ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-3">
              {monthRecords.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    {r.status === 'present'
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-red-500" />}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{format(parseISO(r.date), 'EEE, MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {r.status === 'present' ? `${formatTime(r.timeIn)} – ${formatTime(r.timeOut)}` : 'Absent'}
                  </div>
                  {r.status === 'present'
                    ? <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>
                    : <Badge variant="destructive">Absent</Badge>}
                </div>
              ))}
              {monthRecords.length === 0 && (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No attendance recorded for this month</p>
                  <p className="text-sm text-muted-foreground">Try another month</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
