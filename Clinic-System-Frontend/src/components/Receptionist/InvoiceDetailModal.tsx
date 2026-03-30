import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Table, message, Divider, Tag } from 'antd';
import { getInvoiceById, type Invoice, type InvoiceStatus, createVNPayPayment, payCashInvoice } from '../../services/InvoiceService';
import { formatDateDDMMYYYY } from '../../utils/date';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaCreditCard, FaMoneyBillWave, FaPrint } from 'react-icons/fa';

interface InvoiceDetailModalProps {
    open: boolean;
    invoiceId?: string | null;
    onClose: () => void;
    onSuccess?: () => void; // Callback khi thanh toán thành công
}

const formatGender = (gender: 'male' | 'female' | 'other'): string => {
    switch (gender) {
        case 'male': return 'Nam';
        case 'female': return 'Nữ';
        default: return 'Khác';
    }
};

const getStatusTagText = (status: InvoiceStatus): string => {
    switch (status) {
        case 'Paid': return 'Đã thanh toán';
        case 'Cancelled': return 'Đã hủy';
        case 'Refunded': return 'Đã hoàn tiền';
        default: return 'Chờ thanh toán';
    }
};

const statusColor = (status: InvoiceStatus) => {
    switch (status) {
        case 'Paid': return 'green';
        case 'Cancelled': return 'red';
        case 'Refunded': return 'volcano';
        default: return 'orange';
    }
};

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ open, invoiceId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!open || !invoiceId) return;
            setLoading(true);
            try {
                const data = await getInvoiceById(invoiceId);
                setInvoice(data);
            } catch (e) {
                message.error('Không thể lấy chi tiết hóa đơn.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [open, invoiceId]);
    
    const handleCashPayment = async(invoiceId: string) => {
        Modal.confirm({
            title: "Xác nhận thanh toán tiền mặt",
            content: "Bệnh nhân đã thanh toán tiền mặt tại quầy?",
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await payCashInvoice(invoiceId);
                    message.success("Đã xác nhận thanh toán thành công");
                    
                    // Đóng modal và reload table
                    onClose();
                    if (onSuccess) {
                        onSuccess();
                    }
                } catch (error: any) {
                    message.error(error?.response?.data?.message || "Lỗi khi xác nhận thanh toán");
                }
            },
        });
    };      
    
    const handleVNPayPayment = async (invoiceId: string) => {
        console.log("=== handleVNPayPayment called ===");
        console.log("Invoice ID:", invoiceId);
        
        setPaymentLoading(invoiceId);
        try {
            // Tạo returnUrl để redirect về trang payment result
            const returnUrl = `${window.location.origin}/receptionist/payment-result`;
            console.log("Return URL:", returnUrl);
            console.log("Calling createVNPayPayment...");
            
            const res = await createVNPayPayment(invoiceId, returnUrl);
            console.log("VNPay response:", res);
            
            if (res.checkoutUrl) {
                console.log("Redirecting to:", res.checkoutUrl);
                // Redirect to VNPay checkout
                window.location.href = res.checkoutUrl;
            } else {
                console.error("No checkoutUrl in response");
                message.error("Không nhận được đường dẫn thanh toán");
                setPaymentLoading(null);
            }
        } catch (err: any) {
            console.error("Error creating VNPay payment:", err);
            console.error("Error response:", err?.response);
            message.error(err?.response?.data?.message || "Không thể tạo thanh toán VNPay");
            setPaymentLoading(null);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById("invoice-print-content");
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`invoice-${invoice?._id?.slice(0, 8)}.pdf`);
    };      
    
    // Xác định footer buttons dựa trên trạng thái
    const getFooterButtons = () => {
        if (!invoice) return [];

        // Nếu trạng thái là "Chờ thanh toán" (Pending)
        if (invoice.status === 'Pending') {
            const isPaymentProcessing = paymentLoading === invoice._id;
            
            return [
                <Button 
                    key="cancel" 
                    onClick={onClose}
                    disabled={isPaymentProcessing}
                >
                    Đóng
                </Button>,
                <Button 
                    key="cash" 
                    variant='solid' 
                    color='green' 
                    onClick={() => handleCashPayment(invoice._id)} 
                    icon={<FaMoneyBillWave />}
                    disabled={isPaymentProcessing}
                >
                    Thanh toán tiền mặt
                </Button>,
                <Button 
                    key="card" 
                    type="primary" 
                    onClick={() => handleVNPayPayment(invoice._id)} 
                    icon={<FaCreditCard />}
                    loading={isPaymentProcessing}
                    disabled={isPaymentProcessing}
                >
                    {isPaymentProcessing ? 'Đang chuyển hướng...' : 'Thanh toán VNPAY'}
                </Button>,
            ];
        }

        // Các trạng thái khác (Paid, Cancelled, Refunded) - chỉ hiện nút Tải PDF
        return [
            <Button key="cancel" onClick={onClose}>
                Đóng
            </Button>,
            <Button key="download" type="primary" icon={<FaPrint />}
                onClick={handleDownloadPDF}>
                Tải PDF
            </Button>,
        ];
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onClose}
            footer={getFooterButtons()}
            width={900}
        >
            {loading ? (
                <div className="text-center py-10 text-lg font-semibold">Đang tải...</div>
            ) : (
                invoice && (
                    <div id="invoice-print-content" className="p-6 font-sans">

                        <div id="invoice-print-area" ref={componentRef} className='p-4'>
                            {/* HEADER */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold">PHÒNG KHÁM PROHEALTH</h1>
                                <p>Địa chỉ: 123 Nguyễn Trãi, Hà Nội, Việt Nam</p>
                                <p>Hotline: 1900 1234 · Email: contact@clinic.vn</p>
                                <Divider />
                                <h2 className="text-xl font-bold mt-4">HÓA ĐƠN THANH TOÁN</h2>
                            </div>

                            {/* META INFO */}
                            <div className="grid grid-cols-2 gap-6 text-sm mt-4 mb-6">
                                <div className="space-y-1">
                                    <p><strong>Mã hóa đơn:</strong> {invoice._id.slice(0, 8)}</p>
                                    <p><strong>Ngày tạo:</strong> {formatDateDDMMYYYY(invoice.issued_at)}</p>
                                    <p>
                                        <strong>Trạng thái:</strong>{' '}
                                        <Tag color={statusColor(invoice.status)}>
                                            {getStatusTagText(invoice.status)}
                                        </Tag>
                                    </p>
                                    <p><strong>Tổng tiền:</strong> {invoice.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                                </div>                                
                                <div className="space-y-1">
                                    <p><strong>Chủ hồ sơ:</strong> {invoice.patient.name}</p>
                                    <p><strong>Số điện thoại:</strong> {invoice.patient.phone}</p>
                                    <p><strong>Ngày sinh:</strong> {formatDateDDMMYYYY(invoice.patient.dob)}</p>
                                    <p><strong>Giới tính:</strong> {formatGender(invoice.patient.gender)}</p>
                                </div>
                            </div>                            
                            {/* LAB ORDER */}
                            {invoice.labOrder && invoice.labOrder.items.length > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold mt-5 mb-2">DỊCH VỤ XÉT NGHIỆM</h3>
                                    <Table
                                        bordered
                                        columns={[
                                            { title: 'Tên Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
                                            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'right' },
                                            {
                                                title: 'Giá',
                                                dataIndex: 'price',
                                                key: 'price',
                                                render: (v: number) => v.toLocaleString('vi-VN') + ' VNĐ',
                                                align: 'right'
                                            }
                                        ]}
                                        dataSource={invoice.labOrder.items}
                                        pagination={false}
                                        size="small"
                                        rowKey="_id"
                                    />
                                    <p className="text-right mt-2 font-bold">
                                        Tổng tiền xét nghiệm: {invoice.labOrder.totalPrice.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                </>
                            )}                            
                            {/* PRESCRIPTION */}
                            {invoice.prescription && invoice.prescription.items.length > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-2">ĐƠN THUỐC</h3>
                                    <Table
                                        bordered
                                        columns={[
                                            { title: 'Tên Thuốc', dataIndex: 'medicineName', key: 'medName' },
                                            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'right' },
                                            {
                                                title: 'Giá',
                                                dataIndex: 'price',
                                                key: 'medPrice',
                                                render: (v: number) => v.toLocaleString('vi-VN') + ' VNĐ',
                                                align: 'right'
                                            }
                                        ]}
                                        dataSource={invoice.prescription.items}
                                        pagination={false}
                                        size="small"
                                        rowKey="_id"
                                    />
                                    <p className="text-right mt-2 font-bold">
                                        Tổng tiền thuốc: {invoice.prescription.totalPrice.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                </>
                            )}

                            {/* FINAL TOTAL */}
                            <Divider />
                            <h3 className="text-xl font-bold text-right mt-2">
                                TỔNG CỘNG: {invoice.totalPrice.toLocaleString('vi-VN')} VNĐ
                            </h3>

                            <div className="text-center mt-8 text-sm">
                                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                                <p>Chúc bạn sức khỏe và hẹn gặp lại!</p>
                            </div>
                        </div>
                    </div>
                )
            )}
        </Modal>
    );
};

export default InvoiceDetailModal;
