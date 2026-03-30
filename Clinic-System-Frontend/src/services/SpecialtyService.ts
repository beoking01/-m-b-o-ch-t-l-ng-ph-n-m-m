import api from './Api';
export type Specialty = {
    _id: string;
    name: string;
    description: string;
};

export type SpecialtyMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type SpecialtyQuery = {
    page?: number;
    limit?: number;
    sort?: string;
    q?: string;
};

export type CreateSpecialtyDto = Required<Pick<Specialty, 'name' | 'description'>>;
export type UpdateSpecialtyDto = Partial<CreateSpecialtyDto>;

export async function getSpecialties(params: SpecialtyQuery = {}): Promise<{ items: Specialty[]; meta: SpecialtyMeta | null }> {
    const url = `/specialties`;
    const res = await api.get(url, { params });
    const items: Specialty[] = res?.data?.data ?? res?.data?.specialties ?? [];
    const meta: SpecialtyMeta | null = res?.data?.meta ?? null;
    return { items, meta };
}

export async function getSpecialtyById(specialtyId: string): Promise<Specialty | null> {
    const url = `/specialties/${specialtyId}`;
    try {
        const res = await api.get(url);
        return res?.data ?? null;
    } catch (error) {
        console.error("Lỗi khi lấy chuyên khoa theo ID:", error);
        return null;
    }
}

export async function createSpecialty(dto: CreateSpecialtyDto): Promise<Specialty> {
    const url = `/specialties`;
    const res = await api.post(url, dto);
    return res?.data?.data ?? res?.data;
}

export async function updateSpecialty(id: string, dto: UpdateSpecialtyDto): Promise<Specialty> {
    const url = `/specialties/${id}`;
    const res = await api.put(url, dto);
    return res?.data?.data ?? res?.data;
}

export async function deleteSpecialty(id: string): Promise<void> {
    const url = `/specialties/${id}`;
    await api.delete(url);
}