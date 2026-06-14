import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import {
  uploadDocument,
  listJobs,
  cancelJob,
  isActive,
  filenameFromPath,
  STAGE_PROGRESS,
  STAGE_LABEL,
  type PipelineJob,
} from "../api/pipeline";
import { getDocumentDetail } from "../api/document";

// 단계 순서 (진행 표시용)
const STAGE_ORDER = ["uploaded", "ocr", "embedding", "summarizing", "completed"];

function StageSteps({ stage }: { stage: string | null }) {
  const current = stage ?? "uploaded";
  const steps = [
    { key: "ocr", label: "텍스트 추출" },
    { key: "embedding", label: "임베딩" },
    { key: "summarizing", label: "요약" },
    { key: "completed", label: "완료" },
  ];
  const currentIdx = STAGE_ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((step) => {
        const stepIdx = STAGE_ORDER.indexOf(step.key);
        const done = stepIdx < currentIdx || current === "completed";
        const active = step.key === current || (current === "uploaded" && step.key === "ocr");
        return (
          <div
            key={step.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
              done
                ? "bg-[var(--status-approved)]/10 text-[var(--status-approved)] border-[var(--status-approved)]/20"
                : active
                ? "bg-[var(--status-info)]/10 text-[var(--status-info)] border-[var(--status-info)]/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {done ? "✓" : active ? "⟳" : "○"}
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DocumentSummary() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawData = sessionStorage.getItem("user_session");
  const sessionData = rawData ? JSON.parse(rawData) : null;

  // SSE pipeline_progress 이벤트 수신 → 해당 Job 단계 업데이트
  const handlePipelineProgress = useCallback(
    (event: { job_id: number; stage: string }) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.job_id === event.job_id
            ? {
                ...j,
                pipeline_stage: event.stage,
                job_status:
                  event.stage === "completed"
                    ? "completed"
                    : event.stage === "failed"
                    ? "failed"
                    : event.stage === "cancelled"
                    ? "cancelled"
                    : "running",
              }
            : j,
        ),
      );
    },
    [],
  );

  const { notifications, markRead } = useNotifications(handlePipelineProgress);

  // 마운트 시 기존 Job 목록 로드
  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch(() => {});
  }, []);

  // 완료된 Job의 요약문 로드
  useEffect(() => {
    const completed = jobs.filter(
      (j) => j.job_status === "completed" && j.doc_id && !summaries[j.job_id],
    );
    completed.forEach((j) => {
      getDocumentDetail(j.doc_id!)
        .then((doc) =>
          setSummaries((prev) => ({ ...prev, [j.job_id]: doc.summary ?? "" })),
        )
        .catch(() => {});
    });
  }, [jobs]);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      toast.error("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    setUploading(true);
    try {
      const job = await uploadDocument(file);
      setJobs((prev) => [job, ...prev]);
      toast.success(`'${file.name}' 업로드 완료 — 처리 중입니다.`);
    } catch {
      toast.error("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleCancel = async (jobId: number) => {
    try {
      const updated = await cancelJob(jobId);
      setJobs((prev) => prev.map((j) => (j.job_id === jobId ? updated : j)));
      toast("처리가 취소되었습니다.");
    } catch {
      toast.error("취소 요청 중 오류가 발생했습니다.");
    }
  };

  const activeJobs = jobs.filter(isActive);
  const doneJobs = jobs.filter((j) => j.job_status === "completed");
  const failedJobs = jobs.filter(
    (j) => j.job_status === "failed" || j.job_status === "cancelled",
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header
        userName={sessionData?.name ?? "사용자"}
        userRole={sessionData?.roles?.[0] ?? "실무 담당자"}
        notifications={notifications}
        notificationCount={notifications.filter((n) => n.unread).length}
        onMarkNotificationRead={markRead}
      />

      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/staff/dashboard")}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-medium">문서 요약</h2>
          <Badge variant="outline" className="bg-muted border-border text-muted-foreground">
            🔒 폐쇄망
          </Badge>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
        {/* ── 업로드 영역 ── */}
        <Card>
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center space-y-3 transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex justify-center">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Upload className="size-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-foreground font-medium mb-0.5">
                  PDF를 끌어다 놓거나 파일을 선택하세요
                </p>
                <p className="text-sm text-muted-foreground">최대 100MB</p>
              </div>
              <Button
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "업로드 중..." : "파일 선택"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── 처리 중 ── */}
        {activeJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">처리 중</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeJobs.map((job) => {
                const stage = job.pipeline_stage ?? "uploaded";
                const progress = STAGE_PROGRESS[stage] ?? 0;
                const filename = filenameFromPath(job.file_path);
                return (
                  <div key={job.job_id} className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="size-10 text-muted-foreground shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {STAGE_LABEL[stage] ?? "처리 중"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleCancel(job.job_id)}
                      >
                        <X className="size-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                    </div>

                    <StageSteps stage={stage} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── 완료 ── */}
        {doneJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">완료</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {doneJobs.map((job) => {
                const filename = filenameFromPath(job.file_path);
                const summary = job.doc_id ? summaries[job.job_id] : "";
                return (
                  <div key={job.job_id} className="flex items-start gap-3">
                    <FileText className="size-10 text-muted-foreground shrink-0 mt-1" />
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{filename}</p>
                        <Badge className="bg-[var(--status-approved)] text-white border-transparent shrink-0">
                          <CheckCircle2 className="size-3 mr-1" />
                          요약 완료
                        </Badge>
                      </div>

                      {summary && (
                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {summary}
                          </p>
                        </div>
                      )}

                      {job.doc_id && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/document/${job.doc_id}`)}
                          >
                            전문 보기
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate("/draft/new", {
                                state: {
                                  sourceDocId: job.doc_id,
                                  sourceDocName: filename,
                                  sourceSummary: summary,
                                },
                              })
                            }
                          >
                            📄 이 요약으로 기안 작성
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── 실패 / 취소 ── */}
        {failedJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">실패 / 취소</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {failedJobs.map((job) => {
                const filename = filenameFromPath(job.file_path);
                return (
                  <div key={job.job_id} className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.job_status === "cancelled"
                          ? "취소됨"
                          : job.error_message ?? "처리 중 오류가 발생했습니다."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 아무 Job도 없을 때 */}
        {jobs.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            업로드된 문서가 없습니다.
          </p>
        )}
      </main>
    </div>
  );
}
