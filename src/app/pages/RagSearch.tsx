import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";

export default function RagSearch() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [selectedSource, setSelectedSource] = useState<number | null>(null);

  const messages = [
    {
      type: "user",
      content: "가명정보 결합 시 안전성 확보 조치는 무엇인가요?",
    },
    {
      type: "ai",
      content: [
        "○ 결합전문기관을 통해 결합 수행",
        "○ 결합키 생성·관리 주체 분리",
        "○ 접속기록 1년 이상 보관",
        "○ 반출 전 가명처리 적정성 검토",
      ],
      sources: [
        {
          id: 1,
          title: "가명정보 처리 가이드라인",
          page: 142,
          type: "document",
        },
        {
          id: 2,
          title: "가명정보 처리 가이드라인",
          page: 151,
          type: "document",
        },
        { id: 3, title: "강남구 데이터 조례", page: "제12조", type: "law" },
      ],
      metadata: "근거 3건 · 로컬 DB에서 0.8초",
    },
  ];

  const sourceDetails = {
    title: "가명정보 처리 가이드라인",
    page: "p.142 · 제5장 안전성 확보 조치",
    chunkId: "#142-3",
    similarity: "0.89",
    content: [
      "가명정보의 결합은 개인정보 보호법 제28조의3에 따라 보호위원회가 지정한 결합전문기관을 통해 수행되어야 한다. 이는 가명정보의 안전한 처리를 위한 필수 조치이다.",
      "결합전문기관은 결합키의 생성 및 관리 주체를 분리하여야 하며, 모든 접속기록을 1년 이상 보관하여야 한다. 또한 결합된 정보의 반출 전에는 반드시 가명처리의 적정성을 검토하여야 한다.",
    ],
    highlights: ["보호위원회가 지정한 결합전문기관", "접속기록을 1년 이상 보관"],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header userName="김주무관" userRole="실무 담당자" notificationCount={2} />

      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/staff/dashboard")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-medium">가이드라인 질의 (RAG)</h2>
          <Badge
            variant="outline"
            className="bg-muted border-border text-muted-foreground"
          >
            🔒 폐쇄망
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-primary/10 text-foreground rounded-lg px-4 py-3 max-w-2xl">
                    <p>{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="bg-white border border-border rounded-lg px-4 py-3">
                      <div className="space-y-2">
                        {Array.isArray(msg.content) ? (
                          msg.content.map((line, i) => (
                            <p key={i} className="text-foreground">
                              {line}
                            </p>
                          ))
                        ) : (
                          <p className="text-foreground">{msg.content}</p>
                        )}
                      </div>
                    </div>

                    {msg.metadata && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>⚡</span>
                        {msg.metadata}
                      </p>
                    )}

                    {msg.sources && (
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source) => (
                          <button
                            key={source.id}
                            onClick={() => setSelectedSource(source.id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full text-sm transition-colors"
                          >
                            <span>{source.type === "law" ? "⚖" : "📄"}</span>
                            <span className="text-foreground">
                              {source.title} · {source.page}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="질문을 입력하세요..."
              className="flex-1 bg-input-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setMessage("");
                }
              }}
            />
            <Button>
              <Send className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            🔒 모든 질의는 외부 전송 없이 폐쇄망 내부에서만 처리됩니다
          </p>
        </div>
      </div>

      <Sheet
        open={selectedSource !== null}
        onOpenChange={(open) => !open && setSelectedSource(null)}
      >
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span>📄</span>
              <div className="flex-1">
                <div className="font-medium">{sourceDetails.title}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {sourceDetails.page}
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className="text-muted-foreground">
                🗄 청크 {sourceDetails.chunkId}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                유사도 {sourceDetails.similarity}
              </Badge>
              <Badge variant="secondary">샘플 데이터</Badge>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              {sourceDetails.content.map((paragraph, idx) => (
                <p key={idx} className="text-foreground">
                  {paragraph.split(/(보호위원회가 지정한 결합전문기관|접속기록을 1년 이상 보관)/).map((part, i) =>
                    sourceDetails.highlights.includes(part) ? (
                      <mark
                        key={i}
                        className="bg-yellow-200/60 px-0.5 rounded"
                      >
                        {part}
                      </mark>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </p>
              ))}
            </div>

            <div className="pt-2 pb-4">
              <p className="text-xs text-muted-foreground">
                🖍 강조 구간 = 답변이 근거로 인용한 부분
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                className="flex-1"
                onClick={() => navigate("/draft/new")}
              >
                📄 기안 근거로 추가 ↗
              </Button>
              <Button variant="outline" className="flex-1">
                🔗 PDF 원문 열기
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
