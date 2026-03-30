import { useEffect, useState } from "react";
import { Table, message, Tag } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getDoctorsWithPaging } from "../../services/DoctorService";
import type { Doctor } from "../../services/DoctorService";
import ButtonPrimary from "../../utils/ButtonPrimary";

const DoctorSchedule = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadDoctors();
    }, [page, pageSize]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const { items, total: totalItems } = await getDoctorsWithPaging({ page, limit: pageSize });
            setDoctors(items);
            setTotal(totalItems);
        } catch (error) {
            message.error("Không thể tải danh sách bác sĩ");
            console.error("Error loading doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination: any) => {
        if (pagination.current) setPage(pagination.current);
        if (pagination.pageSize) setPageSize(pagination.pageSize);
    };

    const columns = [
        {
            title: "Tên bác sĩ",
            dataIndex: "name",
            key: "name",
            render: (text: string) => <span className="font-semibold">{text}</span>
        }, {
            title: "Email",
            key: "email",
            render: (_: any, record: Doctor) => (
                <span>{record.accountId?.email || "N/A"}</span>
            )
        },
        {
            title: "Chuyên khoa",
            key: "specialty",
            render: (_: any, record: Doctor) => {
                const specialtyName = record.specialtyId?.name;
                return specialtyName ? (
                    <Tag color="blue">{specialtyName}</Tag>
                ) : (
                    <span className="text-gray-400">Chưa có</span>
                );
            }
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            render: (text: string) => text || <span className="text-gray-400">N/A</span>
        },
        {
            title: "Kinh nghiệm",
            dataIndex: "experience",
            key: "experience",
            align: "center" as const,
            render: (exp: number) => exp ? `${exp} năm` : <span className="text-gray-400">N/A</span>
        }, {
            title: "Trạng thái",
            key: "status",
            render: (_: any, record: Doctor) => {
                const status = record.accountId?.status;
                return status === "active" ? (
                    <Tag color="green">Hoạt động</Tag>
                ) : (
                    <Tag color="red">Không hoạt động</Tag>
                );
            }
        }, {
            title: "Hành động",
            key: "actions",
            render: (_: any, record: Doctor) => {
                const isActive = record.accountId?.status === "active";
                return (
                    <ButtonPrimary
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => navigate(`/admin/doctor-schedule/${record._id}`)}
                        disabled={!isActive}
                        title={!isActive ? "Bác sĩ không hoạt động" : "Xem lịch trình bác sĩ"}
                    >
                        Xem lịch
                    </ButtonPrimary>
                );
            }
        }
    ];

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4 flex items-center gap-4">
                <h1 className="text-3xl font-bold">Quản lý Lịch Trình Bác Sĩ</h1>
            </div>

            <Table
                columns={columns}
                dataSource={doctors}
                rowKey={(record) => record._id}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bác sĩ`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
            />
        </div>
    );
};

export default DoctorSchedule;