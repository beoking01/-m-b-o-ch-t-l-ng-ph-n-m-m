import api from './Api';

export type PermissionItem = { module: string; actions: string[] };

export type Role = {
    _id: string;
    name: string;
    // key kept for backward compatibility but may be empty
    key?: string;
    description?: string;
    permissions: PermissionItem[];
    userCount?: number;
    createdAt?: string;
    updatedAt?: string;
};

export type RoleCreateDTO = {
    name: string;
    description?: string;
    permissions?: PermissionItem[];
};

export type RoleUpdateDTO = Partial<RoleCreateDTO> & { permissions?: PermissionItem[] };

export async function getRoles(query = ''): Promise<{ data: Role[]; total?: number }> {
    const res = await api.get(`/admin/roles${query ? `?${query}` : ''}`);
    const body = res.data;
    // Backend returns { titlePage, roles } or directly an array.
    if (Array.isArray(body)) {
        return { data: body };
    }
    if (body && Array.isArray(body.roles)) {
        return { data: body.roles, total: body.total };
    }
    // Fallback: if the API returns the data under other key, try to find it
    if (body && body.data && Array.isArray(body.data)) {
        return { data: body.data, total: body.total } as any;
    }
    return { data: [] };
}

export async function getRole(id: string): Promise<Role> {
    const res = await api.get(`/admin/roles/${id}`);
    const body = res.data;
    if (body && body.role) return body.role as Role;
    return body as Role;
}

export async function createRole(dto: RoleCreateDTO): Promise<Role> {
    const res = await api.post('/admin/roles', dto);
    return res.data;
}

export async function updateRole(id: string, dto: RoleUpdateDTO): Promise<Role> {
    const res = await api.patch(`/admin/roles/${id}`, dto);
    return res.data;
}

export async function deleteRole(id: string): Promise<void> {
    await api.delete(`/admin/roles/${id}`);
}

export async function getPermissionsSchema() {
    const res = await api.get('/admin/permissions/schema');
    return res.data;
}

export async function updatePermissions(id: string, permissions: PermissionItem[]) {
    const res = await api.patch(`/admin/roles/${id}/permissions`, { permissions });
    return res.data;
}
