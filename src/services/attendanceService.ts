// src/services/attendanceService.ts
import api from '@/services/api';
import { format, parseISO, differenceInHours, parse } from 'date-fns';
import { stat } from 'fs';


export enum AttendanceType {
    MEMBER = 'MEMBER',
    TRAINER = 'TRAINER'
}

export interface AttendanceCreateData {
    userId: number;
    date: string;
    attendanceType: AttendanceType; // Use enum
    
    timeIn?: string;
    hoursWorked?: number;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface AttendanceRecord {
    id: number;
    userId: number;
    userName: string;
    userRole: string;
    date: string;
    timeIn: string;
    timeOut: string | null;
    attendanceType: AttendanceType; // Use enum
    hoursWorked: number | null;
    packageDays: number | null;
    hoursWorkedFrontend?: number | null;
    status : 'ACTIVE' | 'INACTIVE';
}
// Define your data types (align with backend DTOs)
export interface TrainerAttendanceRecord { // Make sure this is exported if used directly
    id: number | string;
    date: string;
    timeIn: string;
    timeOut: string | null;
    clientName: string;
    packageName: string;
    sessionType: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
}


interface AttendanceUpdateData {
    timeOut: string;
    hoursWorked?: number | null
}

export interface User {
    userId: number;
    userEmail: string;
    userName: string;
    role: string;
}

//Duplicate Type
interface SuperAdminDashBoardResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    status: string;
}

//New Interface
interface PaginatedResponse<T> {
    data: T[];
    totalPages: number;
    totalElements: number;
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
}

const basePath = '/api/v1'; // Replace with your actual base path
const attendanceUrl = `${basePath}/attendance`;
const superAdminUrl = `${basePath}/super_admin`; // Super Admin API

// Attendance record as the backend returns it.
interface RawAttendance {
    id: number;
    userId: number;
    userName: string;
    userRole: string;
    date: string;
    timeIn: string;
    timeOut: string | null;
    attendanceType: AttendanceType;
    hoursWorked: number | null;
    packageDays: number | null;
    status: 'ACTIVE' | 'INACTIVE';
}

interface AttendanceApiResponse {
    data?: { attendance?: RawAttendance; attendances?: RawAttendance[]; userId?: number };
}

// Helper function to extract data from ApiResponse
const extractData = (response: AttendanceApiResponse) => {
    if (response && response.data && response.data.attendance) {
        return response.data.attendance;
    }
    return null;
};
const extractTrainerAttendance = (response: AttendanceApiResponse): TrainerAttendanceRecord[] => {
    if (response && response.data && Array.isArray(response.data.attendances)) {
        return response.data.attendances.map((attendance: RawAttendance) => {
            return {
                id: attendance.id,
                date: attendance.date,
                timeIn: attendance.timeIn,
                timeOut: attendance.timeOut,
                // The backend sends who attended and the record type; it has no package/session fields.
                clientName: attendance.userName || 'N/A',
                packageName: 'N/A',
                sessionType: attendance.attendanceType === AttendanceType.MEMBER ? 'Member visit' : 'Trainer shift',
                // ACTIVE = present, INACTIVE = absent
                status: attendance.status === 'INACTIVE' ? 'absent' : 'present',
                notes: undefined
            };
        });
    }
    return [];
};
const getTrainerAttendanceRecords = async (trainerId: number): Promise<TrainerAttendanceRecord[]> => {
    try {
        // IMPORTANT: Ensure this API path matches your backend.
        const response = await api.get(`${basePath}/attendance/trainer/${trainerId}`); // Adjust URL as per your backend
        return extractTrainerAttendance(response.data);
    } catch (error) {
        console.error(`Error fetching attendance for trainer ID ${trainerId}:`, error);
        throw new Error(error.response?.data?.message || 'Failed to fetch trainer attendance');
    }
};
// Turns one record from the backend into the shape the pages use (hours worked from the times).
const toAttendanceRecord = (attendance: RawAttendance): AttendanceRecord => {
    const date = attendance.date;
    let hoursWorked = attendance.hoursWorked;

    if (attendance.timeOut != null) {
        const timeIn = parse(attendance.timeIn, 'HH:mm', parseISO(date));
        const timeOut = parse(attendance.timeOut, 'HH:mm', parseISO(date));
        hoursWorked = differenceInHours(timeOut, timeIn);
    }

    return {
        id: attendance.id,
        userId: attendance.userId,
        userName: attendance.userName,
        userRole: attendance.userRole,
        date: attendance.date,
        timeIn: attendance.timeIn,
        timeOut: attendance.timeOut,
        attendanceType: attendance.attendanceType,
        hoursWorked: hoursWorked,
        packageDays: attendance.packageDays,
        status: attendance.status,
    };
};

