import { useState, useEffect, useRef } from 'react';
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
import { ListSkeleton } from '@/components/ui/loading';
import { initials, displayName } from '@/lib/text';
import { Pager } from '@/components/ui/pager';
import { usePending } from '@/hooks/use-pending';

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
    const [recordsLoading, setRecordsLoading] = useState(true);
    // Paging: the server returns one page (newest first) and does the name search.
    const PAGE_SIZE = 20;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [query, setQuery] = useState(''); // the search text after a short typing pause
    const latestRequest = useRef(0); // ignores a slow response that arrives after a newer one
    // Which records this page manages: trainer shifts or member check-ins.
    const [recordType, setRecordType] = useState<AttendanceType>(AttendanceType.TRAINER);
    const isTrainer = recordType === AttendanceType.TRAINER;
    const personLabel = isTrainer ? 'Trainer' : 'Member';


    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        // Create a Date using today's date + given time
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'hh:mm a'); // 12-hour format with AM/PM
        // return format(date, 'HH:mm'); // (for 24-hour format if you prefer)
    };


    // People for the "add record" form: reloaded when switching between trainers and members.
    useEffect(() => {
        fetchUsers();
        setNewRecord(prev => ({ ...prev, userId: 0, attendanceType: recordType }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordType]);

    // Wait for a pause in typing, then search from the first page.
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(searchTerm.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchAttendanceData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordType, query, page]);

    const fetchAttendanceData = async () => {
        const requestId = ++latestRequest.current;
        setRecordsLoading(true);
        try {
            const result = await attendanceService.getAllAttendance(recordType, { page, size: PAGE_SIZE, keyword: query });
            if (requestId !== latestRequest.current) return; // a newer request is on its way
            setAttendanceRecords(result.records);
            setTotalItems(result.totalItems);
            setTotalPages(result.totalPages);
            // Records were removed and this page no longer exists: go to the last one.
            if (page > result.totalPages) setPage(result.totalPages);
        } catch (error) {
            if (requestId === latestRequest.current) toast.error(error.message || "Failed to fetch attendance data");
        } finally {
            if (requestId === latestRequest.current) setRecordsLoading(false);
        }
    };

    const changeType = (type: AttendanceType) => {
        if (type === recordType) return;
        setAttendanceRecords([]);
        setTotalItems(0);
        setPage(1);
        setRecordType(type);
    };

    const fetchUsers = async () => {
        try {
            const usersData = await attendanceService.getAllUsers(isTrainer ? 'trainer' : 'member');
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error(error.message || "Failed to fetch users");
        }
    };

    const pending = usePending();

    const handleAddRecord = async () => {
        // Absent: person and date. Present: also the check-in time.
        const isValidAbsent = newRecord.status === 'INACTIVE' && newRecord.userId && newRecord.date;
        const isValidPresent = newRecord.status === 'ACTIVE' && newRecord.userId && newRecord.date && newRecord.timeIn;

        if (isValidAbsent || isValidPresent) {
            try {
                const recordToSend: AttendanceCreateData = {
                    userId: newRecord.userId,
                    date: newRecord.date,
                    attendanceType: recordType,
                    // For absent records, use a default time or null
                    timeIn: newRecord.status === 'INACTIVE' ? '00:00' : newRecord.timeIn,
                    ...(isTrainer && newRecord.hoursWorked !== null && newRecord.hoursWorked !== undefined && {
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

                // New records are the newest, so they belong on the first page.
                if (page === 1) fetchAttendanceData(); else setPage(1);

                // Reset state
                setNewRecord({
                    userId: 0,
                    date: '',
                    timeIn: '',
                    attendanceType: recordType,
                    hoursWorked: null,
                    timeOut: '',
                    status: 'ACTIVE'
                });
                setIsAddDialogOpen(false);
                toast.success(`${personLabel} ${newRecord.status === 'ACTIVE' ? 'check-in' : 'absence'} recorded`);
            } catch (error) {
                toast.error(error.message || "Failed to add attendance record");
            }
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

    const handleEdit = (record: AttendanceRecord) => {
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


                    const parsedTimeIn = parse(checkInTime, 'HH:mm', parseISO(date));
                    const parsedTimeOut = parse(checkOutTime, 'HH:mm', parseISO(date));

                    const hoursWorkedCalc = differenceInHours(parsedTimeOut, parsedTimeIn);


                    // Hours worked only matter for trainers (salary); members just check out.
                    const updateData = {
                        timeOut: checkOutTime,
                        hoursWorked: isTrainer ? hoursWorkedCalc : null,
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
                        attendanceType: recordType,
                        hoursWorked: null,
                        timeOut: '',
                        status: 'ACTIVE'
                    });
                    setIsAddDialogOpen(false);
                    toast.success("Check-out time saved");
                } else {
                    toast.error("Attendance Time Out already recorded")
                }
            } catch (error) {
                toast.error(error.message || "Failed to update attendance record");
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await attendanceService.deleteAttendance(id);
            // Reload so the page refills from the next records and the counts stay right.
            if (attendanceRecords.length === 1 && page > 1) setPage(page - 1); else fetchAttendanceData();
            toast.success("Attendance record deleted successfully");
        } catch (error) {
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Attendance</h1>
                    <p className="text-muted-foreground">Record trainer shifts and member check-ins</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Trainers / Members switch */}
                    <div className="inline-flex rounded-md border p-1">
                        {[AttendanceType.TRAINER, AttendanceType.MEMBER].map(type => (
                            <Button key={type} size="sm" variant={recordType === type ? 'default' : 'ghost'}
                                onClick={() => changeType(type)}>
                                {type === AttendanceType.TRAINER ? 'Trainers' : 'Members'}
                            </Button>
                        ))}
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingRecord(null)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Record
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingRecord ? 'Check out' : 'Add'} {personLabel} Attendance</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="userId">{personLabel}</Label>
                                    <Select
                                        value={newRecord.userId.toString()}
                                        onValueChange={(value) => setNewRecord({ ...newRecord, userId: parseInt(value) })}
                                        disabled={!!editingRecord}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={`Select a ${personLabel.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.filter(user => user.role === recordType).map((user) => (
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

                                <Button onClick={() => pending.run('save', editingRecord ? handleUpdateRecord : handleAddRecord)} loading={pending.isPending('save')} className="w-full">
                                    {editingRecord ? 'Update' : 'Add'} Record
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{personLabel} Attendance</CardTitle>
                    <CardDescription>Last 30 days, newest first: check-in, check-out and absences</CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${personLabel.toLowerCase()}s...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {recordsLoading ? <ListSkeleton rows={6} /> : (
                    <div className="space-y-4">
                        {attendanceRecords.map((record) => (
                            <div key={record.id} className="flex flex-col gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium">
                                        {initials(record.userName)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">{displayName(record.userName, 'Profile not completed')}</p>
                                        <p className="text-sm text-muted-foreground">{format(parseISO(record.date), 'MM/dd/yyyy')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                                        <p className="text-sm font-medium">{isTrainer ? 'Hours Worked' : 'Visit #'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {record.status === 'INACTIVE' ? '-' : isTrainer ? (record.hoursWorked != null && typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : '-') : (record.packageDays ?? '-')}
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
                                    <Button variant="outline" size="sm" loading={pending.isPending(`del-${record.id}`)} onClick={() => pending.run(`del-${record.id}`, () => handleDelete(record.id))}>
                                        {!pending.isPending(`del-${record.id}`) && <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {attendanceRecords.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">
                                {query ? `No ${personLabel.toLowerCase()} attendance matches "${query}".` : `No ${personLabel.toLowerCase()} attendance in the last 30 days.`}
                            </p>
                        )}
                    </div>
                    )}
                    <Pager
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                        disabled={recordsLoading}
                        noun="records"
                    />
                </CardContent>
            </Card>
        </div>
    );
}