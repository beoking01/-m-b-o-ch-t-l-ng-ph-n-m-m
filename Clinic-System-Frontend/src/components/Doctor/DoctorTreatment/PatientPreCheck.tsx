import { Button, Input, Space, Card, Divider, Table, Empty, Typography } from "antd";
import { UserOutlined, HeartOutlined, FileTextOutlined, SaveOutlined, ArrowLeftOutlined, ExperimentOutlined, MedicineBoxOutlined, PrinterOutlined } from "@ant-design/icons";
import ButtonPrimary from "../../../utils/ButtonPrimary";
import { useEffect, useState } from "react";
import LabOrderDetailModal from "./LabOrderDetailModal";
import PrescriptionDetailModal from "./PrescriptionDetailModal";

const { Text } = Typography;

interface PrecheckData {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    symptoms: string;
    diagnosis: string;
}

interface Props {
    appointment: any;
    precheckData: PrecheckData;
    onPrecheckDataChange: (data: PrecheckData) => void;
    isSaving: boolean;
    onBack: () => void;
    onCreateLabOrder: () => void;
    onGotoPrescription: () => void;
    onSaveTreatment: () => void;
    currentLabOrderId?: string | null;
    currentLabOrderData?: any | null;
    currentPrescriptionId?: string | null;
    currentPrescriptionData?: any | null;
}

