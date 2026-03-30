import React, { useRef } from 'react';
import { Modal, Button, Table, Divider } from 'antd';
import { formatDateDDMMYYYY } from '../../../utils/date';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaPrint } from 'react-icons/fa';

interface LabOrderDetailModalProps {
    open: boolean;
    labOrderData: any;
    patientInfo: any;
    onClose: () => void;
}

const formatGender = (gender: 'male' | 'female' | 'other'): string => {
    switch (gender) {
        case 'male': return 'Nam';
        case 'female': return 'Nữ';
        default: return 'Khác';
    }
};

const LabOrderDetailModal: React.FC<LabOrderDetailModalProps> = ({ 
    open, 
    labOrderData, 
    patientInfo, 
    onClose 
}) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        const element = document.getElementById("laborder-print-content");
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`laborder-${labOrderData?._id?.slice(0, 8)}.pdf`);
    };

    if (!labOrderData || !patientInfo) return null;

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>Đóng</Button>,
                <Button 
                    key="download" 
                    type="primary" 
                    icon={<FaPrint />}
                    onClick={handleDownloadPDF}
                >
                    Tải PDF
                </Button>,
            ]}
            width={900}
        >
            <div id="laborder-print-content" className="p-6 font-sans">
                <div id="laborder-print-area" ref={componentRef} className='p-4'>
                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold">PHÒNG KHÁM PROHEALTH</h1>
                        <p>Địa chỉ: 123 Nguyễn Trãi, Hà Nội, Việt Nam</p>
                        <p>Hotline: 1900 1234 · Email: contact@clinic.vn</p>
                        <Divider />
                        <h2 className="text-xl font-bold mt-4">PHIẾU CHỈ ĐỊNH CẬN LÂM SÀNG</h2>
                    </div>

                    {/* META INFO */}
                    <div className="grid grid-cols-2 gap-6 text-sm mt-4 mb-6">
                        <div className="space-y-1">
                            <p><strong>Mã chỉ định:</strong> {labOrderData._id.slice(0, 8)}</p>
                            <p><strong>Thời gian thực hiện:</strong> {formatDateDDMMYYYY(labOrderData.testTime)}</p>
                            <p><strong>Tổng tiền:</strong> {labOrderData.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ</p>
                        </div>

                        <div className="space-y-1">
                            <p><strong>Bệnh nhân:</strong> {patientInfo.name}</p>
                            <p><strong>Số điện thoại:</strong> {patientInfo.phone}</p>
                            <p><strong>Ngày sinh:</strong> {formatDateDDMMYYYY(patientInfo.dob)}</p>
                            <p><strong>Giới tính:</strong> {formatGender(patientInfo.gender)}</p>
                        </div>
                    </div>

                    {/* LAB ORDER ITEMS */}
                    <h3 className="text-lg font-semibold mt-5 mb-2">DANH SÁCH DỊCH VỤ XÉT NGHIỆM</h3>
                    <Table
                        bordered
                        columns={[
                            { 
                                title: 'STT', 
                                key: 'index',
                                width: 60,
                                align: 'center',
                                render: (_: any, __: any, index: number) => index + 1
                            },
                            { 
                                title: 'Tên Dịch vụ', 
                                key: 'serviceName',
                                render: (_: any, record: any) => record.serviceId?.name || 'Dịch vụ không xác định'
                            },
                            { 
                                title: 'Số lượng', 
                                dataIndex: 'quantity', 
                                key: 'quantity', 
                                align: 'center',
                                width: 100
                            },
                            {
                                title: 'Ghi chú',
                                dataIndex: 'description',
                                key: 'description',
                                render: (text: string) => text || '—'
                            },
                            {
                                title: 'Đơn giá',
                                key: 'price',
                                render: (_: any, record: any) => {
                                    const price = record.serviceId?.price || 0;
                                    return price.toLocaleString('vi-VN') + ' VNĐ';
                                },
                                align: 'right',
                                width: 150
                            }
                        ]}
                        dataSource={labOrderData.items}
                        pagination={false}
                        size="small"
                        rowKey={(record) => record._id || record.serviceId?._id || Math.random().toString()}
                    />
                    
                    {/* TOTAL */}
                    <Divider />
                    <h3 className="text-xl font-bold text-right mt-2">
                        TỔNG CỘNG: {labOrderData.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ
                    </h3>

                    {/* NOTES */}
                    <div className="mt-6 space-y-2 text-sm">
                        <p><strong>Lưu ý:</strong></p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Vui lòng mang theo phiếu chỉ định này khi đến thực hiện xét nghiệm</li>
                            <li>Liên hệ với lễ tân để được hướng dẫn chi tiết</li>
                        </ul>
                    </div>

                    {/* SIGNATURE AREA */}
                    <div className="grid grid-cols-2 gap-6 mt-10 text-center">
                        <div>
                            <p className="font-semibold">Bệnh nhân</p>
                            <p className="text-sm italic">(Ký và ghi rõ họ tên)</p>
                            <div className="h-20"></div>
                        </div>
                        <div>
                            <p className="font-semibold">Bác sĩ chỉ định</p>
                            <p className="text-sm italic">(Ký và đóng dấu)</p>
                            <div className="h-20"></div>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-sm">
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                        <p>Chúc bạn sức khỏe!</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default LabOrderDetailModal;
