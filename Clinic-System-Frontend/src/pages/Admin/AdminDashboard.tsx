import { useEffect, useState } from "react";
import { Card, Flex, Typography, message, Skeleton, Spin } from "antd";
import CountUp from "react-countup";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import { getDashboardStats } from "../../services/StatsService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const { Text } = Typography;

/* ---------- STAT CARD (GIỮ NGUYÊN) ---------- */

type StatCardProps = {
    title: string;
    value: number;
    height?: number;
    loading?: boolean;
};

const StatCard = ({ title, value, height, loading = false }: StatCardProps) => {
    return (
        <Card variant="outlined" style={{ height: height || 150 }}>
            <Flex vertical gap="large">
                <Text>{title}</Text>
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Skeleton.Input active size="large" style={{ width: '150px', height: '32px' }} />
                    </div>
                ) : (
                    <Typography.Title level={2} style={{ margin: 0 }}>
                        <CountUp end={value} separator="," />
                    </Typography.Title>
                )}
            </Flex>
        </Card>
    );
};

/* ---------- MAIN ---------- */

const AdminDashboard = () => {
    const [last7DaysAppointments, setLast7DaysAppointments] = useState<any[]>([]);
    const [statusStats, setStatusStats] = useState<any[]>([]);
    const [revenueLast7Days, setRevenueLast7Days] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [totalAppointments, setTotalAppointments] = useState<number>(0);
    const [topMedicines, setTopMedicines] = useState<any[]>([]);
    const [topServices, setTopServices] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);

                const data = await getDashboardStats();

                setLast7DaysAppointments(data.appointmentsLast7Days);
                setStatusStats(data.appointmentStatusStats);
                setTotalAppointments(data.totalAppointments);
                setTopMedicines(data.topMedicines || []);
                setTopServices(data.topServices || []);

                const sum = data.revenueLast7Days.reduce(
                    (acc: number, cur: any) => acc + (cur.totalRevenue || 0),
                    0
                );

                setRevenueLast7Days(sum);
                setTotalRevenue(data.totalRevenue);

            } catch (err) {
                console.error(err);
                message.error("Không thể tải dữ liệu thống kê");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    /* ---------- BAR CHART (GIỮ NGUYÊN) ---------- */

    const barLabels = last7DaysAppointments.map(item => item._id);
    const barValues = last7DaysAppointments.map(item => item.count);

    const barChartData = {
        labels: barLabels.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        }),
        datasets: [
            {
                label: "Số lịch hẹn",
                data: barValues,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            }
        ],
    };

    const barChartOptions: any = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Lịch hẹn trong 7 ngày gần nhất" },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    /* ---------- PIE CHART (GIỮ NGUYÊN) ---------- */

    const pieLabels = statusStats.map(item => item._id);
    const pieValues = statusStats.map(item => item.count);

    const statusColorMap: Record<string, string> = {
        waiting_assigned: "rgba(153, 102, 255, 0.6)",
        pending: "rgba(255, 206, 86, 0.6)",
        confirmed: "rgba(54, 162, 235, 0.6)",
        cancelled: "rgba(255, 99, 132, 0.6)",
        completed: "rgba(75, 192, 192, 0.6)",
    };

    const pieChartData = {
        labels: pieLabels.map(label => {
            switch (label) {
                case "waiting_assigned": return "Chờ phân công";
                case "pending": return "Chờ xác nhận";
                case "confirmed": return "Đã xác nhận";
                case "completed": return "Hoàn thành";
                case "cancelled": return "Đã hủy";
                default: return label;
            }
        }),
        datasets: [
            {
                data: pieValues,
                backgroundColor: pieLabels.map(label => statusColorMap[label]),
                borderWidth: 1
            }
        ],
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
    };

    /* ---------- RENDER (GIỮ NGUYÊN) ---------- */

    return (
        <div className="p-6">
            <h1 className="font-bold text-2xl mb-4">Thống kê hệ thống</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <StatCard
                    title="Tổng số lịch hẹn 7 ngày"
                    value={barValues.reduce((a, b) => a + b, 0)}
                    loading={loading}
                />
                <StatCard
                    title="Tổng số lịch hẹn trong hệ thống"
                    value={totalAppointments}
                    loading={loading}
                />
                <StatCard
                    title="Doanh thu 7 ngày gần nhất (VND)"
                    value={revenueLast7Days}
                    loading={loading}
                />
                <StatCard
                    title="Tổng doanh thu (VND)"
                    value={totalRevenue}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <Card title="Biểu đồ lịch hẹn 7 ngày" variant="outlined">
                    {loading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <Spin size="large" tip="Đang tải dữ liệu biểu đồ..." />
                        </div>
                    ) : (
                        <Bar data={barChartData} options={barChartOptions} />
                    )}
                </Card>

                <Card title="Biểu đồ trạng thái lịch hẹn" variant="outlined" className="h-full">
                    <div className="h-[300px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Spin size="large" tip="Đang tải dữ liệu biểu đồ..." />
                            </div>
                        ) : (
                            <Pie data={pieChartData} options={pieChartOptions} />
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <Card title="Top 10 Thuốc Bán Chạy" variant="outlined">
                    {loading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <Spin size="large" tip="Đang tải dữ liệu..." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">#</th>
                                        <th className="text-left p-2">Tên thuốc</th>
                                        <th className="text-right p-2">Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topMedicines.map((med, idx) => (
                                        <tr key={med._id} className="border-b">
                                            <td className="p-2">{idx + 1}</td>
                                            <td className="p-2">{med.name}</td>
                                            <td className="text-right p-2">{med.totalQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card title="Top 10 Dịch Vụ Phổ Biến" variant="outlined">
                    {loading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <Spin size="large" tip="Đang tải dữ liệu..." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">#</th>
                                        <th className="text-left p-2">Tên dịch vụ</th>
                                        <th className="text-right p-2">Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topServices.map((svc, idx) => (
                                        <tr key={svc._id} className="border-b">
                                            <td className="p-2">{idx + 1}</td>
                                            <td className="p-2">{svc.name}</td>
                                            <td className="text-right p-2">{svc.totalQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
