import type { DocResponse, DocItem, DocDetailItem, DocDetailResponse } from "@/types/document";
import  api from "../../lib/api";

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

  try {
    const res = await api.get(`/documents/?${query}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "문서 조회 실패");
  }
}


// 상세 조회 (지금 필요한 것!)
export async function getDocumentDetail(docId: number): Promise<DocDetailResponse> {
  try{
    const res = await api.get(`/documents/${docId}`);
    return toDocDetailItem(res.data);
  } catch (err: any) { 
    throw new Error('상세 정보를 불러오는데 실패했습니다.');
  }
}

// 문서 삭제
export async function deletedDocument(docId: number): Promise<Boolean> {
  try {
    const response = await api.delete(`/documents/${docId}`);

    if (response.status === 204) {
      return true;
     
    }
    return false;
  } catch (error) {
    return false;
  }
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

export function toDocDetailItem(d: DocDetailResponse): DocDetailItem {
  return {
    id: d.doc_id,
    title: d.file_name ?? "제목 없음",
    category: d.category ?? "기타",
    date: formatDate(d.created_at),       
    status: mapStatus(d.job_status),    
    summary: d.content_sum ?? "",
    content: d.content_full ?? "",
    fileType: d.file_type,
  };
}