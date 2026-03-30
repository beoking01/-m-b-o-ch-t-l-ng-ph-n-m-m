import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, message, Popconfirm, Space, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import { deleteDoctorSchedule, getDoctorSchedule, updateDoctorScheduleSlot, type ScheduleEntry } from '../../services/ScheduleService';
import { getDoctorById, type Doctor } from '../../services/DoctorService';
import utc from 'dayjs/plugin/utc';
import ModalCreateSchedule from '../../components/Admin/ModalCreateSchedule';
dayjs.extend(utc);
dayjs.extend(weekday);

const { Title, Text } = Typography;

// Các khung giờ cố định trong ngày (sáng + chiều)
const TIME_SLOTS = [
    '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00',
    '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30',
    '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
    '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30',
];

const ScheduleManagement = () => {
    const { doctorId } = useParams<{ doctorId: string }>();
    const navigate = useNavigate();
    const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);

    // Lấy thông tin bác sĩ
    useEffect(() => {
        const loadDoctorInfo = async () => {
            if (!doctorId) return;
            try {
                const doctor = await getDoctorById(doctorId);
                setDoctorInfo(doctor);
            } catch (err) {
                message.error('Không tải được thông tin bác sĩ');
            }
        };
        loadDoctorInfo();
    }, [doctorId]);

    // Lấy dữ liệu lịch
    useEffect(() => {
        const loadSchedule = async () => {
            if (!doctorId) return;
            setLoading(true);
            try {
                const data = await getDoctorSchedule(doctorId);
                setScheduleData(data || []);
            } catch (err) {
                message.error('Không tải được lịch khám');
            } finally {
                setLoading(false);
            }
        };
        loadSchedule();
    }, [doctorId]);

    // Tạo map: date (ISO string) → danh sách timeSlots
    const scheduleMap = new Map<string, ScheduleEntry>();
    scheduleData.forEach(entry => {
        const dateKey = dayjs.utc(entry.date).format('YYYY-MM-DD');
        scheduleMap.set(dateKey, entry);
    });

    // Tạo 7 ngày gần nhất 
    const today = dayjs.utc().startOf('day');
    const weekDays = Array.from({ length: 14 }, (_, i) => today.add(i, 'day')); // Hiển thị 2 tuần để dễ quản lý    // Xử lý bật/tắt slot
    const handleToggleSlot = async (date: string, slotId: string, currentBooked: boolean) => {
        try {
            // Gọi API cập nhật
            await updateDoctorScheduleSlot(slotId, { isBooked: !currentBooked });

            setScheduleData(prev => prev.map(entry => {
                if (dayjs.utc(entry.date).format('YYYY-MM-DD') === date) {
                    return {
                        ...entry,
                        timeSlots: entry.timeSlots.map(slot =>
                            slot._id === slotId ? { ...slot, isBooked: !currentBooked } : slot
                        ),
                    };
                }
                return entry;
            }));
            message.success('Cập nhật thành công');
        } catch (err) {
            message.error('Cập nhật thất bại');
        }
    };

    // Hàm reload dữ liệu sau khi tạo thành công
    const reloadSchedule = async () => {
        if (!doctorId) return;
        setLoading(true);
        try {
            const data = await getDoctorSchedule(doctorId);
            setScheduleData(data || []);
        } catch (err) {
            message.error('Tải lại dữ liệu thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Hàm xóa lịch của một ngày
    const handleDeleteDay = async (scheduleId: string, dateKey: string) => {
        try {
            const success = await deleteDoctorSchedule(scheduleId);
            if (success) {
                message.success(`Đã xóa lịch ngày ${dayjs(dateKey).format('DD/MM/YYYY')}`);
                reloadSchedule();
            } else {
                message.error('Xóa thất bại');
            }
        } catch (err) {
            message.error('Xóa thất bại');
        }
    };

    return (
        <div className="container mx-auto p-4 ">
            <div className="mb-6 flex items-center justify-between">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/doctor-schedule')}>
                        Quay lại
                    </Button>
                    <div className='ml-4 space-x-4'>
                        <Title level={2} className="!mb-0">
                            Quản lý lịch khám - {doctorInfo ? doctorInfo.name : 'Đang tải...'}
                        </Title>
                        {doctorInfo && doctorInfo.specialtyId && (
                            <Text type="secondary" className="text-base">
                                Chuyên khoa: {typeof doctorInfo.specialtyId === 'object' ? doctorInfo.specialtyId.name : doctorInfo.specialtyId}
                            </Text>
                        )}
                    </div>
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                    Thêm ngày mới
                </Button>
            </div>

            <Card loading={loading}>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 bg-gray-50 p-3 text-left sticky left-0 z-10 bg-white">
                                    Giờ khám
                                </th>
                                {weekDays.map((day) => {
                                    const dateKey = day.format('YYYY-MM-DD');
                                    const entry = scheduleMap.get(dateKey);
                                    const isToday = day.isSame(dayjs(), 'day');

                                    return (
                                        <th
                                            key={dateKey}
                                            className={`border border-gray-300 p-3 text-center min-w-32 ${isToday ? 'bg-blue-50' : 'bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-semibold">
                                                {day.format('dd')}
                                            </div>
                                            <div className="text-lg">{day.format('DD/MM')}</div>
                                            {entry ? (
                                                <Tag color="green" className="mt-1">Đã tạo lịch</Tag>
                                            ) : (
                                                <Tag color="default" className="mt-1">Chưa có</Tag>
                                            )}
                                            {entry && (
                                                <div className="flex justify-center mt-2">
                                                    <Popconfirm
                                                        title={`Xóa lịch ngày ${day.format('DD/MM/YYYY')}?`}
                                                        onConfirm={() => {
                                                            if (!entry._id) {
                                                                message.error('ID lịch không tồn tại');
                                                                return;
                                                            }
                                                            handleDeleteDay(entry._id, dateKey);
                                                        }}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((timeLabel) => {
                                const [startTime] = timeLabel.split(' - ');

                                return (
                                    <tr key={timeLabel}>
                                        <td className="border border-gray-300 px-4 py-3 font-medium sticky left-0 bg-white z-10">
                                            {timeLabel}
                                        </td>
                                        {weekDays.map((day) => {
                                            const dateKey = day.format('YYYY-MM-DD');
                                            const entry = scheduleMap.get(dateKey);
                                            const slot = entry?.timeSlots.find(s => s.startTime === startTime);

                                            return (
                                                <td
                                                    key={dateKey}
                                                    className="border border-gray-300 p-1 text-center h-16 align-middle"
                                                >
                                                    {slot ? (
                                                        <Popconfirm
                                                            title={slot.isBooked ? "Bỏ đặt lịch này?" : "Đánh dấu đã đặt?"}
                                                            onConfirm={() => handleToggleSlot(dateKey, slot._id, slot.isBooked)}
                                                            okText="Có"
                                                            cancelText="Không"
                                                        >
                                                            <div
                                                                className={`h-full flex items-center justify-center rounded cursor-pointer transition-all ${slot.isBooked
                                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                                                    }`}
                                                            >
                                                                {slot.isBooked ? 'Đã đặt' : 'Trống'}
                                                            </div>
                                                        </Popconfirm>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                                            —
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex gap-4 items-center text-sm">
                    <span><Tag color="green">Trống</Tag>: Có thể đặt</span>
                    <span><Tag color="red">Đã đặt</Tag>: Đã có bệnh nhân</span>
                    <span><Tag color="default">Chưa có</Tag>: Ngày chưa tạo lịch</span>
                </div>
            </Card>

            <ModalCreateSchedule
                doctorId={doctorId!}
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSuccess={reloadSchedule}
            />
        </div>
    );
};

export default ScheduleManagement;