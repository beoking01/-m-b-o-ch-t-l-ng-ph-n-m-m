import React, { useState, useEffect } from 'react';
import { Card, Spin, Skeleton, Alert, Tag, Descriptions, Empty, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined, RocketOutlined, ExperimentOutlined, ScheduleOutlined } from '@ant-design/icons';
import { MdEmail } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { getDoctorByAccountId, type DoctorProfileNew } from "../../services/DoctorService";
import UpdateProfileModal from '../../components/Doctor/UpdateProfileModal';
import ButtonPrimary from '../../utils/ButtonPrimary';
import { FaUser } from 'react-icons/fa';

const DoctorProfileComponent: React.FC = () => {
    const [doctor, setDoctor] = useState<DoctorProfileNew | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const currentAccountId = user?.id
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const fetchDoctorData = async () => {
        if (!currentAccountId) {
            setError("Không tìm thấy Account ID để tải hồ sơ.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Gọi hàm service của Doctor
            const data = await getDoctorByAccountId(currentAccountId);
            setDoctor(data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu bác sĩ:", err);
            setError("Không thể tải thông tin hồ sơ bác sĩ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctorData();
    }, [currentAccountId]);

    // --- Xử lý trạng thái tải và lỗi ---
    if (loading) {
        return (
            <div className="p-4 sm:p-8 flex justify-center bg-gray-50 min-h-screen">
                <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
                    <Skeleton active avatar paragraph={{ rows: 5 }} />
                    <div className="mt-4 text-center">
                        <Spin size="large" />
                        <p className="mt-2 text-gray-500">Đang tải hồ sơ chuyên gia...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-8 flex justify-center bg-gray-50 min-h-screen">
                <Alert
                    message="Lỗi Tải Dữ Liệu"
                    description={error}
                    type="error"
                    showIcon
                    className="w-full max-w-4xl"
                />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="p-4 sm:p-8 flex justify-center bg-gray-50 min-h-screen">
                <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
                    <Empty
                        description={<span>Không tìm thấy hồ sơ bác sĩ nào.</span>}
                    />
                </Card>
            </div>
        );
    } const handleDoctorUpdate = async () => {
        // Tải lại dữ liệu từ server để đảm bảo thông tin đầy đủ và chính xác
        await fetchDoctorData();
    };
    const specialtyName = doctor.specialtyId?.name || 'Chưa xác định';
    const experience = doctor.experience;
    const email = doctor.accountId?.email || 'N/A';
    const phone = doctor.phone || 'N/A';

    return (
        <div className="p-4 sm:p-8 ">
            <div className="container mx-auto">
                <Card
                    className="shadow-2xl rounded-2xl border-t-4 border-cyan-600"
                    title={
                        <div className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                            <ExperimentOutlined className="text-cyan-600" />
                            <span>Hồ Sơ Bác Sĩ</span>
                        </div>
                    }
                    extra={
                        <ButtonPrimary
                            type="default"
                            icon={<ScheduleOutlined />}
                            className="text-cyan-600 border-cyan-600 hover:bg-cyan-50 rounded-lg"
                            onClick={() => setIsEditModalVisible(true)}
                        >
                            Sửa hồ sơ
                        </ButtonPrimary>
                    }
                >
                    {/* Phần Thông tin Cơ bản (Tên, Avatar, Tags) */}
                    <div className="flex flex-col md:flex-row items-start md:items-center mb-6 border-b pb-4">
                        {/* Avatar */}
                        <Avatar
                            size={96}
                            icon={<UserOutlined />}
                            className="bg-cyan-100 text-cyan-600 text-5xl font-bold shadow-lg mr-6 flex-shrink-0"
                        >
                            {doctor.name.charAt(0)}
                        </Avatar>

                        <div className="mt-4 md:mt-0 mx-4">
                            <h3 className="text-3xl font-extrabold text-gray-900 leading-tight">{doctor.name}</h3>
                            <div className="mt-1 space-x-2">
                                <Tag color="blue" icon={<IdcardOutlined />}>ID Tài Khoản: {doctor.accountId?._id}</Tag>
                                <Tag color="processing" icon={<ExperimentOutlined />} className="text-base px-3 py-1 font-semibold">
                                    {specialtyName}
                                </Tag>
                            </div>
                        </div>
                    </div>

                    {/* Phần Chi tiết Chuyên môn và Liên hệ */}
                    <h4 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-indigo-500 pl-2">Thông Tin Chuyên Môn & Liên Hệ</h4>

                    <Descriptions
                        column={1}
                        bordered
                        layout="horizontal"
                        className="rounded-lg overflow-hidden"
                        size="middle"
                    >
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><RocketOutlined className="mr-2" /> Kinh Nghiệm</span>}
                        >
                            <span className="font-bold text-indigo-600">{experience} năm</span>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><MdEmail className="mr-2" /> Email</span>}
                        >
                            <span className="font-semibold">{email}</span>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><PhoneOutlined className="mr-2" /> Số Điện Thoại</span>}
                        >
                            <span className="font-semibold text-green-600">{phone}</span>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><ExperimentOutlined className="mr-2" /> Tên Chuyên Khoa</span>}
                        >
                            {specialtyName}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><FaUser className="mr-2" /> Giới thiệu</span>}
                        >
                            {doctor.bio || 'Chưa cập nhật tiểu sử.'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>

            {doctor && (
                <UpdateProfileModal
                    open={isEditModalVisible}
                    accountId={user?.id || ""}
                    onClose={() => setIsEditModalVisible(false)}
                    onUpdated={handleDoctorUpdate}
                />
            )}
        </div>
    );
};

export default DoctorProfileComponent;