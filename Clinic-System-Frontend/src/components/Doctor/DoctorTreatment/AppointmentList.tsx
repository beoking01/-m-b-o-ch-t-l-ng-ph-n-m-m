import { useEffect, useState } from "react";
import { Button, Card, Space, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getAppointmentsByDoctorToday } from "../../../services/AppointmentService";
import { ClockCircleOutlined, CalendarOutlined, SolutionOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
dayjs.extend(utc);

const { Title, Text } = Typography;

interface Props {
    accountId: string;
    onSelect: (app: any) => void;
    onDoctorIdChange: (doctorId: string) => void;
}

const getGenderLabel = (gender?: string): string => {
    switch ((gender || "").toLowerCase()) {
        case "nam":
            return "Nam";
        case "nữ":
            return "Nữ";
        case "khác":
            return "Khác";
        case "other":
            return "Khác";
        case "male":
            return "Nam";
        case "female":
            return "Nữ";
        default:
            return "Chưa cập nhật";
    }
};

const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
        case "pending":
            return <Tag icon={<ClockCircleOutlined />} color="orange">Đang chờ</Tag>;
        case "confirmed":
            return <Tag icon={<CheckCircleOutlined />} color="blue">Đã xác nhận</Tag>;
        case "completed":
            return <Tag icon={<SolutionOutlined />} color="green">Đã hoàn thành</Tag>;
        case "cancelled":
            return <Tag icon={<CloseCircleOutlined />} color="red">Đã hủy</Tag>;
        case "waiting_assigned":
            return <Tag icon={<ClockCircleOutlined />} color="purple">Chờ phân công</Tag>;
        default:
            return <Tag>{status}</Tag>;
    }
};

const AppointmentList = ({ onSelect, accountId, onDoctorIdChange }: Props) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getAppointmentsByDoctorToday(accountId);
        setData(res.appointments);

        // Lấy doctorId từ appointment đầu tiên và truyền lên component cha
        if (res.appointments && res.appointments.length > 0) {
            const doctorId = res.appointments[0].doctor_id;
            onDoctorIdChange(doctorId);
        }

        setLoading(false);
    };

    const columns = [
        {
            title: "Bệnh nhân",
            key: "patient",
            render: (record: any) => {
                // Sử dụng snapshot data thay vì populated data
                const patientData = record.patientSnapshot;
                const name = patientData?.name || "N/A";
                const gender = patientData?.gender || "";
                const dob = patientData?.dob ? dayjs().diff(dayjs(patientData.dob), "year") : "N/A";
                
                return (
                    <div>
                        <Text strong>{name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '0.85em' }}>
                            {getGenderLabel(gender)} - {dob} tuổi
                        </Text>
                    </div>
                );
            },
            sorter: (a: any, b: any) => {
                const nameA = (a.patientSnapshot?.name || "");
                const nameB = (b.patientSnapshot?.name || "");
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: "Ngày & Giờ Hẹn",
            dataIndex: "appointmentDate",
            key: "dateTime",
            render: (date: string, record: any) => (
                <Space direction="vertical" size={2}>
                    <Text><CalendarOutlined /> {dayjs.utc(date).format("DD/MM/YYYY")}</Text>
                    <Text strong><ClockCircleOutlined /> {record.timeSlot}</Text>
                </Space>
            ),
            sorter: (a: any, b: any) => dayjs(a.appointmentDate).valueOf() - dayjs(b.appointmentDate).valueOf(),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true, // Tự động cắt bớt nếu quá dài
            width: '25%',
            render: (reason: string) => <Text>{reason || 'Không có lý do cụ thể'}</Text>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => getStatusTag(status),
            filters: [
                { text: 'Đang chờ', value: 'Pending' },
                { text: 'Đã xác nhận', value: 'Confirmed' },
                { text: 'Đã hoàn thành', value: 'Completed' },
            ],
            onFilter: (value: any, record: any) => record.status.indexOf(value) === 0,
        },
        {
            title: "Hành động",
            key: "action",
            render: (record: any) => (
                // Chỉ cho phép "Khám" nếu trạng thái là Confirmed/Pending
                <Button
                    type="primary"
                    icon={<SolutionOutlined />}
                    onClick={() => onSelect(record)}
                    disabled={record.status.toLowerCase() === 'completed' ||
                        record.status.toLowerCase() === 'cancelled' ||
                        record.status.toLowerCase() === 'pending' ||
                        record.status.toLowerCase() === 'waiting_assigned'
                    }
                >
                    Khám
                </Button>
            )
        }
    ]; return (
        <div>
            <Card variant="outlined" className="shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <Title level={3} className="!mb-0"><CalendarOutlined /> Danh Sách Cuộc Hẹn</Title>
                </div>

                {!data || data.length === 0 ? (
                    <div className="text-center py-8">
                        <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                        <Title level={4} type="secondary">Không có lịch hẹn trong ngày</Title>
                        <Text type="secondary">Hiện tại không có cuộc hẹn nào được lên lịch cho hôm nay.</Text>
                        <div className="mt-4">
                            <Button
                                icon={<SyncOutlined />}
                                onClick={loadData}
                                loading={loading}
                                type="default"
                            >
                                Làm mới
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Table
                        loading={loading}
                        dataSource={data}
                        columns={columns}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </Card>
        </div>
    );
};

export default AppointmentList;
