import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { createDraft, updateDraft, getDraftDetail } from "../api/draft";
import { getDocumentDetail } from "../api/document";
import { getUsersAPI, type UserListItem } from "../api/auth";

export default function DraftCreation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 첨부 근거 문서
  const [sourceDocId, setSourceDocId] = useState<number | null>(
    location.state?.sourceDocId ?? null
  );
  const [sourceDocName, setSourceDocName] = useState<string | null>(
    location.state?.sourceDocName ?? null
  );
  const [sourceSummary, setSourceSummary] = useState<string | null>(
    location.state?.sourceSummary ?? null
  );
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // 결재권자
  const [approverId, setApproverId] = useState<number | null>(null);
  const [approverList, setApproverList] = useState<UserListItem[]>([]);

  // 임시저장 후 draft_id 추적 (URL param과 별도로 관리해 재조회 루프 방지)
  const currentDraftId = useRef<number | null>(id ? Number(id) : null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 결재권자 목록 로드 (결재권자 역할 + 본인 제외)
  useEffect(() => {
    const raw = sessionStorage.getItem("user_session");
    const currentUserId: number | undefined = raw ? JSON.parse(raw)?.id : undefined;
    getUsersAPI()
      .then((users) =>
        setApproverList(
          users.filter(
            (u) => u.roles.includes("결재권자") && u.id !== currentUserId
          )
        )
      )
      .catch(() => { /* 무시 */ });
  }, []);

  // 편집 모드: 기존 기안 데이터 로드
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDraftDetail(Number(id))
      .then(async (data) => {
        setTitle(data.title);
        setContent(data.content);
        currentDraftId.current = data.draft_id;
        if (data.approver_id) setApproverId(data.approver_id);
        if (data.source_doc_id) {
          setSourceDocId(data.source_doc_id);
          try {
            const doc = await getDocumentDetail(data.source_doc_id);
            setSourceDocName(doc.title);
            setSourceSummary(doc.summary);
          } catch {
            // 첨부 문서 조회 실패 시 ID만 유지
          }
        }
      })
      .catch(() => toast.error("기안 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (action: "save" | "submit") => {
    if (!title.trim()) {
      toast.error("기안 제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("본문을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const params = {
        title,
        content,
        action,
        ...(sourceDocId ? { source_doc_id: sourceDocId } : {}),
        ...(approverId ? { approver_id: approverId } : {}),
      };

      if (currentDraftId.current) {
        // 기존 기안 수정
        await updateDraft(currentDraftId.current, params);
      } else {
        // 신규 기안 생성
        const created = await createDraft(params);
        currentDraftId.current = created.draft_id;
      }

      if (action === "submit") {
        toast.success("기안이 상신되었습니다.");
        navigate("/staff/dashboard");
      } else {
        // 임시저장: 페이지에 머뭄
        toast.success("임시저장 되었습니다.");
      }
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetachSource = () => {
    setSourceDocId(null);
    setSourceDocName(null);
    setSourceSummary(null);
  };

  const rawData = sessionStorage.getItem("user_session");
  const sessionData = rawData ? JSON.parse(rawData) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header
        userName={sessionData?.name ?? "사용자"}
        userRole={sessionData?.roles?.[0] ?? "실무 담당자"}
      />

      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/staff/dashboard")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-medium">{id ? "기안 수정" : "기안 작성"}</h2>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
        {/* 첨부 근거 카드 */}
        {sourceDocId && sourceDocName && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📎 근거:</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <FileText className="size-4" />
                    <span className="font-medium">{sourceDocName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {sourceSummary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setSummaryExpanded((v) => !v)}
                    >
                      {summaryExpanded
                        ? <ChevronUp className="size-4" />
                        : <ChevronDown className="size-4" />}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={handleDetachSource}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* 요약문 내용 */}
              {sourceSummary && summaryExpanded && (
                <div className="mt-2 border-t border-border pt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">요약 내용</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {sourceSummary}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 mt-1"
                    onClick={() => setContent((prev) => prev ? `${prev}\n\n${sourceSummary}` : sourceSummary!)}
                  >
                    본문에 삽입
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">기안 제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="기안 제목을 입력하세요"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">결재권자</Label>
              <select
                id="approver"
                value={approverId ?? ""}
                onChange={(e) =>
                  setApproverId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">결재권자를 선택하세요</option>
                {approverList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">본문</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상신 내용을 작성하세요."
                className="bg-input-background min-h-[300px] resize-y"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                disabled={submitting}
                onClick={() => handleSubmit("save")}
              >
                임시저장
              </Button>
              <Button
                className="flex-1"
                disabled={submitting}
                onClick={() => handleSubmit("submit")}
              >
                상신
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              상신 시 결재자에게 알림이 전송됩니다
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
