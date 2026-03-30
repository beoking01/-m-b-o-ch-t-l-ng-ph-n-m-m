import { Button, Input, message, Table, Tag,  } from "antd";
import { useEffect, useState } from "react";
import { FaSearch, FaInfoCircle } from "react-icons/fa";
import { formatDateDDMMYYYY } from "../../utils/date";
import {
    getInvoices,
    type Invoice,
    type InvoiceMeta,
    type InvoiceStatus,
} from "../../services/InvoiceService";
import { useSearchParams } from "react-router-dom";
import ModalDetailInvoice from "../../components/Admin/ModalDetailInvoice";

const ReceptionistInvoice = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [meta, setMeta] = useState<InvoiceMeta | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // table query state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<string | undefined>(undefined);
    const [q, setQ] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [invoiceDetailOpen, setInvoiceDetailOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    // Xử lý khi quay về từ VNPay
    useEffect(() => {
        const status = searchParams.get('vnp_ResponseCode');
        if (status) {
            if (status === '00') {
                message.success('Thanh toán VNPay thành công!');
            } else {
                message.error('Thanh toán VNPay thất bại!');
            }
            // Xóa query params sau khi hiển thị message
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchInvoices();
    }, [page, pageSize, sort, q]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { items, meta } = await getInvoices({ page, limit: pageSize, sort, q });
            setInvoices(items);
            setMeta(meta);
            return items;
        }
        catch (error) {
            message.error("Lỗi khi lấy danh sách hóa đơn");
            return [];
        } finally {
            setLoading(false);
        }
    }

    const getStatusText = (status: InvoiceStatus): string => {
        switch (status) {
            case 'Paid':
                return 'Đã thanh toán';
            case 'Cancelled':
                return 'Đã hủy';
            case 'Refunded':
                return 'Đã hoàn tiền';
            case 'Pending':
            default:
                return 'Chờ thanh toán';
        }
    };

    const getStatusTag = (status: InvoiceStatus) => {
        let color;
        const statusText = getStatusText(status);
        switch (status) {
            case 'Paid':
                color = 'green';
                break;
            case 'Cancelled':
                color = 'red';
                break;
            case 'Refunded':
                color = 'volcano';
                break;
            case 'Pending':
            default:
                color = 'gold';
                break;
        }
        return <Tag color={color}>{statusText}</Tag>;
    };

    const handleTableChange = (
        pagination: { current?: number; pageSize?: number },
        _filters: any,
        sorter: any
    ) => {
        if (pagination.current) setPage(pagination.current);
        if (pagination.pageSize) setPageSize(pagination.pageSize);

        if (Array.isArray(sorter)) {
            sorter = sorter[0];
        }
        if (sorter && sorter.field) {
            const field = sorter.field as string;
            const order = sorter.order as 'ascend' | 'descend' | undefined;
            if (order === 'ascend') setSort(field);
            else if (order === 'descend') setSort(`-${field}`);
            else setSort(undefined);
        } else {
            setSort(undefined);
        }
    };

    const onSearch = () => {
        setPage(1);
        setQ(searchInput.trim());
    };

    const handlePrintInvoice = async (invoiceId: string) => {
        setSelectedInvoiceId(invoiceId);
        setInvoiceDetailOpen(true);
    };

    const columns = [
        {
            title: 'Mã HĐ',
            dataIndex: '_id',
            key: '_id',
            width: 120,
            render: (value: string) => value.slice(0, 8)
        },        
        {
            title: 'Chủ Hồ sơ Sức khỏe',
            dataIndex: ['patient', 'name'],
            key: 'ownerName',
            render: (_: any, record: Invoice) => (
                <>
                    <strong className="block">{record.patient?.name}</strong>
                    <small className="block">SĐT: {record.patient?.phone}</small>
                </>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: getStatusTag
        },
        {
            title: 'Tổng tiền (VNĐ)',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            sorter: true,
            align: 'right' as const,
            render: (value: number) => value.toLocaleString('vi-VN')
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'issued_at',
            key: 'issued_at',
            sorter: true,
            width: 120,
            render: (value: string) => formatDateDDMMYYYY(value)
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 50,
            render: (_: any, record: Invoice) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">

                        <Button
                            type="default"
                            onClick={() => handlePrintInvoice(record._id)}
                            icon={<FaInfoCircle />}
                            size="small"
                            style={{ flex: 1 }}
                        >
                            Chi tiết
                        </Button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Quản lý Hóa đơn</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div style={{ minWidth: 240, width: '100%', maxWidth: 420 }}>
                    <Input.Search
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm kiếm theo tên bệnh nhân ..."
                        allowClear
                        enterButton={
                            <Button icon={<FaSearch />}
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    borderColor: 'var(--color-primary)'
                                }} >
                                Tìm
                            </Button>}
                        className='text-[var(--color-primary)]'
                        onSearch={onSearch}
                    />
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={invoices}
                rowKey={(record) => record._id}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: meta?.total ?? invoices.length,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} hóa đơn`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
            />    
            <ModalDetailInvoice
                open={invoiceDetailOpen}
                invoiceId={selectedInvoiceId}
                onClose={() => {
                    setInvoiceDetailOpen(false);
                    setSelectedInvoiceId(null);
                }}
                onSuccess={() => {
                    // Reload table sau khi thanh toán thành công
                    fetchInvoices();
                }}
            />
        </div>
    )
}

export default ReceptionistInvoice;