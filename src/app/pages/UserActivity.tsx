import { useNavigate, useParams } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ArrowLeft, User } from "lucide-react";

export default function UserActivity() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const userData = {
    name: "김주무관",
    email: "kim@agency.go.kr",
    roles: ["실무 담당자"],
    joinDate: "2025.03.15",
  };

  const ragQueries = [
    {
      id: 1,
      query: "가명정보 결합 시 안전성 확보 조치는 무엇인가요?",
      timestamp: "2026.06.02 14:32",
      sources: 3,
    },
    {
      id: 2,
      query: "개인정보 처리방침 수립 시 필수 포함 사항은?",
      timestamp: "2026.06.01 10:15",
      sources: 2,
    },
    {
      id: 3,
      query: "데이터 결합 신청 절차",
      timestamp: "2026.05.30 16:20",
      sources: 4,
    },
  ];

  const documents = [
    {
      id: 1,
      title: "신규_공모사업_지침",
      category: "공모사업",
      uploadDate: "2026.06.01",
      status: "요약 완료",
    },
    {
      id: 2,
      title: "감사원_처분요구서_2026",
      category: "감사",
      uploadDate: "2026.05.30",
      status: "요약 완료",
    },
    {
      id: 3,
      title: "가명정보_처리_가이드라인",
      category: "가이드라인",
      uploadDate: "2026.05.28",
      status: "요약 완료",
    },
  ];

  const drafts = [
    {
      id: 1,
      title: "데이터 결합 가이드 검토",
      type: "기안",
      date: "2026.06.01",
      status: "approved",
      statusLabel: "승인",
    },
    {
      id: 2,
      title: "가명정보 처리 승인 요청",
      type: "기안",
      date: "2026.06.01",
      status: "pending",
      statusLabel: "대기",
    },
    {
      id: 3,
      title: "감사원 처분요구서 대응",
      type: "기안",
      date: "2026.05.30",
      status: "rejected",
      statusLabel: "반려",
    },
  ];

  const roleColors: Record<string, string> = {
    "실무 담당자":
      "bg-[var(--status-info)] text-white border-transparent",
    결재권자:
      "bg-[var(--status-pending)] text-white border-transparent",
    관리자: "bg-primary text-white border-transparent",
  };

  const statusColors: Record<string, string> = {
    approved:
      "bg-[var(--status-approved)] text-white border-transparent",
    pending:
      "bg-[var(--status-pending)] text-white border-transparent",
    rejected:
      "bg-[var(--status-rejected)] text-white border-transparent",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="size-4" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-medium text-foreground">
            사용자 활동 이력
          </h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="size-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-medium text-foreground">
                    {userData.name}
                  </h2>
                  <div className="flex gap-1">
                    {userData.roles.map((role, idx) => (
                      <Badge
                        key={idx}
                        className={roleColors[role]}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{userData.email}</p>
                  <p>가입일: {userData.joinDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="queries" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queries">
              RAG 질의 이력
            </TabsTrigger>
            <TabsTrigger value="documents">
              업로드/요약 문서
            </TabsTrigger>
            <TabsTrigger value="drafts">
              기안·결재 이력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  RAG 질의 이력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ragQueries.map((query) => (
                    <div
                      key={query.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground mb-1">
                            {query.query}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{query.timestamp}</span>
                            <span>·</span>
                            <span>출처 {query.sources}건</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  업로드/요약 문서
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          문서 제목
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          카테고리
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          업로드일
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            {doc.title}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">
                              {doc.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {doc.uploadDate}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="bg-[var(--status-approved)] text-white border-transparent">
                              {doc.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  기안·결재 이력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          제목
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          유형
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          일시
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.map((draft) => (
                        <tr
                          key={draft.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            {draft.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {draft.type}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {draft.date}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                statusColors[draft.status]
                              }
                            >
                              {draft.statusLabel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}