import { useEffect, useState } from "react";
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
  Badge,
  Divider,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { competitionsApi } from "@/api/competitions";
import { membersApi } from "@/api/members";
import { getErrorMessage } from "@/utils/error";
import {
  CompetitionStatus,
  EventResponseDTO,
  RegistrationResponseDTO,
  ResultResponseDTO,
} from "@/types";
import dayjs from "dayjs";
import { cleanDto } from "@/utils/dto";

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  draft: "default",
  open: "green",
  closed: "orange",
  completed: "blue",
};

const TYPE_COLORS: Record<string, string> = {
  test_fisa: "purple",
  championship: "gold",
  friendly: "cyan",
  indoor: "lime",
  beachrowing: "blue",
  classic: "magenta",
};

const DISTANCES = ["150m", "2000m", "6000m", "10000m", "15000m", "20000m"];
const CATEGORIES = ["junior", "u23", "senior", "u15", "u19"];

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedEvent, setSelectedEvent] = useState<EventResponseDTO | null>(
    null,
  );
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedReg, setSelectedReg] =
    useState<RegistrationResponseDTO | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  const [eventForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [resultForm] = Form.useForm();

  // ── Competition ────────────────────────────────────────────────────────────
  const { data: competition, isLoading } = useQuery({
    queryKey: ["competition", id],
    queryFn: () => competitionsApi.getById(id!),
    enabled: !!id,
  });

  // ── Member search for registration ────────────────────────────────────────
  const { data: memberResults, isFetching: searchingMembers } = useQuery({
    queryKey: ["members", "search", memberSearch],
    queryFn: () =>
      membersApi.list({ search: memberSearch, limit: 20, status: "active" }),
    enabled: memberSearch.length >= 2,
  });

  // ── Registrations for selected event ──────────────────────────────────────
  const { data: registrations } = useQuery({
    queryKey: ["registrations", selectedEvent?.id],
    queryFn: () => competitionsApi.getRegistrations(id!, selectedEvent!.id),
    enabled: !!selectedEvent,
  });

  // ── Results for selected event ─────────────────────────────────────────────
  const { data: results } = useQuery({
    queryKey: ["results", selectedEvent?.id],
    queryFn: () => competitionsApi.getResults(id!, selectedEvent!.id),
    enabled: !!selectedEvent,
  });

  useEffect(() => {
    if (!showResult || !selectedReg) return;

    const existing = results?.find((r) => r.registrationId === selectedReg.id);

    if (existing) {
      resultForm.setFieldsValue({
        rank: existing.rank,
        finalTime: existing.finalTime,
        splitTime500: existing.splitTime500,
        watts: existing.watts,
        heartRate: existing.heartRate,
        strokeRate: existing.strokeRate,
        notes: existing.notes,
        status: existing.status, // 👈 important if you add it in DTO
      });
    } else {
      resultForm.resetFields();
    }
  }, [showResult, selectedReg, results]);
  // ── Mutations ──────────────────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: (status: CompetitionStatus) =>
      competitionsApi.updateStatus(id!, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["competition", id] });
      void messageApi.success(t("common.success"));
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
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
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
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
      setMemberSearch("");
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const resultMutation = useMutation({
    mutationFn: (values: Partial<ResultResponseDTO>) =>
      competitionsApi.recordResult(id!, selectedEvent!.id, {
        ...values,
        memberId: selectedReg!.memberId,
        registrationId: selectedReg!.id,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["results", selectedEvent?.id],
      });
      void messageApi.success(t("common.success"));
      setShowResult(false);
      resultForm.resetFields();
      setSelectedReg(null);
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  // Inside CompetitionDetailPage function

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => competitionsApi.deleteEvent(id!, eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["competition", id] });
      setSelectedEvent(null); // Reset selection after delete
      void messageApi.success(t("common.success"));
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const clearResultsMutation = useMutation({
    mutationFn: () => competitionsApi.clearResults(id!, selectedEvent!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["results", selectedEvent?.id],
      });
      void messageApi.success(t("common.success"));
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!competition) return null;

  // ── Registrations table ────────────────────────────────────────────────────
  const regColumns = [
    {
      title: "#",
      key: "index",
      width: 40,
      render: (_: unknown, __: unknown, i: number) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {i + 1}
        </Text>
      ),
    },
    {
      title: t("common.name"),
      dataIndex: "memberFullName", // Adjust this key based on your DTO
      key: "memberFullName",
      render: (v: string, _: RegistrationResponseDTO) => (
        <Text strong>{v || "Unknown Member"}</Text>
      ),
    },
    {
      title: t("members.license"),
      key: "memberId",
      render: (_: any, r: RegistrationResponseDTO) => (
        <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
          {/* If your API returns the license specifically, use that, 
            otherwise keep the slice for the ID */}
          {r.memberLicenseNumber || r.memberId.slice(-8)}
        </Tag>
      ),
    },
    {
      title: t("common.status"),
      key: "status",
      render: (_: unknown, r: RegistrationResponseDTO) => (
        <Tag color={r.status === "registered" ? "blue" : "orange"}>
          {r.status}
        </Tag>
      ),
    },
    {
      title: t("competitions.results"),
      key: "actions",
      width: 120,
      render: (_: unknown, r: RegistrationResponseDTO) => (
        <Button
          size="small"
          type="primary"
          ghost
          onClick={() => {
            setSelectedReg(r);
            setShowResult(true);
          }}
        >
          + {t("competitions.results")}
        </Button>
      ),
    },
  ];

  // ── Results table ──────────────────────────────────────────────────────────
  const resultColumns = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 50,
      render: (v: number) => (
        <Badge
          count={v ?? "—"}
          style={{
            background:
              v === 1
                ? "#D9AE40"
                : v === 2
                  ? "#bfbfbf"
                  : v === 3
                    ? "#cd7f32"
                    : "#f0f0f0",
            color: v <= 3 ? "#fff" : "#666",
          }}
        />
      ),
    },
    {
      title: t("common.name"),
      dataIndex: "memberFullName",
      key: "name",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "License",
      dataIndex: "memberLicenseNumber",
      key: "license",
      render: (v: string) => (
        <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
          {v}
        </Tag>
      ),
    },
    {
      title: "Final Time",
      dataIndex: "finalTime",
      key: "finalTime",
      render: (v: string) => (
        <Text strong style={{ color: "#0D2145" }}>
          {v ?? "—"}
        </Text>
      ),
    },
    {
      title: "Split /500",
      dataIndex: "splitTime500",
      key: "split",
      render: (v: string) => v ?? "—",
    },
    {
      title: "Watts",
      dataIndex: "watts",
      key: "watts",
      render: (v: number) => v ?? "—",
    },
    {
      title: "HR",
      dataIndex: "heartRate",
      key: "hr",
      render: (v: number) => (v ? `${v} bpm` : "—"),
    },
    {
      title: "SR",
      dataIndex: "strokeRate",
      key: "sr",
      render: (v: number) => v ?? "—",
    },
  ];

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs = [
    // ── Info tab ──────────────────────────────────────────────────────────────
    {
      key: "info",
      label: (
        <Space>
          <InfoCircleOutlined />
          Info
        </Space>
      ),
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
            <Tag color={TYPE_COLORS[competition.type]}>
              {t(`competitions.${competition.type}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("common.season")}>
            {competition.season}
          </Descriptions.Item>
          {competition.description && (
            <Descriptions.Item label="Description" span={2}>
              {competition.description}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },

    // ── Events tab ────────────────────────────────────────────────────────────
    {
      key: "events",
      label: (
        <Space>
          <TrophyOutlined />
          {t("competitions.events")}
          <Tag style={{ marginLeft: 4 }}>{competition.events?.length ?? 0}</Tag>
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Left — event list */}
          <Col xs={24} lg={8}>
            <Card
              size="small"
              title={t("competitions.events")}
              style={{ borderRadius: 10 }}
              extra={
                <Space>
                  {selectedEvent && (
                    <Popconfirm
                      title={t("common.confirmDelete")}
                      onConfirm={() =>
                        deleteEventMutation.mutate(selectedEvent.id)
                      }
                    >
                      <Button
                        size="small"
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  )}
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddEvent(true)}
                    style={{ background: "#0D2145" }}
                  >
                    Add
                  </Button>
                </Space>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {competition.events?.length === 0 && (
                  <Text
                    type="secondary"
                    style={{ textAlign: "center", padding: 16 }}
                  >
                    No events yet
                  </Text>
                )}
                {competition.events?.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border:
                        selectedEvent?.id === event.id
                          ? "2px solid #0D2145"
                          : "1px solid #f0f0f0",
                      background:
                        selectedEvent?.id === event.id ? "#f0f4ff" : "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      opacity:
                        deleteEventMutation.isPending &&
                        selectedEvent?.id === event.id
                          ? 0.5
                          : 1,
                      pointerEvents: deleteEventMutation.isPending
                        ? "none"
                        : "auto",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Space>
                        <Tag color="blue" style={{ margin: 0 }}>
                          {event.distance}
                        </Tag>
                        <Tag color="purple" style={{ margin: 0 }}>
                          {t(`members.${event.category}`)}
                        </Tag>
                        <Tag style={{ margin: 0 }}>
                          {t(`members.${event.gender}`)}
                        </Tag>
                      </Space>
                      <Text style={{ fontSize: 11, color: "#888" }}>
                        {event.label}
                      </Text>
                    </Space>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Right — registrations + results for selected event */}
          <Col xs={24} lg={16}>
            {selectedEvent ? (
              <Card
                style={{ borderRadius: 10 }}
                title={
                  <Space>
                    <TrophyOutlined style={{ color: "#D9AE40" }} />
                    <Text strong>{selectedEvent.label}</Text>
                  </Space>
                }
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
                      label: (
                        <Space>
                          <TeamOutlined />
                          Registered
                          <Badge
                            count={registrations?.length ?? 0}
                            style={{ background: "#0D2145" }}
                          />
                        </Space>
                      ),
                      children: (
                        <Table
                          dataSource={registrations ?? []}
                          columns={regColumns}
                          rowKey="id"
                          size="small"
                          pagination={false}
                          locale={{ emptyText: "No registrations yet" }}
                        />
                      ),
                    },
                    {
                      key: "results",
                      label: (
                        <Space>
                          <BarChartOutlined />
                          Results
                          <Badge
                            count={results?.length ?? 0}
                            style={{ background: "#52c41a" }}
                          />
                        </Space>
                      ),
                      children: (
                        <>
                          <div
                            style={{
                              marginBottom: 16,
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Popconfirm
                              title={t("competitions.confirmClearResults")}
                              onConfirm={() => clearResultsMutation.mutate()}
                              okText={t("common.yes")}
                              cancelText={t("common.no")}
                            >
                              <Button
                                danger
                                ghost
                                size="small"
                                icon={<ClearOutlined />}
                              >
                                {t("competitions.clearResults")}
                              </Button>
                            </Popconfirm>
                          </div>
                          <Table
                            dataSource={results ?? []}
                            columns={resultColumns}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            locale={{ emptyText: "No results yet" }}
                            scroll={{ x: 600 }}
                          />
                        </>
                      ),
                    },
                  ]}
                />
              </Card>
            ) : (
              <Card
                style={{
                  borderRadius: 10,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center", padding: 40 }}>
                  <TrophyOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <div>
                    <Text type="secondary">
                      Select an event on the left to manage registrations and
                      results
                    </Text>
                  </div>
                </div>
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

      {/* Back button */}
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
        <Row justify="space-between" align="middle" wrap>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>
                {competition.name}
              </Title>
              <Space wrap>
                <Tag color={STATUS_COLORS[competition.status]}>
                  {t(`competitions.${competition.status}`)}
                </Tag>
                <Tag color={TYPE_COLORS[competition.type]}>
                  {t(`competitions.${competition.type}`)}
                </Tag>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  📍 {competition.location}, {competition.city}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  📅 {dayjs(competition.startDate).format("DD/MM/YYYY")} →{" "}
                  {dayjs(competition.endDate).format("DD/MM/YYYY")}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("common.status")}:
              </Text>
              <Select
                value={competition.status}
                style={{ width: 140 }}
                onChange={(v) => statusMutation.mutate(v as CompetitionStatus)}
                loading={statusMutation.isPending}
                size="small"
              >
                <Option value="draft">{t("competitions.draft")}</Option>
                <Option value="open">{t("competitions.open")}</Option>
                <Option value="closed">{t("competitions.closed")}</Option>
                <Option value="completed">{t("competitions.completed")}</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs items={tabs} defaultActiveKey="events" />
      </Card>

      {/* ── Add Event Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={showAddEvent}
        title={`Add Event`}
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
            <Select placeholder="Select distance">
              {DISTANCES.map((d) => (
                <Option key={d} value={d}>
                  {d}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label={t("members.category")}
                rules={[{ required: true }]}
              >
                <Select placeholder="Select category">
                  {CATEGORIES.map((c) => (
                    <Option key={c} value={c}>
                      {t(`members.${c}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={t("members.gender")}
                rules={[{ required: true }]}
              >
                <Select placeholder="Select gender">
                  <Option value="male">{t("members.male")}</Option>
                  <Option value="female">{t("members.female")}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Register Member Modal ───────────────────────────────────────────── */}
      {/* Registration Modal */}
      <Modal
        open={showRegister}
        title={
          <Space>
            <span>{t("competitions.recordResult")}</span>
            {selectedReg && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {selectedReg.memberFullName}
              </Tag>
            )}
          </Space>
        }
        // title={t("competitions.registerMember")}
        onCancel={() => setShowRegister(false)}
        onOk={() => registerForm.submit()}
        confirmLoading={registerMutation.isPending}
      >
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={(values) => registerMutation.mutate(values.memberId)}
        >
          <Form.Item
            name="memberId"
            label={t("common.member")}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder={t("members.searchPlaceholder")}
              filterOption={false} // CRITICAL: Tells AntD not to filter locally
              onSearch={(value) => setMemberSearch(value)} // Updates the query key
              loading={searchingMembers}
              notFoundContent={searchingMembers ? <Spin size="small" /> : null}
            >
              {memberResults?.items.map((m) => (
                <Option key={m.id} value={m.id}>
                  {m.fullName} ({m.licenseNumber})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Record Result Modal ─────────────────────────────────────────────── */}
      <Modal
        open={showResult}
        title={`Record result`}
        onCancel={() => {
          setShowResult(false);
          resultForm.resetFields();
          setSelectedReg(null);
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
          onFinish={(v) => {
            const cleaned = cleanDto(v);
            resultMutation.mutate(cleaned as Partial<ResultResponseDTO>);
          }}
          style={{ marginTop: 16 }}
        >
          <Divider style={{ fontSize: 12 }}>Performance</Divider>

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

          <Divider style={{ fontSize: 12 }}>Metrics</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="watts" label="Watts">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="heartRate" label="HR (bpm)">
                <InputNumber style={{ width: "100%" }} min={0} max={250} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="strokeRate" label="Stroke Rate">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="Status">
            <Select placeholder="Select status">
              <Option value="finished">Finished</Option>
              <Option value="dns">DNS</Option>
              <Option value="dnf">DNF</Option>
              <Option value="dq">DQ</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
