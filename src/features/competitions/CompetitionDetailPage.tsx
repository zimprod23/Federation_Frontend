import { useState } from "react";
import {
  Card,
  Tabs,
  Button,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Descriptions,
  Table,
  Select,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { competitionsApi } from "@/api/competitions";
import {
  CompetitionStatus,
  EventResponseDTO,
  RegistrationResponseDTO,
  ResultResponseDTO,
} from "@/types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  draft: "default",
  open: "green",
  closed: "orange",
  completed: "blue",
};

const DISTANCES = ["150m", "2000m", "6000m", "10000m", "15000m"];
const CATEGORIES = ["junior", "u23", "senior"];

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponseDTO | null>(
    null,
  );
  const [selectedRegId, setSelectedRegId] = useState<string>("");

  const [eventForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [resultForm] = Form.useForm();

  const { data: competition, isLoading } = useQuery({
    queryKey: ["competition", id],
    queryFn: () => competitionsApi.getById(id!),
    enabled: !!id,
  });

  const { data: registrations } = useQuery({
    queryKey: ["registrations", selectedEvent?.id],
    queryFn: () => competitionsApi.getRegistrations(id!, selectedEvent!.id),
    enabled: !!selectedEvent,
  });

  const { data: results } = useQuery({
    queryKey: ["results", selectedEvent?.id],
    queryFn: () => competitionsApi.getResults(id!, selectedEvent!.id),
    enabled: !!selectedEvent,
  });

  const statusMutation = useMutation({
    mutationFn: (status: CompetitionStatus) =>
      competitionsApi.updateStatus(id!, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["competition", id] });
      void messageApi.success(t("common.success"));
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  const addEventMutation = useMutation({
    mutationFn: (values: {
      distance: string;
      category: string;
      gender: string;
    }) => competitionsApi.createEvent(id!, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["competition", id] });
      void messageApi.success(t("common.success"));
      setShowAddEvent(false);
      eventForm.resetFields();
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  const registerMutation = useMutation({
    mutationFn: (memberId: string) =>
      competitionsApi.registerMember(id!, selectedEvent!.id, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["registrations", selectedEvent?.id],
      });
      void messageApi.success(t("common.success"));
      setShowRegister(false);
      registerForm.resetFields();
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  const resultMutation = useMutation({
    mutationFn: (values: Partial<ResultResponseDTO>) =>
      competitionsApi.recordResult(id!, selectedEvent!.id, {
        ...values,
        registrationId: selectedRegId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["results", selectedEvent?.id],
      });
      void messageApi.success(t("common.success"));
      setShowResult(false);
      resultForm.resetFields();
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!competition) return null;

  const regColumns = [
    {
      title: "Member ID",
      dataIndex: "memberId",
      key: "memberId",
      render: (v: string) => (
        <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
          {v.slice(-8)}
        </Text>
      ),
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: unknown, r: RegistrationResponseDTO) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedRegId(r.id);
            resultForm.setFieldsValue({ memberId: r.memberId });
            setShowResult(true);
          }}
        >
          {t("competitions.results")}
        </Button>
      ),
    },
  ];

  const resultColumns = [
    { title: "#", dataIndex: "rank", key: "rank", width: 50 },
    { title: t("common.name"), dataIndex: "memberFullName", key: "name" },
    {
      title: "License",
      dataIndex: "memberLicenseNumber",
      key: "license",
      render: (v: string) => <Tag style={{ fontFamily: "monospace" }}>{v}</Tag>,
    },
    { title: "Final Time", dataIndex: "finalTime", key: "finalTime" },
    { title: "Split /500", dataIndex: "splitTime500", key: "split" },
    { title: "Watts", dataIndex: "watts", key: "watts" },
    { title: "HR", dataIndex: "heartRate", key: "hr" },
    { title: "Stroke Rate", dataIndex: "strokeRate", key: "sr" },
  ];

  const tabs = [
    {
      key: "info",
      label: "Info",
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label={t("competitions.location")}>
            {competition.location}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.city")}>
            {competition.city}
          </Descriptions.Item>
          <Descriptions.Item label={t("competitions.startDate")}>
            {dayjs(competition.startDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label={t("competitions.endDate")}>
            {dayjs(competition.endDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label={t("competitions.type")}>
            <Tag>{t(`competitions.${competition.type}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("common.season")}>
            {competition.season}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "events",
      label: t("competitions.events"),
      children: (
        <Row gutter={24}>
          {/* Event list */}
          <Col xs={24} lg={10}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {competition.events?.map((event) => (
                <Card
                  key={event.id}
                  size="small"
                  hoverable
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    borderRadius: 8,
                    border:
                      selectedEvent?.id === event.id
                        ? "2px solid #0D2145"
                        : "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                >
                  <Space>
                    <TrophyOutlined />
                    <Text strong>{event.label}</Text>
                    <Tag color="blue">{event.distance}</Tag>
                  </Space>
                </Card>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setShowAddEvent(true)}
                style={{ marginTop: 8 }}
              >
                {t("competitions.events")}
              </Button>
            </div>
          </Col>

          {/* Event detail */}
          <Col xs={24} lg={14}>
            {selectedEvent ? (
              <Card
                title={selectedEvent.label}
                style={{ borderRadius: 12 }}
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setShowRegister(true)}
                    style={{ background: "#0D2145" }}
                  >
                    {t("competitions.register")}
                  </Button>
                }
              >
                <Tabs
                  size="small"
                  items={[
                    {
                      key: "registrations",
                      label: `Registrations (${registrations?.length ?? 0})`,
                      children: (
                        <Table
                          dataSource={registrations ?? []}
                          columns={regColumns}
                          rowKey="id"
                          size="small"
                          pagination={false}
                        />
                      ),
                    },
                    {
                      key: "results",
                      label: `Results (${results?.length ?? 0})`,
                      children: (
                        <Table
                          dataSource={results ?? []}
                          columns={resultColumns}
                          rowKey="id"
                          size="small"
                          pagination={false}
                        />
                      ),
                    },
                  ]}
                />
              </Card>
            ) : (
              <Card style={{ borderRadius: 12, textAlign: "center" }}>
                <Text type="secondary">
                  Select an event to see registrations and results
                </Text>
              </Card>
            )}
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/competitions")}
        style={{ marginBottom: 16 }}
      >
        {t("common.back")}
      </Button>

      {/* Header card */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>
                {competition.name}
              </Title>
              <Space>
                <Tag color={STATUS_COLORS[competition.status]}>
                  {t(`competitions.${competition.status}`)}
                </Tag>
                <Text type="secondary">
                  {dayjs(competition.startDate).format("DD/MM/YYYY")} →{" "}
                  {dayjs(competition.endDate).format("DD/MM/YYYY")}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Select
              value={competition.status}
              style={{ width: 160 }}
              onChange={(v) => statusMutation.mutate(v as CompetitionStatus)}
              loading={statusMutation.isPending}
            >
              <Option value="draft">{t("competitions.draft")}</Option>
              <Option value="open">{t("competitions.open")}</Option>
              <Option value="closed">{t("competitions.closed")}</Option>
              <Option value="completed">{t("competitions.completed")}</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Tabs items={tabs} />
      </Card>

      {/* Add Event Modal */}
      <Modal
        open={showAddEvent}
        title={t("competitions.events")}
        onCancel={() => {
          setShowAddEvent(false);
          eventForm.resetFields();
        }}
        onOk={() => eventForm.submit()}
        confirmLoading={addEventMutation.isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
      >
        <Form
          form={eventForm}
          layout="vertical"
          onFinish={(v) =>
            addEventMutation.mutate(
              v as {
                distance: string;
                category: string;
                gender: string;
              },
            )
          }
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="distance"
            label="Distance"
            rules={[{ required: true }]}
          >
            <Select>
              {DISTANCES.map((d) => (
                <Option key={d} value={d}>
                  {d}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label={t("members.category")}
            rules={[{ required: true }]}
          >
            <Select>
              {CATEGORIES.map((c) => (
                <Option key={c} value={c}>
                  {t(`members.${c}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="gender"
            label={t("members.gender")}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="male">{t("members.male")}</Option>
              <Option value="female">{t("members.female")}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Register Modal */}
      <Modal
        open={showRegister}
        title={t("competitions.register")}
        onCancel={() => {
          setShowRegister(false);
          registerForm.resetFields();
        }}
        onOk={() => registerForm.submit()}
        confirmLoading={registerMutation.isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
      >
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={(v) => registerMutation.mutate(v.memberId as string)}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="memberId"
            label="Member ID"
            rules={[{ required: true }]}
            extra="Paste the member's ID from the members list"
          >
            <Input placeholder="64f1a2b3c4d5e6f7a8b9c0d1" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Record Result Modal */}
      <Modal
        open={showResult}
        title={t("competitions.results")}
        onCancel={() => {
          setShowResult(false);
          resultForm.resetFields();
        }}
        onOk={() => resultForm.submit()}
        confirmLoading={resultMutation.isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        width={520}
      >
        <Form
          form={resultForm}
          layout="vertical"
          onFinish={(v) =>
            resultMutation.mutate(v as Partial<ResultResponseDTO>)
          }
          style={{ marginTop: 16 }}
        >
          <Form.Item name="memberId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="rank" label="Rank">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="finalTime" label="Final Time">
                <Input placeholder="06:32.4" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="splitTime500" label="Split /500m">
                <Input placeholder="01:38.1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="watts" label="Watts">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="heartRate" label="HR (bpm)">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="strokeRate" label="Stroke Rate">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
