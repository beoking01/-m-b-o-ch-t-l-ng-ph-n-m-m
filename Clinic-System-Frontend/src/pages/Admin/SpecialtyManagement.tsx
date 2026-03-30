import { Button, Input, message, Table, Modal } from "antd";
import { useEffect, useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { getSpecialties, type Specialty, type SpecialtyMeta, deleteSpecialty } from "../../services/SpecialtyService";
import ButtonPrimary from "../../utils/ButtonPrimary";
import { AiFillEdit } from "react-icons/ai";
import ModalCreateSpecialty from "../../components/Admin/ModalCreateSpecialty";
import ModalEditSpecialty from "../../components/Admin/ModalEditSpecialty";

const SpecialtyManagement = () => {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [meta, setMeta] = useState<SpecialtyMeta | null>(null);

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
        fetchSpecialties();
    }, [page, pageSize, sort, q]);

    const fetchSpecialties = async () => {
        try {
            setLoading(true);
            const { items, meta } = await getSpecialties({ page, limit: pageSize, sort, q });
            setSpecialties(items);
            setMeta(meta);
            return items;
        }
        catch (error) {
            message.error("Lỗi khi lấy danh sách chuyên khoa");
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

    const openEditModal = async (record: Specialty) => {
        const id = String(record._id);
        setEditingId(id);
        setEditOpen(true);
    };

    type ID = string | number;

    const handleDelete = async (_id: ID | undefined): Promise<void> => {
        Modal.confirm({
            title: 'Xoá chuyên khoa',
            content: 'Bạn có chắc muốn xoá chuyên khoa này? Hành động này không thể hoàn tác.',
            okText: 'Xoá',
            okType: 'danger',
            cancelText: 'Huỷ',
            onOk: async (): Promise<void> => {
                try {
                    const id = String(_id);
                    await deleteSpecialty(id);
                    message.success("Xoá chuyên khoa thành công");
                    fetchSpecialties();
                } catch {
                    message.error("Xoá chuyên khoa thất bại");
                }
            },
        });
    };

    const columns = [
        { title: 'Tên chuyên khoa', dataIndex: 'name', key: 'name', sorter: true, width: 200 },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 400,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (record: Specialty) => (
                <span className='flex gap-2'>
                    <ButtonPrimary type="link" shape="round" icon={<AiFillEdit />} onClick={() => openEditModal(record)}>Sửa</ButtonPrimary>
                    <Button type="link" danger shape="round" icon={<FaTrash />} onClick={() => handleDelete(record._id)}>Xoá</Button>
                </span>
            ),
        },
    ]


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Quản lý chuyên khoa</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <ButtonPrimary icon={<MdAdd />} size="large" onClick={handleOpenCreate}>
                        Thêm chuyên khoa
                    </ButtonPrimary>
                </div>
                <div style={{ minWidth: 240, width: '100%', maxWidth: 420 }}>
                    <Input.Search
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm kiếm chuyên khoa..."
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
                dataSource={specialties}
                rowKey={(record) => record._id}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: meta?.total ?? specialties.length,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                }}
                onChange={handleTableChange}
            />

            <ModalCreateSpecialty
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => {
                    setPage(1);
                    fetchSpecialties();
                }}
            />

            <ModalEditSpecialty
                open={editOpen}
                id={editingId}
                onClose={() => { setEditOpen(false); setEditingId(undefined); }}
                onUpdated={() => fetchSpecialties()}
            />

        </div>
    )
}

export default SpecialtyManagement;
