import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Upload, FileText, Trash2, CheckCircle2 } from "lucide-react";

export default function DocumentSummary() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processingFile = {
    name: "감사원_처분요구서_2026.pdf",
    size: "24.3 MB",
    pages: 47,
    progress: 62,
    steps: [
      { label: "텍스트 추출", status: "completed" as const },
      { label: "부분 요약 (Map)", status: "processing" as const, current: 5, total: 8 },
      { label: "통합 요약 (Reduce)", status: "pending" as const },
      { label: "완료", status: "pending" as const },
    ],
  };

  const completedFile = {
    name: "신규_공모사업_지침.pdf",
    size: "8.1 MB",
    pages: 19,
    summary: [
      "○ 공모 대상: 가명정보 활용 데이터 분석 과제",
      "○ 신청 기간: 2026.06.15 ~ 07.15",
      "○ 지원 규모: 과제당 최대 5천만원",
      "○ 제출 서류: 사업계획서, 개인정보 처리방침",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h2 className="text-lg font-medium">문서 요약</h2>
          <Badge
            variant="outline"
            className="bg-muted border-border text-muted-foreground"
          >
            🔒 폐쇄망
          </Badge>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Upload className="size-8 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">
                  PDF를 끌어다 놓거나 파일을 선택하세요
                </p>
                <p className="text-sm text-muted-foreground">
                  최대 100MB
                </p>
              </div>
              <Button>파일 선택</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">처리 중</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="size-10 text-muted-foreground shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">
                      {processingFile.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {processingFile.size} · {processingFile.pages}페이지
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">진행 상태</span>
                  <span className="font-medium text-foreground">
                    {processingFile.progress}%
                  </span>
                </div>
                <Progress value={processingFile.progress} className="h-2" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {processingFile.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
                      step.status === "completed"
                        ? "bg-[var(--status-approved)]/10 text-[var(--status-approved)] border-[var(--status-approved)]/20"
                        : step.status === "processing"
                        ? "bg-[var(--status-info)]/10 text-[var(--status-info)] border-[var(--status-info)]/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {step.status === "completed" && "✓"}
                    {step.status === "processing" && "⟳"}
                    {step.status === "pending" && "○"}
                    <span>
                      {step.label}
                      {step.status === "processing" &&
                        ` · ${step.current}/${step.total}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">완료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="size-10 text-muted-foreground shrink-0 mt-1" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">
                        {completedFile.name}
                      </h4>
                      <Badge className="bg-[var(--status-approved)] text-white border-transparent">
                        <CheckCircle2 className="size-3 mr-1" />
                        요약 완료
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {completedFile.size} · {completedFile.pages}페이지
                    </p>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                    {completedFile.summary.map((line, idx) => (
                      <p key={idx} className="text-sm text-foreground">
                        {line}
                      </p>
                    ))}
                    <button className="text-sm text-primary hover:underline">
                      … 전문 보기
                    </button>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate("/draft/new")}
                  >
                    📄 이 요약으로 기안 작성 ↗
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
