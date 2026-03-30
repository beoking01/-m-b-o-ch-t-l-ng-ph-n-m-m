import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { BsPersonVcard } from "react-icons/bs";
import { Button, Layout, Menu, Avatar } from "antd";
import {
    MdDashboard,
    MdPeople,
    MdLogout,
    MdPunchClock,
} from "react-icons/md";
import { useState } from "react";
import { FaClipboardList, FaFileInvoiceDollar } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { GiMedicines } from "react-icons/gi";
import logo from '../assets/logo.svg';
import logoOnly from '../assets/logoOnly.svg';

const { Header, Sider, Content } = Layout;


const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const location = useLocation();

    const menuItems = [
        {
            key: "dashboard",
            icon: <MdDashboard size={20} />,
            label: "Thống kê",
            onClick: () => navigate("/admin/"),
        },
        {
            key: "users",
            icon: <MdPeople size={20} />,
            label: "Quản lý tài khoản",
            onClick: () => navigate("/admin/users"),
        },
        {
            key: "roles",
            icon: <BsPersonVcard size={20} />,
            label: "Quản lý phân quyền",
            onClick: () => navigate("/admin/roles"),
        },
        {
            key: "doctor-schedule",
            icon: <MdPunchClock size={20} />,
            label: "Quản lý lịch trình",
            onClick: () => navigate("/admin/doctor-schedule"),
        },
        {
            key: "medicines",
            icon: <GiMedicines size={20} />,
            label: "Quản lý kho thuốc",
            onClick: () => navigate("/admin/medicines"),
        },
        {
            key: "services",
            icon: <FaClipboardList size={20} />,
            label: "Quản lý dịch vụ",
            onClick: () => navigate("/admin/services"),
        },
        {
            key: "invoices",
            icon: <FaFileInvoiceDollar size={20} />,
            label: "Quản lý hoá đơn",
            onClick: () => navigate("/admin/invoices"),
        },
        {
            key: "specialties",
            icon: <BsPersonVcard size={20} />,
            label: "Quản lý chuyên khoa",
            onClick: () => navigate("/admin/specialties"),
        },
    ];

    const pathname = location.pathname || "";
    let selectedKey = "dashboard";
    if (pathname.startsWith("/admin/medicines")) selectedKey = "medicines";
    else if (pathname.startsWith("/admin/users")) selectedKey = "users";
    else if (pathname.startsWith("/admin/doctor-schedule")) selectedKey = "doctor-schedule";
    else if (pathname.startsWith("/admin/services")) selectedKey = "services";
    else if (pathname.startsWith("/admin/invoices")) selectedKey = "invoices";
    else if (pathname.startsWith("/admin/roles")) selectedKey = "roles";
    else if(pathname.startsWith("/admin/specialties")) selectedKey = "specialties";
    else if (pathname === "/admin" || pathname === "/admin/") selectedKey = "dashboard";

    return (
        <Layout className="h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={300}
                className="!flex !flex-col !h-full"
            >
                <div className="flex h-screen flex-col justify-between border-e border-gray-100 bg-slate-800 text-white">
                    <div className="px-4 py-6">
                        <div className="text-white text-xl font-bold text-center pb-4 align-middle justify-center flex items-center">
                        <Link to="/" className="filter brightness-0 invert">{collapsed ? <img src={logoOnly} alt="logo" /> : <img src={logo} alt="logo" />}</Link>
                        </div>

                        <div className="!flex-1 !overflow-auto">
                            <Menu className="!bg-slate-800 !text-base flex flex-col items-center justify-center gap-4" theme="dark" mode="inline" items={menuItems} selectedKeys={[selectedKey]} />
                        </div>
                    </div>

                    <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
                    <div className="p-4 border-t border-gray-50">
                        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                            <Avatar 
                                size={40} 
                                className="!bg-blue-100 !text-blue-600 font-bold shrink-0 border border-blue-200"
                            >
                                {user?.email?.charAt(0).toUpperCase() || "A"}
                            </Avatar>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold text-white-700 truncate text-sm">
                                        {user?.email?.split('@')[0]}
                                    </span>
                                    <span className="text-[11px] text-white-500 truncate">
                                        {user?.email}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!collapsed && (
                            <Button
                                block
                                icon={<MdLogout />}
                                className="mt-4 flex items-center justify-center gap-2 rounded-lg border-gray-200 text-gray-600 hover:!text-red-500 hover:!border-red-200 transition-all"
                                onClick={() => {
                                    logout();
                                    navigate("/");
                                }}
                            >
                                Đăng xuất
                            </Button>
                        )}
                    </div>
                    </div>
                </div>
            </Sider>
            <Layout>
                <Header
                    className="px-4 flex items-center !bg-slate-800 text-white"

                >
                    <Button
                        type="text"
                        icon={
                            collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        className="!w-[48px] !h-[48px] !text-base !text-white"
                    />
                </Header>

                <Content className="p-4 bg-[#f5f5f5] flex-grow overflow-y-auto">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminLayout;