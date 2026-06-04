import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, FileText, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
export default function DraftView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const draftDetail = {
    id: 1,
    title: "가명정보 처리 승인 요청",
    author: "김주무관",
    date: "2026.06.01 14:32",
    status: "pending" as const,
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

  const statusConfig = {
    pending: { label: "대기", color: "bg-[var(--status-pending)]" },
    approved: { label: "승인", color: "bg-[var(--status-approved)]" },
    rejected: { label: "반려", color: "bg-[var(--status-rejected)]" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header userName="김주무관" userRole="실무 담당자" notificationCount={2} />

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

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-medium text-foreground">
                  {draftDetail.title}
                </h1>
                <Badge className={`${statusConfig[draftDetail.status].color} text-white border-transparent`}>
                  {statusConfig[draftDetail.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {draftDetail.author} · {draftDetail.date}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                첨부 근거
              </h3>
              <Card className="bg-muted/30">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {draftDetail.source.name}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {draftDetail.sourceSummary.map((line, idx) => (
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
              {isEditing ? (
                <Textarea
                  defaultValue={draftDetail.content}
                  className="min-h-[200px] bg-input-background"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {draftDetail.content}
                  </p>
                </div>
              )}
            </div>

            {draftDetail.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditing(false)}
                    >
                      취소
                    </Button>
                    <Button className="flex-1" onClick={() => {
                      setIsEditing(false);
                      toast.success("기안이 수정되었습니다.");
                    }}>
                      저장
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => {
                        if (confirm("기안을 취소하시겠습니까?")) {
                          alert("기안이 취소되었습니다.");
                          navigate("/staff/dashboard");
                        }
                      }}
                    >
                      기안 취소
                    </Button>
                  </>
                )}
              </div>
            )}

            {draftDetail.status === "rejected" && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-destructive mb-2">반려 사유</h4>
                <p className="text-sm text-foreground">
                  개인정보 보호 조치에 대한 구체적인 계획이 부족합니다. 가명처리 방식과 접근 권한 관리 방안을 추가로 작성해주시기 바랍니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
