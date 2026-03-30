import { Button, Input, message, Table, Modal } from "antd";
import { useEffect, useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { formatDateDDMMYYYY } from "../../utils/date";
import { getMedicines, type Medicine, type MedicineMeta, deleteMedicine } from "../../services/MedicineService";
import ButtonPrimary from "../../utils/ButtonPrimary";
// import dayjs, { Dayjs } from "dayjs";
import { AiFillEdit } from "react-icons/ai";
import ModalCreateMedicine from "../../components/Admin/ModalCreateMedicine";
import ModalEditMedicine from "../../components/Admin/ModalEditMedicine";
import { CacheService } from "../../services/CacheService";

const MedicineManagement = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [meta, setMeta] = useState<MedicineMeta | null>(null);

    // table query state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<string | undefined>(undefined);
    const [q, setQ] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | undefined>(undefined);    
    useEffect(() => {
        fetchMedicines();
    }, [page, pageSize, sort, q]);    // Helper function to generate cache key
    const getCacheKey = (p: number, ps: number, s: string | undefined, query: string) => {
        return `medicines_${p}_${ps}_${s || 'nosort'}_${query || 'noquery'}`;
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            
            // Generate cache key based on current query params
            const cacheKey = getCacheKey(page, pageSize, sort, q);
            
            // Try to get from cache first
            const cached = CacheService.get<{ items: Medicine[]; meta: MedicineMeta | null }>(cacheKey);
            if (cached) {
                setMedicines(cached.items);
                setMeta(cached.meta);
                setLoading(false);
                return cached.items;
            }
            
            // If not in cache, fetch from API
            const { items, meta } = await getMedicines({ page, limit: pageSize, sort, q });
            
            // Store in cache
            CacheService.set(cacheKey, { items, meta });
            
            setMedicines(items);
            setMeta(meta);
            return items;
        }
        catch (error) {
            message.error("Lỗi khi lấy danh sách thuốc");
            return [];
        } finally {
            setLoading(false);
        }
    }

    const handleTableChange = (
        pagination: { current?: number; pageSize?: number },
        _filters: any,
        sorter: any
    ) => {
        // pagination
        if (pagination.current) setPage(pagination.current);
        if (pagination.pageSize) setPageSize(pagination.pageSize);

        // sorting
        if (Array.isArray(sorter)) {
            // pick the first sorter if multiple
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

    const handleOpenCreate = () => {
        setCreateOpen(true);
    };

    const openEditModal = async (record: Medicine) => {
        const id = String(record._id || record.id);
        setEditingId(id);
        setEditOpen(true);
    };

    type ID = string | number;

    const handleDelete = async (_id: ID | undefined): Promise<void> => {
        Modal.confirm({
            title: 'Xoá thuốc',
            content: 'Bạn có chắc muốn xoá thuốc này? Hành động này không thể hoàn tác.',
            okText: 'Xoá',
            okType: 'danger',
            cancelText: 'Huỷ',            
            onOk: async (): Promise<void> => {
                try {
                    const id = String(_id);
                    await deleteMedicine(id);
                    message.success("Xoá thuốc thành công");
                    
                    // Clear cache after deleting
                    CacheService.clear();
                    
                    fetchMedicines();
                } catch {
                    message.error("Xoá thuốc thất bại");
                }
            },
        });
    };

    const columns = [
        { title: 'Tên thuốc', dataIndex: 'name', key: 'name' },
        {
            title: 'Giá (VNĐ)', dataIndex: 'price', key: 'price', sorter: true,
            render: (value: number) => value.toLocaleString('vi-VN')
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', sorter: true },
        { title: 'Dạng thuốc', dataIndex: 'dosageForm', key: 'dosageForm' },
        { title: 'Nhà sản xuất', dataIndex: 'manufacturer', key: 'manufacturer' },
        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            sorter: true,
            render: (value: string) => formatDateDDMMYYYY(value)
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (record: Medicine) => (
                <span className='flex gap-2'>
                    <ButtonPrimary type="link" shape="round" icon={<AiFillEdit />} onClick={() => openEditModal(record)}>Sửa</ButtonPrimary>
                    <Button type="link" color="danger" variant="solid" shape="round" icon={<FaTrash />} onClick={() => handleDelete(record._id)}>Xoá</Button>
                </span>
            ),
        },
    ]

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Quản lý kho thuốc</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <ButtonPrimary icon={<MdAdd />} size="large" onClick={handleOpenCreate}>
                        Thêm thuốc
                    </ButtonPrimary>
                </div>
                <div style={{ minWidth: 240, width: '100%', maxWidth: 420 }}>
                    <Input.Search
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm kiếm thuốc..."
                        allowClear
                        enterButton={
                            <Button icon={<FaSearch />}
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    borderColor: 'var(--color-primary)'
                                }} >
                                Search
                            </Button>}
                        className='text-[var(--color-primary)]'
                        onSearch={onSearch}
                    />
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={medicines}
                rowKey={(record) => record._id || String(record.id)}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: meta?.total ?? medicines.length,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                }}
                onChange={handleTableChange}
            />            <ModalCreateMedicine
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => {
                    // Clear cache after creating new medicine
                    CacheService.clear();
                    setPage(1);
                    fetchMedicines();
                }}
            />

            <ModalEditMedicine
                open={editOpen}
                id={editingId}
                onClose={() => { setEditOpen(false); setEditingId(undefined); }}
                onUpdated={() => {
                    // Clear cache after updating medicine
                    CacheService.clear();
                    fetchMedicines();
                }}
            />

        </div>
    )
}

export default MedicineManagement;