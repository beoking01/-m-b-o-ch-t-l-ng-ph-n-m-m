import React, { useState, useEffect } from 'react';
import { Card, Spin, Skeleton, Alert, Tag, Descriptions, Empty, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined, RocketOutlined, ExperimentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { getDoctorById, type Doctor} from "../../services/DoctorService";
import { getAccountById } from '../../services/AccountService';
import NavbarDark from '../General/NavbarDark';
import Footer from '../General/Footer';

const DoctorProfileView: React.FC = () => {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Lấy doctorId từ URL
    const { doctorId } = useParams<{ doctorId: string }>();

    const fetchDoctorData = async () => {
        if (!doctorId) {
            setError("Không tìm thấy Doctor ID để tải hồ sơ.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getDoctorById(doctorId);
            // If backend returned doctor with accountId as an ID (not populated), try to fetch account to get avatar
            if (data && data.accountId && typeof data.accountId === 'string') {
                const acc = await getAccountById(data.accountId);
                (data as any).accountId = acc || data.accountId;
            }
            setDoctor(data);
            console.log(data)
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
    }, [doctorId]);

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
    }

    const specialtyName = doctor.specialtyId?.name || 'Chưa xác định';
    const experience = doctor.experience;
    const phone = doctor.phone || 'N/A';
    const bio = doctor.bio || 'Chưa có thông tin tiểu sử.';

    return (
        <div className=''>
            <NavbarDark />
            <div className="p-4 mt-10 sm:p-8">
                <div className="container mx-auto">
                    <Card
                        className="shadow-2xl rounded-2xl border-t-4 border-cyan-600"
                        title={
                            <div className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                                <ExperimentOutlined className="text-cyan-600" />
                                <span>Hồ Sơ Bác Sĩ {doctor.name}</span>
                            </div>
                        }
                    >
                        <div className="relative mb-14">
                            <div className="h-80 w-full bg-cover bg-center bg-[url('https://png.pngtree.com/background/20210711/original/pngtree-blue-flat-medical-banner-background-picture-image_1101136.jpg')] rounded-xl"></div>


                            <div className="absolute left-6 bottom-[-48px]">
                                <Avatar
                                    size={144}
                                    src={(doctor as any).avatar || (doctor.accountId as any)?.avatar}
                                    icon={<UserOutlined />}
                                    className="bg-cyan-100 text-cyan-600 text-5xl font-bold shadow-lg !object-contain"
                                >
                                    {(!((doctor as any).avatar) && !(doctor.accountId as any)?.avatar) && doctor.name.charAt(0)}
                                </Avatar>
                            </div>
                        </div>

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
                                label={<span className="font-medium flex items-center"><PhoneOutlined className="mr-2" /> Số Điện Thoại</span>}
                            >
                                <span className="font-semibold text-green-600">{phone}</span>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={<span className="font-medium flex items-center"><IdcardOutlined className="mr-2" /> Mã Bác Sĩ</span>}
                            >
                                <Tag color="magenta">{doctor._id}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span className="font-medium flex items-center"><ExperimentOutlined className="mr-2" /> Tên Chuyên Khoa</span>}
                            >
                                {specialtyName}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span className="font-medium flex items-center"><InfoCircleOutlined className="mr-2" /> Tiểu Sử</span>}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <span className="text-gray-700">{bio}</span>
                                    </div>
                                </div>
                            </Descriptions.Item>

                        </Descriptions>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DoctorProfileView;
