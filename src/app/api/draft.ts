import api from "../../lib/api";
import type {
  ApprovalDetail,
  ApprovalListItem,
  DecisionParams,
  DraftCreateParams,
  DraftDetail,
  DraftListItem,
  DraftUpdateParams,
} from "@/types/draft";

export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export function mapStatusLabel(status: string): string {
  switch (status) {
    case "draft":    return "임시저장";
    case "pending":  return "대기";
    case "approved": return "승인";
    case "rejected": return "반려";
    case "canceled": return "취소";
    default:         return status;
  }
}

export async function createDraft(params: DraftCreateParams): Promise<DraftDetail> {
  const res = await api.post("/drafts/", params);
  return res.data;
}

export async function getDraftList(params?: {
  status?: string;
  keyword?: string;
  sort_by?: string;
  skip?: number;
  limit?: number;
}): Promise<{ items: DraftListItem[]; total_count: number; page: number; limit: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.skip != null) query.set("skip", String(params.skip));
  if (params?.limit != null) query.set("limit", String(params.limit));

  const res = await api.get(`/drafts/?${query}`);
  return res.data;
}

export async function getDraftDetail(draftId: number): Promise<DraftDetail> {
  const res = await api.get(`/drafts/${draftId}`);
  return res.data;
}

export async function updateDraft(
  draftId: number,
  params: DraftUpdateParams
): Promise<DraftDetail> {
  const res = await api.patch(`/drafts/${draftId}`, params);
  return res.data;
}

export async function cancelDraft(draftId: number): Promise<void> {
  await api.delete(`/drafts/${draftId}`);
}

export async function getApprovalList(params?: {
  skip?: number;
  limit?: number;
}): Promise<{ items: ApprovalListItem[]; total_count: number; page: number; limit: number }> {
  const query = new URLSearchParams();
  if (params?.skip != null) query.set("skip", String(params.skip));
  if (params?.limit != null) query.set("limit", String(params.limit));
  const res = await api.get(`/drafts/approvals/?${query}`);
  return res.data;
}

export async function getApprovalDetail(draftId: number): Promise<ApprovalDetail> {
  const res = await api.get(`/drafts/approvals/${draftId}`);
  return res.data;
}

export async function postDecision(
  draftId: number,
  params: DecisionParams,
): Promise<DraftDetail> {
  const res = await api.post(`/drafts/${draftId}/decision`, params);
  return res.data;
}
