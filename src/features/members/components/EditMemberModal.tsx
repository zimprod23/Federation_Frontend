import { useEffect } from "react";
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
import { MemberResponseDTO, UpdateMemberDTO, MemberStatus } from "@/types";
import { getErrorMessage } from "@/utils/error";
import dayjs from "dayjs";
import { cleanDto } from "@/utils/dto";

const { Option } = Select;

interface EditMemberForm extends Omit<UpdateMemberDTO, "dateOfBirth"> {
  dateOfBirthPicker?: dayjs.Dayjs;
}

interface Props {
  open: boolean;
  member: MemberResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMemberModal({
  open,
  member,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<EditMemberForm>();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: clubs } = useQuery({
    queryKey: ["clubs", "all"],
    queryFn: () => clubsApi.list({ limit: 100 }),
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        firstName: member.firstName,
        lastName: member.lastName,
        firstNameAr: member.firstNameAr,
        lastNameAr: member.lastNameAr,
        phone: member.phone,
        cin: member.cin,
        height: member.height,
        armSpan: member.armSpan,
        weight: member.weight,
        clubId: member.clubId,
        status: member.status,
        dateOfBirthPicker: member.dateOfBirth
          ? dayjs(member.dateOfBirth)
          : undefined,
      });
    }
  }, [open, member, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: UpdateMemberDTO) => membersApi.update(member.id, dto),
    onSuccess: () => {
      void messageApi.success(t("common.success"));
      onSuccess();
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const onFinish = (values: EditMemberForm) => {
    const { dateOfBirthPicker, ...rest } = values;

    const cleaned = cleanDto(rest);

    mutate({
      ...cleaned,
      dateOfBirth: dateOfBirthPicker
        ? dateOfBirthPicker.format("YYYY-MM-DD")
        : undefined,
    });
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={t("common.edit")}
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
              <Form.Item name="firstName" label={t("members.firstName")}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label={t("members.lastName")}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstNameAr" label={t("members.firstNameAr")}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastNameAr" label={t("members.lastNameAr")}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirthPicker"
                label={t("members.dateOfBirth")}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabledDate={(d) => d.isAfter(dayjs())}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label={t("common.phone")}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cin" label={t("members.cin")}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item name="status" label={t("members.status")}>
                <Select>
                  <Option value="active">{t("members.active")}</Option>
                  <Option value="pending">{t("members.pending")}</Option>
                  <Option value="suspended">{t("members.suspended")}</Option>
                  <Option value="expired">{t("members.expired")}</Option>
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
