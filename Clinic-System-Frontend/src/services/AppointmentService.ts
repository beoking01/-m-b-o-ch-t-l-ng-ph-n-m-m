import axios from 'axios';
import api from './Api';
export type AppointmentPayload = {
    _id?: string;

    booker_id?: string;
    healthProfile_id?: string;

    doctor_id?: string;
    specialty_id?: string;
    appointment_date?: string;
    time_slot?: string;
    appointmentDate?: string;
    timeSlot?: string;

    reason?: string;
    notes?: string;
    status?: string;
    createdAt?: string;
};
export type AppointmentMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
export interface AppointmentByDoctorPayload {
    booker_id: string;
    healthProfile_id: string;
    doctor_id: string;
    appointmentDate: string; // ISO string
    timeSlot: string;
    reason: string;
}
export interface AppointmentBySpecialtyPayload {
    booker_id: string;
    healthProfile_id: string;
    specialty_id: string;
    appointmentDate: string; // ISO string
    timeSlot: string;
    reason: string;
}
export interface AppointmentResponse {
    _id: string;
    // ... các field khác trả về sau này
}

export interface HealthProfileOwner {
    _id: string;
    name: string;
    dob: string;
    gender: string;
    phone: string;
}

export interface HealthProfile {
    _id: string;
    height: number;
    weight: number;
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
    owner_detail: HealthProfileOwner;
}

// Snapshot interfaces cho optimized queries
export interface PatientSnapshot {
    name: string;
    dob?: string;
    phone?: string;
    gender?: string;
    ownerModel?: string;
}

export interface DoctorSnapshot {
    name: string;
    phone?: string;
    experience?: number;
    avatar?: string;
}

export interface SpecialtySnapshot {
    name: string;
    description?: string;
}

export interface AppointmentModel {
    _id: string;
    booker_id: string;
    doctor_id: string;
    healthProfile_id?: string | HealthProfile; // Có thể là ID hoặc populated object
    specialty_id: string;
    appointmentDate: string;
    timeSlot: string;
    reason: string;
    status: string;
    createdAt: string;
    // Snapshot fields - được trả về từ optimized queries
    patient?: PatientSnapshot;
    patientSnapshot?: PatientSnapshot;
    doctor?: DoctorSnapshot;
    doctorSnapshot?: DoctorSnapshot;
    specialty?: SpecialtySnapshot;
    specialtySnapshot?: SpecialtySnapshot;
}

export interface ListAppointmentByDoctorResponse {
    count: number;
    appointments: AppointmentModel[];
}

export interface DoctorDetail {
    _id: string;
    accountId: string;
    name: string;
    specialtyId: string;
    phone: string;
    experience: number;
}

export interface SpecialtyDetail {
    _id: string;
    name: string;
    description: string;
}

export interface BookerAppointmentModel {
    _id: string;
    booker_id: string;
    healthProfile_id: HealthProfile;
    appointmentDate: string;
    timeSlot: string;
    reason: string;
    status: string;
    createdAt: string;
    // Snapshot fields from backend
    doctor?: DoctorSnapshot;
    doctorSnapshot?: DoctorSnapshot;
    specialty?: SpecialtySnapshot;
    specialtySnapshot?: SpecialtySnapshot;
    patient?: PatientSnapshot;
    patientSnapshot?: PatientSnapshot;
}

export interface ListAppointmentByBookerResponse {
    count: number;
    appointments: BookerAppointmentModel[];
}

export async function getAppointments(params: any = {}): Promise<{ items: AppointmentPayload[]; meta: AppointmentMeta | null }> {
    const url = `/appointments`;
    const res = await api.get(url, { params, withCredentials: true });
    const items: AppointmentPayload[] = res?.data?.data ?? res?.data?.appointments ?? res?.data?.items ?? res?.data ?? [];
    const meta: AppointmentMeta | null = res?.data?.meta ?? null;
    return { items, meta };
}
export async function getAppointment(id: string): Promise<AppointmentPayload> {
    const url = `appointments/${id}`;
    const res = await api.get(url, { withCredentials: true });
    return res?.data ?? null;
}
export async function updateAppointment(id: string, payload: Partial<AppointmentPayload>): Promise<AppointmentPayload> {
    const url = `appointments/${id}`;
    const res = await api.put(url, payload, { withCredentials: true });
    return res?.data ?? null;
}
export async function assignDoctor(appointment_id: string, doctor_id: string) {
    const url = `appointments/${appointment_id}/assign-doctor`;
    // Backend expects a PUT to /appointments/:id/assign-doctor with { doctor_id }
    const res = await api.put(url, { doctor_id }, { withCredentials: true });
    return res?.data ?? null;
}
export async function createAppointment(payload: any): Promise<AppointmentPayload> {
    const url = `appointments`;
    const res = await api.post(url, payload, { withCredentials: true });
    return res?.data ?? null;
}
export async function createAppointmentBySpecialty(payload: AppointmentBySpecialtyPayload): Promise<AppointmentResponse> {
    const url = `/appointments/by-specialty`;

    try {
        const res = await api.post(url, payload);
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Đã xảy ra lỗi khi tạo lịch hẹn.");
        }
        throw new Error("Lỗi kết nối hoặc xử lý không xác định.");
    }
}

