import React, { useState, useEffect } from 'react';
import { Card, Spin, Skeleton, Alert, Tag, Button, Descriptions, Empty } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { MdEmail } from 'react-icons/md';
import { getReceptionistByAccountId, type Receptionist } from '../../services/ReceptionistService';
import UpdateReceptionistProfileModal from '../../components/Receptionist/UpdateProfileModal';

const ReceptionistProfile: React.FC = () => {
    const [receptionist, setReceptionist] = useState<Receptionist | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const currentAccountId = user?.id || '';
    const [openEdit, setOpenEdit] = useState(false);

    useEffect(() => {
        const fetchReceptionistData = async () => {
            try {
                setLoading(true);
                const data = await getReceptionistByAccountId(currentAccountId);
                setReceptionist(data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu lễ tân:", err);
                setError("Không thể tải thông tin lễ tân. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchReceptionistData();
    }, [currentAccountId]);

    if (loading) {
        return (
            <div className="p-4 sm:p-8 flex justify-center">
                <Card className="w-full max-w-3xl shadow-xl rounded-xl">
                    <Skeleton avatar active paragraph={{ rows: 4 }} />
                    <div className="mt-4 text-center">
                        <Spin size="large" />
                        <p className="mt-2 text-gray-500">Đang tải hồ sơ lễ tân...</p>
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

    if (!receptionist) {
        return (
            <div className="p-4 sm:p-8 flex justify-center">
                <Card className="w-full max-w-3xl shadow-xl rounded-xl">
                    <Empty
                        description={<span>Không tìm thấy hồ sơ lễ tân nào.</span>}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 ">
            <div className=" mx-auto">
                <Card
                    className="shadow-2xl rounded-2xl border-t-4 border-indigo-500"
                    title={
                        <div className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                            <UserOutlined className="text-indigo-600" />
                            <span>Hồ Sơ Lễ Tân</span>
                        </div>
                    }
                    extra={
                        <Button type="primary" icon={<UserOutlined />} className="bg-indigo-600 hover:bg-indigo-700 rounded-lg" onClick={() => setOpenEdit(true)}>
                            Chỉnh Sửa Hồ Sơ
                        </Button>
                    }
                >
                    {/* Phần Thông tin Cơ bản */}
                    <div className="flex items-center mb-6 border-b pb-4">
                        {/* Ảnh đại diện giả */}
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-semibold mr-6 shadow-md">
                            {receptionist.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-gray-900">{receptionist.name}</h3>
                            <div className="mt-1 space-x-2">
                                <Tag color="blue" icon={<IdcardOutlined />}>ID Tài Khoản: {user?.id}</Tag>
                            </div>
                        </div>
                    </div>

                    {/* Phần Chi tiết Liên hệ và Cá nhân */}
                    <h4 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-yellow-500 pl-2">Chi Tiết Cá Nhân</h4>
                    <Descriptions
                        column={1}
                        bordered
                        layout="horizontal"
                        className="rounded-lg overflow-hidden"
                    >
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><PhoneOutlined className="mr-2" /> Số Điện Thoại</span>}
                        >
                            <span className="font-semibold">{receptionist.phone}</span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={<span className="font-medium flex items-center"><MdEmail className="mr-2" /> Email</span>}
                        >
                            <span className="font-semibold">{user?.email}</span>
                        </Descriptions.Item>
                    </Descriptions>

                </Card>
            </div>

            <UpdateReceptionistProfileModal
                open={openEdit}
                accountId={currentAccountId}
                onClose={() => setOpenEdit(false)}
                onUpdated={(updated) => setReceptionist(updated)}
            />
        </div>
    );
};

export default ReceptionistProfile;