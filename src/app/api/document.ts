import type { DocResponse, DocItem } from "@/types/document";

import { API_BASE_URL } from "../../lib/api";

// ── API 호출 ─────────────────────────────
export async function getDocuments(params?: {
  category?: string;
  skip?: number;
  limit?: number;
}): Promise<DocResponse[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.skip != null) query.set("skip", String(params.skip));
  if (params?.limit != null) query.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE_URL}/docs/?${query}`);
  if (!res.ok) throw new Error(`문서 조회 실패: ${res.status}`);
  return res.json();
}

// ── 변환 헬퍼 ─────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

function mapStatus(status: string | null): string {
  switch (status) {
    case "completed":
    case "success":
    case "done":     return "완료";
    case "processing":
    case "running":  return "요약중";
    case "failed":   return "실패";
    default:         return "대기";
  }
}

export function toDocItem(d: DocResponse): DocItem {
  return {
    id: d.doc_id,
    title: d.file_name ?? "제목 없음",
    category: d.category ?? "기타",
    date: formatDate(d.created_at),
    status: mapStatus(d.job_status),
  };
}