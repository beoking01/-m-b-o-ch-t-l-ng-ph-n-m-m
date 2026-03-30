import { useEffect, useState } from "react";
import { getServices, type Service } from "../../../services/ServiceService";
import { DatePicker, Input, InputNumber, Button, Card, Space, Typography, List, message, Pagination } from "antd";
import { ExperimentOutlined, RollbackOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { createLabOrder } from "../../../services/LabOrderService";
import ButtonPrimary from "../../../utils/ButtonPrimary";
import moment from 'moment';

const { Text, Title } = Typography;

type Props = {
    healthProfileId: string;
    onCreated: (labOrderId: string, labOrderData: any) => void;
    onBack: () => void;
}

const CreateLabOrder = ({ healthProfileId, onCreated, onBack }: Props) => {
    const [services, setServices] = useState<Service[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [testTime, setTestTime] = useState<Dayjs | null>(dayjs());
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchServices();
    }, [currentPage, pageSize]);

    /** Lấy danh sách dịch vụ từ API */
    const fetchServices = async (query?: string) => {
        setLoading(true);
        try {
            const { items: fetchedServices, meta } = await getServices({ 
                q: query || undefined,
                page: currentPage,
                limit: pageSize
            });
            setServices(fetchedServices);
            if (meta) {
                setTotal(meta.total);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách dịch vụ.");
        } finally {
            setLoading(false);
        }
    }

    /** Xử lý khi người dùng bấm nút tìm kiếm hoặc nhấn Enter */
    const handleSearch = (value: string) => {
        setCurrentPage(1);
        fetchServices(value);
    }

    /** Xử lý khi thay đổi trang */
    const handlePageChange = (page: number, size: number) => {
        setCurrentPage(page);
        setPageSize(size);
    }

    const toggleSelect = (service: Service) => {
        const exist = items.find(i => i.serviceId === service._id);
        if (exist) {
            // Xóa khỏi danh sách đã chọn
            setItems(items.filter(i => i.serviceId !== service._id));
        } else {
            // Thêm vào danh sách đã chọn
            setItems([...items, {
                serviceId: service._id,
                name: service.name,
                quantity: 1,
                description: ""
            }]);
        }
    }

    const updateItem = (serviceId: string, field: string, value: any) => {
        setItems(items.map(i => i.serviceId === serviceId ? { ...i, [field]: value } : i));
    }

    const removeItem = (serviceId: string) => {
        setItems(items.filter(i => i.serviceId !== serviceId));
    }

    // Gửi yêu cầu tạo Lab Order
    const submit = async () => {
        if (!testTime || items.length === 0) {
            message.warning("Vui lòng chọn ít nhất một dịch vụ và thời gian chỉ định.");
            return;
        }

        const payload = {
            testTime: testTime ? moment.utc(testTime.format("YYYY-MM-DD")).toISOString() : undefined,
            healthProfile_id: healthProfileId,
            // Chỉ gửi serviceId, quantity và description
            items: items.map(item => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
                description: item.description,
            }))
        };        try {
            setLoading(true);
            const result = await createLabOrder(payload);

            message.success("Tạo chỉ định Cận Lâm Sàng thành công!");
            onCreated(result._id, result);

        } catch (error) {
            message.error("Tạo chỉ định thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }

    // Lấy danh sách ID đã chọn để kiểm tra nhanh
    const selectedServiceIds = items.map(i => i.serviceId);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button icon={<RollbackOutlined />} onClick={onBack}>
                    Quay lại Khám Sơ Bộ
                </Button>
                <Title level={3} className="!mb-0"><ExperimentOutlined /> Tạo Chỉ Định Cận Lâm Sàng (Lab Order)</Title>
                <ButtonPrimary
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={submit}
                    loading={loading}
                    disabled={items.length === 0 || !testTime}
                >
                    Tạo Chỉ Định ({items.length})
                </ButtonPrimary>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột 1 & 2: Danh sách Dịch vụ */}
                <Card
                    title="Danh Sách Dịch Vụ CLS"
                    variant="outlined"
                    className="lg:col-span-2 shadow-md"
                    loading={loading}
                >                    {/* Search Bar */}
                    <div className="mb-4">
                        <Input.Search
                            placeholder="Tìm kiếm dịch vụ theo tên..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onSearch={handleSearch}
                            loading={loading}
                        />
                    </div>                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {services.map(s => {
                            const isSelected = selectedServiceIds.includes(s._id);
                            return (
                                <div
                                    key={s._id}
                                    className={`shadow-sm p-3 rounded-lg transition duration-200 cursor-pointer 
                                                ${isSelected ? "bg-blue-50 border-blue-400 shadow-inner" : "hover:bg-gray-50"}`}
                                    onClick={() => toggleSelect(s)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-base text-blue-800">{s.name}</div>
                                            <div className="text-sm text-gray-600 truncate">{s.description}</div>
                                        </div>
                                        {isSelected ? (
                                            <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); removeItem(s._id); }}>
                                                Xóa
                                            </Button>
                                        ) : (
                                            <Button type="default" size="small" icon={<PlusOutlined />}>
                                                Chọn
                                            </Button>
                                        )}
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
                            showTotal={(total) => `Tổng ${total} dịch vụ`}
                            pageSizeOptions={['5', '10', '20', '50']}
                        />
                    </div>
                </Card>

                {/* Cột 3: Lab Order Summary và Chi tiết đã chọn */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Thời Gian & Tổng Quan Chỉ Định" variant="outlined" className="shadow-md">
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Text strong>Thời gian thực hiện chỉ định:</Text>
                            <DatePicker
                                format="YYYY-MM-DD"
                                value={testTime}
                                onChange={(date) => setTestTime(date)}
                                style={{ width: '100%' }}
                            />
                            <Text strong>Tổng dịch vụ đã chọn: <span className="text-xl text-blue-600">{items.length}</span></Text>
                        </Space>
                    </Card>

                    <div className="mb-4"></div>
                    <Card title="Chi Tiết Dịch Vụ Đã Chọn" variant="outlined" className="shadow-md">
                        {items.length === 0 ? (
                            <div className="text-gray-500 text-center p-4">Chưa có dịch vụ nào được chọn.</div>
                        ) : (
                            <List
                                size="small"
                                itemLayout="vertical"
                                dataSource={items}
                                renderItem={(item) => (
                                    <List.Item key={item.serviceId} className="!p-2">
                                        <Text strong className="block">{item.name}</Text>
                                        <Space direction="vertical" style={{ width: '100%' }} size="small" className="mt-2">
                                            <Input.TextArea
                                                rows={2}
                                                placeholder="Ghi chú/Hướng dẫn chi tiết (description)"
                                                value={item.description}
                                                onChange={(e) => updateItem(item.serviceId, "description", e.target.value)}
                                            />
                                            <Space align="center" className="w-full justify-between">
                                                <Text>Số lượng:</Text>
                                                <InputNumber
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(v) => updateItem(item.serviceId, "quantity", v)}
                                                    style={{ width: '50%' }}
                                                />
                                            </Space>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default CreateLabOrder;