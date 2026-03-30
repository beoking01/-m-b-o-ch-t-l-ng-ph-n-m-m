import React, { useRef } from 'react';
import { Modal, Button, Table, Divider } from 'antd';
import { formatDateDDMMYYYY } from '../../../utils/date';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaPrint } from 'react-icons/fa';

interface PrescriptionDetailModalProps {
    open: boolean;
    prescriptionData: any;
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

const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({ 
    open, 
    prescriptionData, 
    patientInfo, 
    onClose 
}) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        const element = document.getElementById("prescription-print-content");
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`prescription-${prescriptionData?.id?.slice(0, 8)}.pdf`);
    };

    if (!prescriptionData || !patientInfo) return null;

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
            <div id="prescription-print-content" className="p-6 font-sans">
                <div id="prescription-print-area" ref={componentRef} className='p-4'>
                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold">PHÒNG KHÁM PROHEALTH</h1>
                        <p>Địa chỉ: 123 Nguyễn Trãi, Hà Nội, Việt Nam</p>
                        <p>Hotline: 1900 1234 · Email: contact@clinic.vn</p>
                        <Divider />
                        <h2 className="text-xl font-bold mt-4">ĐƠN THUỐC</h2>
                    </div>

                    {/* META INFO */}
                    <div className="grid grid-cols-2 gap-6 text-sm mt-4 mb-6">
                        <div className="space-y-1">
                            <p><strong>Mã đơn thuốc:</strong> {prescriptionData.id?.slice(0, 8)}</p>
                            <p><strong>Ngày kê đơn:</strong> {formatDateDDMMYYYY(new Date().toISOString())}</p>
                            <p><strong>Tổng tiền:</strong> {prescriptionData.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ</p>
                        </div>

                        <div className="space-y-1">
                            <p><strong>Bệnh nhân:</strong> {patientInfo.name}</p>
                            <p><strong>Số điện thoại:</strong> {patientInfo.phone}</p>
                            <p><strong>Ngày sinh:</strong> {formatDateDDMMYYYY(patientInfo.dob)}</p>
                            <p><strong>Giới tính:</strong> {formatGender(patientInfo.gender)}</p>
                        </div>
                    </div>

                    {/* PRESCRIPTION ITEMS */}
                    <h3 className="text-lg font-semibold mt-5 mb-2">DANH SÁCH THUỐC</h3>
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
                                title: 'Tên Thuốc', 
                                key: 'medicineName',
                                render: (_: any, record: any) => record.medicine?.name || 'Thuốc không xác định',
                                width: 200
                            },
                            { 
                                title: 'Số lượng', 
                                dataIndex: 'quantity', 
                                key: 'quantity', 
                                align: 'center',
                                width: 80,
                                render: (qty: number, record: any) => `${qty} ${record.medicine?.unit || ''}`
                            },
                            {
                                title: 'Liều dùng',
                                dataIndex: 'dosage',
                                key: 'dosage',
                                render: (text: string) => text || '—',
                                width: 120
                            },
                            {
                                title: 'Tần suất',
                                dataIndex: 'frequency',
                                key: 'frequency',
                                render: (text: string) => text || '—',
                                width: 100
                            },
                            {
                                title: 'Thời gian',
                                dataIndex: 'duration',
                                key: 'duration',
                                render: (text: string) => text || '—',
                                width: 100
                            },
                            {
                                title: 'Đơn giá',
                                key: 'price',
                                render: (_: any, record: any) => {
                                    const price = record.medicine?.price || 0;
                                    return price.toLocaleString('vi-VN') + ' VNĐ';
                                },
                                align: 'right',
                                width: 120
                            }
                        ]}
                        dataSource={prescriptionData.items}
                        pagination={false}
                        size="small"
                        rowKey={(record) => record._id || record.medicineId || Math.random().toString()}
                    />

                    {/* DETAILED INSTRUCTIONS */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">HƯỚNG DẪN SỬ DỤNG CHI TIẾT:</h4>
                        {prescriptionData.items.map((item: any, index: number) => (
                            item.instruction && (
                                <div key={index} className="mb-2 pl-4">
                                    <p className="text-sm">
                                        <strong>{index + 1}. {item.medicine?.name}:</strong> {item.instruction}
                                    </p>
                                </div>
                            )
                        ))}
                    </div>
                    
                    {/* TOTAL */}
                    <Divider />
                    <h3 className="text-xl font-bold text-right mt-2">
                        TỔNG CỘNG: {prescriptionData.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ
                    </h3>

                    {/* NOTES */}
                    <div className="mt-6 space-y-2 text-sm">
                        <p><strong>Lưu ý:</strong></p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Uống thuốc theo đúng liều lượng và thời gian được hướng dẫn</li>
                            <li>Không tự ý ngừng thuốc hoặc thay đổi liều lượng khi chưa có chỉ định của bác sĩ</li>
                            <li>Bảo quản thuốc ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp</li>
                            <li>Nếu có phản ứng phụ bất thường, vui lòng liên hệ ngay với bác sĩ</li>
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
                            <p className="font-semibold">Bác sĩ điều trị</p>
                            <p className="text-sm italic">(Ký và đóng dấu)</p>
                            <div className="h-20"></div>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-sm">
                        <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi!</p>
                        <p>Chúc bạn sớm bình phục!</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PrescriptionDetailModal;
