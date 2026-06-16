import api from "../../lib/api";

export interface PipelineJob {
  job_id: number;
  job_status: string;          // pending / running / completed / failed / cancelled
  pipeline_stage: string | null; // uploaded / ocr / embedding / summarizing / completed / failed / cancelled
  is_cancelled: boolean | null;
  file_path: string | null;
  error_stage: string | null;
  error_message: string | null;
  doc_id: number | null;
}

export const STAGE_PROGRESS: Record<string, number> = {
  uploaded:    0,
  ocr:         30,
  embedding:   60,
  summarizing: 85,
  completed:   100,
  failed:      0,
  cancelled:   0,
};

export const STAGE_LABEL: Record<string, string> = {
  uploaded:    "업로드 완료",
  ocr:         "텍스트 추출 중",
  embedding:   "임베딩 중",
  summarizing: "요약 중",
  completed:   "완료",
  failed:      "실패",
  cancelled:   "취소됨",
};

export function isActive(job: PipelineJob): boolean {
  return job.job_status === "pending" || job.job_status === "running";
}

export function filenameFromPath(filePath: string | null): string {
  if (!filePath) return "알 수 없는 파일";
  const base = filePath.replace(/\\/g, "/").split("/").pop() ?? filePath;
  // 서버 저장 형식: pipe_{uuid}_{원본파일명}
  const parts = base.split("_");
  return parts.length >= 3 ? parts.slice(2).join("_") : base;
}

export async function uploadDocument(file: File): Promise<PipelineJob> {
  const form = new FormData();
  form.append("file", file);
  // undefined로 설정해 인스턴스 기본값(application/json)을 제거 →
  // 브라우저가 multipart/form-data; boundary=... 를 자동 설정
  const { data } = await api.post("/documents/pipeline/upload", form, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

export async function getJob(jobId: number): Promise<PipelineJob> {
  const { data } = await api.get(`/documents/pipeline/jobs/${jobId}`);
  return data;
}

export async function listJobs(): Promise<PipelineJob[]> {
  const { data } = await api.get("/documents/pipeline/jobs");
  return data;
}

export async function cancelJob(jobId: number): Promise<PipelineJob> {
  const { data } = await api.post(`/documents/pipeline/jobs/${jobId}/cancel`);
  return data;
}
