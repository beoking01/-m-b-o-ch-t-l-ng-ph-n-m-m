import { Button, Card, Descriptions, Input, Typography, message, Spin, notification } from 'antd';
import React, { useState } from 'react';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import dayjs from 'dayjs';
import { createAppointmentBySpecialty, type AppointmentBySpecialtyPayload } from '../../../services/AppointmentService';
import { type HealthProfile } from '../../../services/HealthProfileService';
import { useAuth } from '../../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ConfirmAppointmentProps {
    specialtyId: string;
    specialtyName: string;
    dateTime: { date: string; timeSlot: string };
    profile: HealthProfile;
    patientId: string;
    displayName?: string;
    displayPhone?: string;
    onBack: () => void;
    onSuccess: () => void;
}


const ConfirmAppointment: React.FC<ConfirmAppointmentProps> = ({ specialtyId, specialtyName, dateTime, patientId, displayName, displayPhone, profile, onBack, onSuccess }) => {
    const { user } = useAuth();
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Xử lý gửi lịch hẹn
    const handleSubmit = async () => {
        if (!reason || reason.trim().length < 2) {
            message.warning("Vui lòng nhập lý do khám chi tiết (ít nhất 2 ký tự).");
            return;
        }

        const appointmentDateISO = dayjs(dateTime.date).format('YYYY-MM-DD');


        const payload: AppointmentBySpecialtyPayload = {
            booker_id: patientId,                 // <= lấy từ props, không dùng user.id
            healthProfile_id: profile._id,        // <= API mới
            specialty_id: specialtyId,
            appointmentDate: appointmentDateISO,
            timeSlot: dateTime.timeSlot,
            reason: reason.trim(),
        };

        setLoading(true);
        try {
            await createAppointmentBySpecialty(payload);

            notification.success({
                message: 'Đặt lịch thành công!',
                description: `Lịch hẹn đã được xác nhận.`,
            });

            onSuccess();
        } catch (error: any) {
            notification.error({
                message: 'Đặt lịch thất bại',
                description: error.message || "Đã xảy ra lỗi trong quá trình gửi yêu cầu.",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-4 mx-auto">
            <Title level={3} className="!mb-6 text-center">4. Xác nhận Đặt lịch Khám</Title>

            <Card title="Thông tin Lịch hẹn" variant='outlined' className="mb-6 ">
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Chuyên khoa" styles={{ label: { fontWeight: 'bold', width: '30%' } }}>
                        {specialtyName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày khám" styles={{ label: { fontWeight: 'bold', width: '30%' } }}>
                        {dayjs(dateTime.date).format('dddd, DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khung giờ" styles={{ label: { fontWeight: 'bold', width: '30%' } }}>
                        {dateTime.timeSlot}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Thông tin Hồ sơ Sức khỏe" variant='outlined' className="mb-6 bg-blue-50">
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Tên" styles={{ label: { fontWeight: 'bold', width: '30%' } }}>
                        {displayName}
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT" styles={{ label: { fontWeight: 'bold', width: '30%' } }}>
                        {displayPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="email" styles={{ label: { fontWeight: 'bold', width: '30%' } }}>
                        {user?.email || 'Chưa có'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>


            <div className="mb-6 mt-4">
                <Title level={5} className="!mb-2">Lý do khám bệnh <Text type="danger">*</Text></Title>
                <TextArea
                    rows={4}
                    placeholder="Vui lòng mô tả chi tiết lý do bạn cần đặt lịch khám..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t">
                <Button
                    onClick={onBack}
                    icon={<FaArrowLeft />}
                    disabled={loading}
                >
                    Quay lại (Sửa Hồ sơ)
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={loading ? <Spin size="small" /> : <FaCheckCircle />}
                    disabled={!reason || reason.trim().length < 1}
                >
                    Xác nhận Đặt lịch
                </Button>
            </div>
        </div>
    );
};

export default ConfirmAppointment;