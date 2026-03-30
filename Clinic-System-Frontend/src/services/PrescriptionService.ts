import api from "./Api";

export type PrescriptionItemDto = {
    medicineId: string;
    quantity: number;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
}

export type CreatePrescriptionDto = {
    healthProfile_id: string;
    items: PrescriptionItemDto[];
}

export async function createPrescription(data: CreatePrescriptionDto) {
    const url = `/prescriptions`;
    const res = await api.post(url, data);
    return res.data;
}

export async function getPrescriptionById(prescriptionId: string) {
    const url = `/prescriptions/${prescriptionId}`;
    const res = await api.get(url);
    return res.data;
}