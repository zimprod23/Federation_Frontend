import { Form, Input, Button, Card, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { LoginDTO } from "@/types";

const { Title, Text } = Typography;

const LANGUAGES = [
  { key: "fr", label: "FR" },
  { key: "ar", label: "ع" },
  { key: "en", label: "EN" },
];

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form] = Form.useForm<LoginDTO>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      // Redirect based on role
      if (data.user.role === "scanner") {
        navigate("/scanner");
      } else {
        navigate("/dashboard");
      }
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0D2145 0%, #173368 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo + title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#D9AE40",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
              fontWeight: 700,
              color: "#0D2145",
            }}
          >
            F
          </div>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            {t("auth.federation")}
          </Title>
        </div>

        {/* Language switcher */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Space>
            {LANGUAGES.map((l) => (
              <Button
                key={l.key}
                type={i18n.language === l.key ? "primary" : "text"}
                size="small"
                onClick={() => void i18n.changeLanguage(l.key)}
                style={{
                  color: i18n.language === l.key ? "#0D2145" : "#fff",
                  background:
                    i18n.language === l.key ? "#D9AE40" : "transparent",
                  borderColor: "#D9AE40",
                }}
              >
                {l.label}
              </Button>
            ))}
          </Space>
        </div>

        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>
            {t("auth.login")}
          </Title>

          {error && (
            <Alert
              message={t("common.error")}
              description={(error as Error).message}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => mutate(values)}
            size="large"
          >
            <Form.Item
              name="email"
              label={t("auth.email")}
              rules={[
                { required: true, message: t("auth.email") },
                { type: "email" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="admin@federation.ma"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("auth.password")}
              rules={[{ required: true, message: t("auth.password") }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isPending}
                style={{
                  background: "#0D2145",
                  borderColor: "#0D2145",
                  height: 44,
                  fontWeight: 600,
                }}
              >
                {t("auth.loginButton")}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