const extractAttendances = (response: AttendanceApiResponse) =>
    (response?.data?.attendances ?? []).map(toAttendanceRecord);

//Helper function to extract user ID
const extractUserId = (response: AttendanceApiResponse) => {
    if (response && response.data && response.data.userId) {
        return response.data.userId;
    }
    return null;
}

// Helper function to extract users from PaginatedApiResponse
const extractUsers = (response: PaginatedResponse<SuperAdminDashBoardResponse>) => {
    if (response && response.data) {
        return response.data.map(user => ({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            role: user.role,

        }));
    }
    return [];
};

// Active users of one role (trainers by default), for the attendance form's person picker.
const getAllUsers = async (role: 'trainer' | 'member' = 'trainer'): Promise<User[]> => {
    try {
        const response = await api.get<PaginatedResponse<SuperAdminDashBoardResponse>>(
            `${superAdminUrl}/all-users`, { params: { role, status: 'active', page: 0, size: 1000 } });
        return extractUsers(response.data);
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
};

export interface AttendancePage {
    records: AttendanceRecord[];
    totalItems: number;
    totalPages: number;
}

export const attendanceService = {
    /** One page of records, newest first. Type, name search and paging all happen on the server. */
    getAllAttendance: async (
        type: AttendanceType | undefined,
        options: { page?: number; size?: number; keyword?: string; days?: number } = {},
    ): Promise<AttendancePage> => {
        const { page = 1, size = 20, keyword, days = 30 } = options;
        try {
            const response = await api.get(`${attendanceUrl}`, {
                params: { type, days, page: page - 1, size, keyword: keyword || undefined }, // the API counts pages from 0
            });
            const body = response.data;
            return {
                records: ((body?.data ?? []) as RawAttendance[]).map(toAttendanceRecord),
                totalItems: body?.meta?.totalItems ?? 0,
                totalPages: Math.max(1, body?.meta?.totalPages ?? 1),
            };
        } catch (error) {
            console.error('Error fetching all attendance:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch all attendance');
        }
    },

    getAttendanceById: async (id: number): Promise<AttendanceRecord> => {
        try {
            const response = await api.get(`${attendanceUrl}/${id}`);
            return extractData(response.data);
        } catch (error) {
            console.error(`Error fetching attendance with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
        }
    },

    //NEW FUNCTION TO GET USER ID
    getUserIdByEmail: async (userEmail: string): Promise<number> => {
        try {
            const response = await api.get(`${superAdminUrl}/all-users/email/${userEmail}`); // ASSUME THIS WORKS
            return extractUserId(response.data);
        } catch (error) {
            console.error(`Error fetching user ID with email ${userEmail}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch user ID');
        }
    },

    //NEW FUNCTION TO GET ALL USERS
    getAllUsers: getAllUsers,

    addAttendance: async (data: AttendanceCreateData): Promise<AttendanceRecord> => {
        try {
            const response = await api.post(`${attendanceUrl}`, data);
            return extractData(response.data);
        } catch (error) {
            console.error('Error adding attendance:', error);
            throw new Error(error.response?.data?.message || 'Failed to add attendance');
        }
    },

    updateAttendance: async (id: number, data: AttendanceUpdateData): Promise<AttendanceRecord> => {
        try {
            const response = await api.patch(`${attendanceUrl}/${id}`, data);
            return extractData(response.data);
        } catch (error) {
            console.error(`Error updating attendance with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to update attendance');
        }
    },

    deleteAttendance: async (id: number): Promise<void> => {
        try {
            await api.delete(`${attendanceUrl}/${id}`);
        } catch (error) {
            console.error(`Error deleting attendance with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to delete attendance');
        }
    },
    getTrainerAttendanceRecords: async (trainerId: number): Promise<TrainerAttendanceRecord[]> => {
        try {
            // Ensure this API path matches your backend
            const response = await api.get(`${basePath}/attendance/trainer/${trainerId}`); // Adjust URL as per your backend
            return extractTrainerAttendance(response.data);
        } catch (error) {
            console.error(`Error fetching attendance for trainer ID ${trainerId}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch trainer attendance');
        }
    },
};