export async function createAppointmentByDoctor(payload: AppointmentByDoctorPayload): Promise<AppointmentResponse> {
    const url = `/appointments/by-doctor`;

    try {
        const res = await api.post(url, payload);
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Đã xảy ra lỗi khi tạo lịch hẹn.");
        }
        throw new Error("Lỗi kết nối hoặc xử lý không xác định.");
    }
}

export async function getAppointmentsByDoctor(doctorId: string): Promise<ListAppointmentByDoctorResponse> {
    const url = `/appointments/doctor/${doctorId}`;

    try {
        const res = await api.get(url);
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi lấy lịch hẹn bác sĩ.");
        }
        throw new Error("Lỗi kết nối server");
    }
}

export async function getAppointmentsByBooker(bookerId: string): Promise<ListAppointmentByBookerResponse> {
    const url = `/appointments/booker/${bookerId}`;
    try {
        const res = await api.get(url);
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi lấy lịch hẹn người đặt.");
        }
        throw new Error("Lỗi kết nối server");
    }
}

export async function deleteAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
    const url = `/appointments/${appointmentId}`;
    const res = await api.delete(url, { withCredentials: true });
    return res?.data ?? { success: false, message: 'Xoá thất bại' };
}
export async function cancelAppointment(appointmentId: string): Promise<AppointmentPayload> {
    const url = `/appointments/${appointmentId}/cancel`;
    try {
        const res = await api.put(url);
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi hủy lịch hẹn.");
        }
        throw new Error("Lỗi kết nối server");
    }
}

export async function getAppointmentsByDoctorToday(doctorId: string): Promise<ListAppointmentByDoctorResponse> {
    const url = `/appointments/doctor/${doctorId}/today`;
    try {
        const res = await api.get(url);
        return res.data;
    }
    catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi lấy lịch hẹn bác sĩ hôm nay.");
        }
        throw new Error("Lỗi kết nối server");
    }
}

export async function confirmAppointment(appointmentId: string): Promise<AppointmentPayload> {
    const url = `/appointments/${appointmentId}/confirm`;
    try {
        const res = await api.put(url);
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi xác nhận lịch hẹn.");
        }
        throw new Error("Lỗi kết nối server");
    }
}

export interface MonthAppointmentResponse {
    count: number;
    appointments: BookerAppointmentModel[];
    month: number;
    year: number;
}

export interface MonthAppointmentByDoctorResponse {
    count: number;
    appointments: AppointmentModel[];
    month: number;
    year: number;
}

export async function getMonthAppointmentByBooker(
    bookerId: string,
    year?: number,
    month?: number,
    status?: string
): Promise<MonthAppointmentResponse> {
    const url = `/appointments/booker/${bookerId}/month`;
    
    try {
        const params: any = {};
        
        // Nếu có year và month, tạo date string
        if (year && month) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
            params.date = dateStr;
        }
        
        if (status) {
            params.status = status;
        }
        
        const res = await api.get(url, { params });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi lấy lịch hẹn tháng.");
        }
        throw new Error("Lỗi kết nối server");
    }
}

export async function getMonthAppointmentByDoctor(
    doctorId: string,
    year?: number,
    month?: number,
    status?: string
): Promise<MonthAppointmentByDoctorResponse> {
    const url = `/appointments/doctor/${doctorId}/month`;
    
    try {
        const params: any = {};
        
        // Nếu có year và month, tạo date string
        if (year && month) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
            params.date = dateStr;
        }
        
        if (status) {
            params.status = status;
        }
        
        const res = await api.get(url, { params });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Lỗi lấy lịch hẹn tháng của bác sĩ.");
        }
        throw new Error("Lỗi kết nối server");
    }
}