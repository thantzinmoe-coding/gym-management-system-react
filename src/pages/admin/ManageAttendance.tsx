import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { attendanceService, AttendanceRecord, User, AttendanceCreateData } from '@/services/attendanceService';
import { toast } from "sonner";
import { format, parseISO, differenceInHours, parse } from 'date-fns';
import { AttendanceType } from '@/services/attendanceService';

type AttendanceStatus = 'ACTIVE' | 'INACTIVE';

export default function ManageAttendance() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [newRecord, setNewRecord] = useState<{
        userId: number;
        date: string;
        timeIn: string;
        attendanceType: AttendanceType;
        hoursWorked: number | null;
        timeOut: string;
        status: AttendanceStatus;
    }>({
        userId: 0,
        date: '',
        timeIn: '',
        attendanceType: AttendanceType.TRAINER,
        hoursWorked: null,
        timeOut: '',
        status: 'ACTIVE'
    });

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // Only trainer attendance
    const trainerAttendance = attendanceRecords.filter(record => record.attendanceType === AttendanceType.TRAINER);

    const filteredTrainerData = trainerAttendance.filter(item =>
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        // Create a Date using today's date + given time
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'hh:mm a'); // 12-hour format with AM/PM
        // return format(date, 'HH:mm'); // (for 24-hour format if you prefer)
    };


    useEffect(() => {
        fetchAttendanceData();
        fetchUsers();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            const data = await attendanceService.getAllAttendance();
            setAttendanceRecords(data);
            console.log("Attendance Data:", data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch attendance data");
        }
    };

    const fetchUsers = async () => {
        try {
            const usersData = await attendanceService.getAllUsers();
            console.log("Users Data:", usersData);
            setUsers(usersData);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error(error.message || "Failed to fetch users");
        }
    };

    const handleAddRecord = async () => {
        // For absent trainers, we only need userId, date, and attendanceType
        const isValidAbsent = newRecord.status === 'INACTIVE' &&
            newRecord.userId && newRecord.date && newRecord.attendanceType === AttendanceType.TRAINER;

        // For present trainers, we need timeIn as well
        const isValidPresent = newRecord.status === 'ACTIVE' &&
            newRecord.attendanceType === AttendanceType.TRAINER &&
            newRecord.userId && newRecord.date && newRecord.timeIn;

        if (isValidAbsent || isValidPresent) {
            try {
                const recordToSend: AttendanceCreateData = {
                    userId: newRecord.userId,
                    date: newRecord.date,
                    attendanceType: newRecord.attendanceType,
                    // For absent records, use a default time or null
                    timeIn: newRecord.status === 'INACTIVE' ? '00:00' : newRecord.timeIn,
                    ...(newRecord.hoursWorked !== null && newRecord.hoursWorked !== undefined && {
                        hoursWorked: newRecord.hoursWorked
                    }),
                    status: newRecord.status
                };

                const newRecordResponse = await attendanceService.addAttendance(recordToSend);

                // If it's an absent record, we might need to update it to reflect absent status
                const recordToAdd = {
                    ...newRecordResponse,
                    status: newRecord.status
                };

                setAttendanceRecords([...attendanceRecords, recordToAdd]);

                // Reset state
                setNewRecord({
                    userId: 0,
                    date: '',
                    timeIn: '',
                    attendanceType: AttendanceType.TRAINER,
                    hoursWorked: null,
                    timeOut: '',
                    status: 'ACTIVE'
                });
                setIsAddDialogOpen(false);
                toast.success(`Trainer ${newRecord.status} record added successfully`);
            } catch (error: any) {
                toast.error(error.message || "Failed to add attendance record");
            }
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

    const handleEdit = (record: AttendanceRecord) => {
        if (record.attendanceType !== 'TRAINER') {
            toast.error("Only trainer attendance records can be edited");
            return;
        }

        // Don't allow editing absent records
        if (record.status === 'INACTIVE') {
            toast.error("Absent records cannot be edited");
            return;
        }

        if (record.timeOut != null) {
            toast.error("This record is already closed");
            return;
        }

        setEditingRecord(record);

        const timeInString = record.timeIn;
        const date = record.date;
        const timeIn = parse(timeInString, 'HH:mm', parseISO(date));

        let hoursWorked = 0;
        if (record.timeOut != null) {
            const timeOut = parse(record.timeOut, 'HH:mm', parseISO(date));
            hoursWorked = differenceInHours(timeOut, timeIn);
        }

        setNewRecord({
            userId: record.userId,
            date: record.date,
            timeIn: record.timeIn,
            attendanceType: record.attendanceType,
            hoursWorked: hoursWorked,
            timeOut: record.timeOut || '',
            status: record.status || 'ACTIVE'
        });
        setIsAddDialogOpen(true);
    };

    const handleUpdateRecord = async () => {
        if (editingRecord) {
            try {
                if (editingRecord.timeOut == null) {
                    const checkInTime = editingRecord.timeIn;
                    const date = editingRecord.date;
                    const checkOutTime = newRecord.timeOut;

                    console.log("Check Out Time:", checkOutTime);

                    const parsedTimeIn = parse(checkInTime, 'HH:mm', parseISO(date));
                    const parsedTimeOut = parse(checkOutTime, 'HH:mm', parseISO(date));

                    const hoursWorkedCalc = differenceInHours(parsedTimeOut, parsedTimeIn);

                    console.log("Calculated hoursWorkedCalc:", hoursWorkedCalc);

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
                        attendanceType: AttendanceType.TRAINER,
                        hoursWorked: null,
                        timeOut: '',
                        status: 'ACTIVE'
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

    const handleDelete = async (id: number) => {
        try {
            await attendanceService.deleteAttendance(id);
            setAttendanceRecords(attendanceRecords.filter(record => record.id !== id));
            toast.success("Attendance record deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete attendance record");
        }
    };

    const getStatusBadge = (record: AttendanceRecord) => {
        if (record.status === 'INACTIVE') {
            return <Badge variant="destructive">Absent</Badge>;
        }
        return <Badge variant={record.timeOut == null ? 'secondary' : 'default'}>
            {record.timeOut == null ? 'Present' : 'Closed'}
        </Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Trainer Attendance</h1>
                    <p className="text-muted-foreground">Track and manage trainer attendance</p>
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
                                <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Trainer Attendance Record</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="userId">Trainer</Label>
                                    <Select
                                        value={newRecord.userId.toString()}
                                        onValueChange={(value) => setNewRecord({ ...newRecord, userId: parseInt(value) })}
                                        disabled={!!editingRecord}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a trainer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.filter(user => user.role === 'TRAINER').map((user) => (
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
                                        disabled={!!editingRecord}
                                    />
                                </div>

                                {!editingRecord && (
                                    <div>
                                        <Label htmlFor="status">Attendance Status</Label>
                                        <Select
                                            value={newRecord.status}
                                            onValueChange={(value: AttendanceStatus) => setNewRecord({ ...newRecord, status: value })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select attendance status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Present</SelectItem>
                                                <SelectItem value="INACTIVE">Absent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {!editingRecord && newRecord.status === 'ACTIVE' && (
                                    <div>
                                        <Label htmlFor="timeIn">Check In Time</Label>
                                        <Input
                                            id="timeIn"
                                            type="time"
                                            value={newRecord.timeIn}
                                            onChange={(e) => setNewRecord({ ...newRecord, timeIn: e.target.value })}
                                        />
                                    </div>
                                )}

                                {editingRecord && (
                                    <>
                                        <div>
                                            <Label htmlFor="timeOut">Check Out Time</Label>
                                            <Input
                                                id="timeOut"
                                                type="time"
                                                onChange={(e) => setNewRecord({ ...newRecord, timeOut: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                <Button onClick={editingRecord ? handleUpdateRecord : handleAddRecord} className="w-full">
                                    {editingRecord ? 'Update' : 'Add'} Record
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trainer Attendance</CardTitle>
                    <CardDescription>Daily trainer check-in, check-out and absent records</CardDescription>
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
                                            {record.status === 'INACTIVE' ? '-' : formatTime(record.timeIn)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Check Out</p>
                                        <p className="text-sm text-muted-foreground">
                                            {record.status === 'INACTIVE' ? '-' : formatTime(record.timeOut)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Hours Worked</p>
                                        <p className="text-sm text-muted-foreground">
                                            {record.status === 'INACTIVE' ? '-' : (record.hoursWorked != null && typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : '-')}
                                        </p>
                                    </div>
                                    {getStatusBadge(record)}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(record)}
                                        disabled={record.timeOut != null || record.status === 'INACTIVE'}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(record.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}