import { Form, Input, Button, Card, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/error";
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

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
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
        {/* Logo + federation name */}
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
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {t("auth.federation")}
          </Title>
        </div>

        {/* Language switcher */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Space>
            {LANGUAGES.map((l) => (
              <Button
                key={l.key}
                size="small"
                onClick={() => void i18n.changeLanguage(l.key)}
                style={{
                  color: i18n.language === l.key ? "#0D2145" : "#fff",
                  background:
                    i18n.language === l.key ? "#D9AE40" : "transparent",
                  borderColor: "#D9AE40",
                  fontWeight: i18n.language === l.key ? 700 : 400,
                  minWidth: 36,
                }}
              >
                {l.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* Login card */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>
            {t("auth.login")}
          </Title>

          {/* Error alert */}
          {isError && (
            <Alert
              message={t("common.error")}
              description={getErrorMessage(error)}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => mutate(values)}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label={t("auth.email")}
              rules={[
                { required: true, message: t("auth.email") },
                { type: "email", message: t("auth.email") },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bbb" }} />}
                placeholder="admin@federation.ma"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("auth.password")}
              rules={[{ required: true, message: t("auth.password") }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bbb" }} />}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
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
                  borderRadius: 8,
                }}
              >
                {t("auth.loginButton")}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            © {new Date().getFullYear()} FNSM
          </Text>
        </div>
      </div>
    </div>
  );
}
