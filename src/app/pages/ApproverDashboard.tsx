import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { StatusBadge } from "../components/StatusBadge";
import { Badge } from "../components/ui/badge";
import { FileText, ChevronRight } from "lucide-react";
import ConfirmModal from "../components/ui/confirm-modal";
import toast, { Toaster } from "react-hot-toast";
import { getApprovalList, getApprovalDetail, postDecision } from "../api/draft";
import type { ApprovalListItem, ApprovalDetail } from "../types/draft";

const LIMIT = 3;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd} ${hh}:${min}`;
}

export default function ApproverDashboard() {
  const navigate = useNavigate();

  // 목록 상태
  const [approvalList, setApprovalList] = useState<ApprovalListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(false);

  // 상세 상태
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 결재 처리 상태
  const [deciding, setDeciding] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // 목록 로드
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const skip = (page - 1) * LIMIT;
      const res = await getApprovalList({ skip, limit: LIMIT });
      setApprovalList(res.items);
      setTotalCount(res.total_count);
      if (selectedId && !res.items.find((i) => i.draft_id === selectedId)) {
        setSelectedId(null);
        setDetail(null);
      }
    } catch {
      toast.error("결재 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingList(false);
    }
  }, [page, selectedId]);

  useEffect(() => {
    fetchList();
  }, [page]);

  useEffect(() => {
    const id = setInterval(fetchList, 15000);
    return () => clearInterval(id);
  }, [fetchList]);

  // 상세 로드
  useEffect(() => {
    if (!selectedId) return;
    setLoadingDetail(true);
    setDetail(null);
    setShowRejectForm(false);
    setRejectReason("");
    getApprovalDetail(selectedId)
      .then(setDetail)
      .catch(() => toast.error("기안 상세를 불러오지 못했습니다."))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const handleApproveConfirm = async () => {
    if (!selectedId) return;
    setDeciding(true);
    try {
      await postDecision(selectedId, { action: "approved" });
      toast.success("기안이 승인되었습니다.");
      setShowApproveModal(false);
      setSelectedId(null);
      setDetail(null);
      await fetchList();
    } catch {
      toast.error("승인 처리 중 오류가 발생했습니다.");
    } finally {
      setDeciding(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedId) return;
    if (!rejectReason.trim()) {
      toast.error("반려 사유를 입력해주세요.");
      return;
    }
    setDeciding(true);
    try {
      await postDecision(selectedId, { action: "rejected", reject_reason: rejectReason });
      toast.success("기안이 반려되었습니다.");
      setShowRejectForm(false);
      setRejectReason("");
      setSelectedId(null);
      setDetail(null);
      await fetchList();
    } catch {
      toast.error("반려 처리 중 오류가 발생했습니다.");
    } finally {
      setDeciding(false);
    }
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <MainLayout>
      <Toaster />
      <div className="grid grid-cols-5 gap-6">
        {/* 결재 대기 목록 */}
        <div className="col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>결재 대기</CardTitle>
                <Badge className="bg-[var(--status-pending)] text-white border-transparent">
                  {totalCount}건
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingList ? (
                <p className="text-sm text-muted-foreground text-center py-6">로딩 중...</p>
              ) : approvalList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">결재 대기 중인 기안이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {approvalList.map((draft) => (
                    <div
                      key={draft.draft_id}
                      onClick={() => setSelectedId(draft.draft_id)}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedId === draft.draft_id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <h4 className="font-medium text-foreground truncate">{draft.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {draft.author_name} · {formatDateTime(draft.created_at)}
                        </p>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>이전</Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>다음</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 기안 상세 */}
        <div className="col-span-3">
          <Card>
            {!selectedId ? (
              <CardContent className="py-16 text-center text-muted-foreground text-sm">좌측 목록에서 기안을 선택해주세요</CardContent>
            ) : loadingDetail ? (
              <CardContent className="py-16 text-center text-muted-foreground text-sm">로딩 중...</CardContent>
            ) : detail ? (
              <>
                <CardHeader className="pb-4">
                  <div className="space-y-1">
                    <CardTitle>{detail.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{detail.author_name} · {formatDateTime(detail.created_at)}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ... (생략: 상세 내용 및 액션 버튼은 이전과 동일) */}
                  <p className="text-xs text-muted-foreground text-center">결정 결과는 기안자에게 알림으로 전송됩니다</p>
                </CardContent>
              </>
            ) : null}
          </Card>
        </div>
      </div>
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveConfirm}
        title="기안 승인"
        description={`'${detail?.title}'\n\n위 기안을 승인하시겠습니까?`}
        confirmText="승인"
        cancelText="취소"
        variant="default"
      />
    </MainLayout>
  );
}