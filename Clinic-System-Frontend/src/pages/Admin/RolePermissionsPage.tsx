import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, message, Spin, Typography, Checkbox } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Role, PermissionItem } from '../../services/RoleService';
import * as RoleService from '../../services/RoleService';

const RolePermissionsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role | null>(null);
    const [schema, setSchema] = useState<{ module: string; actions: string[] }[]>([]);
    const [selected, setSelected] = useState<Record<string, Set<string>>>({});
    const [loading, setLoading] = useState(false);

    async function load() {
        if (!id) return;
        setLoading(true);
        try {
            const r = await RoleService.getRole(id);
            // backend returns { titlePage, role } or role directly
            const body = r as Role;
            setRole(body);

            // try get schema from backend
            try {
                const s = await RoleService.getPermissionsSchema();
                if (Array.isArray(s)) {
                    if (s.length > 0 && typeof s[0] === 'object' && 'module' in (s[0] as any)) setSchema(s as any);
                    else setSchema([]);
                }
            } catch (e) {
                // derive schema from role.permissions
                if (body && Array.isArray((body as any).permissions)) {
                    const map: Record<string, Set<string>> = {};
                    for (const p of (body as any).permissions) {
                        if (!map[p.module]) map[p.module] = new Set();
                        for (const a of (p.actions || [])) map[p.module].add(a);
                    }
                    const derived = Object.keys(map).map((m) => ({ module: m, actions: Array.from(map[m]) }));
                    setSchema(derived);
                    // initialize selected
                    const sel: Record<string, Set<string>> = {};
                    for (const d of derived) sel[d.module] = new Set(d.actions);
                    setSelected(sel);
                }
            }
        } catch (err: any) {
            message.error(err?.message || 'Không thể tải role');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [id]);

    async function handleSave() {
        if (!id) return;
        try {
            const out: PermissionItem[] = [];
            for (const mod of Object.keys(selected)) out.push({ module: mod, actions: Array.from(selected[mod] || []) });
            await RoleService.updatePermissions(id, out);
            message.success('Cập nhật quyền thành công');
            navigate('/admin/roles');
        } catch (err: any) {
            message.error(err?.message || 'Lỗi khi lưu quyền');
        }
    }

    if (loading || !role) return <Spin />;
    return (
        <div>
            <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <ArrowLeftOutlined onClick={() => navigate(-1)} style={{ cursor: 'pointer', fontSize: 18 }} />
                <Typography.Title level={4} style={{ margin: 0 }}>{`Phân quyền: ${role.name}`}</Typography.Title>
            </div>
            <div style={{ padding: 16 }}>
                {schema.map((s) => (
                    <div key={s.module} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
                        <div style={{ fontWeight: 600 }}>{s.module}</div>
                        <Checkbox.Group value={Array.from(selected[s.module] || [])} onChange={(vals) => setSelected((prev) => ({ ...prev, [s.module]: new Set(vals as string[]) }))}>
                            <Space>
                                {s.actions.map((a) => (<Checkbox key={a} value={a}>{a}</Checkbox>))}
                            </Space>
                        </Checkbox.Group>
                    </div>
                ))}

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        <Button onClick={() => navigate('/admin/roles')}>Hủy</Button>
                        <Button type="primary" onClick={handleSave}>Lưu</Button>
                    </Space>
                </div>
            </div>
        </div>
    );
}

export default RolePermissionsPage;
