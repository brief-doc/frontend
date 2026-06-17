import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MainLayout } from "../components/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
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
  const { userId } = useParams(); // URL 주소창에서 넘어오는 유저 ID 매개변수 (:userId)

  // 1. 상태 관리 정의 (실제 서버 응답을 담을 공간)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<any>(null);

  // 세션 정보 읽기 (현재 접속자가 관리자인지 파악하기 위함)
  const rawData = sessionStorage.getItem('user_session');
  const sessionData = rawData ? JSON.parse(rawData) : null;
  const myRoles: string[] = sessionData?.roles ?? [];

  const me = sessionData ? { name: sessionData.name, roles: myRoles } : null;

  // 로그인한 사람이 '관리자'이고 URL 패러미터에 특정 userId가 붙어있다면 관리자 상세 뷰로 판정
  const isAdminView = myRoles.includes("관리자") && userId;

  // 2. 컴포넌트가 마운트되거나 userId가 바뀔 때 백엔드 API 실제 호출
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 관리자 모드면 특정 user_id 쿼리를 붙이고, 일반 모드면 본인 조회 호출
        const url = userId
          ? `http://127.0.0.1:8000/users/activity?user_id=${userId}`
          : `http://127.0.0.1:8000/users/activity`;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 세션 쿠키 전송 허용
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => null);
          throw new Error(errBody?.detail || "사용자 활동 내역을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setActivityData(data); // 백엔드에서 받아온 UserActivityResponse를 상태에 반영
      } catch (err: any) {
        console.error("API Fetch Error:", err);
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [userId]);

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  const STATUS_LABEL: Record<string, string> = {
    draft: "임시저장", pending: "대기", approved: "승인", rejected: "반려", canceled: "취소",
  };

  const ragQueries: { id: number; query: string; timestamp: string }[] =
    (activityData?.rag_queries ?? []).map((q: any) => ({
      id: q.query_id,
      query: q.query_text,
      timestamp: formatDate(q.created_at),
    }));

  const drafts: { id: number; title: string; date: string; status: string; statusLabel: string }[] =
    (activityData?.drafts ?? []).map((d: any) => ({
      id: d.draft_id,
      title: d.title,
      date: formatDate(d.created_at),
      status: d.status,
      statusLabel: STATUS_LABEL[d.status] ?? d.status,
    }));

  const statusColors: Record<string, string> = {
    draft: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    review: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  // 로딩 중이거나 에러 상태일 때 화면 처리를 먼저 해줍니다. (방어 코드)
  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">사용자 데이터를 불러오는 중입니다...</div>;
  }

  if (error || !activityData?.user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-destructive font-semibold">{error || "유저 정보를 불러올 수 없습니다."}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-white rounded">뒤로 가기</button>
      </div>
    );
  }

  // 💡 가짜 유저 정보를 전면 제거하고 백엔드가 제공한 실제 엔티티 데이터 바인딩
  const userData = activityData.user;

  // =========================================================================
  // 🎨 핵심 UI 마크업 레이아웃
  // =========================================================================
  const MainContent = (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 상단 타이틀 바 및 뒤로가기 버튼 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">사용자 활동 내역</h1>
          <p className="text-sm text-muted-foreground">
            {isAdminView
              ? `[관리자 모드] ${userData.name} [${userData.roles?.join(", ") || ""}] 님의 시스템 활동 이력 조회`
              : "마이페이지 - 본인의 시스템 활동 내역을 확인합니다."
            }
          </p>
        </div>
      </div>

      {/* 사용자 카드 (백엔드 실제 정보 매핑) */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <User className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{userData.name}</span>
                  {userData.roles?.map((role: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {userData.email}
                </p>
              </div>
            </div>
            <div className="text-right sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground block">
                계정 등록일
              </span>
              <span className="text-sm font-medium text-foreground">
                {userData.joinDate || "비공개"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 인터페이스 */}
      <Tabs defaultValue="rag" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="rag">문서 질의 이력 ({ragQueries.length})</TabsTrigger>
          <TabsTrigger value="drafts">문서 초안 생성 ({drafts.length})</TabsTrigger>
        </TabsList>

        {/* 탭 콘텐츠 1: RAG 질의 이력 */}
        <TabsContent value="rag" className="mt-4 space-y-4">
          {ragQueries.map((item: any) => (
            <Card
              key={item.id}
              className="bg-card hover:bg-muted/10 transition-colors border-border"
            >
              <CardHeader className="p-4 pb-2">
                <span className="text-xs text-muted-foreground">
                  {item.timestamp}
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {item.query}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 탭 콘텐츠 2: 문서 초안 목록 */}
        <TabsContent value="drafts" className="mt-4">
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-semibold">
                      <th className="px-4 py-3">문서 제목</th>
                      <th className="px-4 py-3">생성 일시</th>
                      <th className="px-4 py-3">상태</th>
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
                          {draft.date}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[draft.status]}>
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
  );

  // 조건부 레이아웃 렌더링 스위치
  if (isAdminView) {
    return <MainLayout currentUser={me}>{MainContent}</MainLayout>;
  } else {
    return <div className="p-8 bg-background min-h-screen">{MainContent}</div>;
  }
}