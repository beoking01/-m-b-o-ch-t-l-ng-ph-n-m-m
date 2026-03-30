import { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import type { Role } from '../../services/RoleService';
import type { RoleCreateDTO } from '../../services/RoleService';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave: (dto: RoleCreateDTO) => Promise<void>;
    role?: Role | undefined;
};

export default function RoleCreateModal({ visible, onClose, onSave, role }: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (role) {
            form.setFieldsValue({ name: role.name, description: role.description });
        } else {
            form.resetFields();
        }
    }, [role, form, visible]);

    async function handleFinish(values: any) {
        await onSave(values as RoleCreateDTO);
    }

    return (
        <Modal
            title={role ? 'Sửa vai trò' : 'Tạo vai trò mới'}
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ name: '', description: '' }}>
                <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: 'Nhập tên vai trò' }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Lưu</Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}
