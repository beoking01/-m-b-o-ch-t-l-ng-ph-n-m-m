import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getMonthAppointmentByBooker, type BookerAppointmentModel, cancelAppointment } from "../../services/AppointmentService";
import { Badge, Calendar, Modal, type CalendarProps, Button, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { MdCancel, MdChevronLeft, MdChevronRight } from "react-icons/md";

dayjs.extend(utc);
dayjs.extend(timezone);

const PatientAppointment = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<BookerAppointmentModel[]>([]);
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
            const res = await getMonthAppointmentByBooker(
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
    };    const getAppointmentsForDate = (date: Dayjs) => {
        return appointments.filter((a) => {
            // Parse appointmentDate as UTC - chỉ lấy date string (không có time)
            const appointmentDateStr = a.appointmentDate.split('T')[0]; 
            const calendarDateStr = date.format('YYYY-MM-DD'); 
            
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
    };    const statusToVietnamese = (status: string) => {
        switch (status) {
            case "waiting_assigned": return "Chờ được phân công";
            case "pending": return "Chờ xác nhận";
            case "confirmed": return "Đã xác nhận";
            case "cancelled": return "Đã hủy";
            case "completed": return "Đã hoàn thành";
            default: return status;
        }
    };    const dateCellRender = (value: Dayjs) => {
        
        const daily = getAppointmentsForDate(value)
            .sort((a, b) => {
                const startA = a.timeSlot.split("-")[0];
                const startB = b.timeSlot.split("-")[0];
                return startA.localeCompare(startB);
            });

        if (daily.length === 0) return null;

        return (
            <>
                {/* Mobile view: just show colored dots */}
                <div className="flex flex-wrap gap-1 sm:hidden">
                    {daily.slice(0, 3).map((a) => (
                        <span
                            key={a._id}
                            className={`w-2 h-2 rounded-full ${
                                a.status === 'pending' ? 'bg-yellow-500' :
                                a.status === 'waiting_assigned' ? 'bg-gray-400' :
                                a.status === 'confirmed' ? 'bg-blue-500' :
                                a.status === 'completed' ? 'bg-green-500' :
                                a.status === 'cancelled' ? 'bg-red-500' :
                                'bg-gray-400'
                            }`}
                        />
                    ))}
                    {daily.length > 3 && (
                        <span className="text-[8px] text-gray-500">+{daily.length - 3}</span>
                    )}
                </div>

                {/* Desktop view: show time slots */}
                <ul className="hidden sm:block list-none p-0 m-0 space-y-0.5">
                    {daily.map((a) => (
                        <li key={a._id} className="truncate">
                            <Badge 
                                status={statusToBadge(a.status)} 
                                text={
                                    <span className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis">
                                        {a.timeSlot}
                                    </span>
                                } 
                            />
                        </li>
                    ))}
                </ul>
            </>
        );
    };

    const onSelect = (value: Dayjs) => {
        setSelectedDate(value.clone());
        setIsModalVisible(true);
    }; const handleClose = () => {
        setIsModalVisible(false);
        setSelectedDate(null);
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        Modal.confirm({
            title: "Xác nhận hủy lịch hẹn",
            content: "Bạn có chắc chắn muốn hủy lịch hẹn này?",
            okText: "Hủy lịch hẹn",
            cancelText: "Đóng",
            okType: "danger",
            onOk: async () => {
                try {
                    await cancelAppointment(appointmentId);
                    message.success("Hủy lịch hẹn thành công!");
                    loadAppointments(); // Reload appointments
                } catch (error: any) {
                    message.error(error.message || "Không thể hủy lịch hẹn. Vui lòng thử lại.");
                    console.error("Error cancelling appointment:", error);
                }
            }
        });
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
    };    if (!user?.id) return <div className="p-4">Loading user info...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Lịch hẹn của tôi</h1>
                
                {/* Month/Year Navigation */}
                <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <Button
                        type="default"
                        icon={<MdChevronLeft />}
                        onClick={handlePreviousMonth}
                        disabled={loading}
                        size="small"
                        className="sm:!text-base"
                    />
                    <div className="font-semibold text-base sm:text-lg min-w-[120px] sm:min-w-[150px] text-center">
                        Tháng {currentMonth}/{currentYear}
                    </div>
                    <Button
                        type="default"
                        icon={<MdChevronRight />}
                        onClick={handleNextMonth}
                        disabled={loading}
                        size="small"
                        className="sm:!text-base"
                    />
                    <Button
                        type="primary"
                        onClick={handleToday}
                        disabled={loading}
                        size="small"
                        className="sm:!text-base"
                    >
                        Hôm nay
                    </Button>
                </div>
            </div>
            
            <Calendar 
                cellRender={cellRender} 
                className="!p-2 sm:[&_.ant-picker-calendar-date-content]:!h-auto sm:[&_.ant-picker-calendar-date-content]:!min-h-[120px] [&_.ant-picker-cell-inner]:!text-[20px] sm:[&_.ant-picker-cell-inner]:!text-sm"
                value={dayjs(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)}
                onPanelChange={(value) => {
                    setCurrentYear(value.year());
                    setCurrentMonth(value.month() + 1);
                }}
            />            
            <Modal
                title={<span className="text-sm sm:text-base">{`Lịch hẹn vào ngày ${selectedDate ? selectedDate.format("DD/MM/YYYY") : ""}`}</span>}
                open={isModalVisible}
                onCancel={handleClose}
                footer={null}
                className="[&_.ant-modal-content]:!p-3 sm:[&_.ant-modal-content]:!p-6"
                width="90%"
                style={{ maxWidth: 600, top: 20 }}
            >
                {selectedDate && (
                    <ul className="p-2 sm:p-3">
                        {getAppointmentsForDate(selectedDate)
                            .sort((a, b) => {
                                const startA = a.timeSlot.split("-")[0];
                                const startB = b.timeSlot.split("-")[0];
                                return startA.localeCompare(startB);
                            })
                            .map((a) => (
                                <li key={a._id} className="mb-2 sm:mb-3 p-2 sm:p-3 shadow rounded-md bg-blue-50 relative">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm sm:text-base">{a.timeSlot}</div>
                                            <div className="text-xs sm:text-sm break-words">Lý do: {a.reason}</div>
                                            <div className="text-xs sm:text-sm">Trạng thái: {statusToVietnamese(a.status)}</div>
                                            <div className="text-xs sm:text-sm">
                                                Bác sĩ: {a.doctorSnapshot?.name || "Chưa phân công"}
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                Chuyên khoa: {a.specialtySnapshot?.name || "Không rõ"}
                                            </div>
                                        </div>
                                        {(a.status === "pending" || a.status === "waiting_assigned" || a.status === "confirmed") && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MdCancel className="text-base sm:text-xl" />}
                                                onClick={() => handleCancelAppointment(a._id)}
                                                title="Hủy lịch hẹn"
                                                className="flex items-center justify-center flex-shrink-0"
                                                size="small"
                                            />
                                        )}
                                    </div>
                                </li>
                            ))}
                        {getAppointmentsForDate(selectedDate).length === 0 && (
                            <p className="text-sm sm:text-base">Không có cuộc hẹn trong ngày này.</p>
                        )}
                    </ul>
                )}
            </Modal>
        </div>
    );
};

export default PatientAppointment;
