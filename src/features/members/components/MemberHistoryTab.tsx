import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Statistic,
  Row,
  Col,
  Card,
  Empty,
  Spin,
  Tag,
  Timeline,
  Space,
} from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { membersApi } from "@/api/members";
import { getErrorMessage } from "@/utils/error";

interface MemberHistoryTabProps {
  memberId: string;
}

const getMedalLabel = (medal?: string) => {
  switch (medal) {
    case "gold":
      return "🥇 Gold";
    case "silver":
      return "🥈 Silver";
    case "bronze":
      return "🥉 Bronze";
    default:
      return "—";
  }
};

export default function MemberHistoryTab({ memberId }: MemberHistoryTabProps) {
  const { t } = useTranslation();

  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["memberHistory", memberId],
    queryFn: () => membersApi.getHistory(memberId),
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Empty
        description={getErrorMessage(error)}
        style={{ marginTop: 40, marginBottom: 40 }}
      />
    );
  }

  if (!history) {
    return (
      <Empty
        description={t("common.noData")}
        style={{ marginTop: 40, marginBottom: 40 }}
      />
    );
  }

  return (
    <div>
      {/* Medal Summary Section */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={t("members.totalCompetitions")}
              value={history.totalCompetitions}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={t("members.goldMedals")}
              value={history.goldMedals}
              prefix={<span style={{ marginRight: 8 }}>🥇</span>}
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={t("members.silverMedals")}
              value={history.silverMedals}
              prefix={<span style={{ marginRight: 8 }}>🥈</span>}
              valueStyle={{ color: "#a6a9ad" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={t("members.bronzeMedals")}
              value={history.bronzeMedals}
              prefix={<span style={{ marginRight: 8 }}>🥉</span>}
              valueStyle={{ color: "#cd7f32" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Competition History Timeline */}
      {history.competitionHistory.length > 0 ? (
        <Card
          title={t("members.competitionHistory")}
          style={{ borderRadius: 12 }}
        >
          <Timeline
            items={history.competitionHistory.map((competition, idx) => ({
              key: idx,
              dot: (
                <TrophyOutlined
                  style={{
                    fontSize: 18,
                    color: competition.results.some((r) => r.medal === "gold")
                      ? "#faad14"
                      : undefined,
                  }}
                />
              ),
              children: (
                <Card
                  size="small"
                  style={{ marginBottom: 16, borderRadius: 8 }}
                  type="inner"
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={8}
                  >
                    <div>
                      <strong style={{ fontSize: 16 }}>
                        {competition.competitionName}
                      </strong>
                      <br />
                      <Tag color="blue" style={{ marginTop: 4 }}>
                        {t(`competitions.${competition.competitionType}`)}
                      </Tag>
                      <Tag color="green" style={{ marginLeft: 4 }}>
                        Season {competition.season}
                      </Tag>
                    </div>

                    <Space size="large">
                      <span>
                        <EnvironmentOutlined /> {competition.city},{" "}
                        {competition.location}
                      </span>
                      <span>
                        <CalendarOutlined />{" "}
                        {new Date(competition.startDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}{" "}
                        -{" "}
                        {new Date(competition.endDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </Space>

                    {competition.description && (
                      <p style={{ marginBottom: 0, color: "#666" }}>
                        {competition.description}
                      </p>
                    )}

                    {/* Results */}
                    {competition.results.length > 0 && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: "12px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                          border: "1px solid #e8e8e8",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            marginBottom: 12,
                            fontSize: 14,
                            color: "#333",
                          }}
                        >
                          Results:
                        </strong>
                        <Space
                          direction="vertical"
                          style={{ width: "100%" }}
                          size={10}
                        >
                          {competition.results.map((result) => (
                            <div
                              key={result.resultId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                backgroundColor: "#fff",
                                borderRadius: "6px",
                                border:
                                  result.medal === "gold"
                                    ? "2px solid #faad14"
                                    : result.medal === "silver"
                                      ? "2px solid #a6a9ad"
                                      : result.medal === "bronze"
                                        ? "2px solid #cd7f32"
                                        : "1px solid #e8e8e8",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  flex: 1,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#333",
                                  }}
                                >
                                  Event {result.eventId.slice(-4)}
                                </span>
                                {result.distance && (
                                  <>
                                    <span
                                      style={{ color: "#999", fontSize: 11 }}
                                    >
                                      •
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "#666",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {result.distance}
                                    </span>
                                  </>
                                )}
                                {result.gender && (
                                  <>
                                    <span
                                      style={{ color: "#999", fontSize: 11 }}
                                    >
                                      •
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "#666",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {t(`members.${result.gender}`)}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <Tag
                                  color={
                                    result.rank === 1
                                      ? "gold"
                                      : result.rank === 2
                                        ? "silver"
                                        : result.rank === 3
                                          ? "orange"
                                          : "default"
                                  }
                                  style={{
                                    cursor: "default",
                                    padding: "4px 10px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    margin: 0,
                                  }}
                                >
                                  {result.rank ? `#${result.rank}` : "—"}
                                </Tag>
                                {result.medal && (
                                  <span style={{ fontSize: 16 }}>
                                    {getMedalLabel(result.medal)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                </Card>
              ),
            }))}
          />
        </Card>
      ) : (
        <Empty
          description={t("members.noCompetitionHistory")}
          style={{ marginTop: 40, marginBottom: 40 }}
        />
      )}
    </div>
  );
}
