import { useEffect, useState } from "react";
import { Table, Button, Select, message, Spin, Empty } from "antd";
import { formatDateDDMMYYYY } from "../../utils/date";
import * as AppointmentService from "../../services/AppointmentService";
import * as SpecialtyService from "../../services/SpecialtyService";
import AssignDoctorModal from "../../components/Receptionist/AssignDoctorModal";
import type { AppointmentPayload } from "../../services/AppointmentService";
import type { Specialty } from "../../services/SpecialtyService";

const { Option } = Select;

const ReceptionistAppointment = () => {
    const [appointments, setAppointments] = useState<AppointmentPayload[]>([]);
    const [allAppointments, setAllAppointments] = useState<AppointmentPayload[]>([]);
    const [loading, setLoading] = useState(false);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [filterSpecialty, setFilterSpecialty] = useState<string>();

    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentPayload | null>(null);

    useEffect(() => {
        fetchSpecialties();
        fetchAllAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [filterSpecialty, allAppointments]);

    const fetchSpecialties = async () => {
        try {
            const res = await SpecialtyService.getSpecialties();
            setSpecialties(Array.isArray(res) ? res : []);
        } catch { }
    };

    const fetchAllAppointments = async () => {
        try {
            setLoading(true);

            // Fetch all appointments without specialty filter
            const params: any = { page: 1, limit: 1000 }; // Large limit to get all data

            const result: any = await AppointmentService.getAppointments(params);

            // đảm bảo lấy array
            const items: AppointmentPayload[] = Array.isArray(result)
                ? result
                : result?.items ?? result?.data ?? [];

            // filter appointment chưa có doctor
            const doctorless = items.filter(a => !a.doctor_id);

            setAllAppointments(doctorless);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lấy lịch hẹn");
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        if (!allAppointments.length) {
            setAppointments([]);
            return;
        }

        let filtered = [...allAppointments];

        // Client-side specialty filtering
        if (filterSpecialty) {
            filtered = filtered.filter(appointment => {
                const specialtyId = appointment.specialty_id;
                // Handle both string and object specialty_id
                if (typeof specialtyId === 'string') {
                    return specialtyId === filterSpecialty;
                } else if (typeof specialtyId === 'object' && specialtyId) {
                    return (specialtyId as any)._id === filterSpecialty;
                }
                return false;
            });
        }

        setAppointments(filtered);
    };
    const openAssignModal = async (appointment: AppointmentPayload) => {
        try {
            if (appointment.status !== "waiting_assigned") {
                const updated = await AppointmentService.updateAppointment(
                    String(appointment._id),
                    { status: "waiting_assigned" }
                );
                setSelectedAppointment(updated ?? appointment);
            } else {
                setSelectedAppointment(appointment);
            }
            setAssignModalOpen(true);
        } catch (err: any) {
            message.error("Không thể chuyển trạng thái lịch hẹn");
            setSelectedAppointment(appointment);
            setAssignModalOpen(true);
        }
    };

    const columns = [
        {
            title: "Bệnh nhân",
            key: "patient",
            render: (_: any, r: any) => {
                const getPatientName = (rec: any) => {
                    const p = rec.patientSnapshot;
                    if (!p) return '-';
                    if (typeof p === 'string' || typeof p === 'number') return String(p);
                    if (typeof p === 'object') return String(p.name ?? p.fullName ?? p.full_name ?? p.username ?? p.displayName ?? p.phone ?? '-');
                    return '-';
                };
                return getPatientName(r);
            }
        },
        {
            title: "Chuyên khoa",
            key: "specialty",
            render: (_: any, r: any) => {
                const getSpecialtyName = (rec: any) => {
                    const s = rec.specialty ?? rec.specialty_id ?? rec.specialtyId ?? rec.specialty_data ?? rec.specialtyInfo ?? rec.specialtyName;
                    if (!s) return '-';
                    if (typeof s === 'string' || typeof s === 'number') return String(s);
                    if (typeof s === 'object') return String(s.name ?? s.title ?? s.displayName ?? '-');
                    return '-';
                };
                return getSpecialtyName(r);
            }
        },
        {
            title: "Ngày",
            key: "appointmentDate",
            render: (_: any, r: any) => formatDateDDMMYYYY(r.appointmentDate)
        },
        {
            title: "Giờ",
            key: "timeSlot",
            render: (_: any, r: any) => r.timeSlot
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_: any, r: AppointmentPayload) => (
                <Button type="primary" onClick={() => openAssignModal(r)}>
                    Gán bác sĩ
                </Button>
            )
        }
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Lịch hẹn chưa phân bác sĩ</h1>

            <div className="mb-4 flex items-center gap-4">
                <Select
                    allowClear
                    placeholder="Lọc theo chuyên khoa"
                    style={{ width: 300 }}
                    value={filterSpecialty}
                    onChange={setFilterSpecialty}
                >
                    {specialties.map(s => (
                        <Option key={s._id} value={s._id}>
                            {s.name}
                        </Option>
                    ))}
                </Select>
            </div>

            {loading ? (
                <Spin />
            ) : appointments.length === 0 ? (
                <Empty description="Không có lịch hẹn chưa phân bác sĩ" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={appointments}
                    rowKey={r => String(r._id)}
                    pagination={{ pageSize: 10 }}
                />
            )}

            <AssignDoctorModal
                open={assignModalOpen}
                appointment={selectedAppointment ? { ...selectedAppointment, _id: String(selectedAppointment._id ?? "") } : null}
                onClose={() => {
                    setAssignModalOpen(false);
                    setSelectedAppointment(null);
                }}
                onAssigned={async () => {
                    // Chỉ fetch lại data, không đóng modal ở đây
                    // AssignDoctorModal sẽ tự đóng sau khi callback này xong
                    await fetchAllAppointments();
                }}
            />
        </div>
    );
};

export default ReceptionistAppointment;
