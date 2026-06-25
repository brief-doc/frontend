export type DraftStatus = "draft" | "pending" | "approved" | "rejected" | "canceled";

export interface DraftListItem {
  draft_id: number;
  title: string;
  status: DraftStatus;
  created_at: string;
}

export interface DraftDetail {
  draft_id: number;
  author_id: number;
  source_doc_id: number | null;
  source_doc_name: string | null;
  source_doc_summary: string | null;
  title: string;
  content: string;
  status: DraftStatus;
  approver_id: number | null;
  reject_reason: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DraftCreateParams {
  title: string;
  content: string;
  source_doc_id?: number;
  approver_id?: number;
  action: "save" | "submit";
}

export interface DraftUpdateParams {
  title?: string;
  content?: string;
  source_doc_id?: number;
  approver_id?: number;
  action?: "save" | "submit";
}

export interface ApprovalListItem {
  draft_id: number;
  title: string;
  author_name: string;
  created_at: string;
  status: DraftStatus;
}

export interface ApprovalDetail {
  draft_id: number;
  title: string;
  content: string;
  status: DraftStatus;
  author_id: number;
  author_name: string;
  approver_id: number | null;
  reject_reason: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
  source_doc_id: number | null;
  source_doc_name: string | null;
  source_doc_summary: string | null;
}

export interface DecisionParams {
  action: "approved" | "rejected";
  reject_reason?: string;
}
