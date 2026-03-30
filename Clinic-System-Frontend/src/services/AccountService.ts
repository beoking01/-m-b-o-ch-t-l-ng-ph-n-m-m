import api from './Api';

export type Role = {
    _id: string;
    name: string;
};

export type Account = {
    _id: string;
    email: string;
    password?: string;
    roleId?: Role | null; // object role hoặc null
    status?: string;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};
export type AccountMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type AccountQuery = {
    page?: number;
    limit?: number;
    sort?: string;
    q?: string;
};

export type CreateAccountDto = {
    email: string;
    password: string;
    roleId?: string[];
    status?: string;
};

export type UpdateAccountDto = Partial<CreateAccountDto> & { deleted?: boolean };

const BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:3000';
const API = `${BASE_URL}/accounts`;


// Auth related endpoints
export async function registerAccount(dto: CreateAccountDto): Promise<Account> {
    const url = `${API}/register`;
    const res = await api.post(url, dto);
    console.log("Register Account Response:", res);
    return res?.data?.data ?? res?.data;
}

export async function loginAccount(payload: { email: string; password: string }): Promise<any> {
    const url = `${API}/login`;
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data;
}

export async function logoutAccount(): Promise<void> {
    const url = `${API}/logout`;
    await api.get(url);
}

export async function forgotPassword(payload: { email: string }): Promise<any> {
    const url = `${API}/password/forgot`;
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data;
}

export async function otpPassword(payload: { email: string; otp: string }): Promise<any> {
    const url = `${API}/password/otp`;
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data;
}

export async function resetPassword(payload: { email: string; newPassword: string; confirmPassword: string }): Promise<any> {
    const url = `${API}/password/reset`;
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data;
}

// CRUD helpers

export async function getAccounts(params: AccountQuery = {}): Promise<{ items: Account[]; meta: AccountMeta | null }> {
    const url = `${API}`;
    const res = await api.get(url, { params });
    const items: Account[] = res?.data?.data ?? res?.data?.accounts ?? res?.data?.items ?? res?.data?.users ?? [];
    const meta: AccountMeta | null = res?.data?.meta ?? null;
    console.log("Get Accounts Response:", res);
    return { items, meta };
}

export async function getRole(id: string): Promise<Role | null> {
    try {
        const res = await api.get(`${API}/role/${id}`);
        return res?.data?.role ?? null;
    } catch (error) {
        console.error("Error fetching role", error);
        return null;
    }
}

export async function deleteAccount(id: string): Promise<void> {
    await api.delete(`${API}/${id}`);
}

export async function getAccountById(id: string): Promise<Account | null> {
    try {
        const res = await api.get(`${API}/${id}`);
        return res?.data?.account ?? null;
    } catch (error) {
        console.error("Error fetching account", error);
        return null;
    }
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
    const res = await api.post(`${API}/register`, data);
    return res.data;
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    const res = await api.put(`${API}/${id}`, data);
    return res.data.account;
}