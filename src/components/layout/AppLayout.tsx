import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  TrophyOutlined,
  LogoutOutlined,
  UserOutlined,
  GlobalOutlined,
  ScanOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import type { MenuProps } from "antd";
import FedLogo from "@/assets/fed-logo2.png";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const LANGUAGES = [
  { key: "fr", label: "Français" },
  { key: "ar", label: "العربية" },
  { key: "en", label: "English" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const isRtl = i18n.language === "ar";

  // ── Nav items based on role ───────────────────────────────────────────────
  const allItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: t("nav.dashboard"),
      roles: ["super_admin", "federation_admin", "club_manager"],
    },
    {
      key: "/members",
      icon: <TeamOutlined />,
      label: t("nav.members"),
      roles: ["super_admin", "federation_admin", "club_manager"],
    },
    {
      key: "/clubs",
      icon: <BankOutlined />,
      label: t("nav.clubs"),
      roles: ["super_admin", "federation_admin"],
    },
    {
      key: "/competitions",
      icon: <TrophyOutlined />,
      label: t("nav.competitions"),
      roles: ["super_admin", "federation_admin", "club_manager"],
    },
    // {
    //   key: "/scanner",
    //   icon: <ScanOutlined />,
    //   label: t("nav.scanner"),
    //   roles: ["super_admin", "federation_admin", "scanner"],
    // },
  ];

  const menuItems: MenuProps["items"] = allItems
    .filter((item) => user && item.roles.includes(user.role))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  // ── User dropdown ─────────────────────────────────────────────────────────
  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("auth.logout"),
      danger: true,
    },
  ];

  const handleUserMenu: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      clearAuth();
      navigate("/login");
    }
  };

  // ── Language switcher ─────────────────────────────────────────────────────
  const langItems: MenuProps["items"] = LANGUAGES.map((l) => ({
    key: l.key,
    label: l.label,
  }));

  const handleLang: MenuProps["onClick"] = ({ key }) => {
    void i18n.changeLanguage(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{
          background: "#0D2145",
          position: "fixed",
          height: "100vh",
          left: isRtl ? undefined : 0,
          right: isRtl ? 0 : undefined,
          zIndex: 100,
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "16px 8px" : "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              // background: "#D9AE40",
              // display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // fontWeight: 700,
              // color: "#0D2145",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            <img
              src={FedLogo}
              alt="F"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          {/* {!collapsed && (
            <Text
              style={{
                color: "#D9AE40",
                fontWeight: 700,
                fontSize: 13,
                lineHeight: 1.3,
              }}
            >
              FNSM
            </Text>
          )} */}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: "#0D2145", border: "none" }}
        />
      </Sider>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <Layout
        style={{
          marginLeft: isRtl ? 0 : collapsed ? 80 : 220,
          marginRight: isRtl ? (collapsed ? 80 : 220) : 0,
          transition: "all 0.2s",
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Collapse toggle */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          {/* Right side */}
          <Space size={16}>
            {/* Language switcher */}
            <Dropdown
              menu={{ items: langItems, onClick: handleLang }}
              placement="bottomRight"
            >
              <Button type="text" icon={<GlobalOutlined />}>
                {LANGUAGES.find((l) => l.key === i18n.language)?.label ?? "FR"}
              </Button>
            </Dropdown>

            {/* User menu */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenu }}
              placement="bottomRight"
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ background: "#0D2145" }}
                  icon={<UserOutlined />}
                />
                <Text style={{ fontSize: 13 }}>{user?.email}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Page content */}
        <Content
          style={{
            margin: "24px",
            minHeight: "calc(100vh - 64px - 48px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
