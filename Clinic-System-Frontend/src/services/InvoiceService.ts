import api from './Api';

export type InvoiceStatus = 'Paid' | 'Cancelled' | 'Pending' | 'Refunded';

export type OwnerDetail = {
    name: string;
    dob: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
};

// OPTIMIZED: Sử dụng flat data từ snapshot (không cần populate)
export type MedicineItem = {
    _id: string;
    medicineName: string;
    quantity: number;
    price: number;
};

export type PrescriptionInfo = {
    _id: string;
    totalPrice: number;
    items: MedicineItem[];
};

export type ServiceItem = {
    _id: string;
    serviceName: string;
    quantity: number;
    price: number;
};

export type LabOrderInfo = {
    _id: string;
    totalPrice: number;
    items: ServiceItem[];
};

export type Invoice = {
    _id: string;
    issued_at: string;
    totalPrice: number;
    status: InvoiceStatus;

    // Thông tin bệnh nhân từ snapshot (flat data)
    patient: {
        name: string;
        phone: string;
        dob: string;
        gender: 'male' | 'female' | 'other';
    };

    // Chi tiết đơn thuốc từ snapshot (có thể null)
    prescription: PrescriptionInfo | null;

    // Chi tiết đơn xét nghiệm từ snapshot (có thể null)
    labOrder: LabOrderInfo | null;
};

export type InvoiceMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

// Phân trang và lọc
export type InvoiceQuery = {
    page?: number;
    limit?: number;
    sort?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    q?: string;
    status?: InvoiceStatus;
    dateFrom?: string;
    dateTo?: string;
    id?: string;
};

export type UpdateInvoiceStatusDto = {
    status: InvoiceStatus;
};

export type CreateInvoiceDto = {
    patientId: string;
    status?: InvoiceStatus; // Mặc định là 'Pending' trong backend, nhưng vẫn cho phép gửi
    prescriptionId?: string | null;
    labOrderId?: string | null;
};

// Lấy danh sách hóa đơn với phân trang và lọc
export async function getInvoices(params: InvoiceQuery = {}): Promise<{ items: Invoice[]; meta: InvoiceMeta | null }> {
    const url = `/invoices`;
    const res = await api.get(url, { params });
    const items: Invoice[] = res?.data?.data ?? [];
    const meta: InvoiceMeta | null = res?.data?.meta ?? null;
    return { items, meta };
}

// Lấy chi tiết một hóa đơn theo ID
export async function getInvoiceById(id: string): Promise<Invoice> {
    const url = `/invoices/${id}`;
    const res = await api.get(url);
    return res?.data ?? res?.data?.data;
}

// Câp nhật trạng thái của một hóa đơn
export async function updateInvoiceStatus(id: string, dto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const url = `/invoices/${id}/status`;
    const res = await api.patch(url, dto);
    return res?.data ?? res?.data?.data;
}

// Tạo mới một hóa đơn
export async function createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const url = `/invoices`;
    const res = await api.post(url, dto);
    return res?.data ?? res?.data?.data;
}

// Thanh toán tiền mặt
export async function payCashInvoice(invoiceId: string, amount?: number, note?: string): Promise<any> {
    const url = `/invoices/${invoiceId}/pay/cash`;
    const res = await api.post(url, { amount, note });
    return res?.data ?? res?.data?.data;
}

// Create a VNPay-like checkout (mock) and return checkout URL
export async function createVNPayPayment(invoiceId: string, returnUrl?: string): Promise<{ checkoutUrl: string }> {
    const url = `/invoices/${invoiceId}/pay/vnpay`;
    const res = await api.post(url, { returnUrl });
    return res?.data ?? res?.data?.data;
}