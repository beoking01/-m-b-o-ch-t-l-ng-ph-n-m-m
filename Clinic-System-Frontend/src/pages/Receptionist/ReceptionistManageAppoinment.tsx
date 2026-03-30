import { Button, Input, message, Table, Modal, Tag, Select } from "antd";
import { useEffect, useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";
import { formatDateDDMMYYYY } from "../../utils/date";
import * as AppointmentService from "../../services/AppointmentService";
import type { AppointmentModel, AppointmentMeta } from "../../services/AppointmentService";
import ButtonPrimary from "../../utils/ButtonPrimary";
import { AiFillEdit } from "react-icons/ai";
import { ClockCircleOutlined, CheckCircleOutlined, SolutionOutlined, CloseCircleOutlined } from "@ant-design/icons";
import ModalEditAppointment from "../../components/Admin/ModalEditAppointment";

const ReceptionistManageAppointment = () => {
    const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
    const [meta, setMeta] = useState<AppointmentMeta | null>(null);

    // table query state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<string | undefined>(undefined);
    const [q, setQ] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | undefined>(undefined);
    const [specialtyFilter, setSpecialtyFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, [page, pageSize, sort, q, specialtyFilter, statusFilter]);
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
    const fetchAppointments = async () => {
        try {
            setLoading(true);

            // Check if we need client-side filtering (search or filters active)
            const hasSearchOrFilter = q || specialtyFilter || statusFilter;

            let result: any;
            let items: AppointmentModel[];
            let metaObj: AppointmentMeta | null;

            if (hasSearchOrFilter) {
                // 🔹 Fetch ALL data for client-side filtering/search
                result = await (AppointmentService as any).getAppointments({
                    page: 1,
                    limit: 1000, // Large limit to get all data
                });

                items = Array.isArray(result)
                    ? result
                    : result?.items ?? result?.data ?? result?.appointments ?? [];

                let filtered = [...items];

                // 🔹 Search theo tên bệnh nhân và bác sĩ
                if (q) {
                    const searchLower = q.toLowerCase();
                    filtered = filtered.filter(
                        (a) =>
                            getPatientName(a).toLowerCase().includes(searchLower) ||
                            getDoctorName(a).toLowerCase().includes(searchLower)
                    );
                }

                // 🔹 Filter theo chuyên khoa
                if (specialtyFilter) {
                    filtered = filtered.filter(
                        (a) => {
                            const specialtyData = a?.specialty || a?.specialtySnapshot;
                            let specialtyName = "";
                            
                            if (specialtyData && typeof specialtyData === 'object') {
                                specialtyName = (specialtyData as any)?.name || "";
                            } else if (typeof a?.specialty_id === 'object') {
                                specialtyName = (a.specialty_id as any)?.name || "";
                            }
                            
                            return specialtyName.toLowerCase().includes(specialtyFilter.toLowerCase());
                        }
                    );
                }

                // 🔹 Filter theo trạng thái
                if (statusFilter) {
                    filtered = filtered.filter(
                        (a) => (a.status ?? "").toLowerCase() === statusFilter.toLowerCase()
                    );
                }

                // 🔹 Client-side sort
                if (sort) {
                    const [field, order] = sort.split("_"); // ex: patient_asc
                    filtered.sort((a, b) => {
                        let aVal = "";
                        let bVal = "";

                        switch (field) {
                            case "patient":
                                aVal = getPatientName(a);
                                bVal = getPatientName(b);
                                break;
                            case "doctor":
                                aVal = getDoctorName(a);
                                bVal = getDoctorName(b);
                                break;
                            case "specialty":
                                aVal = typeof a?.specialty_id === 'object'
                                    ? (a.specialty_id as any)?.name
                                    : (a?.specialty_id ?? "");
                                bVal = typeof b?.specialty_id === 'object'
                                    ? (b.specialty_id as any)?.name
                                    : (b?.specialty_id ?? "");
                                break;
                            case "status":
                                aVal = a.status ?? "";
                                bVal = b.status ?? "";
                                break;
                            case "appointmentDate":
                                aVal = a.appointmentDate ?? a.appointment_date ?? a.createdAt ?? "";
                                bVal = b.appointmentDate ?? b.appointment_date ?? b.createdAt ?? "";
                                break;
                            case "timeSlot":
                                aVal = a.timeSlot ?? a.time_slot ?? "";
                                bVal = b.timeSlot ?? b.time_slot ?? "";
                                break;
                            case "reason":
                                aVal = a.reason ?? "";
                                bVal = b.reason ?? "";
                                break;
                        }

                        if (order === "asc") return String(aVal).localeCompare(String(bVal));
                        return String(bVal).localeCompare(String(aVal));
                    });
                }

                // 🔹 Client-side pagination
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                const paged = filtered.slice(start, end);

                setAppointments(paged);
                setMeta({
                    total: filtered.length,
                    page,
                    limit: pageSize,
                    totalPages: Math.ceil(filtered.length / pageSize)
                });
                return paged;
            } else {
                // 🔹 No search/filter - use server-side pagination
                result = await (AppointmentService as any).getAppointments({
                    page,
                    limit: pageSize,
                    sort,
                });

                items = Array.isArray(result)
                    ? result
                    : result?.items ?? result?.data ?? result?.appointments ?? [];

                metaObj = result?.meta ?? null;

                setAppointments(items);
                setMeta(metaObj);
                return items;
            }
        } catch (error: any) {
            console.error("fetchAppointments error:", error);
            message.error("Lỗi khi lấy danh sách lịch hẹn");
            return [];
        } finally {
            setLoading(false);
        }
    };


    const handleSearchInputChange = (value: string) => {
        setSearchInput(value);
    };

    const handleSearchSubmit = () => {
        setPage(1);
        setQ(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setQ("");
        setSpecialtyFilter("");
        setStatusFilter("");
        setPage(1);
    };
    const handleTableChange = (
        pagination: { current?: number; pageSize?: number },
        _filters: any,
        sorter: any
    ) => {
        if (pagination.current) setPage(pagination.current);
        if (pagination.pageSize) setPageSize(pagination.pageSize);

        if (sorter && sorter.field) {
            const field = sorter.field as string;
            const order = sorter.order as "ascend" | "descend" | undefined;

            if (!order) {
                setSort(undefined);
                return;
            }

            // patientName
            if (field === "patientName") {
                setSort(order === "ascend" ? "patient_asc" : "patient_desc");
                return;
            }

            // doctorName
            if (field === "doctorName") {
                setSort(order === "ascend" ? "doctor_asc" : "doctor_desc");
                return;
            }

            // specialty
            if (field === "specialty") {
                setSort(order === "ascend" ? "specialty_asc" : "specialty_desc");
                return;
            }

            // status
            if (field === "status") {
                setSort(order === "ascend" ? "status_asc" : "status_desc");
                return;
            }

            // timeSlot
            if (field === "timeSlot") {
                setSort(order === "ascend" ? "timeSlot" : "-timeSlot");
                return;
            }

            // reason
            if (field === "reason") {
                setSort(order === "ascend" ? "reason" : "-reason");
                return;
            }

            // default: ngày hẹn
            setSort(order === "ascend" ? "appointmentDate" : "-appointmentDate");
        } else {
            setSort(undefined);
        }
    };

    const openEditModal = (record: AppointmentModel) => {
        const id = String((record as any)._id);
        setEditingId(id);
        setEditOpen(true);
        // console.log("openEditModal called", id, editOpen);

    };

    type ID = string | number;

    const handleDelete = async (_id: ID | undefined): Promise<void> => {
        Modal.confirm({
            title: "Xoá lịch hẹn",
            content: "Bạn có chắc muốn xoá lịch hẹn này? Hành động này không thể hoàn tác.",
            okText: "Xoá",
            okType: "danger",
            cancelText: "Huỷ",
            onOk: async (): Promise<void> => {
                try {
                    const id = String(_id);
                    await AppointmentService.deleteAppointment(id);
                    message.success("Xoá lịch hẹn thành công");
                    fetchAppointments();
                } catch (err) {
                    console.error("deleteAppointment error:", err);
                    message.error("Xoá lịch hẹn thất bại");
                }
            },
        });
    };

    // Helpers adapted to your JSON shape
    const getPatientName = (record: any): string => {
        if (!record) return "-";
        
        // Ưu tiên snapshot từ backend
        const patientData = record.patient || record.patientSnapshot;
        if (patientData && typeof patientData === 'object') {
            return String(patientData.name ?? patientData.fullName ?? patientData.username ?? patientData.email ?? "-");
        }
        
        // Fallback: check some common fields
        const primitive = record.patientName ?? record.name ?? record.username ?? record.email;
        return primitive ? String(primitive) : "-";
    };

    const getDoctorName = (record: any): string => {
        if (!record) return "-";
        
        // Ưu tiên snapshot từ backend
        const doctorData = record.doctor || record.doctorSnapshot;
        if (doctorData && typeof doctorData === 'object') {
            return String(doctorData.name ?? doctorData.fullName ?? doctorData.username ?? doctorData.email ?? "-");
        }
        
        // Fallback: nếu có doctor_id dạng object (populate cũ)
        const doc = record.doctor_id;
        if (doc) {
            if (typeof doc === "string") return doc;
            if (typeof doc === "object") {
                return String(doc.name ?? doc.fullName ?? doc.username ?? doc.email ?? "-");
            }
        }
        
        return "-";
    };
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 70,
            render: (_: any, __: any, index: number) => {
                const current = page;
                const size = pageSize;
                return (current - 1) * size + index + 1;
            }
        },
        {
            title: "Bệnh nhân",
            key: "patientName",
            sorter: true,
            render: (_: any, record: any) => getPatientName(record),
        },
        {
            title: "Bác sĩ",
            key: "doctorName",
            sorter: true,
            render: (_: any, record: any) => getDoctorName(record),
        },
        {
            title: "Ngày hẹn",
            dataIndex: "appointmentDate",
            key: "appointmentDate",
            sorter: true,
            width: 160,
            render: (_: any, record: any) => {
                const dateVal = record.appointmentDate ?? record.appointment_date ?? record.createdAt;
                return formatDateDDMMYYYY(dateVal);
            },
        },
        {
            title: "Khung giờ",
            dataIndex: "timeSlot",
            key: "timeSlot",
            sorter: true,
            render: (_: any, record: any) => record.timeSlot ?? record.time_slot ?? "-",
        },
        {
            title: "Chuyên khoa",
            key: "specialty",
            sorter: true,
            render: (_: any, record: any) => {
                const specialtyData = record?.specialty || record?.specialtySnapshot;
                if (specialtyData && typeof specialtyData === 'object') {
                    return specialtyData.name || "-";
                }
                return record?.specialty_id?.name || "-";
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            sorter: true,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            sorter: true,
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            render: (record: AppointmentModel) => (
                <span className="flex gap-2">
                    <ButtonPrimary
                        type="link"
                        shape="round"
                        icon={<AiFillEdit />}
                        onClick={() => openEditModal(record)}
                    >
                        Sửa
                    </ButtonPrimary>
                    <Button
                        type="link"
                        danger
                        shape="round"
                        icon={<FaTrash />}
                        onClick={() => handleDelete((record as any)._id)}
                    >
                        Xoá
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Quản lý lịch hẹn</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div style={{ minWidth: 300, width: "100%", maxWidth: 500 }}>
                        <Input
                            placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ, hoặc thông tin khác..."
                            value={searchInput}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            onPressEnter={handleSearchSubmit}
                            allowClear
                            onClear={handleClearSearch}
                        />
                    </div>
                    <Button
                        icon={<FaSearch />}
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "white",
                            borderColor: "var(--color-primary)",
                        }}
                        onClick={handleSearchSubmit}
                    >
                        Tìm kiếm
                    </Button>
                    <Select
                        placeholder="Lọc theo chuyên khoa"
                        allowClear
                        value={specialtyFilter || undefined}
                        onChange={(value) => setSpecialtyFilter(value || "")}
                        style={{ minWidth: 150 }}
                    >
                        <Select.Option value="Nhi">Nhi</Select.Option>
                        <Select.Option value="Sản phụ khoa">Sản phụ khoa</Select.Option>
                        <Select.Option value="Tim mạch">Tim mạch</Select.Option>
                        <Select.Option value="Tai mũi họng">Tai mũi họng</Select.Option>
                        <Select.Option value="Da liễu">Da liễu</Select.Option>
                        <Select.Option value="Thần kinh">Thần kinh</Select.Option>
                        <Select.Option value="Y học tổng quát">Y học tổng quát</Select.Option>
                        <Select.Option value="Mắt">Mắt</Select.Option>
                        <Select.Option value="Tâm thần">Tâm thần</Select.Option>
                    </Select>
                    <Select
                        placeholder="Lọc theo trạng thái"
                        allowClear
                        value={statusFilter || undefined}
                        onChange={(value) => setStatusFilter(value || "")}
                        style={{ minWidth: 150 }}
                    >
                        <Select.Option value="pending">Đang chờ</Select.Option>
                        <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                        <Select.Option value="completed">Đã hoàn thành</Select.Option>
                        <Select.Option value="cancelled">Đã hủy</Select.Option>
                        <Select.Option value="waiting_assigned">Chờ phân công</Select.Option>
                    </Select>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={appointments}
                rowKey={(record) => (record as any)._id ?? ""}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: meta?.total ?? appointments.length,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                }}
                onChange={handleTableChange}
            />

            <ModalEditAppointment
                open={editOpen}
                id={editingId}
                onClose={() => {
                    setEditingId(undefined);
                    setEditOpen(false);
                }}
                onUpdated={() => fetchAppointments()}
            />
        </div>
    );
};

export default ReceptionistManageAppointment;
