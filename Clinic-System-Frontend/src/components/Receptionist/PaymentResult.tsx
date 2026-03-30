import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Result, Button, Card, Spin, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const PaymentResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);

    const status = searchParams.get("status");
    const invoiceId = searchParams.get("invoiceId");
    const paymentId = searchParams.get("paymentId");
    const message = searchParams.get("message");

    useEffect(() => {
        // Simulate loading for better UX
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);    
    const handleBackToInvoices = () => {
        navigate("/receptionist/invoices");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="p-2 sm:p-4 md:p-6 flex justify-center items-center min-h-screen">
                <Card className="max-w-2xl w-full shadow-lg">
                    <Result
                        status="success"
                        icon={<CheckCircleOutlined style={{ color: "#52c41a", fontSize: '48px' }} className="text-5xl sm:text-6xl md:text-7xl" />}
                        title={<Title level={2} className="text-lg sm:text-xl md:text-2xl">Thanh toán thành công!</Title>}
                        subTitle={
                            <div className="text-center px-2 sm:px-4">
                                <Text className="block mb-2 text-sm sm:text-base break-words">
                                    {message || "Giao dịch của bạn đã được xử lý thành công."}
                                </Text>
                                {invoiceId && (
                                    <Text type="secondary" className="block text-xs sm:text-sm break-words">
                                        Mã hóa đơn: <strong>{invoiceId}</strong>
                                    </Text>
                                )}
                                {paymentId && (
                                    <Text type="secondary" className="block text-xs sm:text-sm break-words">
                                        Mã giao dịch: <strong>{paymentId}</strong>
                                    </Text>
                                )}
                            </div>
                        }
                        extra={[
                            <Button 
                                type="primary" 
                                key="back" 
                                onClick={handleBackToInvoices} 
                                size="middle"
                                className="text-xs sm:text-sm w-full sm:w-auto"
                            >
                                Quay lại danh sách hóa đơn
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // Failed or unknown status
    return (
        <div className="p-2 sm:p-4 md:p-6 flex justify-center items-center min-h-screen">
            <Card className="max-w-2xl w-full shadow-lg">
                <Result
                    status="error"
                    icon={<CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: '48px' }} className="text-5xl sm:text-6xl md:text-7xl" />}
                    title={<Title level={2} className="text-lg sm:text-xl md:text-2xl">Thanh toán thất bại</Title>}
                    subTitle={
                        <div className="text-center px-2 sm:px-4">
                            <Text className="block mb-2 text-sm sm:text-base break-words">
                                {message || "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
                            </Text>
                            {invoiceId && (
                                <Text type="secondary" className="block text-xs sm:text-sm break-words">
                                    Mã hóa đơn: <strong>{invoiceId}</strong>
                                </Text>
                            )}
                        </div>
                    }
                    extra={[
                        <Button 
                            type="primary" 
                            key="back" 
                            onClick={handleBackToInvoices} 
                            size="middle"
                            className="text-xs sm:text-sm w-full sm:w-auto"
                        >
                            Quay lại danh sách hóa đơn
                        </Button>,
                    ]}
                />
            </Card>
        </div>
    );
};

export default PaymentResult;
