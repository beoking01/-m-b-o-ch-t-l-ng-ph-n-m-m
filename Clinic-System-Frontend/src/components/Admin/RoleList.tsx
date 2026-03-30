import { Table, Button, Popconfirm } from 'antd';
import type { Role } from '../../services/RoleService';
import { EditOutlined, SafetyOutlined, DeleteOutlined } from '@ant-design/icons';

type Props = {
    roles: Role[];
    loading?: boolean;
    onEdit: (r: Role) => void;
    onDelete: (id: string) => void;
    onPermissions?: (r: Role) => void;
};

export default function RoleList({ roles, loading, onEdit, onDelete, onPermissions }: Props) {
    const columns = [
        {
            title: 'Tên vai trò',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            key: 'description',
            render: (_: unknown, record: Role) => record.description ?? record.name,
        },
        {
            title: 'Số người',
            dataIndex: 'userCount',
            key: 'userCount',
            render: (v: number) => v ?? 0,
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'right' as const,
            render: (_: unknown, record: Role) => (
                <div className='space-x-2 flex justify-end'>
                    <Button icon={<EditOutlined />} onClick={() => onEdit(record)}
                        color='primary' variant='solid'>
                        Sửa
                    </Button>
                    <Button icon={<SafetyOutlined />} onClick={() => onPermissions?.(record)}
                        color='cyan' variant='solid'>
                        Phân quyền
                    </Button>
                    <Popconfirm title="Bạn có muốn xóa?" onConfirm={() => onDelete(record._id)}>
                        <Button icon={<DeleteOutlined />}
                            color='danger' variant='solid'>
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return <Table rowKey="_id" dataSource={roles} columns={columns} loading={loading} />;
}
