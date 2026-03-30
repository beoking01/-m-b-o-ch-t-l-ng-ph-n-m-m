import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { getSpecialtyById, updateSpecialty, type Specialty } from '../../services/SpecialtyService';

interface ModalEditSpecialtyProps {
    open: boolean;
    id?: string;
    onClose: () => void;
    onUpdated?: (updated: Specialty) => void;
}

const ModalEditSpecialty: React.FC<ModalEditSpecialtyProps> = ({ open, id, onClose, onUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchDetail = async () => {
            if (!open || !id) return;
            try {
                setLoading(true);
                const data = await getSpecialtyById(id);
                if (data) {
                    form.setFieldsValue({
                        name: data.name,
                        description: data.description,
                    });
                }
            } catch (e) {
                message.error('Không thể tải dữ liệu chuyên khoa');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        // reset form when closing
        if (!open) form.resetFields();
    }, [open, id, form]);

    const handleOk = async () => {
        if (!id) return;
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload = {
                name: values.name,
                description: values.description,
            };
            const updated = await updateSpecialty(id, payload);
            message.success('Cập nhật chuyên khoa thành công');
            onUpdated?.(updated);
            onClose();
        } catch (err: any) {
            if (err?.errorFields) return; // validation error
            message.error('Cập nhật chuyên khoa thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa chuyên khoa"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={saving}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnHidden={true}
            maskClosable={!loading}
        >
            <Form form={form} layout="vertical" preserve={false} disabled={loading}>
                <Form.Item name="name" label="Tên chuyên khoa" rules={[{ required: true, message: 'Vui lòng nhập tên chuyên khoa' }]}>
                    <Input placeholder="Tên chuyên khoa" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                    <Input.TextArea placeholder="Mô tả chuyên khoa" rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalEditSpecialty;