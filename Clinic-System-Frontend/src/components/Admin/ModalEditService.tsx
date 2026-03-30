import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { getService, updateService, type Service } from '../../services/ServiceService';

interface ModalEditServiceProps {
    open: boolean;
    id?: string;
    onClose: () => void;
    onUpdated?: (updated: Service) => void;
}

const ModalEditService: React.FC<ModalEditServiceProps> = ({ open, id, onClose, onUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchDetail = async () => {
            if (!open || !id) return;
            try {
                setLoading(true);
                const data = await getService(id);
                form.setFieldsValue({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                });
            } catch (e) {
                message.error('Không thể tải dữ liệu dịch vụ');
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
                price: Number(values.price),
                description: values.description,
            };
            const updated = await updateService(id, payload);
            message.success('Cập nhật dịch vụ thành công');
            onUpdated?.(updated);
            onClose();
        } catch (err: any) {
            if (err?.errorFields) return; // validation error
            message.error('Cập nhật dịch vụ thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa dịch vụ"
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
                <Form.Item name="name" label="Tên dịch vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}>
                    <Input placeholder="Tên dịch vụ" />
                </Form.Item>
                <Form.Item name="price" label="Giá"
                    rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                    <InputNumber className="!w-full" min={0} step={0.01} placeholder="Giá" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                    <Input.TextArea placeholder="Mô tả" rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalEditService;
