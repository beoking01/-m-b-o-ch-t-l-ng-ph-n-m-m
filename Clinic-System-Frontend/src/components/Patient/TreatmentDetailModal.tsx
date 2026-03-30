import { useEffect, useState } from "react";
import { Modal, Descriptions, Table, Spin, Empty, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { getTreatmentById } from "../../services/TreatmentService";
import type {
    Treatment as TreatmentType,
    LabOrder,
    Prescription,
} from "../../services/TreatmentService";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const { Text, Title } = Typography;

type Props = {
    visible: boolean;
    treatmentId?: string | null;
    onClose: () => void;
};

const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "—";
    return `${value.toLocaleString("vi-VN")} VND`;
};

const TreatmentDetailModal: React.FC<Props> = ({ visible, treatmentId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [treatment, setTreatment] = useState<TreatmentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) return;
        if (!treatmentId) {
            setTreatment(null);
            setError("Treatment ID is missing");
            return;
        }

        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getTreatmentById(treatmentId);
                if (!mounted) return;
                setTreatment(data);
            } catch (err: any) {
                console.error("Load treatment error", err);
                if (!mounted) return;
                setError(err?.message || "Không tải được chi tiết ca khám");
                setTreatment(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [visible, treatmentId]);    const labColumns: ColumnsType<LabOrder["items"][number]> = [
        {
            title: "Dịch vụ",
            dataIndex: "serviceName",
            key: "serviceName",
            render: (text, rec) => {
                if (text) return text;
                if (rec.serviceId && typeof rec.serviceId === 'object') return rec.serviceId.name;
                return "—";
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "right",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            align: "right",
            width: 150,
            render: (text, rec) => {
                if (text) return formatCurrency(text);
                if (rec.serviceId && typeof rec.serviceId === 'object') return formatCurrency(rec.serviceId.price);
                return "—";
            },
        }
    ];    const medicineColumns: ColumnsType<Prescription["items"][number]> = [
        {
            title: "Thuốc",
            dataIndex: "medicineName",
            key: "name",
            render: (text, rec) => {
                if (text) return text;
                if (rec.medicineId && typeof rec.medicineId === 'object') return rec.medicineId.name;
                return "—";
            },
            fixed: "left",
            width: 200,
        },
        {
            title: "Nhà sản xuất",
            dataIndex: "manufacturer",
            key: "manufacturer",
            render: (text, rec) => {
                if (text) return text;
                if (rec.medicineId && typeof rec.medicineId === 'object') return rec.medicineId.manufacturer;
                return "—";
            },
            width: 180,
        },
        {
            title: "Đơn vị",
            dataIndex: "unit",
            key: "unit",
            render: (text, rec) => {
                if (text) return text;
                if (rec.medicineId && typeof rec.medicineId === 'object') return rec.medicineId.unit;
                return "—";
            },
            width: 100,
            align: "center",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "right",
        },
        {
            title: "Liều dùng",
            dataIndex: "dosage",
            key: "dosage",
            width: 120,
            render: (text) => text || "—",
        },
        {
            title: "Tần suất",
            dataIndex: "frequency",
            key: "frequency",
            width: 120,
            render: (text) => text || "—",
        },
        {
            title: "Thời lượng",
            dataIndex: "duration",
            key: "duration",
            width: 120,
            render: (text) => text || "—",
        },
        {
            title: "Hướng dẫn",
            dataIndex: "instruction",
            key: "instruction",
            ellipsis: true,
            width: 200,
            render: (text) => text || "—",
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            render: (text, rec) => {
                if (text) return formatCurrency(text);
                if (rec.medicineId && typeof rec.medicineId === 'object') return formatCurrency(rec.medicineId.price);
                return "—";
            },
            fixed: "right",
            width: 130,
            align: "right",
        }
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center" style={{ minHeight: "300px" }}>
                    <Spin size="large" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex justify-center items-center" style={{ minHeight: "300px" }}>
                    <Text type="danger">{error}</Text>
                </div>
            );
        }

        if (!treatment) {
            return (
                <div className="flex justify-center items-center" style={{ minHeight: "300px" }}>
                    <Empty description="Không có dữ liệu ca khám" />
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div>

                    <Title level={5}>Thông tin bệnh nhân & buổi khám</Title>                    <Descriptions bordered column={2} size="small">

                        <Descriptions.Item label="Tên bệnh nhân" styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.ownerName || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày sinh" styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.ownerDob
                                ? dayjs.utc(treatment.healthProfile.ownerDob).format("DD/MM/YYYY")
                                : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Số điện thoại" styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.ownerPhone || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Giới tính" styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.ownerGender === "male" ? "Nam" : treatment.healthProfile?.ownerGender === "female" ? "Nữ" : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Nhóm máu" styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.bloodType || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Dị ứng" styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.allergies && treatment.healthProfile.allergies.length > 0
                                ? treatment.healthProfile.allergies.join(", ")
                                : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Bệnh mãn tính" span={2} styles={{ label: { width: '20%' } }}>
                            {treatment.healthProfile?.chronicConditions && treatment.healthProfile.chronicConditions.length > 0
                                ? treatment.healthProfile.chronicConditions.join(", ")
                                : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Bác sĩ" styles={{ label: { width: '20%' } }}>
                            {treatment.doctor?.name || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Chuyên khoa" styles={{ label: { width: '20%' } }}>
                            {treatment.doctor?.specialtyName || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày hẹn" styles={{ label: { width: '20%' } }}>
                            {treatment.appointment?.appointmentDate
                                ? dayjs.utc(treatment.appointment.appointmentDate).format("DD/MM/YYYY")
                                : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Khung giờ" styles={{ label: { width: '20%' } }}>
                            {treatment.appointment?.timeSlot || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Lý do khám" span={2} styles={{ label: { width: '20%' } }}>
                            {treatment.appointment?.reason || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày khám" styles={{ label: { width: '20%' } }}>
                            {treatment.treatmentDate ? dayjs(treatment.treatmentDate).format("DD/MM/YYYY") : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng chi phí" className="font-semibold text-red-600" styles={{ label: { width: '20%' } }}>
                            {formatCurrency(treatment.totalCost)}
                        </Descriptions.Item>

                    </Descriptions>

                </div>

                <div>
                    <Title level={5}>Chuẩn đoán & chỉ số</Title>
                    <Descriptions bordered column={3} size="small">
                        <Descriptions.Item label="Huyết áp">{treatment.bloodPressure || "—"}</Descriptions.Item>
                        <Descriptions.Item label="Nhịp tim">
                            {treatment.heartRate !== undefined && treatment.heartRate !== null
                                ? `${treatment.heartRate} bpm`
                                : "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhiệt độ">
                            {treatment.temperature !== undefined && treatment.temperature !== null
                                ? `${treatment.temperature} °C`
                                : "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Triệu chứng" span={3}>
                            {treatment.symptoms || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chuẩn đoán" span={3}>
                            {treatment.diagnosis || "—"}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                <div>
                    <Title level={5}>Chỉ định dịch vụ (Lab Order)</Title>
                    {treatment.laborder ? (
                        <div className="space-y-2">

                            <Table
                                rowKey={(rec) => (rec as any)._id ?? Math.random().toString(36).slice(2)}
                                dataSource={treatment.laborder.items || []}
                                columns={labColumns}
                                pagination={false}
                                size="small"
                                bordered
                            />
                            <h2 className="text-right font-semibold">Tổng  <span>
                                {formatCurrency(treatment.laborder.totalPrice)}
                            </span></h2>
                        </div>
                    ) : (
                        <Empty description="Không có chỉ định dịch vụ" />
                    )}
                </div>

                <div>
                    <Title level={5}>Đơn thuốc (Prescription)</Title>
                    {treatment.prescription ? (
                        <div className="space-y-2">
                            <Table
                                rowKey={(rec) => (rec as any)._id ?? Math.random().toString(36).slice(2)}
                                dataSource={treatment.prescription.items || []}
                                columns={medicineColumns}
                                pagination={false}
                                size="small"
                                bordered
                                scroll={{ x: 1500 }}
                            />
                            <h2 className="text-right font-semibold">
                                Tổng <span>
                                    {formatCurrency(treatment.prescription.totalPrice)}
                                </span></h2>
                        </div>
                    ) : (
                        <Empty description="Không có đơn thuốc" />
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Chi tiết ca khám</Title>}
            open={visible}
            onCancel={() => {
                onClose();
                setTreatment(null);
                setError(null);
            }}
            footer={null}
            width={1200}
            style={{ top: 40 }}
            destroyOnHidden={true}
        >
            {renderContent()}
        </Modal>
    );
};

export default TreatmentDetailModal;