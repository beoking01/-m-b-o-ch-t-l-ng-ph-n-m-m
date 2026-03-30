import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import RoleList from '../../components/Admin/RoleList';
import PermissionsMatrix from '../../components/Admin/PermissionsMatrix';
import type { Role, RoleCreateDTO } from '../../services/RoleService';
import * as RoleService from '../../services/RoleService';
import api from '../../services/Api';
import RolePermissionsModal from '../../components/Admin/RolePermissionsModal';
import RoleCreateModal from '../../components/Admin/RoleCreateModal';
import ButtonPrimary from '../../utils/ButtonPrimary';
import { MdAdd } from 'react-icons/md';

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<Role | undefined>(undefined);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [permissionSchema, setPermissionSchema] = useState<{ module: string; actions: string[] }[]>([]);
    const [permModalVisible, setPermModalVisible] = useState(false);
    const [permRole, setPermRole] = useState<Role | undefined>(undefined);

    async function load() {
        setLoading(true);
        try {
            const res = await RoleService.getRoles();
            const rlist = res.data || [];
            // get accounts to compute counts
            try {
                const accRes = await api.get('/accounts');
                const accounts = accRes.data?.accounts || [];
                const counts: Record<string, number> = {};
                for (const a of accounts) {
                    const rid = a.roleId?._id || a.roleId;
                    if (!rid) continue;
                    counts[rid] = (counts[rid] || 0) + 1;
                }
                for (const r of rlist) {
                    // @ts-ignore
                    r.userCount = counts[r._id] || 0;
                }
            } catch (e) {
                // ignore accounts error
            }
            setRoles(rlist);
            // derive permission schema from roles if backend schema unavailable
            try {
                const map: Record<string, Set<string>> = {};
                for (const r of rlist) {
                    if (!Array.isArray((r as any).permissions)) continue;
                    for (const p of (r as any).permissions) {
                        const mod = p.module;
                        const acts = p.actions || [];
                        if (!map[mod]) map[mod] = new Set();
                        for (const a of acts) map[mod].add(a);
                    }
                }
                const schema = Object.keys(map).map((m) => ({ module: m, actions: Array.from(map[m]) }));
                setPermissionSchema(schema);
            } catch (e) {
                setPermissionSchema([]);
            }
        } catch (err: any) {
            message.error(err?.message || 'Không thể lấy danh sách vai trò');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        (async () => {
            try {
                const s = await RoleService.getPermissionsSchema();
                // if backend returns schema as array of {module, actions} or simple array
                if (Array.isArray(s)) {
                    // detect object schema
                    if (s.length > 0 && typeof s[0] === 'object' && s[0].module) {
                        setPermissionSchema(s as any);
                    } else {
                        setPermissions(s as string[]);
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    async function handleCreate(dto: RoleCreateDTO) {
        try {
            if (editing) {
                await RoleService.updateRole(editing._id, dto);
                message.success('Cập nhật vai trò thành công');
            } else {
                await RoleService.createRole(dto);
                message.success('Tạo vai trò thành công');
            }
            setModalVisible(false);
            setEditing(undefined);
            load();
        } catch (err: any) {
            message.error(err?.message || 'Lỗi khi lưu vai trò');
        }
    }

    async function handleDelete(id: string) {
        try {
            await RoleService.deleteRole(id);
            message.success('Xóa vai trò thành công');
            load();
        } catch (err: any) {
            message.error(err?.message || 'Lỗi khi xóa vai trò');
        }
    }

    function handleOpenPermissions(role: Role) {
        setPermRole(role);
        setPermModalVisible(true);
    }

    async function handleSavePermissions(id: string, permissionsData: any) {
        try {
            await RoleService.updatePermissions(id, permissionsData);
            message.success('Cập nhật quyền thành công');
            setPermModalVisible(false);
            setPermRole(undefined);
            load();
        } catch (err: any) {
            message.error(err?.message || 'Lỗi khi lưu quyền');
        }
    }

    return (
        <div className='container mx-auto p-4'>
            <h1 className="text-3xl font-bold mb-4">Quản lý vai trò</h1>
            <div className='space-y-4'>
                <ButtonPrimary icon={<MdAdd />} size="large" onClick={() => setModalVisible(true)}>
                    Tạo vai trò mới
                </ButtonPrimary>

                <RoleList roles={roles} loading={loading} onEdit={(r) => { setEditing(r); setModalVisible(true); }} onDelete={handleDelete} onPermissions={handleOpenPermissions} />

                <RoleCreateModal visible={modalVisible} onClose={() => { setModalVisible(false); setEditing(undefined); }} role={editing} onSave={handleCreate} />
                <RolePermissionsModal visible={permModalVisible} onClose={() => { setPermModalVisible(false); setPermRole(undefined); }} role={permRole} schema={permissionSchema} onSave={handleSavePermissions} />

                {/* Optional: preview permissions list */}
                {permissions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <h4>Permissions available</h4>
                        <PermissionsMatrix permissions={permissions} value={[]} onChange={() => { }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleManagement;