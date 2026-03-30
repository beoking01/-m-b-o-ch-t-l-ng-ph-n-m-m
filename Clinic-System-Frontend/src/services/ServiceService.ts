import api from './Api';

export type Service = {
    _id: string;
    name: string;
    price: number;
    description?: string;
    created_at?: string;
};

export type ServiceMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type ServiceQuery = {
    page?: number;
    limit?: number;
    sort?: string;
    q?: string;
};

export type CreateServiceDto = Required<Pick<Service, 'name' | 'price' | 'description' | 'created_at'>>;
export type UpdateServiceDto = Partial<CreateServiceDto> & { name?: string };


export async function getServices(params: ServiceQuery = {}): Promise<{ items: Service[]; meta: ServiceMeta | null }> {
    const url = `/services`;
    const res = await api.get(url, { params });
    const items: Service[] = res?.data?.data ?? res?.data?.services ?? [];
    const meta: ServiceMeta | null = res?.data?.meta ?? null;
    return { items, meta };
}

export async function createService(dto: CreateServiceDto): Promise<Service> {
    const url = `/services`;
    const res = await api.post(url, dto);
    return res?.data?.data ?? res?.data;
}

export async function updateService(id: string, dto: UpdateServiceDto): Promise<Service> {
    const url = `/services/${id}`;
    const res = await api.put(url, dto);
    return res?.data?.data ?? res?.data;
}

export async function deleteService(id: string): Promise<void> {
    const url = `/services/${id}`;
    await api.delete(url);
}

export async function getService(id: string): Promise<Service> {
    const url = `/services/${id}`;
    const res = await api.get(url);
    return res?.data?.data ?? res?.data;
}
