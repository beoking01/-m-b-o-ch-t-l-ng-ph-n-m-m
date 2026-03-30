import api from "./Api";


export type CreateTreatmentDto = {
    healthProfile: string;
    doctor: string;
    appointment: string;
    treatmentDate?: string;   // ISO date string
    diagnosis: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    symptoms: string;

    // optional
    prescription?: string | null;
    laborder?: string | null;
};

export interface Doctor {
    _id: string;
    name: string;
    phone: string;
    specialtyId?: string;
    specialtyName?: string;
}

export interface HealthProfile {
    _id: string;
    ownerId: string;
    ownerModel: string;
    ownerName: string;
    ownerDob: string;
    ownerPhone: string;
    ownerGender: string;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
}

export interface Appointment {
    _id: string;
    appointmentDate: string;
    timeSlot: string;
    reason?: string;
}

export interface LabOrder {
    testTime: string;
    totalPrice: number;
    items: {
        _id?: string;
        serviceId: string | {
            _id: string;
            name: string;
            price: number;
        };
        serviceName?: string;
        quantity: number;
        description: string;
        price?: number;
    }[];
}

export interface Prescription {
    created_at: string;
    totalPrice: number;
    items: {
        _id?: string;
        medicineId: string | {
            _id: string;
            name: string;
            manufacturer: string;
            unit: string;
            expiryDate?: string;
            price: number;
        };
        medicineName?: string;
        quantity: number;
        dosage: string;
        frequency: string;
        duration: string;
        instruction: string;
        unit?: string;
        manufacturer?: string;
        price?: number;
    }[];
}

export interface Treatment {
    _id: string;
    treatmentDate: string;
    diagnosis: string;
    totalCost: number;
    // Dữ liệu từ snapshot cho bảng danh sách
    patientName?: string;
    doctorName?: string;
    specialtyName?: string;
    // Dữ liệu đầy đủ cho chi tiết (khi gọi getTreatmentById)
    healthProfile?: HealthProfile;
    doctor?: Doctor;
    appointment?: Appointment;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    symptoms?: string;
    laborder?: LabOrder | null;
    prescription?: Prescription | null;
}

export interface TreatmentMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface TreatmentResponse {
    meta: TreatmentMeta;
    treatments: Treatment[];
}

export async function createTreatment(data: CreateTreatmentDto) {
    const url = `/treatments`;
    return api.post(url, data);
}

export async function getTreatmentsByBooker(
    bookerId: string,
    options?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        from?: string;
        to?: string;
    }
): Promise<TreatmentResponse> {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder,
        from,
        to,
    } = options || {};

    const params: Record<string, string | number> = { page, limit };
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (from) params.from = from;
    if (to) params.to = to;

    const url = `/treatments/booker/${bookerId}`;
    const response = await api.get<TreatmentResponse>(url, { params });
    return response.data;
}

export async function getTreatmentById(treatmentId: string): Promise<Treatment> {
    const url = `/treatments/${treatmentId}`;
    const response = await api.get<Treatment>(url);
    return response.data;
}