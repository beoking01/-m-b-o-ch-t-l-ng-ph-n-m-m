import { useEffect, useState } from 'react';
import { Modal, Form, Button, message, Checkbox, Space, Input, Typography, Divider, Alert, Card, Tooltip } from 'antd';
import type { Role, PermissionItem } from '../../services/RoleService';
import { SaveOutlined, CloseOutlined, WarningOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

type PermissionSchema = {
    module: string;
    actions: string[];
};

type Props = {
    visible: boolean;
    onClose: () => void;
    role?: Role;
    schema?: PermissionSchema[]; // available modules/actions
    onSave: (id: string, permissions: PermissionItem[]) => Promise<void>;
};

export default function RolePermissionsModal({ visible, onClose, role, schema = [], onSave }: Props) {
    // selected[module] = Set(actions)
    const [selected, setSelected] = useState<Record<string, Set<string>>>({});
    const [manualJson, setManualJson] = useState('');

    // State schema riêng để không mutate props
    const [schemaState, setSchemaState] = useState<PermissionSchema[]>([]);

    // State thêm module mới
    const [newModule, setNewModule] = useState('');
    const [newActions, setNewActions] = useState('');

    // Khi modal mở hoặc role/schema thay đổi
    useEffect(() => {
        const map: Record<string, Set<string>> = {};
        if (role && Array.isArray(role.permissions)) {
            for (const p of role.permissions) {
                const mod = p.module;
                map[mod] = new Set(p.actions || []);
            }
        }
        setSelected(map);

        // Khởi tạo schemaState từ props
        setSchemaState(schema);
    }, [role, schema, visible]);

    function updateSelectedSet(module: string, values: string[]) {
        setSelected(prev => ({ ...prev, [module]: new Set(values) }));
    }

    async function handleSave() {
        if (!role) return;
        let out: PermissionItem[] = [];
        if (schemaState.length === 0) {
            try {
                out = JSON.parse(manualJson || '[]') as PermissionItem[];
            } catch (e) {
                message.error('JSON không hợp lệ');
                return;
            }
        } else {
            for (const mod of Object.keys(selected)) {
                out.push({ module: mod, actions: Array.from(selected[mod] || []) });
            }
        }

        try {
            await onSave(role._id, out);
            onClose();
        } catch (err: any) {
            message.error(err?.message || 'Lỗi khi lưu quyền');
        }
    }

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            title={<Title level={4} className="!mb-0"><SettingOutlined /> Phân Quyền: <Text type="success">{role?.name || 'Vai trò'}</Text></Title>}
            footer={
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={onClose} icon={<CloseOutlined />}>Hủy</Button>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        icon={<SaveOutlined />}
                        disabled={!role}
                    >
                        Lưu Quyền
                    </Button>
                </Space>
            }
            width={700}
        >
            <Divider className="!my-4" />

            <Form layout="vertical">
                {schemaState.length === 0 ? (
                    <Form.Item
                        label={<Text strong><WarningOutlined style={{ color: '#faad14' }} /> Chỉnh sửa thủ công (Fallback)</Text>}
                        help="Không tìm thấy cấu trúc quyền (schema). Vui lòng nhập mảng JSON quyền trực tiếp."
                    >
                        <TextArea
                            rows={8}
                            value={manualJson}
                            onChange={(e) => setManualJson(e.target.value)}
                            placeholder='Ví dụ: [{"module":"appointments","actions":["read","create"]}]'
                        />
                        <Alert
                            message="Cảnh báo: Chế độ này yêu cầu nhập JSON chính xác. Lỗi cú pháp có thể ngăn việc lưu."
                            type="warning"
                            showIcon
                            className="mt-2"
                        />
                    </Form.Item>
                ) : (
                    <>
                        <Form.Item label={<Text strong>Chọn Quyền theo Module</Text>}>
                            <Space direction="vertical" style={{ width: '100%', maxHeight: '400px', overflowY: 'auto' }}>
                                {schemaState.map((s) => (
                                    <Card
                                        variant='borderless'
                                        key={s.module}
                                        size="small"
                                        title={<Text strong>{s.module.toUpperCase()}</Text>}
                                        className="w-full transition duration-150"
                                        extra={
                                            <Tooltip title="Chọn/Bỏ chọn tất cả">
                                                <Checkbox
                                                    checked={Array.from(selected[s.module] || []).length === s.actions.length && s.actions.length > 0}
                                                    indeterminate={
                                                        (Array.from(selected[s.module] || []).length > 0) &&
                                                        (Array.from(selected[s.module] || []).length < s.actions.length)
                                                    }
                                                    onChange={(e) => {
                                                        updateSelectedSet(s.module, e.target.checked ? s.actions : []);
                                                    }}
                                                />
                                            </Tooltip>
                                        }
                                    >
                                        <Checkbox.Group
                                            value={Array.from(selected[s.module] || [])}
                                            onChange={(vals) => {
                                                updateSelectedSet(s.module, vals as string[]);
                                            }}
                                        >
                                            <Space wrap size={[16, 8]}>
                                                {s.actions.map((a) => (
                                                    <Checkbox key={a} value={a}>
                                                        {a.charAt(0).toUpperCase() + a.slice(1)}
                                                    </Checkbox>
                                                ))}
                                            </Space>
                                        </Checkbox.Group>
                                    </Card>
                                ))}
                            </Space>
                        </Form.Item>

                        {/* --- Thêm Module mới --- */}
                        <Divider />
                        <Card size="small" title="Thêm Module/Action mới">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Input
                                    placeholder="Tên module"
                                    value={newModule}
                                    onChange={(e) => setNewModule(e.target.value)}
                                />
                                <Input
                                    placeholder="Danh sách action (phân tách bằng ,)"
                                    value={newActions}
                                    onChange={(e) => setNewActions(e.target.value)}
                                />
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        if (!newModule) {
                                            message.error("Nhập tên module");
                                            return;
                                        }
                                        const actionsArray = newActions.split(',').map(a => a.trim()).filter(a => a);
                                        setSelected(prev => ({
                                            ...prev,
                                            [newModule]: new Set(actionsArray),
                                        }));
                                        // Cập nhật schemaState, không mutate props
                                        setSchemaState(prev => [...prev.filter(s => s.module !== newModule), { module: newModule, actions: actionsArray }]);
                                        setNewModule('');
                                        setNewActions('');
                                        message.success(`Thêm module ${newModule} thành công`);
                                    }}
                                >
                                    Thêm
                                </Button>
                            </Space>
                        </Card>
                    </>
                )}
            </Form>
        </Modal>
    );
}
