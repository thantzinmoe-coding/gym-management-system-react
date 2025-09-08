// src/services/attendanceService.ts
import api from '@/services/api';
import { format, parseISO, differenceInHours, parse } from 'date-fns';
// Define your data types (align with backend DTOs)
export interface AttendanceRecord {
    id: number;
    userId: number; // Changed back to userId
    userName: string;
    userRole: string;
    date: string; // ISO string
    timeIn: string;
    timeOut: string | null;
    attendanceType: 'MEMBER' | 'TRAINER'; // Or use your enum
    hoursWorked: number | null;
    packageDays: number | null;
    hoursWorkedFrontend?: number | null;
}

export interface AttendanceCreateData {
    userId: number; // Changed back to userId
    date: string; // ISO string
    timeIn: string;
    attendanceType: 'MEMBER' | 'TRAINER';
    hoursWorked?: number;
    packageDays?: number;
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

// Helper function to extract data from ApiResponse
const extractData = (response: any) => {
    if (response && response.data && response.data.attendance) {
        return response.data.attendance;
    }
    return null;
};

// Helper function to extract list of attendances from ApiResponse
// Helper function to extract list of attendances from ApiResponse
const extractAttendances = (response: any) => {
    if (response && response.data && response.data.attendances) {
        return response.data.attendances.map((attendance: any) => {

            const timeInString = attendance.timeIn;
             // Use the date to correctly calculate the date.
            const date = attendance.date;

            const timeIn = parse(timeInString, 'HH:mm', parseISO(date));

            let hoursWorked = attendance.hoursWorked;

            // set timeOut value
            const timeOutString = attendance.timeOut;

            // set the hours worked
            if (timeOutString != null) {
                const timeOut = parse(timeOutString, 'HH:mm', parseISO(date));
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
            };
        });
    }
    return [];
};

//Helper function to extract user ID
const extractUserId = (response: any) => {
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

//Updated get All Users
const getAllUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get<PaginatedResponse<SuperAdminDashBoardResponse>>(`${superAdminUrl}/all-users`);
        return extractUsers(response.data);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
};

export const attendanceService = {
    getAllAttendance: async (): Promise<AttendanceRecord[]> => {
        try {
            const response = await api.get(`${attendanceUrl}`);
            return extractAttendances(response.data);
        } catch (error: any) {
            console.error('Error fetching all attendance:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch all attendance');
        }
    },

    getAttendanceById: async (id: number): Promise<AttendanceRecord> => {
        try {
            const response = await api.get(`${attendanceUrl}/${id}`);
            return extractData(response.data);
        } catch (error: any) {
            console.error(`Error fetching attendance with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
        }
    },

    //NEW FUNCTION TO GET USER ID
    getUserIdByEmail: async (userEmail: string): Promise<number> => {
        try {
            const response = await api.get(`${superAdminUrl}/all-users/email/${userEmail}`); // ASSUME THIS WORKS
            return extractUserId(response.data);
        } catch (error: any) {
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
        } catch (error: any) {
            console.error('Error adding attendance:', error);
            throw new Error(error.response?.data?.message || 'Failed to add attendance');
        }
    },

    updateAttendance: async (id: number, data: AttendanceUpdateData): Promise<AttendanceRecord> => {
        try {
            const response = await api.patch(`${attendanceUrl}/${id}`, data);
            return extractData(response.data);
        } catch (error: any) {
            console.error(`Error updating attendance with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to update attendance');
        }
    },

    deleteAttendance: async (id: number): Promise<void> => {
        try {
            await api.delete(`${attendanceUrl}/${id}`);
        } catch (error: any) {
            console.error(`Error deleting attendance with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to delete attendance');
        }
    }
};