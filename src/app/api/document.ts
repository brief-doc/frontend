import type { DocResponse, DocItem, DocDetailItem, DocDetailResponse, DocUpdateParams } from "@/types/document";
import api from "../../lib/api";

// ── 인터페이스 정의 ─────────────────────────────

// 요약 문서 목록 조회용 파라미터
export interface GetDocumentsParams {
  page: number;
  limit: number;
  category?: string;
  keyword?: string;
  sort_by?: string;
}

// 페이징 처리된 최종 응답 규격
export interface PaginatedDocuments {
  items: DocItem[]; // 💡 UI 목록 테이블에서 사용할 정돈된 데이터 타입으로 지정
  total_count: number;
  page: number;
  limit: number;
}

// ── API 호출 ─────────────────────────────

/**
 * 문서 목록 조회 (페이징, 검색, 카테고리 필터링 포함)
 */
export async function getDocumentList(params: GetDocumentsParams): Promise<PaginatedDocuments | null> {
  try {
    const query = new URLSearchParams();
    
    const skip = (params.page - 1) * params.limit;
    query.set("skip", String(skip));
    query.set("limit", String(params.limit));
    
    // 필터 조건이 존재할 때만 쿼리에 추가
    if (params.category && params.category !== "전체") query.set("category", params.category);
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    // 백엔드 API 호출 
    const response = await api.get(`/documents/?${query.toString()}`);
    
    // 백엔드 응답 데이터 구조
    const { items, total_count } = response.data;

    return {
      items: items.map((item: DocResponse) => toDocItem(item)),
      total_count: total_count || 0,
      page: params.page,
      limit: params.limit
    };
  } catch (error) {
    console.error("목록 조회 실패:", error);
    return null;
  }
}

/**
 * 문서 상세 조회
 */
export async function getDocumentDetail(docId: number): Promise<DocDetailItem> {
  try {
    const res = await api.get(`/documents/${docId}`);
    return toDocDetailItem(res.data);
  } catch (err: any) { 
    throw new Error('상세 정보를 불러오는데 실패했습니다.');
  }
}

/**
 * 문서 삭제
 */
export async function deletedDocument(docId: number): Promise<boolean> {
  try {
    const response = await api.delete(`/documents/${docId}`);
    if (response.status === 204 || response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 문서 수정
 */
export async function updateDocument(
  docId: number, 
  params: DocUpdateParams
): Promise<boolean> {
  try {
    const response = await api.patch(`/documents/${docId}`, {
      file_name: params.title,
      category: params.category,
      content_sum: params.summary
    });

    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// ── 데이터 변환 헬퍼 (Mapping) ─────────────────────────────

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
    case "done":      return "완료";
    case "processing":
    case "running":   return "요약중";
    case "failed":    return "실패";
    default:          return "대기";
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