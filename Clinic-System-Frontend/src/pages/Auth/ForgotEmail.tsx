import React, { useState } from 'react';
import { Input, Button, Form, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/AccountService';

const ForgotEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    const { email } = values;
    setLoading(true);
    try {
      // Call backend to request OTP
      // AccountService.forgotPassword expects an object { email }
      await forgotPassword({ email });
      navigate('/auth/forgot/verify', { state: { email } });
    } catch (err: any) {
      console.error('Request OTP error', err);
      message.error(err?.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full" style={{ minHeight: '480px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 bg-white">
            <h2 className="mb-2 text-2xl font-extrabold text-gray-800">Khôi phục mật khẩu</h2>
            <p className="font-light text-gray-500 mb-6 text-sm">Nhập email đã đăng ký để nhận mã OTP khôi phục.</p>

            <Card bordered={false} className="p-0">
              <Form layout="vertical" onFinish={handleSubmit} className="space-y-4">
                <Form.Item name="email" label={<span className="font-medium text-gray-700">Email</span>} rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
                  <Input placeholder="name@company.com" size="large" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                    Gửi mã OTP
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
                <h3 className="text-xl font-bold text-indigo-700">Không lo quên mật khẩu</h3>
                <p className="text-sm text-indigo-600 mt-2">Chúng tôi sẽ gửi mã xác thực tới email của bạn để khôi phục tài khoản.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotEmail;
