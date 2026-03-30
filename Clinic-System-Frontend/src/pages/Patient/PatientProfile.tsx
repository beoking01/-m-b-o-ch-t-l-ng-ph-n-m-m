import React, { useState, useEffect } from 'react';
import { Card, Spin, Skeleton, Alert, Tag, Button, Descriptions, Empty } from 'antd';
import { UserOutlined, PhoneOutlined, CalendarOutlined, IdcardOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getPatientByAccountId, type Patient } from "../../services/PatientService";
import { useAuth } from '../../contexts/AuthContext';
import { MdEmail } from 'react-icons/md';
import UpdateInfoModal from '../../components/Patient/UpdateInfoModal';
import { CacheService } from '../../services/CacheService';

// Hàm tính tuổi
const calculateAge = (dob?: string | null): number | null => {
    if (!dob) return null;
    return moment.utc().diff(moment.utc(dob), 'years');
};

const PatientProfile: React.FC = () => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const currentAccountId = user?.id || '';
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);

                const cacheKey = `patient_${currentAccountId}`;

                // Check cache first
                let data = CacheService.get<Patient>(cacheKey);
                if (!data) {
                    data = await getPatientByAccountId(currentAccountId);
                    if (data) {
                        CacheService.set(cacheKey, data);
                    }
                }
                setPatient(data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu bệnh nhân:", err);
                setError("Không thể tải thông tin bệnh nhân. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [currentAccountId]);

    if (loading) {
        return (
            <div className="p-4 sm:p-8 flex justify-center">
                <Card className="w-full max-w-3xl shadow-xl rounded-xl">
                    <Skeleton avatar active paragraph={{ rows: 4 }} />
                    <div className="mt-4 text-center">
                        <Spin size="large" />
                        <p className="mt-2 text-gray-500">Đang tải hồ sơ bệnh nhân...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-8 flex justify-center">
                <Alert
                    message="Lỗi Dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    className="w-full max-w-3xl"
                />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="p-4 sm:p-8 flex justify-center">
                <Card className="w-full max-w-3xl shadow-xl rounded-xl">
                    <Empty
                        description={<span>Không tìm thấy hồ sơ bệnh nhân nào.</span>}
                    />
                </Card>
            </div>
        );
    }

    const age = calculateAge(patient.dob);
    const formattedDob = patient.dob
        ? moment(patient.dob.split('T')[0]).format('DD/MM/YYYY')
        : 'N/A';
    const gender = (patient as any).gender || 'N/A';
    const address = (patient as any).address || 'Chưa cập nhật';

    const handlePatientUpdate = (updatedPatient: Patient) => {
        setPatient(updatedPatient);
        // Clear cache to ensure fresh data on next load
        const cacheKey = `patient_${currentAccountId}`;
        CacheService.set(cacheKey, updatedPatient);
    };

    return (
        <div className="container p-2 sm:p-4 md:p-8 ">
            <div className=" mx-auto w-full">
                <Card
                    className="shadow-2xl rounded-2xl border-t-4 border-indigo-500"
                    title={
                        <div className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-2xl font-bold text-gray-800">
                            <UserOutlined className="text-indigo-600" />
                            <span>Hồ Sơ Bệnh Nhân</span>
                        </div>
                    }
                    extra={
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg !text-xs sm:!text-sm"
                            size="small"
                            onClick={() => setIsEditModalVisible(true)}
                        >
                            <span className="hidden sm:inline">Chỉnh Sửa Hồ Sơ</span>
                            <span className="inline sm:hidden">Sửa</span>
                        </Button>
                    }
                >
                    {/* Phần Thông tin Cơ bản */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 border-b pb-4 gap-4">
                        {/* Ảnh đại diện giả */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl sm:text-3xl font-semibold shadow-md flex-shrink-0">
                            {patient.name.charAt(0)}
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">{patient.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                                <Tag color="blue" icon={<IdcardOutlined />} className="text-xs sm:text-sm">
                                    <span className="hidden sm:inline">ID Tài Khoản: </span>
                                    {patient.accountId}
                                </Tag>
                                {age !== null && (
                                    <Tag color="purple" icon={<CalendarOutlined />} className="text-xs sm:text-sm">Tuổi: {age}</Tag>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Phần Chi tiết Liên hệ và Cá nhân */}
                    <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-3 border-l-4 border-yellow-500 pl-2">Chi Tiết Cá Nhân</h4>
                    <Descriptions
                        bordered
                        column={{
                            xs: 2,
                            sm: 2,
                            md: 1,
                            lg: 1,
                            xl: 1,
                            xxl: 1,
                        }}
                        layout="horizontal"
                        className="
                        rounded-lg overflow-hidden
                        [&_.ant-descriptions-item-label]:!font-medium
                        [&_.ant-descriptions-item-label]:!whitespace-normal
                        [&_.ant-descriptions-item-label]:!align-top
                        [&_.ant-descriptions-item-content]:!whitespace-normal
                        [&_.ant-descriptions-item-content]:break-words
                        [&_.ant-descriptions-item]:flex
                        [&_.ant-descriptions-item]:flex-col
                        md:[&_.ant-descriptions-item]:flex-row
                        "
                    >
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center gap-1 sm:gap-2"><CalendarOutlined /> <span className="hidden xs:inline">Ngày Sinh</span><span className="inline xs:hidden">Ngày Sinh</span></span>}
                        >
                            <span className="font-semibold text-gray-700">{formattedDob}</span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center gap-1 sm:gap-2"><PhoneOutlined /> <span className="hidden xs:inline">Số Điện Thoại</span><span className="inline xs:hidden">Số Điện Thoại</span></span>}
                        >
                            <span className="font-semibold">{patient.phone}</span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center gap-1 sm:gap-2"><MdEmail /> Email</span>}
                        >
                            <span className="font-semibold break-words">{user?.email}</span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center gap-1 sm:gap-2"><UserOutlined /> <span className="hidden xs:inline">Giới Tính</span><span className="inline xs:hidden">Giới tính</span></span>}
                        >
                            <span className="font-semibold text-gray-700">{gender === "male" ? "Nam" : "Nữ"}</span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center gap-1 sm:gap-2"><EnvironmentOutlined /> <span className="hidden xs:inline">Địa Chỉ</span><span className="inline xs:hidden">Địa Chỉ</span></span>}
                            span={2}
                        >
                            <span className="break-words">{address}</span>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>

            {patient && (
                <UpdateInfoModal
                    open={isEditModalVisible}
                    patient={patient}
                    patientId={patient._id ?? ''}
                    onClose={() => setIsEditModalVisible(false)}
                    onUpdated={handlePatientUpdate}
                />
            )}
        </div>
    );
};

export default PatientProfile;