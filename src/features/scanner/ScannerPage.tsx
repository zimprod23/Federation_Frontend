import { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Avatar,
  Divider,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ScanOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verificationApi } from "@/api/verification";
import { VerificationResponseDTO } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { toProxyUrl } from "@/utils/image";

const { Title, Text } = Typography;

const RESULT_CONFIG = {
  valid: {
    color: "#52c41a",
    bg: "#f6ffed",
    border: "#b7eb8f",
    icon: <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
  },
  suspended: {
    color: "#ff4d4f",
    bg: "#fff2f0",
    border: "#ffccc7",
    icon: <CloseCircleOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />,
  },
  expired: {
    color: "#faad14",
    bg: "#fffbe6",
    border: "#ffe58f",
    icon: <WarningOutlined style={{ fontSize: 48, color: "#faad14" }} />,
  },
  not_found: {
    color: "#8c8c8c",
    bg: "#fafafa",
    border: "#d9d9d9",
    icon: <CloseCircleOutlined style={{ fontSize: 48, color: "#8c8c8c" }} />,
  },
};

export default function ScannerPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerificationResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const scanMutation = useMutation({
    mutationFn: (token: string) =>
      verificationApi.logScan(token, "Scanner App"),
    onSuccess: (data) => {
      setResult(data);
      setScanning(false);
      stopScanner();
    },
    onError: (err: Error) => {
      setError(err.message);
      setScanning(false);
      stopScanner();
    },
  });

  const stopScanner = () => {
    if (scannerRef.current) {
      void scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  const startScanner = () => {
    setResult(null);
    setError(null);
    setScanning(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false,
      );

      scanner.render(
        (decodedText) => {
          scanMutation.mutate(decodedText);
        },
        () => {
          // scan error — ignore
        },
      );

      scannerRef.current = scanner;
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanner();
  }, []);

  const config = result ? RESULT_CONFIG[result.result] : null;

  return (
    <div
      style={{
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          {t("scanner.title")}
        </Title>
        {user && (
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            {user.email}
          </Text>
        )}
      </div>

      {/* Scanner area */}
      {scanning && (
        <Card
          style={{ borderRadius: 12, overflow: "hidden" }}
          bodyStyle={{ padding: 0 }}
        >
          <div id="qr-reader" style={{ width: "100%" }} />
          <div style={{ padding: "12px 16px", textAlign: "center" }}>
            <Button
              danger
              onClick={() => {
                stopScanner();
                setScanning(false);
              }}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && !scanning && (
        <Alert
          type="error"
          message={t("common.error")}
          description={error}
          style={{ borderRadius: 12 }}
        />
      )}

      {/* Result card */}
      {result && config && !scanning && (
        <Card
          style={{
            borderRadius: 12,
            border: `2px solid ${config.border}`,
            background: config.bg,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            {config.icon}
            <div style={{ marginTop: 8 }}>
              <Tag
                color={result.result === "valid" ? "success" : "error"}
                style={{ fontSize: 16, padding: "4px 16px" }}
              >
                {t(`scanner.${result.result}`)}
              </Tag>
            </div>
          </div>

          {result.member && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Space style={{ width: "100%" }} direction="vertical" size={12}>
                <Space align="center">
                  <Avatar
                    src={toProxyUrl(result.member.photoUrl)}
                    icon={<UserOutlined />}
                    size={56}
                    style={{ background: "#0D2145", flexShrink: 0 }}
                  />
                  <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: 18 }}>
                      {result.member.fullName}
                    </Text>
                    <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
                      {result.member.licenseNumber}
                    </Tag>
                  </Space>
                </Space>

                <Space wrap>
                  <Tag color="blue">
                    {t(`members.${result.member.category}`)}
                  </Tag>
                  <Tag>{t(`members.${result.member.gender}`)}</Tag>
                  <Tag
                    color={result.member.status === "active" ? "green" : "red"}
                  >
                    {t(`members.${result.member.status}`)}
                  </Tag>
                  <Tag>
                    {t("common.season")} {result.member.season}
                  </Tag>
                </Space>
              </Space>
            </>
          )}
        </Card>
      )}

      {/* Scan button */}
      {!scanning && (
        <Button
          type="primary"
          size="large"
          icon={result ? <ReloadOutlined /> : <ScanOutlined />}
          onClick={startScanner}
          loading={scanMutation.isPending}
          style={{
            background: "#D9AE40",
            borderColor: "#D9AE40",
            color: "#0D2145",
            height: 56,
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 12,
          }}
        >
          {result ? t("scanner.scanAgain") : t("scanner.scan")}
        </Button>
      )}
    </div>
  );
}
