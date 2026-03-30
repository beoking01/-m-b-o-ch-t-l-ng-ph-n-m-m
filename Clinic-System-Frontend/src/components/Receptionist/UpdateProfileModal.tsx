import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { getReceptionistByAccountId, updateReceptionist, type Receptionist } from '../../services/ReceptionistService';

interface UpdateReceptionistProfileModalProps {
    open: boolean;
    accountId: string;
    onClose: () => void;
    onUpdated: (updated: Receptionist) => void;
}

type FormValues = Pick<Receptionist, 'name' | 'phone'>;

const UpdateReceptionistProfileModal: React.FC<UpdateReceptionistProfileModalProps> = ({ open, accountId, onClose, onUpdated }) => {
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [profile, setProfile] = useState<Receptionist | null>(null);

    useEffect(() => {
        if (open && accountId) {
            const load = async () => {
                setInitialLoading(true);
                try {
                    const data = await getReceptionistByAccountId(accountId);
                    if (!data) throw new Error('Không tìm thấy hồ sơ lễ tân.');
                    setProfile(data);
                    form.setFieldsValue({
                        name: data.name,
                        phone: data.phone,
                    });
                } catch (e) {
                    message.error('Không thể tải hồ sơ lễ tân.');
                    console.error('Error loading receptionist profile:', e);
                    onClose();
                } finally {
                    setInitialLoading(false);
                }
            };
            load();
        } else {
            form.resetFields();
            setProfile(null);
        }
    }, [open, accountId, form, onClose]);

    const handleSubmit = async (values: FormValues) => {
        if (!profile) {
            message.error('Lỗi: Không tìm thấy ID hồ sơ lễ tân.');
            return;
        }
        setLoading(true);
        try {
            const updated = await updateReceptionist(profile._id, values);
            if (!updated) throw new Error('Cập nhật thất bại');
            message.success('Cập nhật hồ sơ lễ tân thành công!');
            onUpdated(updated);
            onClose();
        } catch (e: any) {
            const errorMessage = e?.message || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.';
            message.error(errorMessage);
            console.error('Update failed:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh Sửa Hồ Sơ Lễ Tân"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            maskClosable={false}
            confirmLoading={loading || initialLoading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={initialLoading}
            >
                {initialLoading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <>
                        <Form.Item
                            name="name"
                            label="Họ và Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input placeholder="Họ và Tên Lễ Tân" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số Điện Thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input placeholder="0901234567" />
                        </Form.Item>

                        <Form.Item className="mt-6 mb-0">
                            <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Lưu Thay Đổi
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default UpdateReceptionistProfileModal;
