import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { StatusBadge } from "../components/StatusBadge";
import { Badge } from "../components/ui/badge";
import { FileText, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ApproverDashboard() {
  const navigate = useNavigate();
  const [selectedDraft, setSelectedDraft] = useState(1);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const pendingDrafts = [
    {
      id: 1,
      title: "가명정보 처리 승인 요청",
      author: "김주무관",
      date: "2026.06.01 14:32",
    },
    {
      id: 2,
      title: "데이터 결합 신청 건",
      author: "김주무관",
      date: "2026.06.01 09:15",
    },
    {
      id: 3,
      title: "개인정보 처리지침 개정안",
      author: "이대리",
      date: "2026.05.31 16:20",
    },
  ];

  const selectedDraftDetail = {
    id: 1,
    title: "가명정보 처리 승인 요청",
    author: "김주무관",
    date: "2026.06.01 14:32",
    source: {
      type: "summary",
      name: "신규_공모사업_지침.pdf 요약",
    },
    sourceSummary: [
      "○ 공모 대상: 가명정보 활용 데이터 분석 과제",
      "○ 신청 기간: 2026.06.15 ~ 07.15",
      "○ 지원 규모: 과제당 최대 5천만원",
      "○ 제출 서류: 사업계획서, 개인정보 처리방침",
    ],
    content:
      "표기된 공모사업 참여를 위해 우리 기관 보유 가명정보의 활용 승인을 요청드립니다.\n\n본 공모사업은 가명정보를 활용한 데이터 분석 과제로, 개인정보 보호법 제28조의2에 따라 적법하게 처리된 가명정보를 활용할 수 있습니다. 첨부된 지침에 따르면 신청 기간은 2026.06.15부터 07.15까지이며, 과제당 최대 5천만원이 지원됩니다.\n\n가명정보 처리 가이드라인 제5장에 명시된 안전성 확보 조치를 준수하여 진행할 예정이며, 결합전문기관을 통한 처리를 계획하고 있습니다.",
  };

  const handleApprove = () => {
    toast.success("기안이 승인되었습니다.");
    navigate("/approver/dashboard");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("반려 사유를 입력해주세요.");
      return;
    }
    toast.error("기안이 반려되었습니다.");
    setShowRejectForm(false);
    setRejectReason("");
  };

  const notifications = [
    {
      id: 1,
      message: "새로운 기안 '가명정보 처리 승인 요청'이 상신되었습니다",
      time: "10분 전",
      unread: true,
      link: "/approver/dashboard",
    },
    {
      id: 2,
      message: "'데이터 결합 신청 건' 기안이 상신되었습니다",
      time: "1시간 전",
      unread: true,
      link: "/approver/dashboard",
    },
    {
      id: 3,
      message: "시스템 공지: 정기 점검이 예정되어 있습니다",
      time: "2시간 전",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header
        userName="박과장"
        userRole="결재권자 · 실무 담당자"
        notifications={notifications}
        showAdminMenu={true}
        isApproverPage={true}
      />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>결재 대기</CardTitle>
                  <Badge className="bg-[var(--status-pending)] text-white border-transparent">
                    {pendingDrafts.length}건
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => setSelectedDraft(draft.id)}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDraft === draft.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <h4 className="font-medium text-foreground truncate">
                            {draft.title}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {draft.author} · {draft.date}
                        </p>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-3">
            <Card>
              <CardHeader className="pb-4">
                <div className="space-y-1">
                  <CardTitle>{selectedDraftDetail.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedDraftDetail.author} ·{" "}
                    {selectedDraftDetail.date}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    첨부 근거
                  </h3>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {selectedDraftDetail.source.name}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        {selectedDraftDetail.sourceSummary.map((line, idx) => (
                          <p key={idx} className="text-foreground">
                            {line}
                          </p>
                        ))}
                      </div>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        원문 보기
                        <ChevronRight className="size-3" />
                      </button>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    상신 내용
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedDraftDetail.content}
                    </p>
                  </div>
                </div>

                {!showRejectForm ? (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => setShowRejectForm(true)}
                    >
                      반려
                    </Button>
                    <Button
                      className="flex-1 bg-[var(--status-approved)] hover:bg-[var(--status-approved)]/90"
                      onClick={handleApprove}
                    >
                      승인
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="reject-reason">반려 사유</Label>
                      <Textarea
                        id="reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="반려 사유를 입력하세요..."
                        className="bg-input-background min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason("");
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        className="flex-1 bg-destructive hover:bg-destructive/90"
                        onClick={handleReject}
                      >
                        반려 확정
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  결정 결과는 기안자에게 알림으로 전송됩니다
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
