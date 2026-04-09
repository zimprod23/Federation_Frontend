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
import { getErrorMessage } from "@/utils/error";
import MemberCardDownload from "./MemberCardDownload";
import { clubsApi } from "@/api";
import MemberAttestationDownload from "./MemberAttestationDownload";
import MemberCardDownloadV2 from "./MemberCardDownloadV2";

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
    queryFn: async () => membersApi.getCard(member.id),
    retry: false,
    staleTime: 0,
  });

  const { data: club } = useQuery({
    queryKey: ["club", member.clubId],
    queryFn: () => clubsApi.getById(member.clubId!),
    enabled: !!member.clubId,
  });
  const now = dayjs();
  const from = dayjs(card && card.validFrom);
  const until = dayjs(card && card.validUntil);
  type CardStatus = "valid" | "not_yet_valid" | "expired" | "invalidated";

  const cardStatus: CardStatus =
    card && !card.isValid
      ? "invalidated"
      : now.isBefore(from)
        ? "not_yet_valid"
        : now.isAfter(until)
          ? "expired"
          : "valid";

  const STATUS_TAG: Record<CardStatus, { color: string; label: string }> = {
    valid: { color: "green", label: "Valide" },
    not_yet_valid: { color: "orange", label: "Pas encore valide" },
    expired: { color: "red", label: "Expiré" },
    invalidated: { color: "default", label: "Invalidée" },
  };

  const tagConfig = STATUS_TAG[cardStatus];
  const isCurrentlyValid = Boolean(
    card &&
    card.isValid &&
    card.validFrom &&
    card.validUntil &&
    dayjs().isAfter(dayjs(card.validFrom)) &&
    dayjs().isBefore(dayjs(card.validUntil)),
  );

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
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
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
                      {/* <Tag color={isCurrentlyValid ? "green" : "red"}>
                        {isCurrentlyValid ? "Valid" : "Expired"}
                      </Tag> */}
                      <Tag color={tagConfig.color}>{tagConfig.label}</Tag>
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
                {card && (
                  <>
                    <MemberCardDownloadV2
                      member={member}
                      card={card}
                      clubName={club?.name ?? ""}
                    />
                    <MemberAttestationDownload
                      member={member}
                      card={card}
                      clubName={club?.name ?? club?.code ?? "CLUB SANS NOM"}
                    />
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

/**
 * 10:34:46 [vite] http proxy error: /api/v1/auth/login
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
10:34:59 [vite] http proxy error: /api/v1/clubs?limit=100
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
10:34:59 [vite] http proxy error: /api/v1/members?page=1&limit=20
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
10:35:00 [vite] http proxy error: /api/v1/members?page=1&limit=20
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) (x2)
10:35:00 [vite] http proxy error: /api/v1/clubs?limit=100
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
10:35:02 [vite] http proxy error: /api/v1/clubs?page=1&limit=20
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
10:35:03 [vite] http proxy error: /api/v1/clubs?page=1&limit=20
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) (x2)
 */
