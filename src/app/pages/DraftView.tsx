import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../components/Header";
import { useNotifications } from "../hooks/useNotifications";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import ConfirmModal from "../components/ui/confirm-modal";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { getDraftDetail, cancelDraft, formatDate } from "../api/draft";
import { getDocumentDetail } from "../api/document";
import type { DraftDetail } from "../types/draft";
import type { DocDetailItem } from "@/types/document";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:    { label: "임시저장", className: "bg-muted text-muted-foreground border-transparent" },
  pending:  { label: "대기",    className: "bg-[var(--status-pending)] text-white border-transparent" },
  approved: { label: "승인",    className: "bg-[var(--status-approved)] text-white border-transparent" },
  rejected: { label: "반려",    className: "bg-[var(--status-rejected)] text-white border-transparent" },
  canceled: { label: "취소",    className: "bg-muted text-muted-foreground border-transparent" },
};

export default function DraftView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [sourceDoc, setSourceDoc] = useState<DocDetailItem | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDraftDetail(Number(id))
      .then((data) => {
        setDraft(data);
        if (data.source_doc_id) {
          getDocumentDetail(data.source_doc_id)
            .then(setSourceDoc)
            .catch(() => {});
        }
      })
      .catch(() => toast.error("기안 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancelConfirm = async () => {
    if (!id) return;
    setCanceling(true);
    try {
      await cancelDraft(Number(id));
      setIsCancelModalOpen(false);
      toast.success("기안이 취소되었습니다.");
      navigate("/staff/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "기안 취소에 실패했습니다.";
      toast.error(msg);
      setIsCancelModalOpen(false);
    } finally {
      setCanceling(false);
    }
  };

  const { notifications, markRead } = useNotifications();

  const rawData = sessionStorage.getItem("user_session");
  const sessionData = rawData ? JSON.parse(rawData) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        기안을 찾을 수 없습니다.
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[draft.status] ?? STATUS_CONFIG.draft;

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header
        userName={sessionData?.name ?? "사용자"}
        userRole={sessionData?.roles?.[0] ?? "실무 담당자"}
        notifications={notifications}
        onMarkNotificationRead={markRead}
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
          <h2 className="text-lg font-medium">기안 상세</h2>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-4">
        {/* 첨부 근거 문서 카드 */}
        {sourceDoc && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📎 근거:</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <FileText className="size-4" />
                    <span className="font-medium">{sourceDoc.title}</span>
                  </div>
                </div>
                {sourceDoc.summary && (
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
              </div>

              {summaryExpanded && sourceDoc.summary && (
                <div className="mt-2 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">요약 내용</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {sourceDoc.summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* 제목 + 상태 배지 */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-medium text-foreground">{draft.title}</h1>
                <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(draft.created_at)}</p>
            </div>

            {/* 상신 내용 */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">상신 내용</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {draft.content}
                </p>
              </div>
            </div>

            {/* 반려 사유 (rejected 상태일 때만) */}
            {draft.status === "rejected" && draft.reject_reason && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-destructive mb-2">반려 사유</h4>
                <p className="text-sm text-foreground">{draft.reject_reason}</p>
              </div>
            )}

            {/* 결재일 (approved/rejected) */}
            {draft.decided_at && (
              <p className="text-xs text-muted-foreground">
                결재일: {formatDate(draft.decided_at)}
              </p>
            )}

            {/* status별 액션 버튼 */}
            {draft.status === "draft" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/draft/${draft.draft_id}`)}
                >
                  수정하기
                </Button>
              </div>
            )}

            {draft.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                  disabled={canceling}
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  기안 취소
                </Button>
              </div>
            )}

            {draft.status === "rejected" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/draft/${draft.draft_id}`)}
                >
                  수정 후 재상신
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="기안 취소"
        description="기안을 취소하시겠습니까? 취소된 기안은 복구할 수 없습니다."
        confirmText={canceling ? "처리 중..." : "취소하기"}
        cancelText="닫기"
        variant="destructive"
      />
    </div>
  );
}
