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
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import { PlusOutlined, TrophyOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { competitionsApi } from "@/api/competitions";
import { CompetitionResponseDTO } from "@/types";
import dayjs from "dayjs";
import { getErrorMessage } from "@/utils/error";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
};

export default function CompetitionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createForm] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["competitions", page, statusFilter],
    queryFn: () =>
      competitionsApi.list({
        page,
        limit: 20,
        status: statusFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: competitionsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["competitions"] });
      void messageApi.success(t("common.success"));
      setShowCreate(false);
      createForm.resetFields();
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const columns = [
    {
      title: t("common.name"),
      key: "name",
      render: (_: unknown, r: CompetitionResponseDTO) => (
        <Space>
          <TrophyOutlined style={{ color: "#D9AE40" }} />
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span style={{ fontSize: 12, color: "#888" }}>
              {r.city} · {t("common.season")} {r.season}
            </span>
          </Space>
        </Space>
      ),
    },
    {
      title: t("competitions.type"),
      key: "type",
      render: (_: unknown, r: CompetitionResponseDTO) => (
        <Tag color={TYPE_COLORS[r.type]}>{t(`competitions.${r.type}`)}</Tag>
      ),
    },
    {
      title: t("common.date"),
      key: "date",
      render: (_: unknown, r: CompetitionResponseDTO) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(r.startDate).format("DD/MM/YYYY")}</span>
          <span style={{ fontSize: 12, color: "#888" }}>
            → {dayjs(r.endDate).format("DD/MM/YYYY")}
          </span>
        </Space>
      ),
    },
    {
      title: t("common.status"),
      key: "status",
      render: (_: unknown, r: CompetitionResponseDTO) => (
        <Tag color={STATUS_COLORS[r.status]}>
          {t(`competitions.${r.status}`)}
        </Tag>
      ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 80,
      render: (_: unknown, r: CompetitionResponseDTO) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/competitions/${r.id}`)}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {t("competitions.title")}
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreate(true)}
            style={{ background: "#0D2145" }}
          >
            {t("competitions.create")}
          </Button>
        </Col>
      </Row>

      {/* Filter */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Select
          placeholder={t("common.status")}
          style={{ width: 200 }}
          allowClear
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <Option value="draft">{t("competitions.draft")}</Option>
          <Option value="open">{t("competitions.open")}</Option>
          <Option value="closed">{t("competitions.closed")}</Option>
          <Option value="completed">{t("competitions.completed")}</Option>
        </Select>
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
            onClick: () => navigate(`/competitions/${record.id}`),
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 700 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        title={t("competitions.create")}
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
          onFinish={(values) => {
            const [startDate, endDate] = values.dates as [
              dayjs.Dayjs,
              dayjs.Dayjs,
            ];
            createMutation.mutate({
              name: values.name as string,
              type: values.type as string,
              location: values.location as string,
              city: values.city as string,
              season: startDate.year(),
              description: values.description as string | undefined,
              startDate: startDate.format("YYYY-MM-DD"),
              endDate: endDate.format("YYYY-MM-DD"),
            });
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label={t("common.name")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label={t("competitions.type")}
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="test_fisa">
                    {t("competitions.test_fisa")}
                  </Option>
                  <Option value="championship">
                    {t("competitions.championship")}
                  </Option>
                  <Option value="friendly">{t("competitions.friendly")}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dates"
                label={`${t("competitions.startDate")} → ${t("competitions.endDate")}`}
                rules={[{ required: true }]}
              >
                <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label={t("competitions.location")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="city"
                label={t("common.city")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
