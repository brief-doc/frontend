import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowLeft, User, KeyRound } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { PasswordChangeModal } from "../components/PasswordChangeModal";
import { getUserActivityAPI } from "../api/auth";
import { getDocumentList } from "../api/document";
import type { DocItem } from "../types/document";

interface RagQueryItem {
  id: number;
  query: string;
  answer: string | null;
  timestamp: string;
}

interface DraftItem {
  id: number;
  title: string;
  date: string;
  status: string;
  statusLabel: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  pending: "대기",
  approved: "승인",
  rejected: "반려",
  canceled: "취소",
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyPage() {
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const rawData = sessionStorage.getItem("user_session");
  const sessionData = rawData ? JSON.parse(rawData) : null;

  const roles: string[] = sessionData?.roles ?? [];
  const userName = sessionData?.user_name ?? sessionData?.name ?? "사용자";
  const userEmail = sessionData?.email ?? "no-reply@example.com";
  const userId = sessionData?.id ?? null;

  const [joinDate, setJoinDate] = useState<string>("...");
  const [ragQueries, setRagQueries] = useState<RagQueryItem[]>([]);
  const [expandedQueryId, setExpandedQueryId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  useEffect(() => {
    if (!sessionData) {
      sessionStorage.clear();
      toast.error("로그인이 필요한 페이지입니다. 로그인 화면으로 이동합니다.");
      navigate("/", { replace: true });
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthorized) return;

    getUserActivityAPI().then((data) => {
      if (!data) return;
      setJoinDate(data.user?.joinDate ?? "");
      setRagQueries(
        (data.rag_queries ?? []).map((q: any) => ({
          id: q.query_id,
          query: q.query_text,
          answer: q.answer_text ?? null,
          timestamp: formatDate(q.created_at),
        }))
      );
      setDrafts(
        (data.drafts ?? []).map((d: any) => ({
          id: d.draft_id,
          title: d.title,
          date: formatDate(d.created_at),
          status: d.status,
          statusLabel: STATUS_LABEL[d.status] ?? d.status,
        }))
      );
    }).catch(() => {});

    getDocumentList({ page: 1, limit: 10 }).then((res) => {
      if (res) setDocuments(res.items);
    }).catch(() => {});
  }, [isAuthorized]);

  const handleBackToDashboard = () => {
    if (roles.includes("관리자")) navigate("/admin/dashboard");
    else if (roles.includes("결재권자")) navigate("/staff/dashboard/approver");
    else navigate("/staff/dashboard");
  };

  const roleColors: Record<string, string> = {
    "실무 담당자": "bg-[var(--status-info)] text-white border-transparent",
    결재권자: "bg-[var(--status-pending)] text-white border-transparent",
    관리자: "bg-primary text-white border-transparent",
  };

  const statusColors: Record<string, string> = {
    approved: "bg-[var(--status-approved)] text-white border-transparent",
    pending: "bg-[var(--status-pending)] text-white border-transparent",
    rejected: "bg-[var(--status-rejected)] text-white border-transparent",
    draft: "bg-muted text-muted-foreground border-transparent",
    canceled: "bg-muted text-muted-foreground border-transparent",
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Toaster />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm font-medium">보안 인증 정보를 확인 중입니다...</p>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="border-b border-border pb-4 mb-6 bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBackToDashboard} className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">마이페이지</h2>
              <p className="text-xs text-muted-foreground mt-0.5">본인의 시스템 이용 프로필과 활동 이력을 확인합니다.</p>
            </div>
          </div>
          <Button onClick={() => setIsPasswordModalOpen(true)} className="gap-2 shadow-sm">
            <KeyRound className="size-4" />
            비밀번호 변경
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="size-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-xl text-foreground">{userName}</span>
                    <div className="flex gap-1">
                      {((roles.length > 0 ? roles : ["실무 담당자"]) as string[]).map((role, idx) => (
                        <Badge key={idx} className={roleColors[role] || "bg-primary"}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground block">계정 가입일</span>
                <span className="text-sm font-medium text-foreground">{joinDate || "비공개"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="queries" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
            <TabsTrigger value="queries">RAG 질의 이력 ({ragQueries.length})</TabsTrigger>
            <TabsTrigger value="documents">업로드/요약 문서 ({documents.length})</TabsTrigger>
            <TabsTrigger value="drafts">기안·결재 이력 ({drafts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">RAG 문서 질의 이력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ragQueries.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">질의 이력이 없습니다.</p>
                ) : (
                  ragQueries.map((q) => {
                    const expanded = expandedQueryId === q.id;
                    return (
                      <div
                        key={q.id}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div
                          className="p-4 hover:bg-muted/30 transition-colors cursor-pointer flex items-start justify-between gap-2"
                          onClick={() => setExpandedQueryId(expanded ? null : q.id)}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">{q.query}</p>
                            <span className="text-xs text-muted-foreground">{q.timestamp}</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 shrink-0">
                            {expanded ? "▲" : "▼"}
                          </span>
                        </div>
                        {expanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
                            <p className="text-xs font-medium text-muted-foreground mb-2 mt-3">답변</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                              {q.answer ?? "저장된 답변이 없습니다."}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">업로드 및 요약 완료 문서</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">문서 제목</th>
                        <th className="px-4 py-3">카테고리</th>
                        <th className="px-4 py-3">업로드일</th>
                        <th className="px-4 py-3">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">업로드한 문서가 없습니다.</td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-border hover:bg-muted/20 transition-colors text-sm cursor-pointer" onClick={() => navigate(`/document/${doc.id}`)}>
                            <td className="px-4 py-3 font-medium text-foreground">{doc.title}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs font-normal">{doc.category}</Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{doc.date}</td>
                            <td className="px-4 py-3">
                              <Badge className="bg-[var(--status-approved)] text-white border-transparent text-xs">{doc.status}</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">기안 및 결재 문서 이력</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">제목</th>
                        <th className="px-4 py-3">일시</th>
                        <th className="px-4 py-3">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">기안 이력이 없습니다.</td>
                        </tr>
                      ) : (
                        drafts.map((draft) => (
                          <tr key={draft.id} className="border-b border-border hover:bg-muted/20 transition-colors text-sm cursor-pointer" onClick={() => navigate(`/draft/view/${draft.id}`)}>
                            <td className="px-4 py-3 font-medium text-foreground">{draft.title}</td>
                            <td className="px-4 py-3 text-muted-foreground">{draft.date}</td>
                            <td className="px-4 py-3">
                              <Badge className={`${statusColors[draft.status]} text-xs`}>{draft.statusLabel}</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PasswordChangeModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        email={userEmail}
        userId={userId}
      />
    </MainLayout>
  );
}
