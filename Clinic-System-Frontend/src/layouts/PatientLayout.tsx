import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Layout, Menu, Avatar, Button, Grid } from "antd";
import { CgProfile } from "react-icons/cg";
import { ImProfile } from "react-icons/im";
import { FaHome, FaFileMedical } from "react-icons/fa";
import { FaListCheck, FaRegCalendarPlus, FaRobot } from "react-icons/fa6";
import { MdOutlineReceiptLong, MdLogout } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import logo from '../assets/logo.svg';
import logoOnly from '../assets/logoOnly.svg';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

/* ================= ICON FIX ================= */
const IconBox = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      width: 24,
      height: 24,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </span>
);

const PatientLayout = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  /* ================= COLLAPSE STATE ================= */
  const [collapsed, setCollapsed] = useState(false);

  // Mobile: luôn collapsed
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  /* ================= MENU ITEMS ================= */
  const menuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <IconBox><CgProfile size={20} /></IconBox>,
        label: collapsed ? null : "Thông tin cá nhân",
        title: "Thông tin cá nhân",
        onClick: () => navigate("/patient"),
      },
      {
        key: "health-profile",
        icon: <IconBox><ImProfile size={20} /></IconBox>,
        label: collapsed ? null : "Hồ sơ sức khỏe",
        title: "Hồ sơ sức khỏe",
        onClick: () => navigate("/patient/health-profile"),
      },
      {
        key: "appointments",
        icon: <IconBox><FaRegCalendarPlus size={20} /></IconBox>,
        label: collapsed ? null : "Xem lịch hẹn",
        title: "Xem lịch hẹn",
        onClick: () => navigate("/patient/appointments"),
      },
      {
        key: "appointments-specialty",
        icon: <IconBox><FaListCheck size={20} /></IconBox>,
        label: collapsed ? null : "Đặt lịch chuyên khoa",
        title: "Đặt lịch chuyên khoa",
        onClick: () => navigate("/patient/appointments-specialty"),
      },
      {
        key: "appointments-doctor",
        icon: <IconBox><FaListCheck size={20} /></IconBox>,
        label: collapsed ? null : "Đặt lịch theo bác sĩ",
        title: "Đặt lịch theo bác sĩ",
        onClick: () => navigate("/patient/appointments-doctor"),
      },
      {
        key: "medical-records",
        icon: <IconBox><FaFileMedical size={20} /></IconBox>,
        label: collapsed ? null : "Lịch sử khám",
        title: "Lịch sử khám",
        onClick: () => navigate("/patient/medical-records"),
      },
      {
        key: "chatbot",
        icon: <IconBox><FaRobot size={20} /></IconBox>,
        label: collapsed ? null : "Chatbot tư vấn",
        title: "Chatbot tư vấn",
        onClick: () => navigate("/patient/chatbot"),
      },
    ],
    [navigate, collapsed]
  );

  // Find the longest matching key to handle nested routes like appointments-specialty
  const selectedKey =
    menuItems
      .filter((i) => location.pathname.includes(i.key))
      .sort((a, b) => b.key.length - a.key.length)[0]?.key || "profile";

  return (
    <Layout className="fixed inset-0">
      {/* ================= SIDER ================= */}
      <Sider
        collapsible={!isMobile}
        collapsed={collapsed}
        trigger={null}
        width={260}
        collapsedWidth={80}
        className="!bg-slate-800"
      >
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <div className="h-[76px] flex items-center justify-center px-4 overflow-hidden">
              <Link to="/" className="filter brightness-0 invert">
                <img src={collapsed ? logoOnly : logo} alt="logo" />
              </Link>
            </div>

            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              className={`!bg-slate-800 !text-base flex flex-col items-center justify-center gap-4 ${collapsed
                ? "[&_.ant-menu-item]:!flex [&_.ant-menu-item]:!justify-center [&_.ant-menu-item]:!items-center [&_.ant-menu-item]:!px-0 [&_.ant-menu-item-icon]:!mr-0"
                : ""
                }`}
            />
          </div>

          <div className="border-t border-slate-700 p-4">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <Avatar
                size={40}
                className="!bg-blue-100 !text-blue-600 font-bold shrink-0 border border-blue-200"
              >
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-white truncate text-sm">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[11px] text-gray-300 truncate">
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
      </Sider>

      {/* ================= MAIN ================= */}
      <Layout>
        <Header className="px-4 flex items-center gap-2 !bg-slate-800 text-white">
          {!isMobile && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((v) => !v)}
              className="!text-white"
            />
          )}

          <Button
            type="text"
            icon={<FaHome />}
            onClick={() => navigate("/")}
            className="!text-white"
          />
        </Header>

        <Content className="p-4 bg-[#f5f5f5] flex-grow overflow-y-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientLayout;