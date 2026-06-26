import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Upload, FileText, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { subscribeSSE } from "../api/notification";
import {
  uploadDocument,
  cancelJob,
  getJob,
  listJobs,
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${done
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
  const location = useLocation();

  const locationState = location.state as { docId?: number } | null;
  const selectedDocId = locationState?.docId ?? null;

  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [extractedTexts, setExtractedTexts] = useState<Record<number, string>>({});
  const [summaryTexts, setSummaryTexts] = useState<Record<number, string>>({});
  const [streamingTokens, setStreamingTokens] = useState<Record<number, string>>({});
  const [selectedDocContent, setSelectedDocContent] = useState("");
  const [selectedDocSummary, setSelectedDocSummary] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // SSE summary_token 이벤트 수신 → 스트리밍 요약 누적
  const handleSummaryToken = useCallback(
    (event: { job_id: number; token: string }) => {
      setStreamingTokens((prev) => ({
        ...prev,
        [event.job_id]: (prev[event.job_id] ?? "") + event.token,
      }));
    },
    [],
  );

  // 이 화면은 알림 목록이 필요 없고 파이프라인 진행 이벤트만 필요하므로 경량 SSE만 구독
  useEffect(() => {
    const es = subscribeSSE(() => { }, undefined, handlePipelineProgress, handleSummaryToken);
    return () => es.close();
  }, [handlePipelineProgress, handleSummaryToken]);

  // StaffDashboard에서 넘어온 문서(docId)는 즉시 원문/요약 조회
  useEffect(() => {
    if (!selectedDocId) return;

    getDocumentDetail(selectedDocId)
      .then((doc) => {
        setSelectedDocContent(doc.content ?? "");
        setSelectedDocSummary(doc.summary ?? "");
      })
      .catch(() => {
        setSelectedDocContent("");
        setSelectedDocSummary("");
      });
  }, [selectedDocId]);

  // StaffDashboard에서 넘어온 문서(docId)에 해당하는 파이프라인 Job을 연결
  // 요약중 문서는 이 화면에서도 현재 단계/취소 버튼을 동일하게 사용할 수 있어야 함
  useEffect(() => {
    if (!selectedDocId) return;

    listJobs()
      .then((allJobs) => {
        const matched = allJobs.find((j) => j.doc_id === selectedDocId);
        if (!matched) return;

        setJobs([matched]);
        setCurrentJobId(matched.job_id);
      })
      .catch(() => { });
  }, [selectedDocId]);

  // SSE는 stage 중심이라 doc_id 반영이 늦을 수 있어 현재 작업 상세를 주기적으로 동기화
  useEffect(() => {
    if (currentJobId === null) return;

    let cancelled = false;

    const syncCurrentJob = async () => {
      try {
        const latest = await getJob(currentJobId);
        if (cancelled) return;

        setJobs((prev) => {
          const idx = prev.findIndex((j) => j.job_id === currentJobId);
          if (idx === -1) return [latest, ...prev];

          const next = [...prev];
          next[idx] = { ...next[idx], ...latest };
          return next;
        });

        const done =
          latest.job_status === "completed" ||
          latest.job_status === "failed" ||
          latest.job_status === "cancelled";

        if (done) {
          clearInterval(intervalId);
        }
      } catch {
        // 네트워크 일시 오류는 다음 주기에 재시도
      }
    };

    syncCurrentJob();
    const intervalId = setInterval(syncCurrentJob, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [currentJobId]);

  // OCR 이후 doc_id가 생기면 원문/요약본을 로드해 화면에 표시
  useEffect(() => {
    if (currentJobId === null) return;

    // undefined 체크: 빈 문자열("")도 falsy라 무한 호출되므로 한 번이라도 fetch했으면 재호출 안 함
    const textReady = jobs.filter(
      (j) =>
        j.job_id === currentJobId &&
        !!j.doc_id &&
        j.job_status !== "failed" &&
        j.job_status !== "cancelled" &&
        j.pipeline_stage !== "summarizing" &&
        (extractedTexts[j.job_id] === undefined || summaryTexts[j.job_id] === undefined),
    );

    textReady.forEach((j) => {
      getDocumentDetail(j.doc_id!)
        .then((doc) => {
          setExtractedTexts((prev) => ({ ...prev, [j.job_id]: doc.content ?? "" }));
          setSummaryTexts((prev) => ({ ...prev, [j.job_id]: doc.summary ?? "" }));

          if (selectedDocId && j.doc_id === selectedDocId) {
            setSelectedDocContent(doc.content ?? "");
            setSelectedDocSummary(doc.summary ?? "");
          }
        })
        .catch(() => { });
    });
  }, [jobs, extractedTexts, summaryTexts, currentJobId, selectedDocId]);

  const handleUpload = useCallback(async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const allowedExt = [".pdf", ".docx", ".hwp"];
    const hasAllowedExt = allowedExt.some((ext) => lowerName.endsWith(ext));

    if (!hasAllowedExt) {
      toast.error("PDF, DOCX, HWP 파일만 업로드할 수 있습니다.");
      return;
    }
    setUploading(true);
    try {
      // 새 업로드를 시작하면 이전 화면 결과는 비우고 현재 파일 기준으로 다시 시작
      setJobs([]);
      setCurrentJobId(null);
      setExtractedTexts({});
      setSummaryTexts({});
      setSelectedDocContent("");
      setSelectedDocSummary("");

      const job = await uploadDocument(file);
      setCurrentJobId(job.job_id);
      setJobs([job]);
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
  const currentActiveJob = activeJobs.find((j) => j.job_id === currentJobId);
  const currentExtractedJob = jobs.find(
    (j) =>
      j.job_id === currentJobId &&
      !!j.doc_id &&
      j.job_status !== "failed" &&
      j.job_status !== "cancelled" &&
      !!extractedTexts[j.job_id]?.trim(),
  );
  const currentSummaryJob = jobs.find(
    (j) =>
      j.job_id === currentJobId &&
      !!j.doc_id &&
      j.job_status !== "failed" &&
      j.job_status !== "cancelled" &&
      !!summaryTexts[j.job_id]?.trim(),
  );

  const currentOriginalText = currentExtractedJob
    ? extractedTexts[currentExtractedJob.job_id] ?? ""
    : "";

  const currentJob = jobs.find((j) => j.job_id === currentJobId);
  const isStreaming = currentJob?.pipeline_stage === "summarizing" && !!streamingTokens[currentJobId ?? -1];

  const currentSummaryText = isStreaming
    ? streamingTokens[currentJobId!]
    : currentSummaryJob
      ? summaryTexts[currentSummaryJob.job_id] ?? ""
      : "";

  const displayOriginalText = selectedDocId
    ? (selectedDocContent || currentOriginalText)
    : currentOriginalText;

  const displaySummaryText = selectedDocId
    ? (selectedDocSummary || currentSummaryText)
    : currentSummaryText;

  const hasOriginalText = !!displayOriginalText.trim();
  const hasSummaryText = !!displaySummaryText.trim();
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <Toaster />

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
                className={`border-2 border-dashed rounded-lg p-8 text-center space-y-3 transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border"
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
                  accept=".pdf,.docx,.hwp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── 처리 중 ── */}
          {currentActiveJob && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">처리 중</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[currentActiveJob].map((job) => {
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

          {/* ── 추출 텍스트 ── */}
          {hasOriginalText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">원문</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="bg-muted/50 border border-border rounded-lg p-5 min-h-[420px] max-h-[72vh] overflow-y-auto">
                    <div className="prose max-w-none text-foreground text-base leading-7">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayOriginalText}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── 요약본 ── */}
          {hasSummaryText && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">요약본</CardTitle>
                  {isStreaming && (
                    <span className="text-xs text-[var(--status-info)] animate-pulse">● 생성 중...</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 border border-border rounded-lg p-5 max-h-[56vh] overflow-y-auto">
                  <div className="prose max-w-none text-foreground text-base leading-7">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {displaySummaryText}
                    </ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 아무 Job도 없을 때 */}
          {jobs.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              업로드된 문서가 없습니다.
            </p>
          )}

          {jobs.length > 0 && currentJobId === null && (
            <p className="text-center text-sm text-muted-foreground py-4">
              파일을 업로드하면 해당 파일의 원문과 요약본을 표시합니다.
            </p>
          )}
        </main>
      </div>
    </MainLayout>
  );
}