const PatientPreCheck = ({
    appointment,
    precheckData,
    onPrecheckDataChange,
    isSaving,
    onBack,
    onCreateLabOrder,
    onGotoPrescription,
    onSaveTreatment,
    currentLabOrderId,
    currentLabOrderData,
    currentPrescriptionId,
    currentPrescriptionData,
}: Props) => {
    // Kiểm tra appointment trước khi sử dụng
    if (!appointment) {
        return <div className="p-4">Không tìm thấy thông tin cuộc hẹn</div>;
    }

    // Sử dụng snapshot từ backend đã tối ưu
    const patientData = appointment?.patient || appointment?.patientSnapshot;
    
    // HealthProfile vẫn cần populate để lấy thông tin y tế chi tiết
    // Kiểm tra xem healthProfile_id đã được populate hay chỉ là string ID
    const hp = typeof appointment?.healthProfile_id === 'object' 
        ? appointment.healthProfile_id 
        : null;
    
    const [labOrder, setLabOrder] = useState<any>(null);
    const [prescription, setPrescription] = useState<any>(null);
    const [labOrderModalOpen, setLabOrderModalOpen] = useState(false);
    const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

    // Sử dụng data trực tiếp thay vì fetch API
    useEffect(() => {
        if (currentLabOrderData) {
            setLabOrder(currentLabOrderData);
        } else {
            setLabOrder(null);
        }
    }, [currentLabOrderData]);

    // Sử dụng prescription data trực tiếp thay vì fetch API
    useEffect(() => {
        if (currentPrescriptionData) {
            setPrescription(currentPrescriptionData);
        } else {
            setPrescription(null);
        }
    }, [currentPrescriptionData]);

    const handleDataChange = (field: keyof PrecheckData, value: string) => {
        onPrecheckDataChange({
            ...precheckData,
            [field]: value,
        });
    };

    return (
        <div className="p-4">
            {/* Thanh điều hướng Quay lại và Tiêu đề */}
            <div className="mb-4 flex justify-between items-center">
                <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
                    Quay lại danh sách
                </Button>
                <div className="text-2xl font-bold">Khám Sơ Bộ Bệnh Nhân</div>
                <div></div> {/* Giữ khoảng trống cho căn chỉnh */}
            </div>

            <Divider />

            {/* Bố cục 2 cột chính */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột 1: Thông tin bệnh nhân và Hồ sơ sức khoẻ */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title={<><UserOutlined /> Thông tin Bệnh nhân</>} variant="outlined" className="shadow-md">
                        <div className="space-y-2 text-sm">
                            <div><b>Họ tên:</b> {patientData?.name || "N/A"}</div>
                            <div><b>Ngày sinh:</b> {patientData?.dob ? new Date(patientData.dob).toLocaleDateString() : "N/A"}</div>
                            <div><b>Giới tính:</b> {patientData?.gender == 'female' ? "Nữ" : patientData?.gender == 'male' ? "Nam" : "N/A"}</div>
                            <div><b>Số điện thoại:</b> {patientData?.phone || "N/A"}</div>
                        </div>
                        <Divider dashed />
                        <div className="text-base font-semibold mb-2">Hồ sơ Sức khoẻ</div>
                        <div className="space-y-2 text-sm">
                            <div><b>Chiều cao:</b> {hp?.height} cm</div>
                            <div><b>Cân nặng:</b> {hp?.weight} kg</div>
                            <div><b>Nhóm máu:</b> {hp?.bloodType || "N/A"}</div>
                            <div className="break-words"><b>Dị ứng:</b> {hp?.allergies?.join(", ") || "Không"}</div>
                            <div className="break-words"><b>Bệnh nền:</b> {hp?.chronicConditions?.join(", ") || "Không"}</div>
                            <div className="break-words"><b>Thuốc đang dùng:</b> {hp?.medications?.join(", ") || "Không"}</div>
                        </div>
                    </Card>
                </div>

                {/* Cột 2: Khám sơ bộ, Triệu chứng, Chẩn đoán */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Khám Sơ Bộ */}
                    <Card title={<><HeartOutlined /> Khám Sơ Bộ</>} variant="outlined" className="shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <Input
                                prefix="Huyết áp:"
                                placeholder="Huyết áp (mmHg)"
                                value={precheckData.bloodPressure}
                                onChange={(e) => handleDataChange("bloodPressure", e.target.value)}
                            />
                            <Input
                                prefix="Nhịp tim:"
                                placeholder="Nhịp tim (lần/phút)"
                                value={precheckData.heartRate}
                                onChange={(e) => handleDataChange("heartRate", e.target.value)}
                            />
                            <Input
                                prefix="Nhiệt độ:"
                                placeholder="Nhiệt độ (°C)"
                                value={precheckData.temperature}
                                onChange={(e) => handleDataChange("temperature", e.target.value)}
                            />
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div className="text-sm ">
                                Triệu chứng lâm sàng:
                            </div>
                            <Input.TextArea
                                placeholder="Triệu chứng lâm sàng"
                                rows={4}
                                value={precheckData.symptoms}
                                onChange={(e) => handleDataChange("symptoms", e.target.value)}
                            />

                            <div className="text-sm ">
                                Chẩn đoán:
                            </div>
                            <Input.TextArea
                                placeholder="Chẩn đoán"
                                rows={4}
                                value={precheckData.diagnosis}
                                onChange={(e) => handleDataChange("diagnosis", e.target.value)}
                            />
                        </Space>
                    </Card>                    
                    <div className="mb-4 "></div>
                    <Card variant="outlined" className="shadow-md">
                        <div className="text-base font-semibold mb-3"><FileTextOutlined /> Hành động</div>
                        <Space size="middle" className="w-full justify-end">
                            <ButtonPrimary
                                icon={<ExperimentOutlined />}
                                onClick={onCreateLabOrder}
                                disabled={!!currentLabOrderId}
                            >
                                {currentLabOrderId ? "Đã chỉ định CLS" : "Chỉ định CLS"}
                            </ButtonPrimary>
                            <ButtonPrimary
                                icon={<MedicineBoxOutlined />}
                                onClick={onGotoPrescription}
                                disabled={!!currentPrescriptionId}
                            >
                                {currentPrescriptionId ? "Đã kê đơn thuốc" : "Kê đơn thuốc"}
                            </ButtonPrimary>
                            <Divider type="vertical" />
                            <Button
                                color="green"
                                variant="solid"
                                icon={<SaveOutlined />}
                                onClick={onSaveTreatment}
                                loading={isSaving}
                            >
                                Lưu Ca Khám
                            </Button>
                        </Space>
                    </Card>
                </div>
            </div>            {/* Hiển thị 2 bảng lab order và prescription nếu có */}
            <Card
                title={<><ExperimentOutlined /> Chỉ định Cận Lâm Sàng</>}
                variant="outlined"
                className="shadow-md !mt-4"
                extra={
                    labOrder && (
                        <ButtonPrimary 
                            type="primary" 
                            icon={<PrinterOutlined />}
                            onClick={() => setLabOrderModalOpen(true)}
                        >
                            In Phiếu Chỉ Định
                        </ButtonPrimary>
                    )
                }
            >
                {labOrder ? (
                    <Table
                        size="small"
                        pagination={false}
                        dataSource={labOrder.items}
                        scroll={{ x: 1200 }}
                        rowKey={(record) => record._id || record.serviceId?._id || Math.random().toString()}
                        columns={[
                            {
                                title: "Dịch vụ",
                                key: "name",
                                render: (_: any, record: any) => record.serviceId?.name || "Dịch vụ không xác định"
                            },
                            { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 80, align: "center" as const },
                            { title: "Ghi chú", dataIndex: "description", key: "description" },
                            {
                                title: "Thời gian",
                                key: "testTime",
                                render: () => new Date(labOrder.testTime).toLocaleDateString("vi-VN")
                            },
                        ]}
                    />
                ) : (
                    <Empty description="Chưa có chỉ định cận lâm sàng" />
                )}
            </Card>              
            {/* Đơn thuốc đã tạo */}
            <Card
                title={<><MedicineBoxOutlined /> Đơn Thuốc</>}
                variant="outlined"
                className="shadow-md !mt-4"
                extra={
                    prescription && (
                        <ButtonPrimary 
                            type="primary" 
                            icon={<PrinterOutlined />}
                            onClick={() => setPrescriptionModalOpen(true)}
                        >
                            In Đơn Thuốc
                        </ButtonPrimary>
                    )
                }
            >
                {prescription ? (
                    <Table
                        size="small"
                        pagination={false}
                        bordered
                        scroll={{ x: 1200 }}
                        dataSource={prescription.items || []}
                        rowKey={(record) => record._id || record.medicineId || Math.random().toString()}
                        columns={[
                            {
                                title: "Thuốc",
                                key: "name",
                                render: (_: any, record: any) => record.medicine?.name || "Thuốc không xác định",
                                width: 200,
                            },
                            {
                                title: "Số lượng",
                                dataIndex: "quantity",
                                key: "quantity",
                                width: 90,
                                align: "center" as const,
                            },
                            {
                                title: "Liều dùng - Tần suất - Thời gian",
                                key: "dosage-info",
                                render: (_: any, record: any) => {
                                    const dosage = record.dosage || "";
                                    const frequency = record.frequency || "";
                                    const duration = record.duration || "";
                                    const parts = [dosage, frequency, duration].filter(Boolean);
                                    return parts.length > 0 ? (
                                        <Text strong>{parts.join(" • ")}</Text>
                                    ) : (
                                        <Text type="secondary">Chưa có hướng dẫn</Text>
                                    );
                                },
                            },
                            {
                                title: "Hướng dẫn sử dụng",
                                dataIndex: "instruction",
                                key: "instruction",
                                ellipsis: { showTitle: true },
                                render: (text: any) => text || <Text type="secondary">Không có ghi chú</Text>,
                            },
                        ]}
                    />
                ) : (                    
                <Empty description="Chưa kê đơn thuốc" />
                )}
            </Card>            
            {/* Lab Order Detail Modal */}
            <LabOrderDetailModal
                open={labOrderModalOpen}
                labOrderData={labOrder}
                patientInfo={patientData}
                onClose={() => setLabOrderModalOpen(false)}
            />

            {/* Prescription Detail Modal */}
            <PrescriptionDetailModal
                open={prescriptionModalOpen}
                prescriptionData={prescription}
                patientInfo={patientData}
                onClose={() => setPrescriptionModalOpen(false)}
            />
        </div>
    );
};

export default PatientPreCheck;