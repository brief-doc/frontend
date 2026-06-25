import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { AlertCircle, Search } from "lucide-react";
import api from "../../lib/api";

interface JobItem {
  job_id: number;
  doc_id: number | null;
  file_name: string | null;
  user_name: string | null;
  job_type: string | null;
  job_status: string | null;
  pipeline_stage: string | null;
  error_stage: string | null;
  error_message: string | null;
  job_start: string | null;
  job_finish: string | null;
}

const STATUS_TABS = [
  { value: "", label: "전체" },
  { value: "failed", label: "실패" },
  { value: "running", label: "진행 중" },
  { value: "success", label: "성공" },
  { value: "completed", label: "완료" },
];

const STATUS_BADGE: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  failed: { label: "실패", variant: "destructive" },
  running: { label: "진행 중", variant: "default" },
  pending: { label: "대기", variant: "outline" },
  success: { label: "성공", variant: "secondary" },
  completed: { label: "완료", variant: "secondary" },
  cancelled: { label: "취소", variant: "outline" },
};

const STAGE_LABEL: Record<string, string> = {
  uploaded: "업로드",
  ocr: "OCR",
  embedding: "임베딩",
  summarizing: "요약",
  completed: "완료",
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 20;

export default function AdminDocuments() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, keyword]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = {
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    };
    if (statusFilter) params.status = statusFilter;

    api
      .get("/admin/jobs", { params })
      .then((res) => {
        const data = res.data;
        const filtered = keyword
          ? data.items.filter(
              (j: JobItem) =>
                j.file_name?.includes(keyword) || j.user_name?.includes(keyword)
            )
          : data.items;
        setJobs(filtered);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, page, keyword]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border px-6 py-4 bg-white">
          <h2 className="text-lg font-medium">문서 파이프라인 모니터링</h2>
        </div>

        <main className="container mx-auto px-6 py-6 max-w-6xl space-y-4">
          {/* 필터 영역 */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* 상태 탭 */}
            <div className="flex gap-1 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab.value}
                  size="sm"
                  variant={statusFilter === tab.value ? "default" : "outline"}
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* 키워드 검색 */}
            <div className="relative ml-auto w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="파일명 / 사용자"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* 테이블 */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">파일명</th>
                      <th className="px-4 py-3 text-left font-medium">사용자</th>
                      <th className="px-4 py-3 text-left font-medium">작업 유형</th>
                      <th className="px-4 py-3 text-left font-medium">상태</th>
                      <th className="px-4 py-3 text-left font-medium">단계</th>
                      <th className="px-4 py-3 text-left font-medium">시작</th>
                      <th className="px-4 py-3 text-left font-medium">종료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          불러오는 중...
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          항목이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => {
                        const isFailed = job.job_status === "failed";
                        const expanded = expandedId === job.job_id;

                        return (
                          <>
                            <tr
                              key={job.job_id}
                              className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/30 ${
                                isFailed ? "bg-destructive/5" : ""
                              }`}
                              onClick={() => {
                                if (isFailed) setExpandedId(expanded ? null : job.job_id);
                                else if (job.doc_id) navigate(`/document/${job.doc_id}`);
                              }}
                            >
                              <td className="px-4 py-3 max-w-[200px] truncate">
                                <span className="flex items-center gap-1.5">
                                  {isFailed && (
                                    <AlertCircle className="size-3.5 text-destructive shrink-0" />
                                  )}
                                  {job.file_name ?? "-"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {job.user_name ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {job.job_type ?? "-"}
                              </td>
                              <td className="px-4 py-3">
                                {job.job_status ? (
                                  <Badge variant={STATUS_BADGE[job.job_status]?.variant ?? "outline"}>
                                    {STATUS_BADGE[job.job_status]?.label ?? job.job_status}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {isFailed && job.error_stage
                                  ? `${STAGE_LABEL[job.error_stage] ?? job.error_stage} 실패`
                                  : (STAGE_LABEL[job.pipeline_stage ?? ""] ?? job.pipeline_stage ?? "-")}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {formatDate(job.job_start)}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {formatDate(job.job_finish)}
                              </td>
                            </tr>

                            {/* 실패 시 에러 메시지 펼치기 */}
                            {isFailed && expanded && (
                              <tr key={`${job.job_id}-error`} className="bg-destructive/5">
                                <td colSpan={7} className="px-6 py-3">
                                  <p className="text-xs font-medium text-destructive mb-1">오류 내용</p>
                                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all max-h-32 overflow-y-auto bg-background rounded p-2 border border-border">
                                    {job.error_message ?? "상세 메시지 없음"}
                                  </pre>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>총 {total}건</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <span className="flex items-center px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
