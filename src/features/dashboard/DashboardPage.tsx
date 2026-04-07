import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  TeamOutlined,
  BankOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { membersApi } from "@/api/members";
import { clubsApi } from "@/api/clubs";
import { competitionsApi } from "@/api/competitions";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { t } = useTranslation();

  const { data: members } = useQuery({
    queryKey: ["members", "dashboard"],
    queryFn: () => membersApi.list({ limit: 1 }),
  });

  const { data: clubs } = useQuery({
    queryKey: ["clubs", "dashboard"],
    queryFn: () => clubsApi.list({ limit: 1 }),
  });

  const { data: competitions } = useQuery({
    queryKey: ["competitions", "dashboard"],
    queryFn: () => competitionsApi.list({ limit: 1, status: "open" }),
  });

  const stats = [
    {
      title: t("nav.members"),
      value: members?.total ?? 0,
      icon: <TeamOutlined style={{ fontSize: 28, color: "#0D2145" }} />,
      color: "#E6F0FF",
    },
    {
      title: t("nav.clubs"),
      value: clubs?.total ?? 0,
      icon: <BankOutlined style={{ fontSize: 28, color: "#D9AE40" }} />,
      color: "#FFF8E6",
    },
    {
      title: t("competitions.open"),
      value: competitions?.total ?? 0,
      icon: <TrophyOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
      color: "#F0FFF0",
    },
    {
      title: t("nav.cards"),
      value: "—",
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 28, color: "#C7262E" }} />
      ),
      color: "#FFF0F0",
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        {t("nav.dashboard")}
      </Title>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Statistic
                  title={
                    <Text style={{ fontSize: 13, color: "#666" }}>
                      {stat.title}
                    </Text>
                  }
                  value={stat.value}
                  valueStyle={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0D2145",
                  }}
                />
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: stat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
