import { Button, Dropdown } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { MenuProps } from "antd";

const LANGUAGES = [
  { key: "fr", label: "Français" },
  { key: "ar", label: "العربية" },
  { key: "en", label: "English" },
];

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();

  const langItems: MenuProps["items"] = LANGUAGES.map((l) => ({
    key: l.key,
    label: l.label,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D2145",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            color: "#D9AE40",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          FNSM
        </div>
        <Dropdown
          menu={{
            items: langItems,
            onClick: ({ key }) => void i18n.changeLanguage(key),
          }}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<GlobalOutlined />}
            style={{ color: "#fff" }}
          />
        </Dropdown>
      </div>

      {/* Content */}
      <div style={{ width: "100%", maxWidth: 480, padding: "0 16px", flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
