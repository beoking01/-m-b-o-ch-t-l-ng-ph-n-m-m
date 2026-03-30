import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getMonthAppointmentByDoctor, type AppointmentModel, confirmAppointment } from "../../services/AppointmentService";
import type { Dayjs } from "dayjs";
import { Badge, Calendar, Modal, type CalendarProps, Button, message } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FaCheckCircle } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

dayjs.extend(utc);
dayjs.extend(timezone);

const DoctorAppointment = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

    // State for month/year navigation
    const [currentYear, setCurrentYear] = useState(dayjs().year());
    const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1); // 1-12
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, [user?.id, currentYear, currentMonth]);

    const loadAppointments = async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            const res = await getMonthAppointmentByDoctor(
                user.id,
                currentYear,
                currentMonth
            );
            setAppointments(res.appointments);
        } catch (err) {
            console.error("Lỗi khi tải danh sách cuộc hẹn:", err);
            message.error("Không thể tải lịch hẹn");
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleToday = () => {
        const now = dayjs();
        setCurrentYear(now.year());
        setCurrentMonth(now.month() + 1);
    };

    const getAppointmentsForDate = (date: Dayjs) => {
        return appointments.filter((a) => {
            // Parse appointmentDate as UTC - chỉ lấy date string (không có time)
            const appointmentDateStr = a.appointmentDate.split('T')[0]; // "2025-12-25"
            const calendarDateStr = date.format('YYYY-MM-DD'); // "2025-12-25"
            
            // So sánh trực tiếp string để tránh mọi vấn đề timezone
            return appointmentDateStr === calendarDateStr;
        });
    };

    const statusToBadge = (status: string) => {
        switch (status) {
            case "pending": return "warning";
            case "waiting_assigned": return "default";
            case "confirmed": return "processing";
            case "completed": return "success";
            case "cancelled": return "error";
            default: return "default";
        }
    };

    const dateCellRender = (value: Dayjs) => {
        const daily = getAppointmentsForDate(value)
            .sort((a, b) => {
                const startA = a.timeSlot.split("-")[0];
                const startB = b.timeSlot.split("-")[0];
                return startA.localeCompare(startB);
            });
        return (
            <ul>
                {daily.map((a) => (
                    <li key={a._id}>
                        <Badge status={statusToBadge(a.status)} text={`${a.timeSlot}`} />
                    </li>
                ))}
            </ul>
        );
    };

    const onSelect = (value: Dayjs) => {
        setSelectedDate(value.clone());
        setIsModalVisible(true);
    };

    const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
        if (info.type === "date") {
            return (
                <div onClick={() => onSelect(current)} className="cursor-pointer">
                    {dateCellRender(current)}
                </div>
            );
        }
        return info.originNode;
    }; const handleClose = () => {
        setIsModalVisible(false);
        setSelectedDate(null);
    };

    const handleConfirmAppointment = async (appointmentId: string) => {
        Modal.confirm({
            title: "Xác nhận lịch hẹn",
            content: "Bạn có chắc chắn muốn xác nhận lịch hẹn này?",
            okText: "Xác nhận",
            cancelText: "Đóng",
            okType: "primary",
            onOk: async () => {
                try {
                    await confirmAppointment(appointmentId);
                    message.success("Xác nhận lịch hẹn thành công!");
                    loadAppointments(); // Reload appointments
                } catch (error: any) {
                    message.error(error.message || "Không thể xác nhận lịch hẹn. Vui lòng thử lại.");
                    console.error("Error confirming appointment:", error);
                }
            }
        });
    };

    const statusToVietnamese = (status: string) => {
        switch (status) {
            case "waiting_assigned": return "Chờ được phân công";
            case "pending": return "Chờ xác nhận";
            case "confirmed": return "Đã xác nhận";
            case "cancelled": return "Đã hủy";
            case "completed": return "Đã hoàn thành";
            default: return status;
        }
    };

    if (!user?.id) {
        return <div>
            Không tìm thấy bác sĩ liên kết với tài khoản của bạn.
        </div>;
    }

    return (
        <div className="">
            <div className="container mx-auto ">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Lịch hẹn của tôi</h1>
                
                {/* Month/Year Navigation */}
                <div className="flex items-center gap-3">
                    <Button
                        type="default"
                        icon={<MdChevronLeft />}
                        onClick={handlePreviousMonth}
                        disabled={loading}
                    />
                    <div className="font-semibold text-lg min-w-[150px] text-center">
                        Tháng {currentMonth}/{currentYear}
                    </div>
                    <Button
                        type="default"
                        icon={<MdChevronRight />}
                        onClick={handleNextMonth}
                        disabled={loading}
                    />
                    <Button
                        type="primary"
                        onClick={handleToday}
                        disabled={loading}
                    >
                        Hôm nay
                    </Button>
                </div>
            </div>

                <Calendar 
                    cellRender={cellRender} 
                    className="!p-2"
                    value={dayjs().year(currentYear).month(currentMonth - 1)}
                />
            </div>

            <Modal
                title={`Lịch hẹn vào ngày ${selectedDate ? selectedDate.format("YYYY-MM-DD") : ""}`}
                open={isModalVisible}
                onCancel={handleClose}
                footer={null}
            >
                {selectedDate && (
                    <ul className="p-3">
                        {getAppointmentsForDate(selectedDate)
                            .sort((a, b) => {
                                const startA = a.timeSlot.split("-")[0];
                                const startB = b.timeSlot.split("-")[0];
                                return startA.localeCompare(startB);
                            }).map((a) => (
                                <li key={a._id} className="mb-3 p-3 shadow rounded-md bg-blue-50 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-semibold">{a.timeSlot}</div>
                                            <div className="text-sm">Lý do: {a.reason}</div>
                                            <div className="text-sm">Trạng thái: {statusToVietnamese(a.status)}</div>
                                            <div className="text-sm">
                                                Bệnh nhân: {a.patient?.name || a.patientSnapshot?.name || 'N/A'}
                                            </div>
                                        </div>
                                        {(a.status === "pending" || a.status === "waiting_assigned") && (
                                            <Button
                                                type="text"
                                                icon={<FaCheckCircle size={20} />}
                                                onClick={() => handleConfirmAppointment(a._id)}
                                                title="Xác nhận lịch hẹn"
                                                className="flex items-center justify-center !text-blue-600 !hover:text-blue-800"
                                            />
                                        )}
                                    </div>
                                </li>
                            ))}
                        {getAppointmentsForDate(selectedDate).length === 0 && (
                            <p>Không có cuộc hẹn trong ngày này.</p>
                        )}
                    </ul>
                )}
            </Modal>
        </div>
    );
}
export default DoctorAppointment;