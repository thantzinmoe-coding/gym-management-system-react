import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ManageSchedule() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      title: 'Morning Cardio Session',
      date: '2024-01-16',
      startTime: '06:00',
      endTime: '07:00',
      client: 'John Doe',
      type: 'Personal Training',
      status: 'Confirmed'
    },
    {
      id: 2,
      title: 'Weight Training',
      date: '2024-01-16',
      startTime: '08:00',
      endTime: '09:30',
      client: 'Jane Smith',
      type: 'Personal Training',
      status: 'Confirmed'
    },
    {
      id: 3,
      title: 'Group Yoga Class',
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '11:00',
      client: 'Group Session',
      type: 'Group Class',
      status: 'Confirmed'
    },
    {
      id: 4,
      title: 'Consultation',
      date: '2024-01-16',
      startTime: '14:00',
      endTime: '14:30',
      client: 'Mike Johnson',
      type: 'Consultation',
      status: 'Pending'
    },
    {
      id: 5,
      title: 'HIIT Training',
      date: '2024-01-17',
      startTime: '07:00',
      endTime: '08:00',
      client: 'Sarah Wilson',
      type: 'Personal Training',
      status: 'Confirmed'
    }
  ]);

  const [newSchedule, setNewSchedule] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    client: '',
    type: ''
  });

  const filteredSchedules = schedules.filter(schedule => 
    schedule.date === selectedDate
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddSchedule = () => {
    if (newSchedule.title && newSchedule.date && newSchedule.startTime && newSchedule.endTime) {
      setSchedules([...schedules, {
        id: schedules.length + 1,
        ...newSchedule,
        status: 'Confirmed'
      }]);
      setNewSchedule({ title: '', date: '', startTime: '', endTime: '', client: '', type: '' });
      setIsAddDialogOpen(false);
      toast({
        title: "Schedule Added",
        description: "New schedule has been added successfully.",
      });
    }
  };

  const handleRemoveSchedule = (id: number) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
    toast({
      title: "Schedule Removed",
      description: "Schedule has been removed successfully.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const todaySchedules = schedules.filter(s => s.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Schedule</h1>
          <p className="text-muted-foreground">Organize your training sessions and appointments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  placeholder="Enter session title"
                />
              </div>
              <div>
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  value={newSchedule.client}
                  onChange={(e) => setNewSchedule({...newSchedule, client: e.target.value})}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="type">Session Type</Label>
                <Select value={newSchedule.type} onValueChange={(value) => setNewSchedule({...newSchedule, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal Training">Personal Training</SelectItem>
                    <SelectItem value="Group Class">Group Class</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddSchedule} className="w-full">Add Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todaySchedules.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaySchedules.filter(s => s.status === 'Confirmed').length} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">15</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">28</div>
            <p className="text-xs text-muted-foreground">Total sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>View and manage your daily training schedule</CardDescription>
              <div>
                <Label htmlFor="date-select">Select Date</Label>
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSchedules.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No sessions scheduled for this date
                  </p>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{schedule.startTime}</p>
                          <p className="text-xs text-muted-foreground">to</p>
                          <p className="text-sm font-medium">{schedule.endTime}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{schedule.title}</p>
                          <p className="text-sm text-muted-foreground">{schedule.client}</p>
                          <Badge variant="outline" className="mt-1">{schedule.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(schedule.status)}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">87%</div>
                <p className="text-sm text-muted-foreground">Session Completion Rate</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">145</div>
                <p className="text-sm text-muted-foreground">Hours This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}