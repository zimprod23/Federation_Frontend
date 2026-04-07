import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Modal,
  Row,
  Col,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { membersApi } from "@/api/members";
import { clubsApi } from "@/api/clubs";
import { CreateMemberDTO } from "@/types";
import dayjs from "dayjs";
import { getErrorMessage } from "@/utils/error";

const { Option } = Select;

// ── Form type — extends DTO with the DatePicker field ─────────────────────────
interface CreateMemberForm extends Omit<CreateMemberDTO, "dateOfBirth"> {
  dateOfBirthPicker: dayjs.Dayjs;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMemberModal({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateMemberForm>(); // ← correct type
  const [messageApi, contextHolder] = message.useMessage();

  const { data: clubs } = useQuery({
    queryKey: ["clubs", "all"],
    queryFn: () => clubsApi.list({ limit: 100 }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      form.resetFields();
      void messageApi.success(t("common.success"));
      onSuccess();
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const onFinish = (values: CreateMemberForm) => {
    // ← correct type
    const { dateOfBirthPicker, ...rest } = values;
    mutate({
      ...rest,
      dateOfBirth: dateOfBirthPicker.format("YYYY-MM-DD"),
    });
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={t("members.create")}
        onCancel={onClose}
        onOk={() => form.submit()}
        confirmLoading={isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label={t("members.firstName")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label={t("members.lastName")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirthPicker"
                label={t("members.dateOfBirth")}
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabledDate={(d) => d.isAfter(dayjs())}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={t("members.gender")}
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="male">{t("members.male")}</Option>
                  <Option value="female">{t("members.female")}</Option>
                  <Option value="other">{t("members.other")}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label={t("common.email")}
                rules={[{ required: true }, { type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={t("common.phone")}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cin" label={t("members.cin")}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clubId" label={t("members.club")}>
                <Select allowClear showSearch optionFilterProp="children">
                  {clubs?.items.map((club) => (
                    <Option key={club.id} value={club.id}>
                      {club.name} ({club.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="height" label={t("members.height")}>
                <InputNumber style={{ width: "100%" }} min={100} max={250} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="armSpan" label={t("members.armSpan")}>
                <InputNumber style={{ width: "100%" }} min={100} max={250} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label={t("members.weight")}>
                <InputNumber style={{ width: "100%" }} min={30} max={200} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
