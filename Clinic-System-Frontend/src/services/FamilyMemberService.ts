import api from './Api';

const URL = '/family-members';

export type FamilyMember = {
    _id?: string;
    bookerId: string;
    name: string;
    relationship: string;
    dob?: string; // ISO string
    gender?: string; // "male" | "female" | "other"
    phone?: string;
};

/**
 * Tạo FamilyMember mới
 * @param payload FamilyMember info
 * @returns FamilyMember đã tạo với _id
 */
export const createFamilyMember = async (payload: FamilyMember): Promise<FamilyMember> => {
    try {
        const res = await api.post(URL, payload);
        return res.data;
    } catch (err: any) {
        console.error('Error creating family member:', err);
        throw new Error(err?.response?.data?.message || 'Lỗi khi tạo FamilyMember');
    }
};

/**
 * Lấy danh sách FamilyMember của Patient
 * @param bookerId Id của Patient
 */
export const getFamilyMembersByPatient = async (bookerId: string): Promise<FamilyMember[]> => {
    try {
        const res = await api.get(`${URL}/by-patient/${bookerId}`);
        return res.data;
    } catch (err: any) {
        console.error('Error fetching family members:', err);
        throw new Error(err?.response?.data?.message || 'Lỗi khi lấy FamilyMember');
    }
};

export async function updateFamilyMember(id: string, payload: any) {
    const res = await api.patch(`/family-members/${id}`, payload);
    return res.data;
}

export async function deleteFamilyMember(id: string) {
    const res = await api.delete(`/family-members/${id}`);
    return res.data;
}