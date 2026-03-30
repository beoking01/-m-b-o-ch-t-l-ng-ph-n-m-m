import { useEffect, useState } from "react";
import { getMedicines, type Medicine } from "../../../services/MedicineService";
import { createPrescription } from "../../../services/PrescriptionService";
import { Button, Input, Card, Space, Typography, List, Modal, InputNumber, Divider, message, Popconfirm, Pagination } from "antd";
import { MedicineBoxOutlined, RollbackOutlined, SaveOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ButtonPrimary from "../../../utils/ButtonPrimary";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Props {
    healthProfileId: string;
    onCreated: (prescriptionId: string, prescriptionData: any) => void;
    onBack: () => void;
}

interface DosageForm {
    quantity: number;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
}

const defaultForm: DosageForm = {
    quantity: 1,
    dosage: "",
    frequency: "",
    duration: "",
    instruction: "",
};

const CreatePrescription = ({ healthProfileId, onCreated, onBack }: Props) => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState<DosageForm>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadMed();
    }, [currentPage, pageSize]);

    /** Lấy danh sách thuốc từ API */
    const loadMed = async (query?: string) => {
        setLoading(true);
        try {
            const res = await getMedicines({ 
                page: currentPage, 
                limit: pageSize, 
                q: query || undefined 
            });
            setMedicines(res.items);
            if (res.meta) {
                setTotal(res.meta.total);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách thuốc.");
        } finally {
            setLoading(false);
        }
    };

    /** Xử lý khi người dùng bấm nút tìm kiếm hoặc nhấn Enter */
    const handleSearch = (value: string) => {
        setCurrentPage(1);
        loadMed(value);
    };

    /** Xử lý khi thay đổi trang */
    const handlePageChange = (page: number, size: number) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const selectMed = (med: Medicine) => {
        const existItem = items.find(i => i.medicineId === med._id);
        if (existItem) {
            setSelectedMed(med);
            setForm({
                quantity: existItem.quantity,
                dosage: existItem.dosage,
                frequency: existItem.frequency,
                duration: existItem.duration,
                instruction: existItem.instruction,
            });
        } else {
            setSelectedMed(med);
            setForm(defaultForm);
        }
        setOpenModal(true);
    };

    const handleFormChange = (field: keyof DosageForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddItem = () => {
        if (!selectedMed || form.quantity <= 0) return;

        const newItem = {
            medicineId: selectedMed._id,
            name: selectedMed.name,
            unit: selectedMed.unit,
            ...form,
        };

        const existingIndex = items.findIndex(i => i.medicineId === selectedMed._id);

        if (existingIndex > -1) {
            // Cập nhật thuốc đã có
            const updatedItems = items.map((item, index) =>
                index === existingIndex ? newItem : item
            );
            setItems(updatedItems);
            message.success(`Cập nhật hướng dẫn dùng thuốc ${selectedMed.name}.`);
        } else {
            // Thêm thuốc mới
            setItems([...items, newItem]);
            message.success(`Đã thêm thuốc ${selectedMed.name} vào đơn.`);
        }
        setOpenModal(false);
        setSelectedMed(null);
    };

    const removeItem = (medicineId: string) => {
        setItems(items.filter(i => i.medicineId !== medicineId));
    };

    const submit = async () => {
        if (items.length === 0) {
            message.warning("Vui lòng chọn ít nhất một loại thuốc.");
            return;
        }

        const payload = {
            healthProfile_id: healthProfileId,
            items: items.map(item => ({
                medicineId: item.medicineId,
                quantity: item.quantity,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instruction: item.instruction,
            }))
        };        try {
            setLoading(true);
            const result = await createPrescription(payload);
            message.success("Tạo đơn thuốc thành công!");
            onCreated(result.id, result);
        } catch (error) {
            message.error("Tạo đơn thuốc thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const selectedMedicineIds = items.map(i => i.medicineId);

    return (
        <div className="p-4">
            {/* Thanh điều hướng và Hành động */}
            <div className="flex justify-between items-center mb-4">
                <Button icon={<RollbackOutlined />} onClick={onBack}>
                    Quay lại Khám Sơ Bộ
                </Button>
                <Title level={3} className="!mb-0"><MedicineBoxOutlined /> Tạo Đơn Thuốc</Title>
                <ButtonPrimary
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={submit}
                    loading={loading}
                    disabled={items.length === 0}
                >
                    Tạo Đơn Thuốc ({items.length})
                </ButtonPrimary>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">                
                {/* Cột 1 & 2: Danh sách Thuốc */}
                <Card
                    title="Danh Sách Thuốc Có Sẵn"
                    variant="outlined"
                    className="lg:col-span-2 shadow-md"
                    loading={loading}
                >
                    {/* Search Bar */}
                    <div className="mb-4">
                        <Input.Search
                            placeholder="Tìm kiếm thuốc theo tên..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onSearch={handleSearch}
                            loading={loading}
                        />
                    </div>                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {medicines.map(m => {
                            const isSelected = selectedMedicineIds.includes(m._id);
                            return (
                                <div
                                    key={m._id}
                                    className={`shadow-sm p-3 rounded-lg transition duration-200 cursor-pointer 
                                                ${isSelected ? "bg-green-50 border-green-400 shadow-inner" : "hover:bg-gray-50"}`}
                                    onClick={() => selectMed(m)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-base text-green-800">{m.name}</div>
                                            <div className="text-sm text-gray-600">
                                                <Text type="secondary">SX: {m.manufacturer} | HSD: {dayjs(m.expiryDate).format('MM/YYYY')}</Text>
                                            </div>
                                        </div>
                                        <Button
                                            type={isSelected ? "primary" : "default"}
                                            icon={isSelected ? <DeleteOutlined /> : <PlusOutlined />}
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); selectMed(m); }}
                                        >
                                            {isSelected ? "Chỉnh sửa" : "Chọn & Kê"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={total}
                            onChange={handlePageChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng ${total} loại thuốc`}
                            pageSizeOptions={['5', '10', '20', '50']}
                        />
                    </div>
                </Card>

                {/* Cột 3: Đơn Thuốc Hiện Tại */}
                <Card title="Chi Tiết Đơn Thuốc Hiện Tại" variant="outlined" className="shadow-md lg:col-span-1">
                    {items.length === 0 ? (
                        <div className="text-gray-500 text-center p-4">Chưa có thuốc nào được kê.</div>
                    ) : (
                        <List
                            size="small"
                            itemLayout="vertical"
                            dataSource={items}
                            renderItem={(item) => (
                                <List.Item
                                    key={item.medicineId}
                                    actions={[
                                        <Button key="edit" type="link" onClick={() => selectMed(medicines.find(m => m._id === item.medicineId) as Medicine)}>Sửa</Button>,
                                        <Popconfirm
                                            key="delete"
                                            title="Xóa thuốc khỏi đơn?"
                                            onConfirm={() => removeItem(item.medicineId)}
                                            okText="Có"
                                            cancelText="Không"
                                        >
                                            <Button type="link" danger>Xóa</Button>
                                        </Popconfirm>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={<Text strong>{item.name} <Text type="secondary" className="ml-2">({item.quantity} {item.unit})</Text></Text>}
                                        description={
                                            <Space direction="vertical" size={2}>
                                                <Text>Liều dùng: <Text strong>{item.dosage}</Text></Text>
                                                <Text>Tần suất: <Text strong>{item.frequency}</Text></Text>
                                                <Text>Thời gian: <Text strong>{item.duration}</Text></Text>
                                                <Text type="secondary">HDSD: {item.instruction}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            </div>

            {/* Modal Nhập Chi Tiết Liều Dùng */}
            <Modal
                title={<Title level={4} className="!mb-0">Kê Thuốc: {selectedMed?.name}</Title>}
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onOk={handleAddItem}
                okText={selectedMedicineIds.includes(selectedMed?._id || '') ? "Cập nhật" : "Thêm vào đơn"}
                cancelText="Hủy"
                destroyOnHidden={true}
            >
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Text strong>1. Số lượng & Đơn vị</Text>
                    <Space align="center" className="w-full">
                        <InputNumber min={1} value={form.quantity} onChange={(v) => handleFormChange("quantity", v)} style={{ width: 120 }} />
                        <Text>{selectedMed?.unit || 'đơn vị'}</Text>
                        <Text type="secondary">(Tồn kho: {selectedMed?.quantity})</Text>
                    </Space>

                    <Text strong>2. Chi tiết hướng dẫn</Text>
                    <div className="text-sm">
                        Liều dùng
                    </div>
                    <Input placeholder="Liều dùng (VD: 1 viên 2 lần/ngày)" value={form.dosage} onChange={e => handleFormChange("dosage", e.target.value)} />
                    <div className="text-sm">
                        Tần suất
                    </div>
                    <Input placeholder="Tần suất (VD: Sáng/Tối)" value={form.frequency} onChange={e => handleFormChange("frequency", e.target.value)} />
                    <div className="text-sm">
                        Thời gian
                    </div>
                    <Input placeholder="Thời gian (VD: 5 ngày)" value={form.duration} onChange={e => handleFormChange("duration", e.target.value)} />

                    <Text strong>3. Hướng dẫn thêm</Text>
                    <div className="text-sm">
                        Ghi chú/Hướng dẫn
                    </div>
                    <TextArea placeholder="Ghi chú/Hướng dẫn đặc biệt" rows={3} value={form.instruction} onChange={e => handleFormChange("instruction", e.target.value)} />
                </Space>
            </Modal>
        </div>
    );
};

export default CreatePrescription;
