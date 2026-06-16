import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { streamQuery, type RagReference } from "../api/rag";

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface UserMessage {
  role: "user";
  content: string;
}

interface AiMessage {
  role: "ai";
  content: string;       // 스트리밍 중 누적 토큰
  streaming: boolean;
  references: RagReference[];
  elapsed?: number;      // ms
}

type ChatMessage = UserMessage | AiMessage;

// ── 소스 칩 ──────────────────────────────────────────────────────────────────

function SourceChip({
  source,
  onClick,
}: {
  source: RagReference;
  onClick: () => void;
}) {
  const isLaw = source.category.includes("법령") || source.category.includes("조례");
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full text-sm transition-colors"
    >
      <span>{isLaw ? "⚖" : "📄"}</span>
      <span className="text-foreground">
        {source.doc_name}
        {source.page ? ` · ${source.page}` : ""}
      </span>
    </button>
  );
}

// ── AI 메시지 버블 ────────────────────────────────────────────────────────────

function AiBubble({
  msg,
  onSourceClick,
}: {
  msg: AiMessage;
  onSourceClick: (ref: RagReference) => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
        {msg.streaming ? (
          <Loader2 className="size-4 text-primary animate-spin" />
        ) : (
          <Sparkles className="size-4 text-primary" />
        )}
      </div>
      <div className="flex-1 space-y-3">
        <div className="bg-white border border-border rounded-lg px-4 py-3">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {msg.content}
            {msg.streaming && (
              <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
            )}
          </p>
        </div>

        {!msg.streaming && msg.references.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>⚡</span>
              근거 {msg.references.length}건
              {msg.elapsed != null && ` · 로컬 DB에서 ${(msg.elapsed / 1000).toFixed(1)}초`}
            </p>
            <div className="flex flex-wrap gap-2">
              {msg.references.map((ref, i) => (
                <SourceChip key={i} source={ref} onClick={() => onSourceClick(ref)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function RagSearch() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [selectedRef, setSelectedRef] = useState<RagReference | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const rawData = sessionStorage.getItem("user_session");
  const sessionData = rawData ? JSON.parse(rawData) : null;

  const { notifications, markRead } = useNotifications();

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    const question = input.trim();
    if (!question || streaming) return;

    setInput("");
    setStreaming(true);

    // 1. 사용자 메시지 추가
    const userMsg: UserMessage = { role: "user", content: question };
    // 2. AI 플레이스홀더 추가
    const aiMsg: AiMessage = { role: "ai", content: "", streaming: true, references: [] };

    setMessages((prev) => [...prev, userMsg, aiMsg]);

    const startedAt = Date.now();

    // 3. SSE 스트리밍 시작
    const cancel = streamQuery(question, (event) => {
      if (event.type === "token") {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1] as AiMessage;
          return [...next.slice(0, -1), { ...last, content: last.content + event.content }];
        });
      } else if (event.type === "sources") {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1] as AiMessage;
          return [
            ...next.slice(0, -1),
            {
              ...last,
              references: event.references,
              elapsed: Date.now() - startedAt,
            },
          ];
        });
      } else if (event.type === "done") {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1] as AiMessage;
          return [...next.slice(0, -1), { ...last, streaming: false }];
        });
        setStreaming(false);
      } else if (event.type === "error") {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1] as AiMessage;
          return [
            ...next.slice(0, -1),
            { ...last, content: event.content, streaming: false },
          ];
        });
        setStreaming(false);
      }
    });

    cancelRef.current = cancel;
  }, [input, streaming]);

  // 언마운트 시 SSE 정리
  useEffect(() => {
    return () => cancelRef.current?.();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        userName={sessionData?.name ?? "사용자"}
        userRole={sessionData?.roles?.[0] ?? "실무 담당자"}
        notifications={notifications}
        notificationCount={notifications.filter((n) => n.unread).length}
        onMarkNotificationRead={markRead}
      />

      {/* 상단 바 */}
      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/staff/dashboard")}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-medium">가이드라인 질의 (RAG)</h2>
          <Badge variant="outline" className="bg-muted border-border text-muted-foreground">
            🔒 폐쇄망
          </Badge>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="size-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">
                법령·가이드라인에 대해 무엇이든 질문하세요
              </p>
            </div>
          )}

          {messages.map((msg, idx) =>
            msg.role === "user" ? (
              <div key={idx} className="flex justify-end">
                <div className="bg-primary/10 text-foreground rounded-lg px-4 py-3 max-w-2xl">
                  <p>{msg.content}</p>
                </div>
              </div>
            ) : (
              <AiBubble key={idx} msg={msg} onSourceClick={setSelectedRef} />
            ),
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-border bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-input bg-input-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button onClick={sendMessage} disabled={streaming || !input.trim()}>
              {streaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            🔒 모든 질의는 외부 전송 없이 폐쇄망 내부에서만 처리됩니다
          </p>
        </div>
      </div>

      {/* 참고 문서 상세 패널 */}
      <Sheet open={selectedRef !== null} onOpenChange={(open) => !open && setSelectedRef(null)}>
        <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto">
          {selectedRef && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-start gap-2">
                  <span className="mt-0.5">📄</span>
                  <div className="flex-1">
                    <div className="font-medium">{selectedRef.doc_name}</div>
                    {selectedRef.page && (
                      <div className="text-sm font-normal text-muted-foreground">
                        p.{selectedRef.page}
                      </div>
                    )}
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {selectedRef.category && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {selectedRef.category}
                  </Badge>
                )}

                <div className="text-sm leading-relaxed text-foreground bg-muted/40 border border-border rounded-lg p-4 whitespace-pre-wrap">
                  {selectedRef.snippet}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      navigate("/draft/new", {
                        state: {
                          sourceDocName: selectedRef.doc_name,
                          sourceSummary: selectedRef.snippet,
                        },
                      })
                    }
                  >
                    📄 기안 근거로 추가 ↗
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
