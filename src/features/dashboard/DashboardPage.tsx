import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  message,
  Button,
  Modal,
  Select,
  Alert,
  Space,
} from "antd";
import {
  TeamOutlined,
  BankOutlined,
  TrophyOutlined,
  SettingOutlined,
  WarningOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { statsApi } from "@/api/stats";
import { membersApi } from "@/api/members";
import { useState, useMemo, useRef } from "react";
import { getErrorMessage } from "@/utils/error";
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
import { client } from "@/api";

const { Title, Text } = Typography;

// ── UI Configuration ─────────────────────────────────────────────────────────
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
};
const GENDER_COLORS: Record<string, string> = {
  male: "#003f8a",
  female: "#D9AE40",
  other: "#bfbfbf",
};

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
};
const GENDER_LABELS: Record<string, string> = {
  male: "Masculin",
  female: "Féminin",
  other: "Autre",
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (!percent || Number(percent) < 0.05) return null;
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
      fontSize={12}
      fontWeight={700}
    >
      {`${(Number(percent) * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Reusable UI Components ──────────────────────────────────────────────────
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
      bordered={false}
      style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
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
            width: 48,
            height: 48,
            borderRadius: 10,
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
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        height: "100%",
      }}
      title={
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontSize: 15, color: "#0D2145", fontWeight: 600 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 400 }}>
              {subtitle}
            </div>
          )}
        </div>
      }
    >
      {children}
    </Card>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<
    string | "all" | undefined
  >();

  // ── Queries ──
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: statsApi.dashboard,
  });

  const { data: memberResults, isFetching: searchingMembers } = useQuery({
    queryKey: ["members", "search", memberSearch],
    queryFn: () =>
      membersApi.list({ search: memberSearch, limit: 10, status: "active" }),
    enabled: memberSearch.length >= 2,
  });

  // ── Mutations ──
  const adjustMutation = useMutation({
    mutationFn: (id: string | "all") =>
      membersApi.adjustLicenses(id === "all" ? undefined : id),
    onSuccess: (data) => {
      messageApi.success(`${data.adjustedCount || 0} licences synchronisées`);
      setIsAdjustModalOpen(false);
      setSelectedMemberId(undefined);
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err) => messageApi.error(getErrorMessage(err)),
  });

  // ── Database Operations ──
  //  const handleExport = () => {
  //   membersApi.exportDatabase();
  //   messageApi.success("Préparation du téléchargement...");
  // };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Modal.confirm({
      title: "Remplacer la base de données ?",
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      content:
        "Attention : cette action écrasera toutes les données actuelles. L'application redémarrera après l'import.",
      okText: "Confirmer l'import",
      okType: "danger",
      onOk: async () => {
        try {
          const formData = new FormData();
          formData.append("database", file);
          await membersApi.importDatabase(formData);
          messageApi.success("Import réussi ! Redémarrage...");
          setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
          messageApi.error("Erreur lors de l'importation");
        }
      },
    });
    e.target.value = ""; // Reset input
  };

  // ── Chart Logic ──
  const chartData = useMemo(() => {
    if (!stats) return null;
    return {
      status: stats.membersByStatus.map((d) => ({
        name: STATUS_LABELS[d.status] || d.status,
        value: d.count,
        color: STATUS_COLORS[d.status] || "#aaa",
      })),
      category: stats.membersByCategory.map((d) => ({
        name: CATEGORY_LABELS[d.category] || d.category,
        value: d.count,
        color: CATEGORY_COLORS[d.category] || "#aaa",
      })),
      gender: stats.membersByGender.map((d) => ({
        name: GENDER_LABELS[d.gender] || d.gender,
        value: d.count,
        color: GENDER_COLORS[d.gender] || "#aaa",
      })),
    };
  }, [stats]);

  if (isLoading || !stats)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div>
      {contextHolder}

      {/* ── HEADER WITH ACTIONS ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Tableau de Bord
        </Title>

        <Space size="middle">
          {/* <Button icon={<DownloadOutlined />} onClick={handleExportDB}>
            Sauvegarder (Export)
          </Button> */}

          {/* <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            Restaurer (Import)
          </Button> */}
          {/* Hidden file input triggered by the button above */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".sqlite"
            onChange={handleImportDB}
          />

          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsAdjustModalOpen(true)}
            type="primary"
          >
            Ajuster Licences
          </Button>
        </Space>
      </div>

      {/* ── TOTALS ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Membres"
            value={stats.totals.members}
            iconBg="#E6F0FF"
            icon={<TeamOutlined style={{ fontSize: 22, color: "#003f8a" }} />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Clubs actifs"
            value={stats.totals.activeClubs}
            iconBg="#FFF8E6"
            icon={<BankOutlined style={{ fontSize: 22, color: "#D9AE40" }} />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Compétitions"
            value={stats.totals.openCompetitions}
            iconBg="#F0FFF0"
            icon={<TrophyOutlined style={{ fontSize: 22, color: "#52c41a" }} />}
          />
        </Col>
      </Row>

      {/* ── ANALYTICS ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <ChartCard title="Répartition Statut">
            <div style={{ height: 260, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData?.status}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {chartData?.status.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: "absolute",
                  top: "42%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{ fontSize: 22, fontWeight: 700, color: "#0D2145" }}
                >
                  {stats.totals.members}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  Total
                </div>
              </div>
            </div>
          </ChartCard>
        </Col>

        <Col xs={24} lg={8}>
          <ChartCard title="Répartition Catégorie">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData?.category}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={40}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData?.category.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>

        <Col xs={24} lg={8}>
          <ChartCard title="Répartition Genre">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData?.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {chartData?.gender.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>

      {/* ── LICENSE ADJUSTMENT MODAL ── */}
      <Modal
        title="Mise à jour des licences"
        open={isAdjustModalOpen}
        onCancel={() => {
          setIsAdjustModalOpen(false);
          setSelectedMemberId(undefined);
        }}
        onOk={() => selectedMemberId && adjustMutation.mutate(selectedMemberId)}
        confirmLoading={adjustMutation.isPending}
        okButtonProps={{
          disabled: !selectedMemberId,
          danger: selectedMemberId === "all",
        }}
        okText={selectedMemberId === "all" ? "Lancer Globale" : "Confirmer"}
        centered
        destroyOnClose
      >
        <div style={{ marginBottom: 20 }}>
          {selectedMemberId === "all" ? (
            <Alert
              message="Action Globale"
              description="Synchronisation de toute la base. Cette opération peut impacter les statistiques actuelles."
              type="warning"
              showIcon
            />
          ) : (
            <Text type="secondary">
              Sélectionnez un membre spécifique ou l'option globale.
            </Text>
          )}
        </div>

        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Choisir un membre ou 'Tous'..."
          filterOption={false}
          onSearch={setMemberSearch}
          onChange={setSelectedMemberId}
          allowClear
          size="large"
        >
          <Select.Option
            key="all"
            value="all"
            style={{ fontWeight: 600, color: "#d48806" }}
          >
            <TeamOutlined /> Tous les membres (Global)
          </Select.Option>

          {memberResults?.items.map((m: any) => (
            <Select.Option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}{" "}
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({m.licenseNumber})
              </Text>
            </Select.Option>
          ))}

          {searchingMembers && (
            <Select.Option disabled key="loading">
              <Spin size="small" /> Recherche...
            </Select.Option>
          )}
        </Select>
      </Modal>
    </div>
  );
}
