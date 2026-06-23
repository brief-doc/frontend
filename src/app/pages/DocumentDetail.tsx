import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import ConfirmModal from "../components/ui/confirm-modal";
import { Badge } from "../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ArrowLeft, Edit, Trash2, Download, FilePen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDocumentDetail, deletedDocument, updateDocument } from "../api/document";
import type { DocDetailItem } from "../types/document";

export default function DocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 1. 모달 및 화면 제어 관련 State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [document, setDocument] = useState<DocDetailItem | null>(null);

  // 2. 문서 데이터 입력 폼 State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  // 3. 페이지 진입 시 데이터 단건 조회
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDocumentDetail(Number(id))
      .then((data: DocDetailItem) => {
        setDocument(data);

        // Form 필드 초기값 세팅
        setTitle(data.title);
        setCategory(data.category);
        setSummary(data.summary);
        setContent(data.content);
      })
      .catch((err) => {
        console.error(err);
        toast.error("문서 상세 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      const isSuccess = await deletedDocument(Number(id));

      if (isSuccess) {
        setIsDeleteModalOpen(false);
        toast.success("문서를 성공적으로 삭제했습니다.", {
          position: "top-center",
          duration: 3000,
        });
        navigate("/staff/dashboard");
      } else {
        toast.error("삭제에 실패했습니다. 권한이 없거나 이미 없는 데이터일 수 있습니다.", {
          position: "top-center",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category);
      setSummary(document.summary);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      const isSuccess = await updateDocument(Number(id), {
        title,
        category,
        summary,
      });

      if (isSuccess) {
        setIsEditing(false);

        if (document) {
          setDocument({ ...document, title, category, summary, content });
        }
        toast.success("문서가 수정되었습니다.");
      } else {
        toast.error("문서 수정에 실패했습니다. 데이터를 확인해 주세요.");
      }
    } catch (error) {
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.");
      return;
    }
    const escaped = summary.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 48px; line-height: 1.8; font-size: 14px; color: #333; }
    h1 { font-size: 20px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #ddd; }
    pre { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <pre>${escaped}</pre>
</body>
</html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const categories = ["감사", "공모사업", "가이드라인", "기타"];

  // 8. 예외 처리 분기 (로딩 및 미존재 대응)
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  }
  if (!document) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">문서를 찾을 수 없습니다.</div>;
  }

  return (
    <MainLayout>
      <Toaster />
      {/* 상단 컨트롤 바 */}
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
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-medium text-lg max-w-md"
              />
            ) : (
              <h2 className="text-lg font-medium">{title}</h2>
            )}
            {isEditing ? (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary">{category}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button onClick={handleSave}>저장</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate("/draft/new", {
                      state: {
                        sourceDocId: Number(id),
                        sourceDocName: title,
                        sourceSummary: summary,
                      },
                    })
                  }
                >
                  <FilePen className="size-4" />
                  기안 작성
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="size-4" />
                      다운로드
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleDownloadTxt()}>
                      TXT 다운로드
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPdf}>
                      PDF 다운로드
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="size-4" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteModal();
                  }}
                >
                  <Trash2 className="size-4" />
                  삭제
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메인 뷰어 영역 */}
      <main className="container mx-auto px-6 py-8 max-w-7xl h-[calc(100vh-200px)] min-h-0">
        <div className="grid grid-cols-2 gap-6 h-full min-h-0">
          {/* 왼쪽 카드: 원문 */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">원문</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden min-h-0">
              <div className="bg-muted/30 rounded-lg p-4 h-full overflow-y-auto">
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽 카드: 요약본 */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">요약본</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden min-h-0">
              {isEditing ? (
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="h-full bg-input-background resize-none"
                />
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 h-full overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 공통 컨펌 모달 연동 */}
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
    </MainLayout >
  );
}