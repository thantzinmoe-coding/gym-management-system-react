import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, CheckCircle, XCircle, Search } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  timeSlot: string;
  status: 'present' | 'absent' | 'late';
  clientName: string;
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
    clientName: 'John Doe',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training',
    notes: 'Great session, excellent progress'
  },
  {
    id: '2',
    date: '2024-01-15',
    timeSlot: '10:30 AM - 11:30 AM',
    status: 'late',
    clientName: 'Jane Smith',
    packageName: 'Strength Training Advanced',
    sessionType: 'Personal Training',
    notes: '15 minutes late due to traffic'
  },
  {
    id: '3',
    date: '2024-01-15',
    timeSlot: '02:00 PM - 03:00 PM',
    status: 'absent',
    clientName: 'Mike Johnson',
    packageName: 'Beginner Fitness',
    sessionType: 'Group Session',
    notes: 'Called in sick'
  },
  {
    id: '4',
    date: '2024-01-14',
    timeSlot: '08:00 AM - 09:00 AM',
    status: 'present',
    clientName: 'Sarah Wilson',
    packageName: 'Weight Loss Bootcamp',
    sessionType: 'Personal Training'
  },
  {
    id: '5',
    date: '2024-01-14',
    timeSlot: '11:00 AM - 12:00 PM',
    status: 'present',
    clientName: 'David Brown',
    packageName: 'Strength Training Advanced',
    sessionType: 'Personal Training',
    notes: 'Achieved new personal record'
  },
  {
    id: '6',
    date: '2024-01-14',
    timeSlot: '03:00 PM - 04:00 PM',
    status: 'present',
    clientName: 'Emma Davis',
    packageName: 'Beginner Fitness',
    sessionType: 'Group Session'
  }
];

export default function ViewAttendance() {
  const [attendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate === '' || record.date === selectedDate;
    return matchesSearch && matchesDate;
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

  const totalSessions = attendance.length;
  const presentSessions = attendance.filter(a => a.status === 'present').length;
  const lateSessions = attendance.filter(a => a.status === 'late').length;
  const absentSessions = attendance.filter(a => a.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your training session attendance and client records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">All recorded sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentSessions}</div>
            <p className="text-xs text-muted-foreground">
              {totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0}% attendance rate
            </p>
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
          <CardTitle>Session Records</CardTitle>
          <CardDescription>View detailed attendance records for your training sessions</CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client or package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-sm"
            />
            {(searchTerm || selectedDate) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate('');
                }}
              >
                Clear Filters
              </Button>
            )}
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
                      <h4 className="font-medium text-foreground">{record.clientName}</h4>
                      <p className="text-sm text-muted-foreground">{record.packageName}</p>
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
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
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
                <p className="text-muted-foreground">No attendance records found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}