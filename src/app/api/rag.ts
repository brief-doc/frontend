import api, { API_BASE_URL } from "../../lib/api";

export interface RagReference {
  doc_id?: number | null;
  doc_name: string;
  category: string;
  page: string;
  snippet: string;
}

export interface RagQueryResponse {
  query_id: number;
  question: string;
  answer: string;
  references: RagReference[];
}

export interface RagHistoryItem {
  query_id: number;
  query_text: string;
  answer_text: string | null;
  source_count: number;
  created_at: string;
}

/** 동기 질의 — 완전한 답변과 참고 문서를 한 번에 반환 */
export async function queryRag(question: string, catId?: number): Promise<RagQueryResponse> {
  const { data } = await api.post("/rag/query", { question, cat_id: catId ?? null });
  return data;
}

/** 질의 이력 목록 */
export async function getRagHistory(skip = 0, limit = 20): Promise<RagHistoryItem[]> {
  const { data } = await api.get("/rag/history", { params: { skip, limit } });
  return data;
}

// ── SSE 스트리밍 이벤트 타입 ────────────────────────────────────────────────

export type SseEvent =
  | { type: "token"; content: string }
  | { type: "sources"; references: RagReference[] }
  | { type: "done" }
  | { type: "error"; content: string };

/**
 * SSE 스트리밍 질의.
 * EventSource는 쿠키를 자동 전송하므로 JWT 인증이 그대로 적용됩니다.
 *
 * @returns 구독 해제 함수 (컴포넌트 언마운트 시 호출)
 */
export function streamQuery(
  question: string,
  onEvent: (event: SseEvent) => void,
): () => void {
  const params = new URLSearchParams({ question });
  const url = `${API_BASE_URL}/rag/query/stream?${params.toString()}`;
  const es = new EventSource(url, { withCredentials: true });

  es.onmessage = (e) => {
    try {
      const parsed: SseEvent = JSON.parse(e.data);
      onEvent(parsed);
      if (parsed.type === "done" || parsed.type === "error") {
        es.close();
      }
    } catch {
      // parse 오류 무시
    }
  };

  es.onerror = () => {
    onEvent({ type: "error", content: "연결이 끊어졌습니다." });
    es.close();
  };

  return () => es.close();
}
