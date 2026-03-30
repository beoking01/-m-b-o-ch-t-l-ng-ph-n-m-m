import { useEffect, useState } from "react";
import { Table, Input, message, Tabs, Button, Modal } from "antd";
import { FaSearch, FaTrash } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
// import { AiFillEdit } from "react-icons/ai";
import { getAccounts, deleteAccount } from "../../services/AccountService";
import type { Account } from "../../services/AccountService";
import ButtonPrimary from "../../utils/ButtonPrimary";
import ModalCreateAccount from "../../components/Admin/ModalCreateAccount";
// import ModalEditAccount from "../../components/Admin/ModalEditAccount";
import ModalViewAccount from "../../components/Admin/ModalViewAccount";
import { formatDateDDMMYYYY } from "../../utils/date";
import { EyeOutlined } from "@ant-design/icons";

const AccountManagement = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewAccount, setViewAccount] = useState<Account | null>(null);

    
    // Load accounts once
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const { items } = await getAccounts();
            setAccounts(items);
        } catch (err) {
            message.error("Lỗi khi lấy danh sách tài khoản");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: "Xoá tài khoản",
            content: "Bạn có chắc muốn xoá tài khoản này? Hành động này không thể hoàn tác.",
            okText: "Xoá",
            okType: "danger",
            cancelText: "Huỷ",
            onOk: async () => {
                try {
                    await deleteAccount(id);
                    message.success("Xoá tài khoản thành công");
                    fetchAccounts();
                } catch {
                    message.error("Xoá tài khoản thất bại");
                }
            },
        });
    };;

    // Table columns
    const columns = [
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Role",
            key: "role",
            render: (_: any, record: Account) => record.roleId?.name || "Người dùng",
        },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string) => formatDateDDMMYYYY(value),
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,            // thêm width cố định
            render: (_: any, record: Account) => (
                <div style={{ display: "flex", gap: 8, whiteSpace: "nowrap" }}>
                    <Button type="link" danger shape="round" icon={<FaTrash />} onClick={() => handleDelete(record._id)}>
                        Xoá
                    </Button>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setViewAccount(record);
                            setViewOpen(true);
                        }}
                    >
                        Xem
                    </Button>
                </div>
            ),
        },
    ];

    const filterAccounts = (roleName: string) => {
        return accounts.filter(acc => {
            const matchesRole = acc.roleId?.name === roleName; // lọc theo tab
            const search = debouncedSearch.toLowerCase();
            const matchesEmail = acc.email.toLowerCase().includes(search);
            return matchesRole && matchesEmail;
        });
    };

    // Debounce searchInput
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300); // 300ms debounce
        return () => clearTimeout(handler);
    }, [searchInput]);



    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Quản lý tài khoản</h1>

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <ButtonPrimary icon={<MdAdd />} size="large" onClick={() => setCreateOpen(true)}>
                    Thêm tài khoản
                </ButtonPrimary>
                <Input.Search
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Tìm kiếm tài khoản..."
                    allowClear
                    enterButton={<Button icon={<FaSearch />}>Search</Button>}
                />
            </div>

            <Tabs
                defaultActiveKey="user"
                items={[
                    {
                        key: 'user',
                        label: 'User',
                        children: (
                            <Table
                                columns={columns}
                                dataSource={filterAccounts("patient")}
                                rowKey={record => record._id!}
                                loading={loading}
                            />
                        ),
                    },
                    {
                        key: 'receptionist',
                        label: 'Receptionist',
                        children: (
                            <Table
                                columns={columns}
                                dataSource={filterAccounts("receptionist")}
                                rowKey={record => record._id!}
                                loading={loading}
                            />
                        ),
                    },
                    {
                        key: 'doctor',
                        label: 'Doctor',
                        children: (
                            <Table
                                columns={columns}
                                dataSource={filterAccounts("doctor")}
                                rowKey={record => record._id!}
                                loading={loading}
                            />
                        ),
                    },
                    {
                        key: 'admin',
                        label: 'Admin',
                        children: (
                            <Table
                                columns={columns}
                                dataSource={filterAccounts("admin")}
                                rowKey={record => record._id!}
                                loading={loading}
                            />
                        ),
                    },
                ]}
            />
            <ModalCreateAccount
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => fetchAccounts()}
            />

            <ModalViewAccount
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                accountId={viewAccount?._id || ""}
                role={viewAccount?.roleId?.name as "doctor" | "patient" | "receptionist" | "admin"}
            />
        </div>
    );
};

export default AccountManagement;
