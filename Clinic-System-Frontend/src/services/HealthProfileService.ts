import api from './Api';
export interface HealthProfile {
    _id: string;
    ownerId: string;
    ownerModel: 'Patient' | 'FamilyMember';
    height?: number;
    weight?: number;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    medications?: string[];
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
    };
    familyMemberName?: string;
    familyMemberPhone?: string;
    familyMemberDob?: string;
    familyMemberGender?: string;
    relationship?: string;
    type: 'Patient' | 'FamilyMember';
    createdAt: string;
    updatedAt: string;
}

// Lấy tất cả hồ sơ sức khỏe của bệnh nhân theo Patient ID
export async function getAllHealthProfiles(patientId: string): Promise<HealthProfile[]> {
    const url = `/health-profiles/all/${patientId}`;
    try {
        const res = await api.get(url);
        // API trả về list trực tiếp => return res.data
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        throw error;
    }
}

// Create a new health profile for ownerModel ('Patient' or 'FamilyMember') and ownerId
export async function createHealthProfileNew(ownerModel: 'Patient' | 'FamilyMember', ownerId: string, payload: Partial<HealthProfile>) {
    const modelParam = ownerModel === 'Patient' ? 'patient' : 'familyMember';
    const url = `/health-profiles/${modelParam}/${ownerId}`;
    try {
        const res = await api.post(url, payload);
        return res.data;
    } catch (error) {
        throw error;
    }
}


// Note: backend may not expose this route; this helper attempts PATCH /health-profiles/:id
export async function updateHealthProfileById(profileId: string, updates: Partial<HealthProfile>) {
    const url = `/health-profiles/profile/${profileId}`;
    try {
        const res = await api.patch(url, updates);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export async function deleteHealthProfileById(profileId: string) {
    const url = `/health-profiles/profile/${profileId}`;
    try {
        const res = await api.delete(url);
        return res.data;
    } catch (error) {
        throw error;
    }
}