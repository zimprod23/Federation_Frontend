import { Card, Row, Col, Statistic, Typography, Spin } from "antd";
import { TeamOutlined, BankOutlined, TrophyOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { statsApi } from "@/api/stats";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";

const { Title, Text } = Typography;

// ── Palette ───────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  active: "#52c41a",
  pending: "#faad14",
  suspended: "#ff4d4f",
  expired: "#bfbfbf",
};

const CATEGORY_COLORS: Record<string, string> = {
  junior: "#0077c8",
  u23: "#003f8a",
  senior: "#00a3e0",
  u15: "#f68f3c",
};

const GENDER_COLORS: Record<string, string> = {
  male: "#003f8a",
  female: "#D9AE40",
  other: "#bfbfbf",
};

// ── Label helpers ─────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  active: "Actifs",
  pending: "En attente",
  suspended: "Suspendus",
  expired: "Expirés",
};

const CATEGORY_LABELS: Record<string, string> = {
  junior: "Junior",
  u23: "U23",
  senior: "Senior",
  u15: "U15",
};

const GENDER_LABELS: Record<string, string> = {
  male: "Masculin",
  female: "Féminin",
  other: "Autre",
};

// ── Custom donut label ────────────────────────────────────────────────────────
const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined ||
    percent === undefined ||
    Number(percent) < 0.05
  )
    return null;

  const RADIAN = Math.PI / 180;
  const radius =
    Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.6;
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
    >
      {`${(Number(percent) * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  iconBg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
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
          title={<Text style={{ fontSize: 13, color: "#666" }}>{title}</Text>}
          value={value}
          valueStyle={{ fontSize: 28, fontWeight: 700, color: "#0D2145" }}
        />
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Chart card wrapper ────────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      style={{
        borderRadius: 12,
        border: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        height: "100%",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 15, color: "#0D2145" }}>
          {title}
        </Text>
        {subtitle && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {subtitle}
            </Text>
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: statsApi.dashboard,
    staleTime: 60_000,
  });

  if (isLoading || !stats) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  // ── Prepare chart data ─────────────────────────────────────────────────────
  const statusData = stats.membersByStatus.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? "#aaa",
  }));

  const categoryData = stats.membersByCategory.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    value: d.count,
    color: CATEGORY_COLORS[d.category] ?? "#aaa",
  }));

  const genderData = stats.membersByGender.map((d) => ({
    name: GENDER_LABELS[d.gender] ?? d.gender,
    value: d.count,
    color: GENDER_COLORS[d.gender] ?? "#aaa",
  }));

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        {t("nav.dashboard")}
      </Title>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title={t("nav.members")}
            value={stats.totals.members}
            iconBg="#E6F0FF"
            icon={<TeamOutlined style={{ fontSize: 24, color: "#0D2145" }} />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Clubs actifs"
            value={stats.totals.activeClubs}
            iconBg="#FFF8E6"
            icon={<BankOutlined style={{ fontSize: 24, color: "#D9AE40" }} />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Compétitions ouvertes"
            value={stats.totals.openCompetitions}
            iconBg="#F0FFF0"
            icon={<TrophyOutlined style={{ fontSize: 24, color: "#52c41a" }} />}
          />
        </Col>
      </Row>

      {/* ── Charts ──────────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        {/* 1 — Member status donut */}
        <Col xs={24} lg={8}>
          <ChartCard
            title="Statut des membres"
            subtitle="Répartition par statut d'adhésion"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // formatter={(value: unknown, name: unknown) => [value, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: "#555" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total center overlay */}
            <div
              style={{
                textAlign: "center",
                marginTop: -240,
                paddingTop: 90,
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0D2145" }}>
                {stats.totals.members}
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>Total</div>
            </div>
            <div style={{ height: 148 }} />
          </ChartCard>
        </Col>

        {/* 2 — Category bar */}
        <Col xs={24} lg={8}>
          <ChartCard title="Catégories d'âge" subtitle="Junior · U23 · Senior">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                barSize={48}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#aaa" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  // formatter={(value: unknown) => [value, "Membres"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Membres">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>

        {/* 3 — Gender donut */}
        <Col xs={24} lg={8}>
          <ChartCard
            title="Répartition par genre"
            subtitle="Masculin · Féminin"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // formatter={(value: unknown, name: unknown) => [value, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: "#555" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
}
