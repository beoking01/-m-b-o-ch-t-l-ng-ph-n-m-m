import { useEffect, useState } from "react";
import { Modal, Select, Spin, Empty, message } from "antd";
import * as ScheduleService from "../../services/ScheduleService";
import * as AppointmentService from "../../services/AppointmentService";
import * as DoctorService from "../../services/DoctorService";
import type { AvailableSlots } from "../../services/ScheduleService";

const { Option } = Select;

type Doctor = { _id: string; name: string };

type AppointmentLike = {
  _id: string;
  specialty_id?: string;
  appointmentDate?: string;
  appointment_date?: string;
  time_slot?: string;
  timeSlot?: string;
};

type Props = {
  open: boolean;
  appointment: AppointmentLike | null;
  onClose: () => void;
  onAssigned?: () => void;
};

export default function AssignDoctorModal({ open, appointment, onClose, onAssigned }: Props) {

  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<string>();

  useEffect(() => {
    if (!open || !appointment) return;

    (async () => {
      setLoading(true);
      setDoctors([]);
      setDoctorId(undefined);

      try {
        // 1. Lấy specialty_id dạng string
        const specialty_id_raw: any = appointment.specialty_id;
        const specialty_id =
          typeof specialty_id_raw === "string" ? specialty_id_raw : specialty_id_raw?._id;

        // 2. Lấy appointment date chuẩn YYYY-MM-DD
        const rawDate = appointment.appointmentDate ?? appointment.appointment_date ?? "";
        let date = "";
        if (rawDate) {
          const d = new Date(rawDate);
          date = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(rawDate).slice(0, 10);
        }

        // 3. Lấy timeSlot
        const timeSlot = appointment.time_slot ?? appointment.timeSlot;
        if (!specialty_id || !date || !timeSlot) {
          message.error("Thiếu dữ liệu cuộc hẹn");
          console.log("Missing data", { specialty_id, date, timeSlot });
          return;
        }
        const [startTime, endTime] = timeSlot.split("-").map(s => s.trim());

        // 4. Gọi API lấy tất cả slot trống theo specialty
        const slots: AvailableSlots[] = await ScheduleService.getAvailableTimeSlotsBySpecialty(specialty_id, date);

        // 5. Lọc slot đúng giờ
        const matched = slots.filter(s => s.startTime === startTime && s.endTime === endTime);
        console.log("matched slots", matched);

        if (!matched.length) {
          setDoctors([]);
          return;
        }

        // 6. Lấy danh sách doctor_id
        const doctorIds = matched.flatMap(s => s.doctor_ids ?? []);
        console.log("doctorIds", doctorIds);

        // 7. Fetch thông tin doctor
        const doctorList = await DoctorService.getDoctorsByIds(doctorIds);
        setDoctors(doctorList);

      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách bác sĩ");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, appointment]);
  const handleAssign = async () => {
    console.log("Assigning doctor", doctorId, "to appointment", appointment);
    if (!doctorId || !appointment) return message.warning("Chọn bác sĩ");

    try {
      setLoading(true);
      await AppointmentService.assignDoctor(String(appointment._id), doctorId);
      message.success("Gán bác sĩ thành công");
      
      // Gọi callback để reload data TRƯỚC khi đóng modal
      if (onAssigned) {
        await onAssigned();
      }
      
      // Reset state và đóng modal
      setDoctorId(undefined);
      onClose();
    } catch {
      message.error("Gán thất bại");
    } finally {
      setLoading(false);
    }
  };
  const handleOk = () => {
    if (!doctorId) return message.warning("Chọn bác sĩ trước khi gán");
    handleAssign();
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Gán bác sĩ"
      title="Chọn bác sĩ">
      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}>
          <Spin />
        </div>
      ) : doctors.length === 0 ? (
        <Empty description="Không có bác sĩ khả dụng" />
      ) : (
        <Select
          value={doctorId}
          onChange={setDoctorId}
          style={{ width: "100%" }}
          placeholder="Chọn bác sĩ"
        >
          {doctors.map((d) => (
            <Option key={d._id} value={d._id}>
              {d.name}
            </Option>
          ))}
        </Select>
      )}
    </Modal>
  );
}
