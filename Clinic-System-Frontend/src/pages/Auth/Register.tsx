import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/AuthService";
import { 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  Alert, 
  Typography, 
  ConfigProvider 
} from "antd";
import backgroundImage from "../../assets/login_photo.jpg";

const { Title, Text } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Logic handle khi form submit thành công (đã qua validate của antd)
  const onFinish = async (values: any) => {
    setErrorMsg("");
    
    // Format lại dữ liệu để khớp với API của bạn (nếu cần)
    const payload = {
      ...values,
      dob: values.dob ? values.dob.format("YYYY-MM-DD") : "",
    };

    try {
      setLoading(true);
      const response = await registerUser(payload);
      if (response.message === "Đăng ký thành công!") {
        navigate("/login");
      } else {
        setErrorMsg(response.message || "Đăng ký thất bại!");
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4f46e5", // Màu Indigo-600 của bạn
          borderRadius: 8,
        },
      }}
    >
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center bg-no-repeat p-4"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Title level={2} style={{ color: "#4f46e5", margin: 0 }}>
              Đăng ký tài khoản
            </Title>
            <Text type="secondary">
              Tạo tài khoản để truy cập vào hệ thống của chúng tôi.
            </Text>
          </div>

          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              className="mb-4"
              closable
            />
          )}

          <Form
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            {/* Họ tên */}
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input size="large" placeholder="Nhập họ tên" />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
            >
              <Input size="large" placeholder="Nhập email" />
            </Form.Item>

            {/* Mật khẩu */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password size="large" placeholder="••••••••" />
            </Form.Item>

            {/* Nhập lại mật khẩu */}
            <Form.Item
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="••••••••" />
            </Form.Item>

            {/* Số điện thoại */}
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input size="large" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              {/* Ngày sinh */}
              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[{ required: true, message: "Chọn ngày sinh!" }]}
              >
                <DatePicker size="large" className="w-full" placeholder="Chọn ngày" />
              </Form.Item>

              {/* Giới tính */}
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Chọn giới tính!" }]}
              >
                <Select size="large" placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Địa chỉ */}
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input size="large" placeholder="Nhập địa chỉ" />
            </Form.Item>

            {/* Nút submit */}
            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-12 text-base font-semibold"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-sm">
            <Text type="secondary">Đã có tài khoản? </Text>
            <Button 
              type="link" 
              className="p-0 h-auto font-medium" 
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Register;