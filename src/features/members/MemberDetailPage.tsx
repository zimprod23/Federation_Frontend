import { useState } from "react";
import {
  Card,
  Tabs,
  Button,
  Tag,
  Avatar,
  Typography,
  Descriptions,
  Space,
  Upload,
  message,
  Spin,
  Row,
  Col,
  Image,
} from "antd";
import { toProxyUrl } from "@/utils/image";
import {
  ArrowLeftOutlined,
  UserOutlined,
  UploadOutlined,
  IdcardOutlined,
  EditOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { membersApi } from "@/api/members";
import { MemberStatus } from "@/types";
import { useAuthStore } from "@/store/authStore";
import MemberCardTab from "./components/MemberCardTab";
import MemberHistoryTab from "./components/MemberHistoryTab";
import EditMemberModal from "./components/EditMemberModal";
import { getErrorMessage } from "@/utils/error";

const { Title } = Typography;

const STATUS_COLORS: Record<MemberStatus, string> = {
  active: "green",
  pending: "orange",
  suspended: "red",
  expired: "default",
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [showEdit, setShowEdit] = useState(false);

  // Sync tab with URL
  const activeTab = searchParams.get("tab") ?? "info";

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => membersApi.getById(id!),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => membersApi.uploadPhoto(id!, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["member", id] });
      void messageApi.success(t("common.success"));
    },
    onError: (err: unknown) => void messageApi.error(getErrorMessage(err)),
  });

  const isAdmin =
    user?.role === "super_admin" || user?.role === "federation_admin";

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!member) return null;

  const tabs = [
    {
      key: "info",
      label: (
        <span>
          <UserOutlined /> {t("common.name")}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label={t("members.firstName")}>
            {member.firstName}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.lastName")}>
            {member.lastName}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.firstNameAr")}>
            {member.firstNameAr ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.lastNameAr")}>
            {member.lastNameAr ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.email")}>
            {member.email}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.phone")}>
            {member.phone ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.cin")}>
            {member.cin ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.gender")}>
            {t(`members.${member.gender}`)}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.category")}>
            <Tag color="blue">{t(`members.${member.category}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("common.season")}>
            {member.season}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.height")}>
            {member.height ? `${member.height} cm` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.armSpan")}>
            {member.armSpan ? `${member.armSpan} cm` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.weight")}>
            {member.weight ? `${member.weight} kg` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("members.status")}>
            <Tag color={STATUS_COLORS[member.status]}>
              {t(`members.${member.status}`)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "card",
      label: (
        <span>
          <IdcardOutlined /> {t("members.card")}
        </span>
      ),
      children: <MemberCardTab member={member} />,
    },
    {
      key: "history",
      label: (
        <span>
          <TrophyOutlined /> {t("members.history")}
        </span>
      ),
      children: <MemberHistoryTab memberId={id!} />,
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/members")}
          style={{ marginBottom: 16 }}
        >
          {t("common.back")}
        </Button>

        <Card style={{ borderRadius: 12 }}>
          <Row gutter={24} align="middle">
            <Col>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Image
                  src={toProxyUrl(member.photoUrl)}
                  width={80}
                  height={80}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #f0f0f0",
                  }}
                  preview={!!member.photoUrl}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJvSURBVHgB7doxbsIwFAbgx6FHQGrFARhgh45l6R06lrEjdGzTqVKlSpWqSlWqUpWqVKVSJSv5JVayTUwc2+/5pCgCO/b7bCfBAREREREREREREREREf2Tcy5jbcUYm7VtBwvuV+9s2/bDqd3KsmxtbXv+sHZZlqcxxsTMN+fcMef8mXNOrYhIBGAEYLMoygdQVS8i6oHEe5cKYAOgWIAH4ACgWEAJ4AGgWEAL4ACgWMAM4AGgWOAM4ACgWOAN4ACgWOAP4ACgWOAQ4ACgWOAR4ACgWOAS4ACgWOAT4ACgWOAU4ACgWOAV4ACgWOAW4ACgWOAX4ACgWOAY4ACgWOAZ4ACgWOAa4ACgWOAb4ACgWOAc4ACgWOAd4ACgWOAe4ACgWOAf4ACgWOAg4ACgWOAh4ACgWOAi4ACgWOAj4ACgWOAk4ACgWOAl4ACgWOAm4ACgWOAn4ACgWOAo4ACgWOAp4ACgWOAq4ACgWOAr4ACgWOAs4ACgWOAt4ACgWOAu4ACgWOAv4ACgWOAw4ACgWOAx4ACgWOAy4ACgWOAz4ACgWOA04ACgWOA14ACgWOA24ACgWOA34ACgWOA44ACgWOA54ACgWOA64ACgWOA74ACgWOA84ACgWOA94ACgWOA+4ACgWOA/4ACA"
                />
                {!member.photoUrl && (
                  <Avatar
                    icon={<UserOutlined />}
                    size={80}
                    style={{
                      background: "#0D2145",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
                {isAdmin && (
                  <Upload
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={(file) => {
                      uploadMutation.mutate({ file });
                      return false;
                    }}
                  >
                    <Button
                      size="small"
                      icon={<UploadOutlined />}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        padding: 0,
                        fontSize: 11,
                        background: "#D9AE40",
                        borderColor: "#D9AE40",
                        color: "#0D2145",
                      }}
                    />
                  </Upload>
                )}
              </div>
            </Col>
            <Col flex={1}>
              <Space direction="vertical" size={4}>
                <Title level={4} style={{ margin: 0 }}>
                  {member.fullName}
                </Title>
                <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
                  {member.licenseNumber}
                </Tag>
                <Tag color={STATUS_COLORS[member.status]}>
                  {t(`members.${member.status}`)}
                </Tag>
              </Space>
            </Col>
            {isAdmin && (
              <Col>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setShowEdit(true)}
                >
                  {t("common.edit")}
                </Button>
              </Col>
            )}
          </Row>
        </Card>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={tabs}
        />
      </Card>

      <EditMemberModal
        open={showEdit}
        member={member}
        onClose={() => setShowEdit(false)}
        onSuccess={() => {
          setShowEdit(false);
          void queryClient.invalidateQueries({ queryKey: ["member", id] });
        }}
      />
    </>
  );
}
