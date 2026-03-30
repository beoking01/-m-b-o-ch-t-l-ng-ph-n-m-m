import { Checkbox, Space } from 'antd';

type Props = {
    permissions: string[]; // all available
    value?: string[]; // selected
    onChange?: (v: string[]) => void;
};

export default function PermissionsMatrix({ permissions, value = [], onChange }: Props) {
    return (
        <Space direction="vertical">
            <Checkbox.Group value={value} onChange={(v) => onChange?.(v as string[])}>
                <Space direction="vertical">
                    {permissions.map((p) => (
                        <Checkbox key={p} value={p}>
                            {p}
                        </Checkbox>
                    ))}
                </Space>
            </Checkbox.Group>
        </Space>
    );
}
