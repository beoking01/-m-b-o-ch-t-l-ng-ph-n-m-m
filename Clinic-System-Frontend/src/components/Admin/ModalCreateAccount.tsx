import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, DatePicker } from 'antd';
import { createDoctor } from '../../services/DoctorService';
import { createPatient } from '../../services/PatientService';
import { createAdmin } from '../../services/AdminService';
import { createReceptionist } from '../../services/ReceptionistService';

const { Option } = Select;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const ModalCreateAccount = ({ open, onClose, onCreated }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('patient');
  useEffect(() => {
    if (open) {
      setRole("patient");
      form.setFieldsValue({ role: "patient" });
    }
  }, [open]);
  const handleRoleChange = (value: string) => {
    setRole(value);
    form.resetFields();
    form.setFieldsValue({ role: value });
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      switch (values.role) {
        case 'doctor':
          try {
            const formData = new FormData();
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('name', values.name);
            formData.append('specialtyName', values.specialtyName);
            formData.append('phone', values.phone);
            formData.append('experience', values.experience || '');

            const avatarInput = document.querySelector('input[name="avatar"]') as HTMLInputElement;
            if (avatarInput?.files?.[0]) {
              const file = avatarInput.files[0];
              console.log('📎 File to upload:', {
                name: file.name,
                type: file.type,
                size: file.size
              });
              formData.append('avatar', file);
            } else {
              console.log('No avatar file selected');
            }

            await createDoctor(formData, true);
            message.success('Tạo bác sĩ thành công');
            form.resetFields();
            onCreated?.();
            onClose();
          } catch (err: any) {
            console.error('Create doctor error:', err);
            message.error(err.response?.data?.message || 'Tạo bác sĩ thất bại');
          } finally {
            setLoading(false);
          }
          break;

        case 'patient':
          await createPatient({
            email: values.email,
            password: values.password,
            name: values.name,
            phone: values.phone,
            dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
            address: values.address,
            gender: values.gender,
          });
          message.success('Tạo bệnh nhân thành công');
          form.resetFields();
          onCreated?.();
          onClose();
          break;

        case 'admin':
          await createAdmin({
            email: values.email,
            password: values.password,
            name: values.name,
            phone: values.phone,
          });
          message.success('Tạo admin thành công');
          form.resetFields();
          onCreated?.();
          onClose();
          break;

        case 'receptionist':
          await createReceptionist({
            name: values.name,
            phone: values.phone,
            email: values.email,
            password: values.password,
          });
          message.success('Tạo lễ tân thành công');
          form.resetFields();
          onCreated?.();
          onClose();
          break;

        default:
          throw new Error('Role không hợp lệ');
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      message.error(error.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Tạo tài khoản mới" open={open} onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          initialValue="patient"
        >
          <Select placeholder="Chọn vai trò" onChange={handleRoleChange}>
            <Option value="admin">Admin</Option>
            <Option value="doctor">Bác sĩ</Option>
            <Option value="patient">Bệnh nhân</Option>
            <Option value="receptionist">Lễ tân</Option>
          </Select>
        </Form.Item>

        {/* Common fields */}
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder="Nhập tên" />
        </Form.Item>

        {(role === 'doctor' || role === 'patient' || role === 'admin' || role === 'receptionist') && (
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        )}

        {(role === 'doctor' || role === 'patient' || role === 'admin' || role === 'receptionist') && (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}

        {role === 'doctor' && (
          <>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              label="Tên chuyên khoa"
              name="specialtyName"
              rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
            >
              <Select placeholder="Chọn chuyên khoa">
                <Option value="Tim mạch">Tim mạch</Option>
                <Option value="Nhi">Nhi</Option>
                <Option value="Da liễu">Da liễu</Option>
                <Option value="Tai Mũi Họng">Tai Mũi Họng</Option>
                <Option value="Nội tổng quát">Nội tổng quát</Option>
                <Option value="Sản phụ khoa">Sản phụ khoa</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Kinh nghiệm" name="experience">
              <Input placeholder="Số năm kinh nghiệm" />
            </Form.Item>

            {/* ✅ FIX: Thêm name="avatar" vào input */}
            <Form.Item label="Avatar">
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('✅ File selected:', file.name);
                  }
                }}
              />
            </Form.Item>
          </>
        )}

        {role === 'patient' && (
          <>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="dob">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
            <Form.Item label="Giới tính" name="gender">
              <Select placeholder="Chọn giới tính">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </>
        )}

        {role === 'admin' && (
          <>
            <Form.Item label="Số điện thoại" name="phone">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </>
        )}

        {role === 'receptionist' && (
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCreateAccount;