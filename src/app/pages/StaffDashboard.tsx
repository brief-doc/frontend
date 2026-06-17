import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { MainLayout } from "../components/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import ConfirmModal from "../components/ui/confirm-modal";
import { FileSearch, FileText, Plus } from "lucide-react";
import { getDocumentList, deletedDocument } from "../api/document";
import type { DocItem } from "../types/document";
import { getDraftList, formatDate, mapStatusLabel } from "../api/draft";
import type { DraftListItem } from "../types/draft";
import { useNotifications } from "../hooks/useNotifications";

interface StaffDashboardProps {
  userRole?: string;
  showApproverMenu?: boolean;
  showAdminMenu?: boolean;
}

export default function StaffDashboard({ userRole, showApproverMenu, showAdminMenu }: StaffDashboardProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [drafts, setDrafts] = useState<DraftListItem[]>([]);

  // 알림 훅 (SSE 실시간 + API 초기 로드)
  const { notifications, markRead, latest } = useNotifications();

  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [category, setCategory] = useState("전체"); // 이미지의 '가이드라인' 등
  const [keyword, setKeyword] = useState("");       // 검색어
  const [page, setPage] = useState(1);              // 현재 페이지 번호
  const [totalCount, setTotalCount] = useState(0);  // 총 아이템 수
  const LIMIT = 5;                                 // 한 페이지에 보여줄 개수
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    const fetchList = async () => {
      const data = await getDocumentList({
        page,
        limit: LIMIT,
        category,
        keyword,
        sort_by: sortBy
      });

      if (data) {
        setDocuments(data.items);
        setTotalCount(data.total_count);
      }
    };

    fetchList();
  }, [page, category, keyword, sortBy]);

  // 카테고리나 검색어가 바뀌면 페이지를 '1'로 리셋
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // 하단 페이징 블록 계산 
  const totalPages = Math.ceil(totalCount / LIMIT);

  const SORT_MAP: Record<string, string> = {
    latest: "created_at",
    oldest: "asc",
    title: "title",
  };

  const fetchDrafts = useCallback(async () => {
    try {
      const data = await getDraftList({
        status: statusFilter === "all" ? undefined : statusFilter,
        sort_by: SORT_MAP[sortOrder] ?? "created_at",
        limit: 3,
      });
      setDrafts(data.items);
    } catch {
      toast.error("기안 목록을 불러오지 못했습니다.");
    }
  }, [statusFilter, sortOrder]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // 15초 폴링 — 승인/반려 결과를 새로고침 없이 자동 반영
  useEffect(() => {
    const id = setInterval(fetchDrafts, 15000);
    return () => clearInterval(id);
  }, [fetchDrafts]);

  // APPROVAL 알림 수신 시 즉시 갱신 (SSE가 살아있을 때 보너스)
  useEffect(() => {
    if (latest?.link?.startsWith("APPROVAL:")) {
      fetchDrafts();
    }
  }, [latest]);

  // 💡 1. 모달의 열림 상태와 현재 선택된 문서 ID를 관리할 State 추가
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  // 💡 2. 삭제 버튼을 눌렀을 때 모달을 열어주는 함수
  const handleOpenDeleteModal = (id: number) => {
    setSelectedDocId(id);
    setIsDeleteModalOpen(true);
  };

  // 💡 3. 모달에서 '확인'을 눌렀을 때 실제 삭제를 처리할 함수
  const handleDeleteConfirm = async () => {
    if (selectedDocId !== null) {
      // 실제 삭제 로직 (State 반영 또는 API 호출)
      const isSuccess = await deletedDocument(selectedDocId);

      if (isSuccess) {
        setDocuments(documents.filter(doc => doc.id !== selectedDocId));

        setIsDeleteModalOpen(false);
        setSelectedDocId(null);

        toast.success("문서를 성공적으로 삭제했습니다.", {
          position: "top-center",
          duration: 3000,
        });
      } else {
        toast.error("삭제를 실패했습니다. 권한이 없거나 이미 없는 데이터일 수 있습니다.", {
          position: "top-center",
          duration: 3000,
        });
      }
    }
  };

  // Retrieve the raw string data
  const rawData = sessionStorage.getItem('user_session');

  // Parse it back into an object if it was JSON
  const sessionData = rawData ? JSON.parse(rawData) : null;

  const userInfo = {
    name: sessionData?.name ?? "사용자",
    email: sessionData?.email ?? "no-reply@example.com",
    roles: sessionData?.roles ?? ["가상롤"],
    joinDate: "2025.03.15",
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <Toaster /> {/* 토스트 알림을 화면에 렌더링 */}


        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/rag-search")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileSearch className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      RAG 검색
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      조례·가이드라인 근거 검색 (페이지 출처)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/document-summary")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      문서 요약
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      외부 PDF 업로드 → 1장 요약
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle>내 기안 현황</CardTitle>
                    <Button onClick={() => navigate("/draft/new")}>
                      <Plus className="size-4" />새 기안
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
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
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="latest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="title">제목순</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        기안이 없습니다.
                      </p>
                    ) : (
                      drafts.map((draft) => (
                        <div
                          key={draft.draft_id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/draft/view/${draft.draft_id}`)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{draft.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(draft.created_at)}
                            </p>
                          </div>
                          <Badge
                            className={{
                              draft: "bg-muted text-muted-foreground border-transparent",
                              pending: "bg-[var(--status-pending)] text-white border-transparent",
                              approved: "bg-[var(--status-approved)] text-white border-transparent",
                              rejected: "bg-[var(--status-rejected)] text-white border-transparent",
                              canceled: "bg-muted text-muted-foreground border-transparent",
                            }[draft.status] ?? ""}
                          >
                            {mapStatusLabel(draft.status)}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => navigate("/draft/list")}
                    >
                      전체 기안 보기 →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>알림</CardTitle>
                    {notifications.filter((n) => n.unread).length > 0 && (
                      <span className="text-xs px-2 py-1 bg-status-info text-white rounded-full">
                        {notifications.filter((n) => n.unread).length} 새 알림
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        새로운 알림이 없습니다
                      </p>
                    ) : (
                      notifications.slice(0, 3).map((notif) => (
                        <div
                          key={notif.id}
                          className="flex gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            if (notif.unread) markRead(notif.id);
                            if (notif.link) navigate(notif.link);
                          }}
                        >
                          {notif.unread && (
                            <div className="size-2 bg-status-info rounded-full mt-2 shrink-0" />
                          )}
                          <div className={`flex-1 min-w-0 ${!notif.unread ? "pl-5" : ""}`}>
                            <p className="text-sm text-foreground leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle>내 문서함</CardTitle>
                    <select
                      value={category}
                      onChange={handleCategoryChange}
                      className="px-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" >
                      <option>전체</option>
                      <option>감사</option>
                      <option>공모사업</option>
                      <option>가이드라인</option>
                      <option>기타</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="검색..."
                        value={keyword}
                        onChange={(e) => {
                          setKeyword(e.target.value);
                          setPage(1); // 검색어 타이핑 시에도 1페이지로 리셋
                        }}
                        className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring w-48"
                      />
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
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-1.5 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="created_at">최신순</option>
                      <option value="title">제목순</option>
                      <option value="oldest">오래된순</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          문서 제목
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-32">
                          카테고리
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-32">
                          요약 완료일
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-24">
                          상태
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-foreground w-24">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr className="border-b border-border bg-background">
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center text-sm text-muted-foreground font-medium"
                          >
                            🔍 조건에 부합하는 문서가 존재하지 않습니다.
                          </td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr
                            key={doc.id}
                            className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() =>

                              navigate(`/document/${doc.id}`)
                            }
                          >
                            <td className="px-4 py-3 text-sm text-foreground">
                              {doc.title}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                {doc.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {doc.date}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="bg-[var(--status-approved)] text-white border-transparent text-xs">
                                {doc.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/document/${doc.id}`);
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  <svg
                                    className="size-4 text-muted-foreground hover:text-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDeleteModal(doc.id);
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  <svg
                                    className="size-4 text-muted-foreground hover:text-destructive"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>

                        )))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
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
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    다음
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="문서 삭제"
          description="정말 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          variant="destructive"
        />
      </div>
    </MainLayout>
  );
}
