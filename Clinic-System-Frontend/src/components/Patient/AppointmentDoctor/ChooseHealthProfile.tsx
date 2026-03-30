import { Button, Card, Col, Row, Typography, Spin, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaHeartbeat, FaPhone, FaUser } from 'react-icons/fa';
import dayjs from 'dayjs';
import { getAllHealthProfiles, type HealthProfile } from '../../../services/HealthProfileService';
import { FaPerson } from 'react-icons/fa6';

const { Title, Text } = Typography;

interface ChooseHealthProfileProps {
    specialtyId: string;
    specialtyName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    timeSlot: string;
    patientId: string;
    onNext: (profile: HealthProfile) => void;
    onBack: () => void;
}

const ChooseHealthProfile: React.FC<ChooseHealthProfileProps> = ({
    specialtyName,
    doctorName,
    date,
    timeSlot,
    patientId,
    onNext,
    onBack }) => {
    const [profiles, setProfiles] = useState<HealthProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);

    // Lấy dữ liệu hồ sơ sức khỏe
    useEffect(() => {
        if (!patientId) return;

        const fetchProfiles = async () => {
            setLoading(true);
            try {
                const data = await getAllHealthProfiles(patientId);
                setProfiles(data);

                if (data.length > 0) {
                    setSelectedProfile(data[0]);
                }
            } catch (error) {
                console.error("Lỗi khi tải hồ sơ sức khỏe:", error);
                message.error("Không thể tải hồ sơ sức khỏe. Vui lòng thử lại.");
                setProfiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [patientId]);

    // Xử lý khi nhấn nút Tiếp tục
    const handleNext = () => {
        if (!selectedProfile) {
            message.warning("Vui lòng chọn một hồ sơ sức khỏe để tiếp tục.");
            return;
        }
        onNext(selectedProfile);
    };

    // Render thẻ hồ sơ sức khỏe
    const renderProfileCard = (profile: HealthProfile) => {
        const isSelected = selectedProfile?._id === profile._id;

        return (
            <Col xs={24} sm={12} lg={8} key={profile._id}>
                <Card
                    hoverable
                    className={`transition-all duration-200 border-2 ${isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200'}`}
                    onClick={() => setSelectedProfile(profile)}
                    title={
                        <div className="flex items-center">
                            <FaUser className="mr-2 text-blue-500" />
                            <Title level={5} className="!mb-0 !text-blue-600 truncate">
                                {profile.type === "Patient" ? "Chính chủ" : profile.familyMemberName}
                            </Title>
                        </div>
                    }
                >
                    <div className="space-y-2 text-base text-gray-700">
                        <p className="flex items-center">
                            <FaHeartbeat className="mr-2 text-red-500" />
                            Nhóm máu: {profile.bloodType ?? "Không rõ"}
                        </p>
                        <p className="flex items-center">
                            <FaPerson className="mr-2 text-cyan-500" />
                            <div>
                                <p>Chiều cao: {profile.height ?? "-"} cm</p>
                                <p>Cân nặng: {profile.weight ?? "-"} kg </p>
                            </div>
                        </p>
                        {profile.emergencyContact && (
                            <p className="flex items-center">
                                <FaPhone className="mr-2 text-green-500" />
                                Người liên hệ khẩn cấp: {profile.emergencyContact.name} ({profile.emergencyContact.phone})
                            </p>
                        )}
                    </div>
                </Card>
            </Col>
        );
    };


    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={onBack} icon={<FaArrowLeft />}>Quay lại</Button>
                <Title level={3} className="!mb-0">3. Chọn Hồ sơ Sức khỏe</Title>
                <div />
            </div>

            <div className="bg-blue-50 p-3 mb-6 rounded-lg border-l-4 border-blue-500 text-base">
                <h1 className='font-bold'>Lịch hẹn đã chọn</h1>
                <p className="">Chuyên khoa: {specialtyName}</p>
                <p className="">Bác sĩ: {doctorName}</p>
                <p className="">Ngày & Giờ: {dayjs(date).format('dddd, DD/MM/YYYY')} lúc {timeSlot}</p>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-500">Đang tải hồ sơ sức khỏe...</p>
                </div>
            ) : (
                <>
                    {profiles.length > 0 ? (
                        <>
                            <Title level={5}>Chọn hồ sơ cho lần khám này:</Title>
                            <Row gutter={[16, 16]} className="mb-6">
                                {profiles.map(renderProfileCard)}
                            </Row>
                        </>
                    ) : (
                        <div className="text-center py-10 border rounded-lg bg-gray-50">
                            <Text type="warning">Không tìm thấy hồ sơ sức khỏe nào.</Text>
                            <p className="text-sm text-gray-500">Vui lòng tạo hồ sơ mới nếu cần.</p>
                        </div>
                    )}
                </>
            )}

            <div className="mt-8 pt-4 border-t flex justify-end">
                <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    disabled={!selectedProfile || loading}
                >
                    Tiếp tục ({selectedProfile ? (selectedProfile.type === 'Patient' ? 'Chính chủ' : selectedProfile.familyMemberName) : 'Chọn Hồ Sơ'})
                </Button>
            </div>
        </div>
    );
}

export default ChooseHealthProfile;