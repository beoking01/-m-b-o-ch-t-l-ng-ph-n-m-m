import React, { useEffect, useState } from 'react';
import {
    Button, List, Tag, Drawer, Form, Input, Select, Space, message,
    Empty, Card, DatePicker, Row, Col, Descriptions, Popconfirm
} from 'antd';
import { FaUser } from 'react-icons/fa';
import { EditOutlined, DeleteOutlined, CalendarOutlined, MedicineBoxOutlined, HeartOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import * as HealthProfileService from '../../services/HealthProfileService';
import * as FamilyMemberService from '../../services/FamilyMemberService';
import type { HealthProfile } from '../../services/HealthProfileService';
import { getPatientByAccountId } from "../../services/PatientService";
import { CacheService } from '../../services/CacheService';
import dayjs from 'dayjs';
const { Option } = Select;

// Define the Label component
const Label: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        {text}
    </span>
);

// ✨ Card hiển thị hồ sơ với nút xóa
const CardHoverProfile: React.FC<{
    profile: HealthProfile;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ profile, onEdit, onDelete }) => {
    const title = profile.type === 'Patient'
        ? 'Chủ sở hữu'
        : profile.familyMemberName || 'Thành viên';

    return (
        <Card
            hoverable
            style={{ borderRadius: 16, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', minHeight: 220 }}
            className="[&_.ant-card-head]:!p-3 sm:[&_.ant-card-head]:!p-4 [&_.ant-card-body]:!p-3 sm:[&_.ant-card-body]:!p-4"
            title={
                <Space align="center" size="small" className="flex-wrap">
                    <FaUser className="text-lg sm:text-2xl" style={{ color: '#4f46e5' }} />
                    <span className="font-bold text-sm sm:text-lg">{title}</span>
                    {profile.type === 'Patient'
                        ? <Tag color="blue" className="text-xs">Bạn</Tag>
                        : <Tag color="purple" className="text-xs">{profile.relationship}</Tag>}
                </Space>
            }
            extra={
                <Space size="small">
                    <Button type="text" icon={<EditOutlined />} onClick={onEdit} size="small" />
                    {profile.type === 'FamilyMember' && (
                        <Popconfirm
                            title="Bạn có chắc muốn xóa hồ sơ này không?"
                            onConfirm={onDelete}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    )}
                </Space>
            }
        >
            <Descriptions
                column={1}
                size="small"
                bordered
                style={{ borderRadius: 8, overflow: 'hidden' }}
                className="[&_.ant-descriptions-item-label]:!text-xs sm:[&_.ant-descriptions-item-label]:!text-sm [&_.ant-descriptions-item-content]:!text-xs sm:[&_.ant-descriptions-item-content]:!text-sm"
            >
                <Descriptions.Item
                    label={<Label icon={<CalendarOutlined />} text="Chiều cao" />}
                    styles={{ label: { width: '40%' } }}
                >
                    {profile.height ?? '-'} cm
                </Descriptions.Item>

                <Descriptions.Item
                    label={<Label icon={<CalendarOutlined />} text="Cân nặng" />}
                    styles={{ label: { width: '40%' } }}
                >
                    {profile.weight ?? '-'} kg
                </Descriptions.Item>

                <Descriptions.Item
                    label={<Label icon={<HeartOutlined />} text="Nhóm máu" />}
                    styles={{ label: { width: '40%' } }}
                >
                    {profile.bloodType ?? '---'}
                </Descriptions.Item>

                <Descriptions.Item
                    label={<Label icon={<MedicineBoxOutlined />} text="Dị ứng" />}
                    styles={{ label: { width: '40%' } }}
                >
                    <span className="break-words">
                        {(profile.allergies || []).slice(0, 3).join(', ') || '---'}
                    </span>
                </Descriptions.Item>

                <Descriptions.Item
                    label={<Label icon={<MedicineBoxOutlined />} text="Thuốc đang dùng" />}
                    styles={{ label: { width: '40%' } }}
                >
                    <span className="break-words">
                        {(profile.medications || []).slice(0, 3).join(', ') || '---'}
                    </span>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

const HealthProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState<HealthProfile[]>([]);
    const [selected, setSelected] = useState<HealthProfile | null>(null);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formType, setFormType] = useState<'Patient' | 'FamilyMember'>('Patient');

    const [form] = Form.useForm();

    // Load patient + health profiles with caching
    const load = async (forceRefresh = false) => {
        if (!user) return;
        try {
            setLoading(true);
            
            const patientCacheKey = `patient_${user.id}`;
            const profilesCacheKey = `health_profiles_${user.id}`;
            
            // Check cache for patient data
            let patient = forceRefresh ? null : CacheService.get<any>(patientCacheKey);
            if (!patient) {
                patient = await getPatientByAccountId(user.id);
                if (patient) {
                    CacheService.set(patientCacheKey, patient);
                }
            }
            
            if (!patient) {
                message.error("Không tìm thấy thông tin bệnh nhân");
                setProfiles([]);
                setPatientId(null);
                return;
            }
            setPatientId(patient?._id || null);

            // Check cache for health profiles
            let data = forceRefresh ? null : CacheService.get<HealthProfile[]>(profilesCacheKey);
            if (!data) {
                data = await HealthProfileService.getAllHealthProfiles(patient?._id || '');
                const profilesArray = Array.isArray(data) ? data : [];
                CacheService.set(profilesCacheKey, profilesArray);
                setProfiles(profilesArray);
            } else {
                setProfiles(data);
            }
        } catch (err) {
            console.error(err);
            message.error("Không thể tải hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [user]);

    const openNew = (type: 'Patient' | 'FamilyMember' = 'Patient') => {
        setSelected(null);
        form.resetFields();
        setFormType(type);
        setDrawerOpen(true);
    };

    const openEdit = (p: HealthProfile) => {
        setSelected(p);
        setFormType(p.type);
        form.setFieldsValue({
            familyMemberName: p.familyMemberName,
            relationship: p.relationship,
            dob: p.familyMemberDob ? dayjs(p.familyMemberDob) : undefined,
            gender: p.familyMemberGender,
            familyMemberPhone: p.familyMemberPhone,
            height: p.height,
            weight: p.weight,
            bloodType: p.bloodType,
            allergies: (p.allergies || []).join(", "),
            chronicConditions: (p.chronicConditions || []).join(", "),
            medications: (p.medications || []).join(", "),
            emergencyContactName: p.emergencyContact?.name,
            emergencyContactPhone: p.emergencyContact?.phone,
        });
        setDrawerOpen(true);
    };

    const onDelete = async (profile: HealthProfile) => {
        try {
            setLoading(true);
            if (profile.type === 'FamilyMember') {
                await FamilyMemberService.deleteFamilyMember(profile.ownerId);
            }
            await HealthProfileService.deleteHealthProfileById(profile._id);
            message.success('Xóa hồ sơ thành công');
            
            // Clear cache and force refresh
            if (user) {
                CacheService.set(`health_profiles_${user.id}`, null);
            }
            load(true);
        } catch (err: any) {
            console.error(err);
            message.error(err?.message || 'Lỗi khi xóa hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const onSave = async () => {
        if (!patientId) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            let ownerId = patientId;

            if (formType === 'FamilyMember' && !selected) {
                const fm = await FamilyMemberService.createFamilyMember({
                    bookerId: patientId,
                    name: values.familyMemberName,
                    relationship: values.relationship,
                    dob: values.dob?.toISOString(),
                    gender: values.gender,
                    phone: values.familyMemberPhone
                });
                ownerId = fm._id || '';
            }

            const healthPayload: any = {
                height: values.height ? Number(values.height) : undefined,
                weight: values.weight ? Number(values.weight) : undefined,
                bloodType: values.bloodType || undefined,
                allergies: values.allergies ? values.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                chronicConditions: values.chronicConditions ? values.chronicConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                medications: values.medications ? values.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                emergencyContact: (values.emergencyContactName || values.emergencyContactPhone) ? {
                    name: values.emergencyContactName || undefined,
                    phone: values.emergencyContactPhone || undefined
                } : undefined
            };
            Object.keys(healthPayload).forEach(key => {
                if (healthPayload[key] === undefined) delete healthPayload[key];
            });

            if (selected) {
                // Update existing
                if (formType === "FamilyMember") {
                    await FamilyMemberService.updateFamilyMember(selected.ownerId, {
                        relationship: values.relationship,
                        name: values.familyMemberName,
                        dob: values.dob?.toISOString(),
                        gender: values.gender,
                        phone: values.familyMemberPhone
                    });
                }
                await HealthProfileService.updateHealthProfileById(selected._id, healthPayload);
                message.success("Cập nhật hồ sơ thành công");
            } else {
                // Create new
                try {
                    await HealthProfileService.createHealthProfileNew(formType, ownerId, healthPayload);
                    message.success("Tạo hồ sơ thành công");
                } catch (createError: any) {
                    if (createError?.response?.data?.message?.includes('already exists') && formType === 'Patient') {
                        // Patient HP exists → update
                        const existingProfiles = await HealthProfileService.getAllHealthProfiles(patientId);
                        const existingProfile = existingProfiles.find((p: any) => p.type === 'Patient');
                        if (existingProfile) {
                            await HealthProfileService.updateHealthProfileById(existingProfile._id, healthPayload);
                            message.success("Cập nhật hồ sơ chủ sở hữu thành công");
                        } else {
                            throw createError;
                        }
                    } else {
                        throw createError;
                    }
                }
            }

            setDrawerOpen(false);
            
            // Clear cache and force refresh
            if (user) {
                CacheService.set(`health_profiles_${user.id}`, null);
            }
            load(true);

        } catch (err: any) {
            console.error("Error saving profile:", err);
            const errorMsg = err?.response?.data?.message || err?.message || "Lỗi khi lưu hồ sơ";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const owner = profiles.find(p => p.type === "Patient") ?? null;
    const family = profiles.filter(p => p.type === "FamilyMember");

    return (
        <div className="container p-3 sm:p-4 md:p-6">
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold">Hồ sơ sức khỏe</h2>
                    <Space size="small" className="flex-wrap">
                        {!owner && <Button type="primary" onClick={() => openNew('Patient')} size="small" className="text-xs sm:text-sm">Thêm hồ sơ chủ</Button>}
                        <Button type="primary" onClick={() => openNew('FamilyMember')} size="small" className="text-xs sm:text-sm">Thêm thành viên</Button>
                    </Space>
                </div>

                <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Chủ sở hữu</h3>
                    {owner ? (
                        <List grid={{ gutter: 12, column: 1, xs: 1 }}>
                            <List.Item>
                                <CardHoverProfile
                                    profile={owner}
                                    onEdit={() => openEdit(owner)}
                                    onDelete={() => onDelete(owner)}
                                />
                            </List.Item>
                        </List>
                    ) : <Empty description="Chưa có hồ sơ chủ" className="text-sm" />}
                </div>

                <div>
                    <h3 className="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">Thành viên gia đình</h3>
                    {family.length ? (
                        <List
                            grid={{ gutter: 12, column: 3, xs: 1, sm: 2, md: 2, lg: 3 }}
                            dataSource={family}
                            renderItem={item => (
                                <List.Item>
                                    <CardHoverProfile
                                        profile={item}
                                        onEdit={() => openEdit(item)}
                                        onDelete={() => onDelete(item)}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : <Empty description="Chưa có hồ sơ thành viên" />}
                </div>
            </Space>

            <Drawer
                title={selected ? "Chỉnh sửa hồ sơ" : "Tạo hồ sơ mới"}
                width="100%"
                style={{ maxWidth: 550 }}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                bodyStyle={{ paddingBottom: 24 }}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button onClick={() => setDrawerOpen(false)} style={{ marginRight: 8 }} size="small" className="text-xs sm:text-sm">Hủy</Button>
                        <Button type="primary" onClick={onSave} loading={loading} size="small" className="text-xs sm:text-sm">Lưu</Button>
                    </div>
                }
            >
                <Form layout="vertical" form={form} colon={false}>
                    {!selected && (
                        <Form.Item label="Loại hồ sơ">
                            <Select value={formType} onChange={setFormType}>
                                <Option value="FamilyMember">Thành viên gia đình</Option>
                                <Option value="Patient">Chủ sở hữu</Option>
                            </Select>
                        </Form.Item>
                    )}

                    {formType === "FamilyMember" && (
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Form.Item
                                name="familyMemberName"
                                label="Tên thành viên"
                                rules={[{ required: true, message: "Nhập tên thành viên" }]}
                            >
                                <Input placeholder="Nhập tên thành viên" />
                            </Form.Item>

                            <Form.Item
                                name="relationship"
                                label="Quan hệ"
                                rules={[{ required: true, message: "Chọn quan hệ" }]}
                            >
                                <Select placeholder="Chọn quan hệ">
                                    <Option value="Bố">Bố</Option>
                                    <Option value="Mẹ">Mẹ</Option>
                                    <Option value="Vợ/Chồng">Vợ / Chồng</Option>
                                    <Option value="Con">Con</Option>
                                    <Option value="Anh/Chị/Em">Anh / Chị / Em</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="dob" label="Ngày sinh">
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn giới tính">
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="familyMemberPhone" label="SĐT">
                                <Input placeholder="Số điện thoại" />
                            </Form.Item>
                        </Space>
                    )}

                    <Row gutter={[8, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="height" label="Chiều cao (cm)">
                                <Input type="number" placeholder="Ví dụ: 170" size="small" className="sm:!h-8" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="weight" label="Cân nặng (kg)">
                                <Input type="number" placeholder="Ví dụ: 60" size="small" className="sm:!h-8" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="bloodType" label="Nhóm máu">
                        <Select allowClear placeholder="Chọn nhóm máu">
                            <Option value="A">A</Option>
                            <Option value="B">B</Option>
                            <Option value="AB">AB</Option>
                            <Option value="O">O</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="allergies" label="Dị ứng (cách nhau bởi dấu ,)">
                        <Input placeholder="Ví dụ: Penicillin, Dust" />
                    </Form.Item>

                    <Form.Item name="chronicConditions" label="Bệnh mãn tính (cách nhau bởi dấu ,)">
                        <Input placeholder="Ví dụ: Tiểu đường, Huyết áp" />
                    </Form.Item>

                    <Form.Item name="medications" label="Thuốc đang dùng (cách nhau bởi dấu ,)">
                        <Input placeholder="Ví dụ: Paracetamol" />
                    </Form.Item>

                    <Form.Item label="Liên hệ khẩn cấp">
                        <Input.Group compact>
                            <Form.Item name="emergencyContactName" noStyle>
                                <Input style={{ width: "50%" }} placeholder="Tên" />
                            </Form.Item>
                            <Form.Item name="emergencyContactPhone" noStyle>
                                <Input style={{ width: "50%" }} placeholder="SĐT" />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default HealthProfilePage;
