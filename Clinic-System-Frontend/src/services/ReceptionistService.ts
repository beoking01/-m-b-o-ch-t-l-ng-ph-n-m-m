import api from './Api';

export type Receptionist = {
    _id: string;
    name: string;
    phone: string;
    email: string;
    password?: string;
};

export async function getReceptionists(): Promise<Receptionist[]> {
    const url = `/receptionists`;
    const res = await api.get(url);
    return res?.data ?? [];
}

export async function getReceptionistById(receptionistId: string): Promise<Receptionist | null> {
    const url = `/receptionists/${receptionistId}`;
    try {
        const res = await api.get(url);
        return res?.data ?? null;
    } catch (error) {
        return null;
    }
}

// Lấy lễ tân bằng account ID
export async function getReceptionistByAccountId(accountId: string): Promise<Receptionist | null> {
    const url = `/receptionists/byAccount/${accountId}`;
    try {
        const res = await api.get(url);
        return res?.data ?? null;
    } catch (error) {
        return null;
    }
}
export async function createReceptionist(dto: { name: string; phone: string; email: string; password: string }): Promise<Receptionist> {
    const url = `/receptionists`;
    const res = await api.post(url, dto);
    return res?.data;
}
export async function updateReceptionist(receptionistId: string, dto: Partial<Receptionist>): Promise<Receptionist | null> {
    const url = `/receptionists/${receptionistId}`;
    try {
        const res = await api.put(url, dto);
        return res?.data ?? null;
    }
    catch (error) {
        return null;
    }
}