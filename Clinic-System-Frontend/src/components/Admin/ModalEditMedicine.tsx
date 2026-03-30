import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { getMedicine, updateMedicine, type Medicine } from '../../services/MedicineService';

interface ModalEditMedicineProps {
    open: boolean;
    id?: string;
    onClose: () => void;
    onUpdated?: (updated: Medicine) => void;
}

const ModalEditMedicine: React.FC<ModalEditMedicineProps> = ({ open, id, onClose, onUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchDetail = async () => {
            if (!open || !id) return;
            try {
                setLoading(true);
                const data = await getMedicine(id);
                form.setFieldsValue({
                    name: data.name,
                    price: data.price,
                    quantity: data.quantity,
                    dosageForm: data.dosageForm,
                    manufacturer: data.manufacturer,
                    unit: data.unit,
                    expiryDate: data.expiryDate ? dayjs(data.expiryDate) : undefined,
                });
            } catch (e) {
                message.error('Không thể tải dữ liệu thuốc');
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
                quantity: Number(values.quantity),
                dosageForm: values.dosageForm,
                manufacturer: values.manufacturer,
                unit: values.unit,
                expiryDate: (values.expiryDate as Dayjs).toDate().toISOString(),
            };
            const updated = await updateMedicine(id, payload);
            message.success('Cập nhật thuốc thành công');
            onUpdated?.(updated);
            onClose();
        } catch (err: any) {
            if (err?.errorFields) return; // validation error
            message.error('Cập nhật thuốc thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa thuốc"
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
                <Form.Item name="name" label="Tên thuốc" rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}>
                    <Input placeholder="Tên thuốc" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                        <InputNumber className="!w-full" min={0} step={0.01} placeholder="Giá" />
                    </Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                        <InputNumber className="!w-full" min={0} placeholder="Số lượng" />
                    </Form.Item>
                </div>
                <Form.Item name="dosageForm" label="Dạng thuốc" rules={[{ required: true, message: 'Vui lòng nhập dạng thuốc' }]}>
                    <Input placeholder="Dạng thuốc" />
                </Form.Item>
                <Form.Item name="manufacturer" label="Nhà sản xuất" rules={[{ required: true, message: 'Vui lòng nhập nhà sản xuất' }]}>
                    <Input placeholder="Nhà sản xuất" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}>
                        <Input placeholder="Đơn vị" />
                    </Form.Item>
                    <Form.Item name="expiryDate" label="Hạn sử dụng" rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}>
                        <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default ModalEditMedicine;
