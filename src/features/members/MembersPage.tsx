import { useCallback, useState } from "react";
import { toProxyUrl } from "@/utils/image";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Avatar,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { membersApi } from "@/api/members";
import { MemberResponseDTO, MemberStatus } from "@/types";
import { useAuthStore } from "@/store/authStore";
import CreateMemberModal from "./components/CreateMemberModal";
import { getErrorMessage } from "@/utils/error";

const { Title } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<MemberStatus, string> = {
  active: "green",
  pending: "orange",
  suspended: "red",
  expired: "default",
};

const CATEGORY_COLORS = {
  junior: "blue",
  u23: "purple",
  senior: "gold",
};

export default function MembersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [showCreate, setShowCreate] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["members", page, debouncedSearch, status, category],
    queryFn: () =>
      membersApi.list({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status: status as MemberStatus | undefined,
        category: category || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      void messageApi.success(t("common.success"));
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const isAdmin =
    user?.role === "super_admin" || user?.role === "federation_admin";

  const columns = [
    {
      title: t("members.photo"),
      key: "photo",
      width: 60,
      render: (_: unknown, record: MemberResponseDTO) =>
        record.photoUrl ? (
          <Avatar src={toProxyUrl(record.photoUrl)} size={40} />
        ) : (
          <Avatar
            icon={<UserOutlined />}
            size={40}
            style={{ background: "#0D2145" }}
          />
        ),
    },
    {
      title: t("members.license"),
      dataIndex: "licenseNumber",
      key: "licenseNumber",
      render: (v: string) => (
        <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
          {v}
        </Tag>
      ),
    },
    {
      title: t("common.name"),
      key: "fullName",
      render: (_: unknown, r: MemberResponseDTO) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{r.fullName}</span>
          <span style={{ fontSize: 12, color: "#888" }}>{r.email}</span>
        </Space>
      ),
    },
    {
      title: t("members.category"),
      key: "category",
      render: (_: unknown, r: MemberResponseDTO) => (
        <Space>
          <Tag
            color={CATEGORY_COLORS[r.category as keyof typeof CATEGORY_COLORS]}
          >
            {t(`members.${r.category}`)}
          </Tag>
          <Tag>
            {r.gender === "male" ? t("members.male") : t("members.female")}
          </Tag>
        </Space>
      ),
    },
    {
      title: t("members.status"),
      key: "status",
      render: (_: unknown, r: MemberResponseDTO) => (
        <Tag color={STATUS_COLORS[r.status]}>{t(`members.${r.status}`)}</Tag>
      ),
    },
    {
      title: t("common.season"),
      dataIndex: "season",
      key: "season",
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 120,
      render: (_: unknown, r: MemberResponseDTO) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Tooltip title={t("common.edit")}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/members/${r.id}`)}
            />
          </Tooltip>
          <Tooltip title={t("members.card")}>
            <Button
              type="text"
              icon={<IdcardOutlined />}
              onClick={() => navigate(`/members/${r.id}?tab=card`)}
            />
          </Tooltip>
          {user?.role === "super_admin" && (
            <Popconfirm
              title={t("common.confirm")}
              onConfirm={() => deleteMutation.mutate(r.id)}
              okText={t("common.yes")}
              cancelText={t("common.no")}
            >
              <Tooltip title={t("common.delete")}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {t("members.title")}
            </Title>
          </Col>
          {isAdmin && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreate(true)}
                style={{ background: "#0D2145" }}
              >
                {t("members.create")}
              </Button>
            </Col>
          )}
        </Row>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={10}>
            <Input
              placeholder={t("common.search")}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              onClear={() => {
                setSearch("");
                setDebouncedSearch("");
                setPage(1);
              }}
            />
          </Col>
          <Col xs={12} sm={7}>
            <Select
              placeholder={t("members.status")}
              style={{ width: "100%" }}
              allowClear
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <Option value="active">{t("members.active")}</Option>
              <Option value="pending">{t("members.pending")}</Option>
              <Option value="suspended">{t("members.suspended")}</Option>
              <Option value="expired">{t("members.expired")}</Option>
            </Select>
          </Col>
          <Col xs={12} sm={7}>
            <Select
              placeholder={t("members.category")}
              style={{ width: "100%" }}
              allowClear
              value={category}
              onChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <Option value="junior">{t("members.junior")}</Option>
              <Option value="u23">{t("members.u23")}</Option>
              <Option value="senior">{t("members.senior")}</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={data?.items ?? []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.total ?? 0,
            onChange: setPage,
            showTotal: (total) => `${t("common.total")}: ${total}`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/members/${record.id}`),
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 800 }}
        />
      </Card>

      <CreateMemberModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false);
          void queryClient.invalidateQueries({ queryKey: ["members"] });
        }}
      />
    </>
  );
}
