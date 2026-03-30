import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Form, Select, DatePicker, Input, message, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";

import * as AppointmentService from "../../services/AppointmentService";
import * as ScheduleService from "../../services/ScheduleService";

interface Doctor {
  _id: string;
  name: string;
}

interface ModalEditAppointmentProps {
  open: boolean;
  id?: string;
  onClose: () => void;
  onUpdated?: (updated: any) => void;
}

const { Option } = Select;

const normalizeAppointment = (data: any) => {
  const specialtyId =
    typeof data?.specialty_id === "object" ? data.specialty_id?._id : data?.specialty_id;
  const rawDate = data?.appointmentDate ?? data?.appointment_date ?? null;
  const appointmentDate = rawDate ? dayjs(rawDate) : null;
  const timeSlot = data?.timeSlot ?? data?.time_slot ?? undefined;
  const doctorId = typeof data?.doctor_id === "object" ? data.doctor_id?._id : data?.doctor_id;
  return { specialtyId, appointmentDate, timeSlot, doctorId, raw: data };
};

const uniqDoctors = (arr: Doctor[]) =>
  arr.filter((d, i, self) => self.findIndex(x => x._id === d._id) === i);

const ModalEditAppointment: React.FC<ModalEditAppointmentProps> = ({ open, id, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [currentSpecialty, setCurrentSpecialty] = useState<string | undefined>(undefined);

  const [form] = Form.useForm();

  // token to prevent stale async updates
  const fetchToken = useRef(0);

  // reset local state when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setDoctors([]);
      setTimeSlots([]);
      setCurrentSpecialty(undefined);
      // bump token to cancel inflight
      fetchToken.current += 1;
    }
  }, [open, form]);

  // load appointment detail
  useEffect(() => {
    if (!open || !id) return;
    const token = ++fetchToken.current;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const data: any = await AppointmentService.getAppointment(id);

        if (token !== fetchToken.current) return; // stale

        const { specialtyId, appointmentDate, timeSlot, doctorId } = normalizeAppointment(data);

        setCurrentSpecialty(specialtyId ?? undefined);

        // fill form (DatePicker expects dayjs or undefined)
        form.setFieldsValue({
          doctor_id: doctorId,
          appointmentDate: appointmentDate ?? undefined,
          timeSlot,
          status: data?.status,
          reason: data?.reason,
        });

        // load slots & doctors if we have specialty + date
        if (specialtyId && appointmentDate && appointmentDate.isValid()) {
          const dateStr = appointmentDate.format("YYYY-MM-DD");
          const slots: any[] = await ScheduleService.getAvailableTimeSlotsBySpecialty(specialtyId, dateStr);
          if (token !== fetchToken.current) return; // stale

          const formattedSlots = [...new Set(slots.map(s => `${s.startTime}-${s.endTime}`))];
          setTimeSlots(formattedSlots);

          const availableDoctors: Doctor[] = ([] as Doctor[]).concat(
            ...slots.map(s => {
              const ids = Array.isArray(s.doctor_ids) ? s.doctor_ids : s.doctor_id ? [s.doctor_id] : [];
              const names = Array.isArray(s.doctor_names) ? s.doctor_names : s.doctor_name ? s.doctor_name : [];
              return ids.map((did: string, i: number) => ({ _id: did, name: names?.[i] ?? "Unknown" }));
            })
          );

          setDoctors(uniqDoctors(availableDoctors));
        } else {
          setTimeSlots([]);
          setDoctors([]);
        }
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu lịch hẹn");
        form.resetFields();
        setTimeSlots([]);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      // cancel by bumping token
      fetchToken.current++;
    };
  }, [open, id, form]);

  // helper to load slots & doctors by specialty + date
  const loadSlotsAndDoctors = useCallback(
    async (specialtyId: string, dateStr: string) => {
      const token = ++fetchToken.current;
      try {
        setLoading(true);
        setTimeSlots([]);
        setDoctors([]);

        const slots: any[] = await ScheduleService.getAvailableTimeSlotsBySpecialty(specialtyId, dateStr);
        if (token !== fetchToken.current) return;

        const formattedSlots = [...new Set(slots.map(s => `${s.startTime}-${s.endTime}`))];
        setTimeSlots(formattedSlots);

        const availableDoctors: Doctor[] = ([] as Doctor[]).concat(
          ...slots.map(s => {
            const ids = Array.isArray(s.doctor_ids) ? s.doctor_ids : s.doctor_id ? [s.doctor_id] : [];
            const names = Array.isArray(s.doctor_names) ? s.doctor_names : s.doctor_name ? s.doctor_name : [];
            return ids.map((did: string, i: number) => ({ _id: did, name: names?.[i] ?? "Unknown" }));
          })
        );
        setDoctors(uniqDoctors(availableDoctors));
      } catch (err) {
        console.error(err);
        message.error("Không thể tải khung giờ/ bác sĩ khả dụng");
        setTimeSlots([]);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // date changed handler
  const handleDateChange = useCallback(
    (dateObj: Dayjs | null) => {
      const date = dateObj ? dateObj.format("YYYY-MM-DD") : "";
      const specialty = currentSpecialty;
      // reset time slot selection immediately for clean UX
      form.setFieldValue("timeSlot", undefined);

      if (!date || !specialty) {
        setTimeSlots([]);
        setDoctors([]);
        return;
      }

      loadSlotsAndDoctors(specialty, date);
    },
    [currentSpecialty, form, loadSlotsAndDoctors]
  );

  // doctor changed -> load slots for that doctor
  const handleDoctorChange = useCallback(
    async (doctorId: string) => {
      const dateObj: Dayjs | null = form.getFieldValue("appointmentDate") ?? null;
      if (!doctorId || !dateObj) {
        return;
      }

      const dateStr = dateObj.format("YYYY-MM-DD");
      const token = ++fetchToken.current;
      try {
        setLoading(true);
        setTimeSlots([]);

        // try to use a dedicated API (if exists) otherwise fallback to specialty based fetch and filter
        if (ScheduleService.getAvailableSlotsByDoctor) {
          const slots = await ScheduleService.getAvailableSlotsByDoctor(doctorId, dateStr);
          if (token !== fetchToken.current) return;

          // normalize slots shape: either [{ timeSlots: [{startTime, endTime}, ...] }, ...] or [{startTime, endTime}]
          const formattedSlots = ([] as string[]).concat(
            ...slots.map((s: any) =>
              Array.isArray(s.timeSlots) ? s.timeSlots.map((ts: any) => `${ts.startTime}-${ts.endTime}`) : [`${s.startTime}-${s.endTime}`]
            )
          );
          setTimeSlots([...new Set(formattedSlots)]);
        } else {
          // fallback: load by specialty and filter by doctorId
          const specialty = currentSpecialty;
          if (!specialty) return;
          const slots: any[] = await ScheduleService.getAvailableTimeSlotsBySpecialty(specialty, dateStr);
          if (token !== fetchToken.current) return;

          const filtered = slots.filter(s => {
            const ids = Array.isArray(s.doctor_ids) ? s.doctor_ids : s.doctor_id ? [s.doctor_id] : [];
            return ids.includes(doctorId);
          });
          const formatted = [...new Set(filtered.map(s => `${s.startTime}-${s.endTime}`))];
          setTimeSlots(formatted);
        }

        // reset timeSlot if not present
        if (!timeSlots.includes(form.getFieldValue("timeSlot"))) {
          form.setFieldValue("timeSlot", undefined);
        }
      } catch (err) {
        console.error(err);
        message.error("Không thể tải khung giờ cho bác sĩ");
      } finally {
        setLoading(false);
      }
    },
    [currentSpecialty, form, timeSlots]
  );

  const handleOk = useCallback(async () => {
    if (!id) return;
    try {
      const values = await form.validateFields();
      setSaving(true);

      const appointmentDate: Dayjs = values.appointmentDate;
      const payload = {
        doctor_id: values.doctor_id,
        appointmentDate: appointmentDate ? appointmentDate.toISOString() : undefined,
        timeSlot: values.timeSlot,
        status: values.status,
        reason: values.reason,
      };

      const updated = await AppointmentService.updateAppointment(id, payload);
      message.success("Cập nhật lịch hẹn thành công");
      onUpdated?.(updated);
      onClose();
    } catch (err: any) {
      if (!err?.errorFields) {
        message.error("Cập nhật thất bại");
      }
    } finally {
      setSaving(false);
    }
  }, [form, id, onClose, onUpdated]);

  return (
    <Modal
      title="Chỉnh sửa lịch hẹn"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText="Lưu"
      width={600}
    >
      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical" disabled={loading}>
          <Form.Item
            name="doctor_id"
            label="Bác sĩ"
            rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
          >
            <Select
              placeholder="Chọn bác sĩ"
              showSearch
              optionFilterProp="children"
              onChange={(val: string) => handleDoctorChange(val)}
              value={form.getFieldValue("doctor_id")}
            >
              {doctors.map(d => (
                <Option key={d._id} value={d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="appointmentDate"
            label="Ngày"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="timeSlot"
            label="Khung giờ"
            rules={[{ required: true, message: "Vui lòng chọn khung giờ" }]}
          >
            <Select placeholder="Chọn khung giờ">
              {timeSlots.map(t => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={[
                { value: "waiting_assigned", label: "Chờ phân công" },
                { value: "pending", label: "Đang chờ" },
                { value: "confirmed", label: "Đã phân công" },
                { value: "completed", label: "Hoàn thành" },
                { value: "cancelled", label: "Đã hủy" },
              ]}
            />
          </Form.Item>

          <Form.Item name="reason" label="Lý do / Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ModalEditAppointment;
