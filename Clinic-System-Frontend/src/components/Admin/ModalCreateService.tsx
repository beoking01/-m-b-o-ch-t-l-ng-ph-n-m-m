import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { createService, type CreateServiceDto, type Service } from '../../services/ServiceService';

interface ModalCreateServiceProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (created: Service) => void;
}

const ModalCreateService: React.FC<ModalCreateServiceProps> = ({ open, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload: CreateServiceDto = {
                name: values.name,
                price: Number(values.price),
                description: values.description,
                created_at: new Date().toISOString(),
            };
            const created = await createService(payload);
            message.success('Tạo dịch vụ thành công');
            form.resetFields();
            onCreated?.(created);
            onClose();
        } catch (err: any) {
            if (err?.errorFields) return; // validation error
            message.error('Tạo dịch vụ thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm dịch vụ mới"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Tạo"
            cancelText="Hủy"
            destroyOnHidden={true}
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item name="name" label="Tên dịch vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}>
                    <Input placeholder="Nhập tên dịch vụ" />
                </Form.Item>
                <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                    <InputNumber className="!w-full" min={0} step={0.01} placeholder="Nhập giá" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                    <Input.TextArea placeholder="Nhập mô tả" rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCreateService;
