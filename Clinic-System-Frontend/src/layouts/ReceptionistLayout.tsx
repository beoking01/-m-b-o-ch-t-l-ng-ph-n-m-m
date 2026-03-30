import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { CgProfile } from "react-icons/cg";
import { Button, Layout, Menu, Avatar } from "antd";
import {
    MdLogout,
} from "react-icons/md";
import { useState } from "react";
import { FaListCheck } from "react-icons/fa6";
import { FaMoneyBill } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import logo from '../assets/logo.svg';
import logoOnly from '../assets/logoOnly.svg';

const { Header, Sider, Content } = Layout;


const ReceptionistLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const location = useLocation();

    const menuItems = [
        {
            key: "profile",
            icon: <CgProfile size={20} />,
            label: "Thông tin cá nhân",
            onClick: () => navigate("/receptionist"),
        },
        {
            key: "assignments",
            icon: <FaListCheck size={20} />,
            label: "Gán bác sĩ",
            onClick: () => navigate("/receptionist/assignments"),
        },
        {
            key: "appointments",
            icon: <FaListCheck size={20} />,
            label: "Quản lý lịch hẹn",
            onClick: () => navigate("/receptionist/appointments"),
        },
        {
            key: "invoices",
            icon: <FaMoneyBill size={20} />,
            label: "Quản lý hoá đơn",
            onClick: () => navigate("/receptionist/invoices"),
        },
    ];

    const pathname = location.pathname || "";
    let selectedKey = "profile";
    if (pathname.startsWith("/receptionist/treatments")) selectedKey = "treatments";
    else if (pathname.startsWith("/receptionist/invoices")) selectedKey = "invoices";
    else if (pathname.startsWith("/receptionist/appointments")) selectedKey = "appointments";
    else if (pathname.startsWith("/receptionist/assignments")) selectedKey = "assignments";
    else if (pathname === "/receptionist" || pathname === "/receptionist/") selectedKey = "profile";


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

export default ReceptionistLayout;