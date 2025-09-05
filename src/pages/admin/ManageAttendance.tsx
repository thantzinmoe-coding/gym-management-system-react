
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function ManageAttendance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [newRecord, setNewRecord] = useState({
    name: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'Present',
    type: 'member'
  });

  const [memberAttendance, setMemberAttendance] = useState([
    { id: 1, memberName: 'John Doe', date: '2024-01-15', checkIn: '06:00', checkOut: '07:30', status: 'Present', type: 'member' },
    { id: 2, memberName: 'Jane Smith', date: '2024-01-15', checkIn: '07:00', checkOut: '08:45', status: 'Present', type: 'member' },
    { id: 3, memberName: 'Mike Johnson', date: '2024-01-15', checkIn: '-', checkOut: '-', status: 'Absent', type: 'member' },
    { id: 4, memberName: 'Sarah Wilson', date: '2024-01-15', checkIn: '08:30', checkOut: '10:00', status: 'Present', type: 'member' },
  ]);

  const [trainerAttendance, setTrainerAttendance] = useState([
    { id: 1, memberName: 'Alex Johnson', date: '2024-01-15', checkIn: '05:30', checkOut: '14:30', status: 'Present', type: 'trainer' },
    { id: 2, memberName: 'Maria Garcia', date: '2024-01-15', checkIn: '06:00', checkOut: '15:00', status: 'Present', type: 'trainer' },
    { id: 3, memberName: 'David Brown', date: '2024-01-15', checkIn: '-', checkOut: '-', status: 'Absent', type: 'trainer' },
  ]);

  const filteredMemberData = memberAttendance.filter(item =>
    item.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrainerData = trainerAttendance.filter(item =>
    item.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRecord = () => {
    if (newRecord.name && newRecord.date) {
      const newId = Math.max(...memberAttendance.map(m => m.id), ...trainerAttendance.map(t => t.id)) + 1;
      const record = {
        id: newId,
        memberName: newRecord.name,
        date: newRecord.date,
        checkIn: newRecord.checkIn || '-',
        checkOut: newRecord.checkOut || '-',
        status: newRecord.status,
        type: newRecord.type
      };

      if (newRecord.type === 'member') {
        setMemberAttendance([...memberAttendance, record]);
      } else {
        setTrainerAttendance([...trainerAttendance, record]);
      }

      setNewRecord({ name: '', date: '', checkIn: '', checkOut: '', status: 'Present', type: 'member' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setNewRecord({
      name: record.memberName,
      date: record.date,
      checkIn: record.checkIn === '-' ? '' : record.checkIn,
      checkOut: record.checkOut === '-' ? '' : record.checkOut,
      status: record.status,
      type: record.type
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateRecord = () => {
    if (editingRecord && newRecord.name && newRecord.date) {
      const updatedRecord = {
        ...editingRecord,
        memberName: newRecord.name,
        date: newRecord.date,
        checkIn: newRecord.checkIn || '-',
        checkOut: newRecord.checkOut || '-',
        status: newRecord.status,
        type: newRecord.type
      };

      if (newRecord.type === 'member') {
        setMemberAttendance(memberAttendance.map(m => m.id === editingRecord.id ? updatedRecord : m));
      } else {
        setTrainerAttendance(trainerAttendance.map(t => t.id === editingRecord.id ? updatedRecord : t));
      }

      setEditingRecord(null);
      setNewRecord({ name: '', date: '', checkIn: '', checkOut: '', status: 'Present', type: 'member' });
      setIsAddDialogOpen(false);
    }
  };

  const handleDelete = (id: number, type: string) => {
    if (type === 'member') {
      setMemberAttendance(memberAttendance.filter(m => m.id !== id));
    } else {
      setTrainerAttendance(trainerAttendance.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Attendance</h1>
          <p className="text-muted-foreground">Track and manage member and trainer attendance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRecord(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Attendance Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newRecord.name}
                    onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="checkIn">Check In Time</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={newRecord.checkIn}
                    onChange={(e) => setNewRecord({...newRecord, checkIn: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check Out Time</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={newRecord.checkOut}
                    onChange={(e) => setNewRecord({...newRecord, checkOut: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newRecord.status} onValueChange={(value) => setNewRecord({...newRecord, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={editingRecord ? handleUpdateRecord : handleAddRecord} className="w-full">
                  {editingRecord ? 'Update' : 'Add'} Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members Present</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {memberAttendance.filter(m => m.status === 'Present').length}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trainers Present</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {trainerAttendance.filter(t => t.status === 'Present').length}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {[...memberAttendance, ...trainerAttendance].filter(r => r.status === 'Absent').length}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round(([...memberAttendance, ...trainerAttendance].filter(r => r.status === 'Present').length / [...memberAttendance, ...trainerAttendance].length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Member Attendance</TabsTrigger>
          <TabsTrigger value="trainers">Trainer Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Member Attendance</CardTitle>
              <CardDescription>Daily member check-in and check-out records</CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMemberData.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {record.memberName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{record.memberName}</p>
                        <p className="text-sm text-muted-foreground">{record.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Check In</p>
                        <p className="text-sm text-muted-foreground">{record.checkIn}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Check Out</p>
                        <p className="text-sm text-muted-foreground">{record.checkOut}</p>
                      </div>
                      <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                        {record.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(record.id, 'member')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainers">
          <Card>
            <CardHeader>
              <CardTitle>Trainer Attendance</CardTitle>
              <CardDescription>Daily trainer check-in and check-out records</CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trainers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTrainerData.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium">
                        {record.memberName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{record.memberName}</p>
                        <p className="text-sm text-muted-foreground">{record.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Check In</p>
                        <p className="text-sm text-muted-foreground">{record.checkIn}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Check Out</p>
                        <p className="text-sm text-muted-foreground">{record.checkOut}</p>
                      </div>
                      <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                        {record.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(record.id, 'trainer')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
