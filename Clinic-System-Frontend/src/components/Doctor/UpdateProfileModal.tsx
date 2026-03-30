import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import {
    getDoctorByAccountId,
    updateDoctorById,
    type DoctorProfileNew,
    type UpdateDoctorPayload
} from '../../services/DoctorService';

interface UpdateDoctorProfileModalProps {
    open: boolean;
    accountId: string;
    onClose: () => void;
    onUpdated: () => void;
}

type FormValues = UpdateDoctorPayload;

const UpdateProfileModal: React.FC<UpdateDoctorProfileModalProps> = ({ open, accountId, onClose, onUpdated }) => {
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfileNew | null>(null);

    // 2. Tải dữ liệu bác sĩ theo accountId khi modal mở
    useEffect(() => {
        if (open && accountId) {
            const fetchDoctorData = async () => {
                setInitialLoading(true);
                try {
                    const profile = await getDoctorByAccountId(accountId);
                    setDoctorProfile(profile);

                    form.setFieldsValue({
                        name: profile.name,
                        phone: profile.phone,
                        experience: profile.experience,
                        bio: profile.bio,
                    });
                } catch (e) {
                    message.error('Không thể tải hồ sơ bác sĩ.');
                    console.error('Error loading doctor profile:', e);
                    onClose();
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchDoctorData();
        } else {
            // Đặt lại form khi modal đóng
            form.resetFields();
            setDoctorProfile(null);
        }
    }, [open, accountId, form, onClose]);


    // 3. Xử lý logic cập nhật
    const handleSubmit = async (values: FormValues) => {
        if (!doctorProfile) {
            message.error('Lỗi: Không tìm thấy ID hồ sơ bác sĩ.');
            return;
        }

        setLoading(true); try {
            await updateDoctorById(doctorProfile._id, values);

            message.success('Cập nhật hồ sơ bác sĩ thành công!');
            onUpdated();
            onClose();
        } catch (e: any) {
            const errorMessage = e.message || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.';
            message.error(errorMessage);
            console.error('Update failed:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="👨‍⚕️ Chỉnh Sửa Hồ Sơ Bác Sĩ"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnHidden={true}
            maskClosable={false}
            confirmLoading={loading || initialLoading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ experience: 0 }}
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
                            <Input placeholder="Họ và Tên Bác Sĩ" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số Điện Thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input placeholder="0901234567" />
                        </Form.Item>

                        <Form.Item
                            name="experience"
                            label="Kinh Nghiệm (Năm)"
                            rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' }]}
                        >
                            <InputNumber placeholder="Số năm kinh nghiệm" className="!w-full" />
                        </Form.Item>
                        <Form.Item
                            name="bio"
                            label="Giới thiệu"
                            rules={[{ required: true, message: 'Vui lòng nhập giới thiệu!' }]}
                        >
                            <Input placeholder="Giới thiệu" className="!w-full" />
                        </Form.Item>

                        <Form.Item className="mt-6 mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                Lưu Thay Đổi
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default UpdateProfileModal;