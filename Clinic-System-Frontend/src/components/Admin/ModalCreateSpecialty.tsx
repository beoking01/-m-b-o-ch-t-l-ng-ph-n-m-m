import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createSpecialty, type CreateSpecialtyDto, type Specialty } from '../../services/SpecialtyService';

interface ModalCreateSpecialtyProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (created: Specialty) => void;
}

const ModalCreateSpecialty: React.FC<ModalCreateSpecialtyProps> = ({ open, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload: CreateSpecialtyDto = {
                name: values.name,
                description: values.description,
            };
            const created = await createSpecialty(payload);
            message.success('Tạo chuyên khoa thành công');
            form.resetFields();
            onCreated?.(created);
            onClose();
        } catch (err: any) {
            if (err?.errorFields) return; // validation error
            message.error('Tạo chuyên khoa thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm chuyên khoa mới"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Tạo"
            cancelText="Hủy"
            destroyOnHidden={true}
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item name="name" label="Tên chuyên khoa" rules={[{ required: true, message: 'Vui lòng nhập tên chuyên khoa' }]}>
                    <Input placeholder="Nhập tên chuyên khoa" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                    <Input.TextArea placeholder="Nhập mô tả chuyên khoa" rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCreateSpecialty;