import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { createMedicine, type CreateMedicineDto, type Medicine } from '../../services/MedicineService';

interface ModalCreateMedicineProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (created: Medicine) => void;
}

const ModalCreateMedicine: React.FC<ModalCreateMedicineProps> = ({ open, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload: CreateMedicineDto = {
                name: values.name,
                price: Number(values.price),
                quantity: Number(values.quantity),
                dosageForm: values.dosageForm,
                manufacturer: values.manufacturer,
                unit: values.unit,
                expiryDate: (values.expiryDate as Dayjs).toDate().toISOString(),
            };
            const created = await createMedicine(payload);
            message.success('Tạo thuốc thành công');
            form.resetFields();
            onCreated?.(created);
            onClose();
        } catch (err: any) {
            if (err?.errorFields) return; // validation error
            message.error('Tạo thuốc thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm thuốc mới"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Tạo"
            cancelText="Hủy"
            destroyOnHidden={true}
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item name="name" label="Tên thuốc" rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}>
                    <Input placeholder="Nhập tên thuốc" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                        <InputNumber className="!w-full" min={0} step={0.01} placeholder="Nhập giá" />
                    </Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                        <InputNumber className="!w-full" min={0} placeholder="Nhập số lượng kho" />
                    </Form.Item>
                </div>
                <Form.Item name="dosageForm" label="Dạng thuốc" rules={[{ required: true, message: 'Vui lòng nhập dạng thuốc' }]}>
                    <Input placeholder="Nhập dạng thuốc" />
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

export default ModalCreateMedicine;
