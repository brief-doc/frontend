import api, { API_BASE_URL } from "../../lib/api";

export interface NotificationOut {
  noti_id: number;
  user_id: number;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedNotificationResponse {
  items: NotificationOut[];
  total_count: number;
  page: number;
  limit: number;
}

export async function getNotifications(
  skip = 0,
  limit = 20,
): Promise<PaginatedNotificationResponse> {
  const { data } = await api.get("/notifications/", { params: { skip, limit } });
  return data;
}

export async function markNotificationRead(notiId: number): Promise<NotificationOut> {
  const { data } = await api.patch(`/notifications/${notiId}/read`);
  return data;
}

/** 백엔드 link 형식("APPROVAL:1024", "SUMMARY:55")을 프론트 경로로 변환 */
export function linkToRoute(link: string | null): string | null {
  if (!link) return null;
  const colonIdx = link.indexOf(":");
  if (colonIdx === -1) return null;
  const domain = link.slice(0, colonIdx);
  const id = link.slice(colonIdx + 1);
  if (domain === "APPROVAL") return `/draft/view/${id}`;
  if (domain === "APPROVAL_REQ") return `/approver/dashboard`;
  if (domain === "SUMMARY") return `/document/${id}`;
  return null;
}

/** created_at ISO 문자열을 상대 시간 문자열로 변환 */
export function relativeTime(isoString: string): string {
  const now = Date.now();
  const diff = Math.floor((now - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export interface PipelineProgressEvent {
  type: "pipeline_progress";
  job_id: number;
  stage: string;
}

export interface SummaryTokenEvent {
  type: "summary_token";
  job_id: number;
  token: string;
}

/** SSE 구독 — EventSource 인스턴스를 반환하므로 컴포넌트 언마운트 시 .close() 필요 */
export function subscribeSSE(
  onNotification: (noti: NotificationOut) => void,
  onConnected?: () => void,
  onPipelineProgress?: (event: PipelineProgressEvent) => void,
  onSummaryToken?: (event: SummaryTokenEvent) => void,
): EventSource {
  const es = new EventSource(`${API_BASE_URL}/notifications/subscribe`, {
    withCredentials: true,
  });

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === "connected") {
        onConnected?.();
      } else if (data.type === "pipeline_progress") {
        onPipelineProgress?.(data as PipelineProgressEvent);
      } else if (data.type === "summary_token") {
        onSummaryToken?.(data as SummaryTokenEvent);
      } else if (data.noti_id) {
        onNotification(data as NotificationOut);
      }
    } catch {
      // parse 오류 무시
    }
  };

  return es;
}
