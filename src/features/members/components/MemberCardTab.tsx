import { useState } from "react";
import {
  Card,
  Button,
  DatePicker,
  Form,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Divider,
  Image,
  message,
  Empty,
  Spin,
} from "antd";
import { IdcardOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { membersApi } from "@/api/members";
import { MemberResponseDTO } from "@/types";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface Props {
  member: MemberResponseDTO;
}

export default function MemberCardTab({ member }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const { data: card, isLoading } = useQuery({
    queryKey: ["card", member.id],
    queryFn: () => membersApi.getCard(member.id),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: ({
      validFrom,
      validUntil,
    }: {
      validFrom: string;
      validUntil: string;
    }) => membersApi.generateCard(member.id, validFrom, validUntil),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["card", member.id] });
      void messageApi.success(t("common.success"));
    },
    onError: (err: Error) => void messageApi.error(err.message),
  });

  const onGenerate = (values: {
    validFrom: dayjs.Dayjs;
    validUntil: dayjs.Dayjs;
  }) => {
    generateMutation.mutate({
      validFrom: values.validFrom.format("YYYY-MM-DD"),
      validUntil: values.validUntil.format("YYYY-MM-DD"),
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <Row gutter={24}>
        {/* Left — current card */}
        <Col xs={24} lg={14}>
          {card ? (
            <Card
              title={
                <Space>
                  <IdcardOutlined />
                  {t("members.card")}
                </Space>
              }
              style={{ borderRadius: 12 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">{t("card.cardNumber")}</Text>
                    <div>
                      <Tag style={{ fontFamily: "monospace" }}>
                        {card.cardNumber}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">{t("members.status")}</Text>
                    <div>
                      <Tag color={card.isValid ? "green" : "red"}>
                        {card.isValid ? "Valid" : "Invalid"}
                      </Tag>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 12 }}>
                  <Col span={12}>
                    <Text type="secondary">{t("card.validFrom")}</Text>
                    <div>
                      <Text strong>
                        {dayjs(card.validFrom).format("DD/MM/YYYY")}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">{t("card.validUntil")}</Text>
                    <div>
                      <Text strong>
                        {dayjs(card.validUntil).format("DD/MM/YYYY")}
                      </Text>
                    </div>
                  </Col>
                </Row>

                {card.qrDataUrl && (
                  <>
                    <Divider />
                    <div style={{ textAlign: "center" }}>
                      <Image
                        src={card.qrDataUrl}
                        width={160}
                        preview={false}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 8,
                          padding: 8,
                        }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {member.licenseNumber}
                        </Text>
                      </div>
                    </div>
                  </>
                )}
              </Space>
            </Card>
          ) : (
            <Card style={{ borderRadius: 12 }}>
              <Empty
                description={t("members.card") + " — " + t("common.error")}
              />
            </Card>
          )}
        </Col>

        {/* Right — generate */}
        <Col xs={24} lg={10}>
          <Card title={t("members.generateCard")} style={{ borderRadius: 12 }}>
            <Form form={form} layout="vertical" onFinish={onGenerate}>
              <Form.Item
                name="validFrom"
                label={t("card.validFrom")}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                name="validUntil"
                label={t("card.validUntil")}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={generateMutation.isPending}
                icon={<ReloadOutlined />}
                style={{ background: "#0D2145" }}
              >
                {t("card.generate")}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
