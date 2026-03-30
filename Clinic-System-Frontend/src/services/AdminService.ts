import api from './Api';

export type Admin = {
    _id?: string;
    accountId?: string; // ObjectId reference to Account
    phone: string;
    name: string;
    avatar?: string;
    note?: string;
}

export async function getAdmins(): Promise<Admin[]> {
    const response = await api.get('/admins');
    return response.data?.data ?? response.data ?? [];
}
export async function getAdminById(adminId: string): Promise<Admin | null> {
    try {
        const response = await api.get(`/admins/${adminId}`);
        return response.data?.data ?? response.data ?? null;
    } catch (error) {
        return null;
    }
}
export async function getAdminByAccountId(accountId: string): Promise<Admin | null> {
    try {
        const response = await api.get(`/admins/account/${accountId}`);
        return response.data?.data ?? response.data ?? null;
    } catch (error) {
        return null;
    }
}
export async function createAdmin(dto: { email: string; password: string; name: string; phone: string; note?: string; avatar?: string }): Promise<Admin> {
    const response = await api.post('/admins', dto);
    return response.data?.data ?? response.data;
}
export async function updateAdmin(adminId: string, payload: Partial<Admin>): Promise<Admin | null> {
    try {
        const response = await api.put(`/admins/${adminId}`, payload);
        return response.data?.data ?? response.data ?? null;
    } catch (error) {
        return null;
    }
}
export async function deleteAdmin(adminId: string): Promise<void> {
    await api.delete(`/admins/${adminId}`);
}