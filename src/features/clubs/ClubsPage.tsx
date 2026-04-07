import { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, BankOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { clubsApi } from "@/api/clubs";
import { ClubResponseDTO, ClubStatus, CreateClubDTO } from "@/types";

const { Title } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  pending: "orange",
  suspended: "red",
};

const DISCIPLINES = [
  "surfing",
  "paddling",
  "bodyboard",
  "kitesurfing",
  "windsurfing",
];

export default function ClubsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubResponseDTO | null>(
    null,
  );

  const [createForm] = Form.useForm<CreateClubDTO>();
  const [statusForm] = Form.useForm<{ status: ClubStatus }>();

  const { data, isLoading } = useQuery({
    queryKey: ["clubs", page],
    queryFn: () => clubsApi.list({ page, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: clubsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clubs"] });
      void messageApi.success(t("common.success"));
      setShowCreate(false);
      createForm.resetFields();
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      clubsApi.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clubs"] });
      void messageApi.success(t("common.success"));
      setShowStatus(false);
      setSelectedClub(null);
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  const openStatusModal = (club: ClubResponseDTO) => {
    setSelectedClub(club);
    statusForm.setFieldsValue({ status: club.status as ClubStatus });
    setShowStatus(true);
  };

  const columns = [
    {
      title: t("clubs.code"),
      key: "code",
      width: 120,
      render: (_: unknown, r: ClubResponseDTO) => (
        <Space direction="vertical" size={0}>
          <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
            {r.code}
          </Tag>
          <Tag style={{ fontSize: 10 }}>{r.clubShort}</Tag>
        </Space>
      ),
    },
    {
      title: t("common.name"),
      key: "name",
      render: (_: unknown, r: ClubResponseDTO) => (
        <Space>
          <BankOutlined style={{ color: "#D9AE40" }} />
          <span style={{ fontWeight: 600 }}>{r.name}</span>
        </Space>
      ),
    },
    {
      title: t("common.city"),
      key: "city",
      render: (_: unknown, r: ClubResponseDTO) => (
        <Space direction="vertical" size={0}>
          <span>{r.city}</span>
          <span style={{ fontSize: 12, color: "#888" }}>{r.region}</span>
        </Space>
      ),
    },
    {
      title: t("clubs.president"),
      key: "president",
      render: (_: unknown, r: ClubResponseDTO) => (
        <Space direction="vertical" size={0}>
          <span>{r.presidentName ?? "—"}</span>
          <span style={{ fontSize: 12, color: "#888" }}>
            {r.presidentEmail ?? ""}
          </span>
        </Space>
      ),
    },
    {
      title: t("common.status"),
      key: "status",
      render: (_: unknown, r: ClubResponseDTO) => (
        <Tag color={STATUS_COLORS[r.status]}>{t(`clubs.${r.status}`)}</Tag>
      ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 80,
      render: (_: unknown, r: ClubResponseDTO) => (
        <Tooltip title={t("common.edit")}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openStatusModal(r)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {t("clubs.title")}
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreate(true)}
            style={{ background: "#0D2145" }}
          >
            {t("clubs.create")}
          </Button>
        </Col>
      </Row>

      {/* Table */}
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
          scroll={{ x: 700 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        title={t("clubs.create")}
        onCancel={() => {
          setShowCreate(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        width={680}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={t("common.name")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="code"
                label={t("clubs.code")}
                rules={[{ required: true }]}
              >
                <Input style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="clubShort"
                label={t("clubs.clubShort")}
                rules={[{ required: true }]}
                extra="Used in license numbers e.g. PR → CNPR/PR001"
              >
                <Input style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="city"
                label={t("common.city")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="region"
                label={t("common.region")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="presidentName" label={t("clubs.president")}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="presidentEmail"
                label={t("common.email")}
                rules={[{ type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="presidentPhone" label={t("common.phone")}>
            <Input />
          </Form.Item>

          <Form.Item
            name="disciplines"
            label={t("clubs.disciplines")}
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder={t("clubs.disciplines")}>
              {DISCIPLINES.map((d) => (
                <Option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        open={showStatus}
        title={`${t("common.edit")} — ${selectedClub?.name}`}
        onCancel={() => {
          setShowStatus(false);
          setSelectedClub(null);
        }}
        onOk={() => statusForm.submit()}
        confirmLoading={statusMutation.isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={({ status }) => {
            if (selectedClub) {
              statusMutation.mutate({ id: selectedClub.id, status });
            }
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="status"
            label={t("common.status")}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="active">{t("clubs.active")}</Option>
              <Option value="pending">{t("clubs.pending")}</Option>
              <Option value="suspended">{t("clubs.suspended")}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
