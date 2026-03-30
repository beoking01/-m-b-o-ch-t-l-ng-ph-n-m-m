import { Modal, Form, DatePicker, message, Button, Space, Checkbox, Typography } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { createSchedule, type ScheduleEntry } from '../../services/ScheduleService';

const { Title, Text } = Typography;

const FIXED_TIME_SLOTS = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '13:00', end: '13:30' },
    { start: '13:30', end: '14:00' },
    { start: '14:00', end: '14:30' },
    { start: '14:30', end: '15:00' },
    { start: '15:00', end: '15:30' },
    { start: '15:30', end: '16:00' },
    { start: '16:00', end: '16:30' },
];

interface ModalCreateScheduleProps {
    doctorId: string;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingDate?: string | null;
    scheduleMap?: Map<string, ScheduleEntry>;
}

const ModalCreateSchedule: React.FC<ModalCreateScheduleProps> = ({
    doctorId,
    visible,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const morningSlots = FIXED_TIME_SLOTS.slice(0, 7);
    const afternoonSlots = FIXED_TIME_SLOTS.slice(7);

    const handleSelectAll = () => {
        const allSlotStarts = FIXED_TIME_SLOTS.map(slot => slot.start);
        form.setFieldsValue({ timeSlots: allSlotStarts });
    };

    const handleDeselectAll = () => {
        form.setFieldsValue({ timeSlots: [] });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const selectedStarts: string[] = values.timeSlots || [];

            if (selectedStarts.length === 0) {
                message.warning('Vui lòng chọn ít nhất một khung giờ');
                return;
            }

            const timeSlots = selectedStarts.map(startTime => {
                const slot = FIXED_TIME_SLOTS.find(s => s.start === startTime)!;
                return {
                    startTime: slot.start,
                    endTime: slot.end,
                    isBooked: false,
                };
            });

            setLoading(true);
            await createSchedule({
                doctor_id: doctorId,
                date: values.date.format('YYYY-MM-DD'),
                timeSlots,
            });
            console.log("SEND:", {
                doctor_id: doctorId,
                date: values.date.format('YYYY-MM-DD'),
                timeSlots,
            });
            message.success('Tạo lịch khám thành công!');
            form.resetFields();
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err?.response?.data?.message) {
                message.error(err.response.data.message);
            } else {
                message.error('Tạo lịch thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={<Title level={4}>Tạo lịch khám mới</Title>}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Tạo lịch"
            cancelText="Hủy"
            confirmLoading={loading}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="date"
                    label="Chọn ngày khám"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                    <DatePicker
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        style={{ width: '100%' }}
                        placeholder="Chọn ngày"
                    />
                </Form.Item>
                <Form.Item
                    name="timeSlots"
                    label={
                        <div className="flex justify-between items-center w-full space-x-4">
                            <span>Chọn khung giờ làm việc</span>
                            <Space>
                                <Button size="small" color='blue' variant='outlined' type="link" onClick={handleSelectAll}>
                                    Chọn tất cả
                                </Button>
                                <Button size="small" color='danger' variant='outlined' type="link" danger onClick={handleDeselectAll}>
                                    Bỏ chọn tất cả
                                </Button>
                            </Space>
                        </div>
                    }
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một khung giờ' }]}
                >
                    <Checkbox.Group className="w-full">
                        <div className="w-full grid grid-cols-2 gap-6">
                            {/* Buổi sáng */}
                            <div >
                                <Space direction="vertical" className="ml-4 mt-2">
                                <Text strong>Sáng (08:00 - 11:30)</Text>
                                    {morningSlots.map(slot => (
                                        <Checkbox key={slot.start} value={slot.start}>
                                            {slot.start} - {slot.end}
                                        </Checkbox>
                                    ))}
                                </Space>
                            </div>

                            {/* Buổi chiều */}
                            <div>
                                <Space direction="vertical" className="ml-4 mt-2">
                                <Text strong>Chiều (13:00 - 16:30)</Text>
                                    {afternoonSlots.map(slot => (
                                        <Checkbox key={slot.start} value={slot.start}>
                                            {slot.start} - {slot.end}
                                        </Checkbox>
                                    ))}
                                </Space>
                            </div>
                        </div>
                    </Checkbox.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCreateSchedule;