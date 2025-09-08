import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { attendanceService, AttendanceRecord, User, AttendanceCreateData } from '@/services/attendanceService';
import { toast } from "sonner";
import { format, parseISO, differenceInHours, parse } from 'date-fns';

export default function ManageAttendance() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [newRecord, setNewRecord] = useState({
        userId: 0,
        date: '',
        timeIn: '',
        attendanceType: 'MEMBER',
        hoursWorked: null,
        packageDays: 0,
        timeOut: ''
    });

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [users, setUsers] = useState<User[]>([]);  // State for users

    useEffect(() => {
        fetchAttendanceData();
        fetchUsers(); // Fetch users on component mount
    }, []);

    const fetchAttendanceData = async () => {
        try {
            const data = await attendanceService.getAllAttendance();
            setAttendanceRecords(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch attendance data");
        }
    };

    const fetchUsers = async () => {
        try {
            const usersData = await attendanceService.getAllUsers();
            console.log("Users Data:", usersData); // Debug log
            setUsers(usersData);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error(error.message || "Failed to fetch users");
        }
    };

    const memberAttendance = attendanceRecords.filter(record => record.attendanceType === 'MEMBER');
    const trainerAttendance = attendanceRecords.filter(record => record.attendanceType === 'TRAINER');

    const filteredMemberData = memberAttendance.filter(item =>
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTrainerData = trainerAttendance.filter(item =>
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddRecord = async () => {
        if (newRecord.userId && newRecord.date && newRecord.timeIn && newRecord.attendanceType) {
            try {
                const record: AttendanceCreateData = {
                    userId: newRecord.userId,
                    date: newRecord.date,
                    timeIn: newRecord.timeIn,
                    attendanceType: newRecord.attendanceType === 'MEMBER' ? 'MEMBER' : 'TRAINER',
                    hoursWorked: newRecord.hoursWorked,
                    packageDays: newRecord.packageDays
                };

                const newRecordResponse = await attendanceService.addAttendance(record);
                setAttendanceRecords([...attendanceRecords, newRecordResponse]);

                setNewRecord({
                    userId: 0,
                    date: '',
                    timeIn: '',
                    attendanceType: 'MEMBER',
                    hoursWorked: null,
                    packageDays: 0,
                    timeOut: ''
                });
                setIsAddDialogOpen(false);
            } catch (error: any) {
                toast.error(error.message || "Failed to add attendance record");
            }
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

     const handleEdit = (record: AttendanceRecord) => {
        setEditingRecord(record);

        // Parse the timeIn value
        const timeInString = record.timeIn;

        // Use the date to correctly calculate the date.
        const date = record.date;

        // The error was here, because timeIn was not parsed correctly. timeIn is in HH:mm format, so we use that to parse the date.
        const timeIn = parse(timeInString, 'HH:mm', parseISO(date));

        console.log("Parsed timeIn:", timeIn); // Debug log

        // set timeOut value
        const timeOutString = record.timeOut;// Debug log

        console.log("timeOutString:", timeOutString); // Debug log

        // set the hours worked
        let hoursWorked = 0;
        if (timeOutString != null) {
            const timeOut = parse(timeOutString, 'HH:mm', parseISO(date));
           hoursWorked = differenceInHours(timeOut, timeIn);
        }

        console.log("Calculated hoursWorked:", hoursWorked); // Debug log

        setNewRecord({
            userId: record.userId,
            date: record.date,
            timeIn: record.timeIn,
            attendanceType: record.attendanceType,
            hoursWorked: hoursWorked,
            packageDays: 0,
            timeOut: record.timeOut
        });
        setIsAddDialogOpen(true);
    };

     const handleUpdateRecord = async () => {
    if (editingRecord) {
        try {

          if (editingRecord.timeOut == null) {
            // Get the check-in time from the existing record
            const checkInTime = editingRecord.timeIn;

             // Use the date to correctly calculate the date.
            const date = editingRecord.date;

            // Get the current time as the check-out time
            const checkOutTime = newRecord.timeOut;

            console.log("Check Out Time:", checkOutTime); // Debug log

             // The error was here, because timeIn was not parsed correctly. timeIn is in HH:mm format, so we use that to parse the date.
             const parsedTimeIn = parse(checkInTime, 'HH:mm', parseISO(date));
             // The error was here, because timeOut was not parsed correctly. timeOut is in HH:mm format, so we use that to parse the date.
             const parsedTimeOut = parse(checkOutTime, 'HH:mm', parseISO(date));

            // Calculate hours worked (difference in hours between checkOutTime and checkInTime)
            const hoursWorkedCalc = differenceInHours(
                parsedTimeOut,
                parsedTimeIn
            );

            console.log("Calculated hoursWorkedCalc:", hoursWorkedCalc); // Add this line

            // Prepare update data (only timeOut is editable)
            const updateData = {
                timeOut: checkOutTime,
                hoursWorked: hoursWorkedCalc,
            };

            const updatedRecordResponse = await attendanceService.updateAttendance(editingRecord.id, updateData);

            setAttendanceRecords(
                attendanceRecords.map(record =>
                    record.id === editingRecord.id
                        ? { ...record, timeOut: checkOutTime, hoursWorked: hoursWorkedCalc }
                        : record
            )
        );

            setEditingRecord(null);
            setNewRecord({
                userId: 0,
                date: '',
                timeIn: '',
                attendanceType: 'MEMBER',
                hoursWorked: null,
                packageDays: 0,
                timeOut: ''
            });
            setIsAddDialogOpen(false);
            toast.success("Attendance Time Out updated successfully");
          } else {
               toast.error("Attendance Time Out already recorded")
          }


        } catch (error: any) {
            toast.error(error.message || "Failed to update attendance record");
        }
    }
};

    const handleDelete = async (id: number, type: string) => {
        try {
            await attendanceService.deleteAttendance(id);
            setAttendanceRecords(attendanceRecords.filter(record => record.id !== id));
            toast.success("Attendance record deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete attendance record");
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
                                    <Label htmlFor="userId">User</Label>
                                    <Select onValueChange={(value) => setNewRecord({ ...newRecord, userId: parseInt(value) })}>
                                        <SelectTrigger className="w-[240px]">
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.userId} value={user.userId.toString()}>
                                                    {user.userName} ({user.userEmail})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={newRecord.date}
                                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                                    />
                                </div>
                                {editingRecord == null ? (
                                    <div>
                                        <Label htmlFor="timeIn">Check In Time</Label>
                                        <Input
                                            id="timeIn"
                                            type="time"
                                            value={newRecord.timeIn}
                                            onChange={(e) => setNewRecord({ ...newRecord, timeIn: e.target.value })}
                                        />
                                    </div>
                                ) : null}
                                {editingRecord != null ? (
                                    <div>
                                        <Label htmlFor="timeOut">Check Out Time</Label>
                                        <Input
                                            id="timeOut"
                                            type="time"
                                            onChange={(e) => setNewRecord({ ...newRecord, timeOut: e.target.value })}
                                        />
                                    </div>
                                ) : null}
                                {editingRecord != null ? (
                                    <div>
                                        <Label htmlFor="hoursWorked">Hours Worked</Label>
                                        <Input
                                            id="hoursWorked"
                                            type="number"
                                            value={newRecord.hoursWorked}
                                            disabled
                                        />
                                    </div>
                                ) : null}
                                <div>
                                    <Label htmlFor="attendanceType">Attendance Type</Label>
                                    <Select value={newRecord.attendanceType} onValueChange={(value) => setNewRecord({ ...newRecord, attendanceType: value as 'MEMBER' | 'TRAINER' })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                            <SelectItem value="TRAINER">Trainer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newRecord.attendanceType === 'MEMBER' && (
                                    <div>
                                        <Label htmlFor="packageDays">Package Days</Label>
                                        <Input
                                            id="packageDays"
                                            type="number"
                                            value={newRecord.packageDays}
                                            onChange={(e) => setNewRecord({ ...newRecord, packageDays: parseInt(e.target.value) })}
                                            placeholder="Enter Package Days"
                                        />
                                    </div>
                                )}
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
                            {memberAttendance.filter(m => m.timeOut == null).length}
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
                            {trainerAttendance.filter(t => t.timeOut == null).length}
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
                            {attendanceRecords.filter(r => r.timeOut == null).length}
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
                            {attendanceRecords.length > 0 ? Math.round((attendanceRecords.filter(r => r.timeOut != null).length / attendanceRecords.length) * 100) : 0}%
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
                                                {record.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{record.userName}</p>
                                                <p className="text-sm text-muted-foreground">{format(parseISO(record.date), 'MM/dd/yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Check In</p>
                                                <p className="text-sm text-muted-foreground">{record.timeIn}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Check Out</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.timeOut ? format(parseISO(record.timeOut), 'hh:mm a') : '-'}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Hours Worked</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.hoursWorked != null && typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : '-'}
                                                </p>
                                            </div>
                                            <Badge variant={record.timeOut == null ? 'destructive' : 'default'}>
                                                {record.timeOut == null ? 'Present' : 'Closed'}
                                            </Badge>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(record)}  disabled={record.timeOut != null}>
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
                                                {record.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{record.userName}</p>
                                                <p className="text-sm text-muted-foreground">{format(parseISO(record.date), 'MM/dd/yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Check In</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.timeIn}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Check Out</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.timeOut}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Hours Worked</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.hoursWorked != null && typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : '-'}
                                                </p>
                                            </div>
                                            <Badge variant={record.timeOut == null ? 'destructive' : 'default'}>
                                                {record.timeOut == null ? 'Present' : 'Closed'}
                                            </Badge>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(record)} disabled={record.timeOut != null}>
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