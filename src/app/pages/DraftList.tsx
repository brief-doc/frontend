import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { getDraftList, formatDate, mapStatusLabel } from "../api/draft";
import type { DraftListItem } from "../types/draft";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  pending: "bg-[var(--status-pending)] text-white border-transparent",
  approved: "bg-[var(--status-approved)] text-white border-transparent",
  rejected: "bg-[var(--status-rejected)] text-white border-transparent",
  canceled: "bg-muted text-muted-foreground border-transparent",
};

const SORT_MAP: Record<string, string> = {
  latest: "created_at",
  oldest: "asc",
  title: "title",
};

const LIMIT = 10;

export default function DraftList() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<DraftListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  useEffect(() => {
    setLoading(true);
    getDraftList({
      status: statusFilter === "all" ? undefined : statusFilter,
      keyword: keyword || undefined,
      sort_by: SORT_MAP[sortOrder] ?? "created_at",
      skip: (page - 1) * LIMIT,
      limit: LIMIT,
    })
      .then((data) => {
        setDrafts(data.items);
        setTotalCount(data.total_count);
      })
      .catch(() => toast.error("기안 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [page, statusFilter, sortOrder, keyword]);

  // 필터/정렬/검색 변경 시 1페이지로 리셋
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setPage(1);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputValue.trim());
    setPage(1);
  };

  const rawData = sessionStorage.getItem("user_session");
  const sessionData = rawData ? JSON.parse(rawData) : null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <Toaster />
        <div className="border-b border-border px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/staff/dashboard")}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <h2 className="text-lg font-medium">내 기안 현황</h2>
            </div>
            <Button onClick={() => navigate("/draft/new")}>
              <Plus className="size-4" />새 기안
            </Button>
          </div>
        </div>

        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">기안 목록</CardTitle>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">전체</option>
                      <option value="draft">임시저장</option>
                      <option value="pending">대기</option>
                      <option value="approved">승인</option>
                      <option value="rejected">반려</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="latest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="title">제목순</option>
                    </select>
                  </div>
                </div>

                {/* 검색창 */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-2.5 top-2 size-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="기안 제목 검색..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    검색
                  </Button>
                  {keyword && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setKeyword(""); setInputValue(""); setPage(1); }}
                    >
                      초기화
                    </Button>
                  )}
                </form>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  로딩 중...
                </p>
              ) : drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  기안이 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.draft_id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/draft/view/${draft.draft_id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{draft.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {formatDate(draft.created_at)}
                        </p>
                      </div>
                      <Badge className={STATUS_CLASS[draft.status] ?? ""}>
                        {mapStatusLabel(draft.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    이전
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    다음
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-3">
                총 {totalCount}건
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </MainLayout>
  );
}
