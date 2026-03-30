import React, { useState } from 'react';
import { Input, Button, Form, message, Card } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/AccountService';
const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const handleSubmit = async (values: any) => {
    const { password, confirmPassword } = values;
    if (password !== confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      // Call backend to reset password
      // Backend route: POST /accounts/password/reset
      // Backend expects the reset token in cookie (set after OTP verify), so only send password
      await resetPassword({ email, newPassword: password, confirmPassword });
      message.success('Đổi mật khẩu thành công. Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      console.error('Reset password error', err);
      message.error(err?.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full" style={{ minHeight: '480px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 bg-white">
            <h2 className="mb-2 text-2xl font-extrabold text-gray-800">Đổi mật khẩu mới</h2>
            <p className="font-light text-gray-500 mb-6 text-sm">Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>.</p>

            <Card bordered={false} className="p-0">
              <Form layout="vertical" onFinish={handleSubmit} className="space-y-4">
                <Form.Item name="password" label={<span className="font-medium text-gray-700">Mật khẩu mới</span>} rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                  <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
                </Form.Item>
                <Form.Item name="confirmPassword" label={<span className="font-medium text-gray-700">Xác nhận mật khẩu</span>} rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}>
                  <Input.Password placeholder="Xác nhận mật khẩu" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                    Đổi mật khẩu
                  </Button>
                </Form.Item>

                <div className="text-center text-sm mt-3 text-gray-500">
                  <a onClick={() => navigate('/login')} className="font-semibold text-indigo-600 hover:underline">Quay lại đăng nhập</a>
                </div>
              </Form>
            </Card>
          </div>

          <div className="relative hidden md:block">
            <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="text-xl font-bold text-indigo-700">Bảo mật tài khoản</h3>
                <p className="text-sm text-indigo-600 mt-2">Hãy chọn mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
