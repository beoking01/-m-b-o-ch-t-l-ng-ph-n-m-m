import { useState } from 'react';
import { Input, Checkbox, Button, Form, Alert, message } from 'antd';
import backgroundImage from '../../assets/login_photo.jpg';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Thêm hook để điều hướng
import Cookies from 'js-cookie';
// Loại bỏ các props của Modal: visible và onClose
const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate(); // Hook để điều hướng sau khi đăng nhập thành công

    const handleSignIn = async () => {
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            message.success('Đăng nhập thành công! Chào mừng trở lại.', 2);
            // Điều hướng người dùng đến trang chủ hoặc trang dashboard sau khi đăng nhập thành công
            navigate('/');
            const userData = JSON.parse(Cookies.get('userData') || '{}');
            switch (userData.role) {
                case 'doctor':
                    navigate('/doctor');
                    break;
                case 'admin':
                    navigate('/admin');
                    break;
                case 'patient':
                    navigate('/');
                    break;
                case 'receptionist':
                    navigate('/receptionist');
                    break;
                default:
                    navigate('/');
            }
        } catch (err: any) {
            console.error('Lỗi khi đăng nhập:', err);
            let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
            const resp = err && (err as any).response;
            if (resp && resp.data) {
                const data = resp.data;
                if (typeof data === 'object' && data.message) {
                    msg = String(data.message);
                } else if (typeof data === 'string') {
                    msg = data;
                }
            } else if (err && err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Thay thế <Modal> bằng div để làm layout toàn trang
        // Sử dụng Tailwind CSS để căn giữa và giới hạn chiều rộng nội dung
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">

            {/* Nội dung chính, tương đương với phần body của Modal, giờ đã là container cho trang */}
            <div
                className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full" // Thay đổi kích thước và căn giữa
                style={{ minHeight: '600px' }} // Chiều cao tối thiểu cho giao diện trang
            >
                {/* Sử dụng grid với 2 cột bằng nhau: grid-cols-2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">

                    {/* Cột Trái: Form Đăng nhập */}
                    <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 bg-white order-2 md:order-1">
                        <h2 className="mb-2 text-3xl font-extrabold text-gray-800">Chào mừng trở lại 👋</h2>
                        <p className="font-light text-gray-500 mb-6 text-sm">
                            Vui lòng nhập thông tin chi tiết của bạn để tiếp tục.
                        </p>

                        {error && (
                            <Alert
                                message="Lỗi Đăng nhập"
                                description={error}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setError(null)}
                                className="mb-4"
                            />
                        )}

                        <Form layout="vertical" onFinish={handleSignIn} className="space-y-4">
                            <Form.Item label={<span className="font-medium text-gray-700">Email</span>} required>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    size="large"
                                    className="rounded-lg shadow-sm focus:border-indigo-500"
                                />
                            </Form.Item>

                            <Form.Item label={<span className="font-medium text-gray-700">Mật khẩu</span>} required>
                                <Input.Password
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    size="large"
                                    className="rounded-lg shadow-sm focus:border-indigo-500"
                                />
                            </Form.Item>

                            <div className="flex justify-between items-center text-sm">
                                <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
                                    <span className="text-gray-600">Ghi nhớ trong 30 ngày</span>
                                </Checkbox>
                                <a onClick={() => navigate('/auth/forgot')} className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="w-full h-10 bg-indigo-600 border-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150"
                            >
                                Đăng nhập
                            </Button>
                        </Form>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Hoặc</span>
                            </div>
                        </div>

                        <div className="text-center text-sm mt-3 text-gray-500">
                            Chưa có tài khoản?{' '}
                            <a onClick={() => navigate('/register')} className="font-semibold text-indigo-600 hover:underline">
                                Đăng ký miễn phí
                            </a>
                        </div>
                    </div>

                    {/* Cột Phải: Hình ảnh */}
                    <div className="relative hidden md:block order-1 md:order-2">
                        <img
                            src={backgroundImage}
                            alt="Background"
                            className="w-full h-full object-cover rounded-r-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;