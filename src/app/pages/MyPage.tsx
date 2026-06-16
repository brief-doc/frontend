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

export default function MyPage() {
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. 세션 정보 읽기 (안전한 예외 처리 적용)
  const rawData = sessionStorage.getItem('user_session');
  const sessionData = rawData ? JSON.parse(rawData) : null;

  // 💡 sessionData가 null이어도 하단 가짜 데이터나 마크업이 터지지 않도록 완벽히 방어합니다.
  const roles: string[] = sessionData?.roles ?? [];
  const userName = sessionData?.user_name ?? sessionData?.name ?? "사용자";
  const userEmail = sessionData?.email ?? "no-reply@example.com";
  const userId = sessionData?.id ?? null;

  // 🔒 [보안 가드] 로그인 여부 검증 및 무한루프 방지
  useEffect(() => {
    if (!sessionData) {
      // 불완전하게 남아있을 수 있는 잔여 세션 데이터 청소
      sessionStorage.clear();

      // 💡 흰 화면에 갇히는 걸 막기 위해 알림을 띄우고 즉시 replace 모드로 튕겨냅니다.
      toast.error("로그인이 필요한 페이지입니다. 로그인 화면으로 이동합니다.");
      navigate("/", { replace: true });
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]); // 의존성 배열을 비워 무한 렌더링 스노우볼 차단

  // 사용자의 권한에 맞는 대시보드로 안전 리다이렉트
  const handleBackToDashboard = () => {
    if (roles.includes("관리자")) {
      navigate("/admin/dashboard");
    } else if (roles.includes("결재권자")) {
      navigate("/staff/dashboard/approver");
    } else {
      navigate("/staff/dashboard");
    }
  };

  // 2. 템플릿용 가짜 데이터 정의
  const ragQueries = [
    { id: 1, query: "가명정보 결합 시 안전성 확보 조치는 무엇인가요?", timestamp: "2026.06.02 14:32", sources: 3 },
    { id: 2, query: "개인정보 처리방침 수립 시 필수 포함 사항은?", timestamp: "2026.06.01 10:15", sources: 2 },
    { id: 3, query: "데이터 결합 신청 절차", timestamp: "2026.05.30 16:20", sources: 4 },
  ];

  const documents = [
    { id: 1, title: "신규_공모사업_지침", category: "공모사업", uploadDate: "2026.06.01", status: "요약 완료" },
    { id: 2, title: "감사원_처분요구서_2026", category: "감사", uploadDate: "2026.05.30", status: "요약 완료" },
    { id: 3, title: "가명정보_처리_가이드라인", category: "가이드라인", uploadDate: "2026.05.28", status: "요약 완료" },
  ];

  const drafts = [
    { id: 1, title: "데이터 결합 가이드 검토", type: "기안", date: "2026.06.01", status: "approved", statusLabel: "승인" },
    { id: 2, title: "가명정보 처리 승인 요청", type: "기안", date: "2026.06.01", status: "pending", statusLabel: "대기" },
    { id: 3, title: "감사원 처분요구서 대응", type: "기안", date: "2026.05.30", status: "rejected", statusLabel: "반려" },
  ];

  const roleColors: Record<string, string> = {
    "실무 담당자": "bg-[var(--status-info)] text-white border-transparent",
    결재권자: "bg-[var(--status-pending)] text-white border-transparent",
    관리자: "bg-primary text-white border-transparent",
  };

  const statusColors: Record<string, string> = {
    approved: "bg-[var(--status-approved)] text-white border-transparent",
    pending: "bg-[var(--status-pending)] text-white border-transparent",
    rejected: "bg-[var(--status-rejected)] text-white border-transparent",
  };

  // 💡 [안전 장치] 아직 로그인 여부가 확인되지 않은 상태라면 가벼운 로딩 스피너만 노출합니다.
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
                  <div className="space-y-0.5 text-sm text-muted-foreground">
                    <p>{userEmail}</p>
                    <p className="text-xs text-slate-400">개인정보보호과 · 주무관</p>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground block">계정 가입일</span>
                <span className="text-sm font-medium text-foreground">2025.03.15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 인터페이스 영역 */}
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
                {ragQueries.map((query) => (
                  <div key={query.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">{query.query}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{query.timestamp}</span>
                          <span>·</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">출처 {query.sources}건</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b border-border hover:bg-muted/20 transition-colors text-sm">
                          <td className="px-4 py-3 font-medium text-foreground">{doc.title}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs font-normal">{doc.category}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{doc.uploadDate}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-[var(--status-approved)] text-white border-transparent text-xs">{doc.status}</Badge>
                          </td>
                        </tr>
                      ))}
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
                        <th className="px-4 py-3">유형</th>
                        <th className="px-4 py-3">일시</th>
                        <th className="px-4 py-3">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.map((draft) => (
                        <tr key={draft.id} className="border-b border-border hover:bg-muted/20 transition-colors text-sm">
                          <td className="px-4 py-3 font-medium text-foreground">{draft.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{draft.type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{draft.date}</td>
                          <td className="px-4 py-3">
                            <Badge className={`${statusColors[draft.status]} text-xs`}>{draft.statusLabel}</Badge>
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

      <PasswordChangeModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        email={userEmail}
        userId={userId}
      />
    </MainLayout>
  );
}