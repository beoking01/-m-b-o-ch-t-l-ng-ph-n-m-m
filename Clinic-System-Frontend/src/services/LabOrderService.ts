import api from "./Api";

export type LabOrderItemInput = {
    serviceId: string;
    quantity: number;
    description?: string;
};

export type CreateLabOrderInput = {
    testTime?: string; // ISO string
    healthProfile_id: string;
    items: LabOrderItemInput[];
};

export async function createLabOrder(data: CreateLabOrderInput) {
    const url = `/laborders`;
    const res = await api.post(url, data);
    return res?.data;
}

export async function getLabOrderById(labOrderId: string) {
    const url = `/laborders/${labOrderId}`;
    const res = await api.get(url);
    return res?.data;
}