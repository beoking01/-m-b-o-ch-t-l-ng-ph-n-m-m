import api from './Api';

export type Medicine = {
    _id?: string;
    id?: string | number;
    name: string;
    price: number;
    quantity?: number;
    dosageForm?: string;
    manufacturer?: string;
    unit?: string;
    expiryDate?: string;
};

export type MedicineMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type MedicineQuery = {
    page?: number;
    limit?: number;
    sort?: string;
    q?: string;
};

export type CreateMedicineDto = Required<Pick<Medicine, 'name' | 'price' | 'quantity' | 'dosageForm' | 'manufacturer' | 'unit' | 'expiryDate'>>;
export type UpdateMedicineDto = Partial<CreateMedicineDto> & { name?: string };

export async function getMedicines(params: MedicineQuery = {}): Promise<{ items: Medicine[]; meta: MedicineMeta | null }> {
    const url = `/medicines`;
    const res = await api.get(url, { params });
    const items: Medicine[] = res?.data?.data ?? res?.data?.medicines ?? [];
    const meta: MedicineMeta | null = res?.data?.meta ?? null;
    return { items, meta };
}

export async function createMedicine(dto: CreateMedicineDto): Promise<Medicine> {
    const url = `/medicines`;
    const res = await api.post(url, dto);
    return res?.data?.data ?? res?.data;
}

export async function updateMedicine(id: string, dto: UpdateMedicineDto): Promise<Medicine> {
    const url = `/medicines/${id}`;
    const res = await api.put(url, dto);
    return res?.data?.data ?? res?.data;
}

export async function deleteMedicine(id: string): Promise<void> {
    const url = `/medicines/${id}`;
    await api.delete(url);
}

export async function getMedicine(id: string): Promise<Medicine> {
    const url = `/medicines/${id}`;
    const res = await api.get(url);
    return res?.data?.data ?? res?.data;
}
