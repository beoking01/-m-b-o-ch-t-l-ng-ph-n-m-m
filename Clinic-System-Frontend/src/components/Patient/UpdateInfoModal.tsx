import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Radio, DatePicker, Button, message } from 'antd';
import moment, { type Moment } from 'moment';
import { updatePatient, type Patient, type UpdatePatientDTO } from '../../services/PatientService';

interface UpdateInfoModalProps {
    open: boolean;
    patient: Patient;
    patientId: string;
    onClose: () => void;
    onUpdated: (updated: Patient) => void;
}

type FormValues = Omit<UpdatePatientDTO, 'dob'> & { dob?: Moment | null };

const UpdateInfoModal: React.FC<UpdateInfoModalProps> = ({ open, patient, patientId, onClose, onUpdated }) => {
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && patient) {
            form.setFieldsValue({
                name: patient.name,
                phone: patient.phone,
                gender: (patient as any).gender || 'other',
                address: (patient as any).address || '',
                dob: patient.dob ? moment.utc(patient.dob) : undefined,
            });
        }
    }, [open, patient, form]);

    const handleSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const { dob, ...rest } = values;
            const dto: UpdatePatientDTO = {
                ...rest,
                dob: dob ? moment.utc(dob.format('YYYY-MM-DD')).toISOString() : undefined,
            };
            const updated = await updatePatient(patientId as string, dto);
            message.success('Cập nhật hồ sơ thành công!');
            onUpdated(updated);
            onClose();
        } catch (e) {
            message.error('Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
            console.error('Update failed:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Chỉnh Sửa Thông Tin Bệnh Nhân" open={open} onCancel={onClose} footer={null} destroyOnClose>
            <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ gender: 'other' }}>
                <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
                    <Input placeholder="Họ và Tên" />
                </Form.Item>

                <Form.Item name="dob" label="Ngày Sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                    <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày" className="w-full" />
                </Form.Item>

                <Form.Item name="gender" label="Giới Tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                    <Radio.Group>
                        <Radio value="male">Nam</Radio>
                        <Radio value="female">Nữ</Radio>
                        <Radio value="other">Khác</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                    <Input placeholder="0901234567" />
                </Form.Item>

                <Form.Item name="address" label="Địa Chỉ">
                    <Input.TextArea rows={2} placeholder="Nhập địa chỉ hiện tại..." />
                </Form.Item>

                <Form.Item className="mt-6 mb-0">
                    <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Lưu Thay Đổi
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateInfoModal;
