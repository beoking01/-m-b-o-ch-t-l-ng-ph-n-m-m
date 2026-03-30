import api from './Api';
export type DoctorScheduleItem = {
  _id?: string;
  day: string;
  timeSlots: string[];
};
export interface Account {
  _id: string;
  email: string;
}
export type SpecialtyRef = {
  _id: string;
  name: string;
};
export type Doctor = {
  _id: string;
  name: string;
  specialtyId?: SpecialtyRef | null;
  phone?: string;
  email?: string;
  password?: string;
  experience?: number;
  schedule?: DoctorScheduleItem[];
  photo?: string;
  bio?: string;
  __v?: number;
  avatar?: string;
  title?: string;
  accountId?: {
    _id: string;
    email: string;
    status?: string;
  };
};
export interface DoctorProfile {
  _id: string;
  accountId: Account;
  name: string;
  specialtyName: string;
  phone: string;
  experience: number; // Số năm kinh nghiệm
  bio?: string;
}

export interface DoctorProfileNew {
  _id: string;
  accountId: Account;
  name: string;
  specialtyId: Specialty;
  phone: string;
  experience: number; // Số năm kinh nghiệm
  bio?: string;
}

export interface Specialty {
  _id: string;
  name: string;
}

interface DoctorResponse {
  message: string;
  data: DoctorProfile;
}

interface DoctorResponseNew {
  message: string;
  data: DoctorProfileNew;
}

interface DoctorResponse {
  message: string;
  data: DoctorProfile;
}

export interface UpdateDoctorPayload {
  specialtyId?: string;
  name?: string;
  phone?: string;
  experience?: number;
  bio?: string;
}

export async function getDoctorsWithPaging(params: { page?: number; limit?: number; q?: string; specialty?: string; specialtyId?: string; name?: string } = {}): Promise<{ items: Doctor[]; total: number; page: number; limit: number }> {
  const url = `/doctors`;
  // Map frontend params to backend query names: 'q' -> 'name', 'specialty'|'specialtyId' -> 'specialtyId'
  const sendParams: any = {};
  if (params.page) sendParams.page = params.page;
  if (params.limit) sendParams.limit = params.limit;
  if (params.q) sendParams.name = params.q;
  if (params.name) sendParams.name = params.name;
  if (params.specialtyId) sendParams.specialtyId = params.specialtyId;
  else if (params.specialty) sendParams.specialtyId = params.specialty;

  const res = await api.get(url, { params: sendParams, withCredentials: true });
  const body = res?.data ?? {};

  // Expected backend shape (based on your example): { message, data: [...], pagination: { page, pageSize, totalItems, totalPages } }
  if (Array.isArray(body.data) && body.pagination) {
    const items = body.data as Doctor[];
    const page = Number(body.pagination.page) || (params.page ?? 1);
    const limit = Number(body.pagination.pageSize) || (params.limit ?? 10);
    const total = Number(body.pagination.totalItems) || items.length;
    return { items, total, page, limit };
  }

  // Fallbacks for other shapes
  if (Array.isArray(body)) {
    const items = body as Doctor[];
    return { items, total: items.length, page: params.page ?? 1, limit: params.limit ?? items.length };
  }

  if (Array.isArray(body.items)) {
    const items = body.items as Doctor[];
    const total = typeof body.total === 'number' ? body.total : items.length;
    return { items, total, page: params.page ?? 1, limit: params.limit ?? items.length };
  }

  if (Array.isArray(body.data)) {
    const items = body.data as Doctor[];
    return { items, total: items.length, page: params.page ?? 1, limit: params.limit ?? items.length };
  }

  // last resort: try nested properties
  const items = (body?.data?.doctors ?? body?.doctors ?? []) as Doctor[];
  return { items, total: Array.isArray(items) ? items.length : 0, page: params.page ?? 1, limit: params.limit ?? (items.length || 10) };
}
export async function getDoctorsByIds(ids: string[]): Promise<Doctor[]> {
  if (!ids || !ids.length) return [];
  const url = `/doctors/batch`;
  try {
    const res = await api.post(url, { ids }, { withCredentials: true });
    return res?.data?.data ?? res?.data ?? [];
  } catch (e) {
    return [];
  }
}
export async function getDoctorById(id: string): Promise<Doctor | null> {
  const url = `/doctors/${id}`;
  try {
    const res = await api.get(url, { withCredentials: true });
    if (res?.data?.data) {
      // Some APIs return { data: { doctor: { ... }, schedules: [...] } }
      if (res.data.data.doctor) return res.data.data.doctor;
      return res.data.data;
    }
    return res?.data ?? null;
  } catch (e) {
    return null;
  }
}

