// src/pages/ViewAttendance.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, CheckCircle, XCircle, Search, Timer } from 'lucide-react'; // Import Timer icon
// Ensure the import path is correct and includes TrainerAttendanceRecord and attendanceService
import { attendanceService, TrainerAttendanceRecord } from '@/services/attendanceService'; // Assuming TrainerAttendanceRecord is exported and available here
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import { format, parseISO, parse, differenceInHours, isValid } from 'date-fns'; // Import necessary date-fns functions
import { authService } from '@/services/authService'; // To get the current trainer's ID

// Define an interface for the attendance record as displayed in ViewAttendance
interface SessionAttendanceRecord {
  id: number | string;
  date: string;
  timeSlot: string;
  status: 'present' | 'absent'; // Keep only present/absent as per your last ManageAttendance changes
  clientName: string;
  packageName: string;
  sessionType: string;
  notes?: string;
  workHours: number | null; // Field for calculated work hours per session
}

export default function ViewAttendance() {
  // State for attendance records fetched from the API
  const [attendance, setAttendance] = useState<SessionAttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the currently logged-in trainer's ID from authService
  const trainer = authService.getCurrentUser();
  const currentTrainerId = trainer ? Number(trainer.id) : null; // Ensure it's a number or null

  useEffect(() => {
    const fetchAttendanceForTrainer = async () => {
      if (currentTrainerId === null) {
        setError("Trainer not identified. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch records, assuming getTrainerAttendanceRecords returns data compatible with TrainerAttendanceRecord interface
        const fetchedRecords: TrainerAttendanceRecord[] = await attendanceService.getTrainerAttendanceRecords(currentTrainerId);

        const formattedRecords: SessionAttendanceRecord[] = fetchedRecords.map((record: TrainerAttendanceRecord) => {
          const dateObj = record.date ? parseISO(record.date) : null;
          const isValidDate = dateObj && isValid(dateObj);
          const formattedDate = isValidDate ? format(dateObj, 'yyyy-MM-dd') : 'N/A';

          // --- Status Determination Logic ---
          // Prioritize the 'status' field from the backend if it's valid ('present' or 'absent')
          let resolvedStatus: 'present' | 'absent' = 'absent'; // Default to absent

          if (record.status === 'present' || record.status === 'absent') {
            resolvedStatus = record.status;
          } else {
            // Fallback: If backend status is not clear, derive from timeIn/timeOut
            const startTimeStr = record.timeIn;
            const endTimeStr = record.timeOut;

            if (startTimeStr && endTimeStr && isValidDate) {
                // If both times are present and valid, it's considered present
                resolvedStatus = 'present';
            } else if (startTimeStr && !endTimeStr && isValidDate) {
                // If only check-in exists, and it's not '00:00' placeholder, it's present
                resolvedStatus = 'present';
            } else {
                // If no valid times or explicit '00:00' with no end time, it defaults to absent.
                resolvedStatus = 'absent';
            }
          }
          // --- End Status Determination Logic ---


          // --- Time Slot and Work Hours Calculation ---
          let timeSlot = '--:-- AM - --:-- AM'; // Default display
          let workHours: number | null = null;

          if (resolvedStatus === 'present' && isValidDate) {
            const startTimeStr = record.timeIn;
            const endTimeStr = record.timeOut;

            // Check if start time is '00:00' specifically for absent display
            if (startTimeStr === '00:00' && !endTimeStr) {
                 // This record was likely marked absent via admin with '00:00' as placeholder
                 resolvedStatus = 'absent'; // Ensure it's marked absent
                 timeSlot = '00:00 - --- AM'; // Display as absent
            } else if (startTimeStr) {
                const checkIn = parse(`${formattedDate} ${startTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
                if (isValid(checkIn)) {
                    timeSlot = format(checkIn, 'hh:mm a'); // Start with check-in time
                    if (endTimeStr) {
                        const checkOut = parse(`${formattedDate} ${endTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
                        if (isValid(checkOut)) {
                            const diffInHours = differenceInHours(checkOut, checkIn);
                            workHours = diffInHours >= 0 ? diffInHours : 0; // Ensure non-negative hours
                            timeSlot = `${format(checkIn, 'hh:mm a')} - ${format(checkOut, 'hh:mm a')}`;
                        } else {
                            // If checkout is invalid, show only check-in and mark as incomplete session
                            timeSlot = `${format(checkIn, 'hh:mm a')} - --:-- AM`;
                        }
                    } else {
                        // If only check-in exists, show it as incomplete
                        timeSlot = `${format(checkIn, 'hh:mm a')} - --:-- AM`;
                    }
                }
            }
          } else if (resolvedStatus === 'absent') {
              // Explicitly set placeholder for absent records
              timeSlot = '00:00 - --- AM';
              workHours = null;
          }
          // --- End Time Slot and Work Hours Calculation ---

          return {
            id: record.id,
            date: formattedDate,
            timeSlot: timeSlot,
            status: resolvedStatus, // Use the determined status
            clientName: record.clientName,
            packageName: record.packageName,
            sessionType: record.sessionType,
            notes: record.notes,
            workHours: workHours,
          };
        });

        setAttendance(formattedRecords);

      } catch (err: any) {
        console.error("Error fetching trainer attendance:", err);
        setError(err.message || "Could not fetch attendance records.");
        toast.error(err.message || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if currentTrainerId is valid
    if (currentTrainerId !== null) {
        fetchAttendanceForTrainer();
    } else {
        setError("Trainer not identified. Please log in.");
        setLoading(false);
    }
  // Re-added currentTrainerId and toast to dependency array.
  }, [currentTrainerId, toast]);

  // Filter attendance based on search term and selected date
  const filteredAttendance = attendance.filter(record => {
    // Use '-' if clientName or packageName are empty strings, null, or undefined.
    const clientName = record.clientName || '-';
    const packageName = record.packageName || '-';

    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate === '' || record.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Helper functions for status badges and icons
  const getStatusBadge = (status: 'present' | 'absent') => {
    switch (status) {
      case 'present':
        // Using 'default' variant for present, custom color via className if needed.
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>; // Fallback
    }
  };

  const getStatusIcon = (status: 'present' | 'absent') => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null; // Fallback
    }
  };

  // Calculate summary statistics based on the filtered attendance
  const totalSessions = filteredAttendance.length;
  const presentSessions = filteredAttendance.filter(a => a.status === 'present').length;
  const absentSessions = filteredAttendance.filter(a => a.status === 'absent').length;

  // Calculate total work hours from the filtered attendance
  const totalWorkHours = filteredAttendance.reduce((sum, record) => {
      // Only add work hours if they are valid numbers, status is 'present', and hours are not null/NaN.
      return sum + (record.status === 'present' && record.workHours !== null && !isNaN(record.workHours) ? record.workHours : 0);
  }, 0);

  // Attendance rate calculation only considers present vs total sessions
  const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

  // Render Loading or Error states
  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <p>Loading attendance...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex justify-center items-center h-screen text-destructive">
              <p>{error}</p>
          </div>
      );
  }

  // Main component rendering
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your training session attendance and client records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Summary Card: Total Sessions */}
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

        {/* Summary Card: Present */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentSessions}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceRate}% attendance rate
            </p>
          </CardContent>
        </Card>

        {/* Summary Card: Absent */}
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

        {/* NEW SUMMARY CARD FOR TOTAL WORK HOURS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Hours</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Format totalWorkHours to 2 decimal places for consistency */}
            <div className="text-2xl font-bold text-primary">{totalWorkHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        {/* END NEW SUMMARY CARD */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Records</CardTitle>
          <CardDescription>View detailed attendance records for your training sessions</CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
           
            {/* Date Filter */}
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-sm"
            />
            {/* Clear Filters Button */}
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
            {/* Map through filtered attendance records to display each session */}
            {filteredAttendance.map((record) => (
              <div key={record.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  {/* Client Info and Status Icon */}
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                  </div>
                  {/* Status Badge */}
                  {getStatusBadge(record.status)}
                </div>
                
                {/* Session Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{record.date}</span>
                  </div>
                  
                  {/* Time Slot - Show '-' if absent, otherwise show calculated timeSlot */}
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{record.status === 'present' ? record.timeSlot : '-'}</span>
                  </div>
                  
                  {/* Session Type - Show '-' if empty */}
                </div>
                
                {/* Work Hours - Display only if status is 'present' and hours are valid */}
                {record.status === 'present' && record.workHours !== null && !isNaN(record.workHours) && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>{record.workHours.toFixed(2)} hrs</span>
                  </div>
                )}
                
                {/* Notes Section - Display if notes exist */}
                {record.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {record.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Conditional rendering for "no records found" message */}
            {filteredAttendance.length === 0 && !loading && !error && (
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