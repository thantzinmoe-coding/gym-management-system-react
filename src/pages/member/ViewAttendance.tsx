import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  timeSlot: string;
  status: 'present' | 'absent' | 'late';
  trainerName: string;
  packageName: string;
  sessionType: string;
  notes?: string;
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    date: '2024-01-15',
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'present',
    trainerName: 'Alex Johnson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training'
  },
  {
    id: '2',
    date: '2024-01-14',
    timeSlot: '08:00 AM - 09:00 AM',
    status: 'present',
    trainerName: 'Alex Johnson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training',
    notes: 'Great workout session!'
  },
  {
    id: '3',
    date: '2024-01-12',
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'late',
    trainerName: 'Alex Johnson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training',
    notes: '10 minutes late due to traffic'
  },
  {
    id: '4',
    date: '2024-01-10',
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'absent',
    trainerName: 'Alex Johnson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training',
    notes: 'Called in sick'
  },
  {
    id: '5',
    date: '2024-01-08',
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'present',
    trainerName: 'Alex Johnson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training'
  },
  {
    id: '6',
    date: '2024-01-05',
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'present',
    trainerName: 'Alex Johnson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training'
  }
];

export default function ViewAttendance() {
  const [attendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  const filteredAttendance = attendance.filter(record => {
    return record.date.startsWith(selectedMonth);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case 'late':
        return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Late</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const totalSessions = filteredAttendance.length;
  const presentSessions = filteredAttendance.filter(a => a.status === 'present').length;
  const lateSessions = filteredAttendance.filter(a => a.status === 'late').length;
  const absentSessions = filteredAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = totalSessions > 0 ? Math.round(((presentSessions + lateSessions) / totalSessions) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your gym session attendance and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentSessions}</div>
            <p className="text-xs text-muted-foreground">Sessions attended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lateSessions}</div>
            <p className="text-xs text-muted-foreground">Late arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentSessions}</div>
            <p className="text-xs text-muted-foreground">Missed sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>View your detailed attendance records</CardDescription>
          
          <div className="flex items-center space-x-4">
            <label htmlFor="month-filter" className="text-sm font-medium">
              Filter by Month:
            </label>
            <Input
              id="month-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAttendance.map((record) => (
              <div key={record.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <h4 className="font-medium text-foreground">{record.packageName}</h4>
                      <p className="text-sm text-muted-foreground">with {record.trainerName}</p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{record.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{record.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span>{record.sessionType}</span>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {record.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredAttendance.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No attendance records found for this month</p>
                <p className="text-sm text-muted-foreground">Try selecting a different month</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}