export async function createDoctor(dto: Partial<DoctorProfile> | FormData, isFormData = false): Promise<DoctorProfile | null> {
  const url = `/doctors`;
  try {
    const isFD = isFormData || (typeof FormData !== 'undefined' && dto instanceof FormData);

    if (isFD) {
      const res = await api.post(url, dto as FormData, {
        withCredentials: true,
      });

      return res?.data?.data ?? res?.data ?? null;
    }

    const res = await api.post(url, dto as Partial<DoctorProfile>, { withCredentials: true });
    return res?.data?.data ?? res?.data ?? null;
  } catch (e: any) {
    throw e;
  }
}
export async function updateDoctor(dto: Partial<DoctorProfile>, id: string | FormData, isFormData = false): Promise<DoctorProfile | null> {
  const url = `/doctors/${id}`;
  try {
    const isFD = isFormData || (typeof FormData !== 'undefined' && dto instanceof FormData);

    if (isFD) {
      const res = await api.post(url, dto as FormData, {
        withCredentials: true,
      });

      return res?.data?.data ?? res?.data ?? null;
    }

    const res = await api.put(url, dto as Partial<DoctorProfile>, { withCredentials: true });
    return res?.data?.data ?? res?.data ?? null;
  } catch (e) {
    throw e;
  }
}

export async function deleteDoctor(id: string): Promise<void> {
  const url = `/doctors/${id}`;
  await api.delete(url);
}

// search doctors by query params (e.g., ?q=smith&page=1&limit=10)
export async function searchDoctors(params: { q?: string; page?: number; limit?: number } = {}): Promise<Doctor[]> {
  const url = `/doctors/search`;
  const res = await api.get(url, { params, withCredentials: true });
  return res?.data?.data ?? res?.data ?? [];
}

export async function getDoctorsBySpecialty(specialtyId: string, params: { page?: number; limit?: number } = {}): Promise<Doctor[]> {
  const url = `/doctors/specialty/${specialtyId}`;
  const res = await api.get(url, { params });
  return res?.data?.data ?? res?.data ?? [];
}


export async function getDoctors(specialtyId?: string): Promise<Doctor[]> {
  try {
    const url = specialtyId
      ? `/doctors/specialty/${specialtyId}`
      : `/doctors`;
    const res = await api.get(url);

    // backend trả về { message, data: [...] }
    const data = res?.data?.data;
    if (Array.isArray(data)) return data as Doctor[];

    console.warn('getDoctors: unexpected response shape', res.data);
    return [];
  } catch (error) {
    return [];
  }
}

export async function getDoctorByAccountId(accountId: string): Promise<DoctorProfileNew> {
  const url = `/doctors/account/${accountId}`;

  try {
    const res = await api.get<DoctorResponseNew>(url);
    return res.data.data;
  } catch (error) {
    throw new Error('Lỗi không xác định khi tải hồ sơ bác sĩ.');
  }
}

export async function updateDoctorById(
  doctorId: string,
  payload: UpdateDoctorPayload | FormData
): Promise<DoctorProfile> {
  const url = `/doctors/${doctorId}`;

  try {
    const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
    const res = isForm
      ? await api.put<DoctorResponse>(url, payload, { withCredentials: true })
      : await api.put<DoctorResponse>(url, payload as UpdateDoctorPayload, { withCredentials: true });
    return res.data.data;
  } catch (error) {
    throw new Error('Lỗi không xác định khi cập nhật hồ sơ bác sĩ.');
  }
}
export async function updateDoctorBio(doctorId:string, bio: string): Promise<DoctorProfile> {
  const url = `/doctors/${doctorId}/bio`;
  try {
    const res = await api.patch<DoctorResponse>(url, { bio }, { withCredentials: true });
    return res.data.data;
  }
  catch (error) {
    throw new Error('Lỗi không xác định khi thêm tiểu sử bác sĩ.');
  }
}
export default {} as const;
