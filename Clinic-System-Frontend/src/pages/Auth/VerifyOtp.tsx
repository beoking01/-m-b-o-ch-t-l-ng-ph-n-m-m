import React, { useState } from 'react';
import { Input, Button, Form, message, Card } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/Api';

const VerifyOtp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const handleSubmit = async (values: any) => {
    const { otp } = values;
    setLoading(true);
    try {
      // Call backend to verify OTP
      // Backend route: POST /accounts/password/otp
      await api.post('/accounts/password/otp', { email, otp });
      message.success('Mã OTP hợp lệ. Tiếp tục đổi mật khẩu.');
      navigate('/auth/forgot/reset', { state: { email } });
    } catch (err: any) {
      console.error('Verify OTP error', err);
      message.error(err?.response?.data?.message || 'Mã OTP không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full" style={{ minHeight: '480px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 bg-white">
            <h2 className="mb-2 text-2xl font-extrabold text-gray-800">Xác thực mã OTP</h2>
            <p className="font-light text-gray-500 mb-6 text-sm">Nhập mã OTP đã được gửi tới <strong>{email}</strong>.</p>

            <Card bordered={false} className="p-0">
              <Form layout="vertical" onFinish={handleSubmit} className="space-y-4">
                <Form.Item name="otp" label={<span className="font-medium text-gray-700">Mã OTP</span>} rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}>
                  <Input placeholder="Nhập mã OTP" size="large" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                    Xác thực
                  </Button>
                </Form.Item>

                <div className="text-center text-sm mt-3 text-gray-500">
                  <a onClick={() => navigate('/auth/forgot')} className="font-semibold text-indigo-600 hover:underline">Quay lại</a>
                </div>
              </Form>
            </Card>
          </div>

          <div className="relative hidden md:block">
            <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="text-xl font-bold text-indigo-700">Nhập mã OTP</h3>
                <p className="text-sm text-indigo-600 mt-2">Kiểm tra hòm thư của bạn và nhập mã xác thực để tiếp tục.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
