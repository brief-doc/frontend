import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
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
import { ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import { getDocumentDetail } from "../api/document";
import type { DocDetailItem } from "@/types/document";
  
export default function DocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [document, setDocument] = useState<DocDetailItem | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  // 1. 페이지 진입 시 데이터 단건 조회
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

  // 2. 수정 취소 핸들러 (기존 상세 정보로 롤백)
  const handleCancel = () => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category);
      setSummary(document.summary);
      setContent(document.content);
    }
    setIsEditing(false);
  };

  // 3. 수정 저장 핸들러
  const handleSave = async () => {
    try {
      // TODO: 필요 시 백엔드 수정 API 호출 연동 (ex: await updateDocument(Number(id), { title, category, summary }))
      setIsEditing(false);
      
      // 로컬 state 업데이트 반영
      if (document) {
        setDocument({ ...document, title, category, summary, content });
      }
      toast.success("문서가 수정되었습니다.");
    } catch (error) {
      toast.error("문서 수정에 실패했습니다.");
    }
  };

  // 4. 삭제 핸들러
  const handleDelete = async () => {
    try {
      // TODO: 필요 시 백엔드 삭제 API 호출 연동 (ex: await deleteDocument(Number(id)))
      toast.error("문서가 삭제되었습니다.");
      navigate("/staff/dashboard");
    } catch (error) {
      toast.error("문서 삭제에 실패했습니다.");
    }
  };

  const categories = ["감사", "공모사업", "가이드라인", "기타"];

  // 5. 안전장치: 로딩 중이거나 데이터가 없을 때 UI 튕김 방지
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  }
  if (!document) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">문서를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header userName="김주무관" userRole="실무 담당자" notificationCount={2} />

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
                {/* 🛠️ 버그 수정: 하드코딩 대신 앞서 정의한 handleCancel 연동 */}
                <Button variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button onClick={handleSave}>저장</Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="size-4" />
                      다운로드
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => alert("TXT 파일 다운로드 중...")}>
                      TXT 다운로드
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("PDF 파일 다운로드 중...")}>
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
                  onClick={() => setShowDeleteDialog(true)}
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
      <main className="container mx-auto px-6 py-8 max-w-7xl h-[calc(100vh-200px)]">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* 왼쪽 카드: 원문 */}
          <Card className="flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">원문</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="bg-muted/30 rounded-lg p-4 h-full overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {/* 🛠️ 버그 수정: 존재하지 않는 originalText 대신 content 바인딩 */}
                  <div className="space-y-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽 카드: 요약본 */}
          <Card className="flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">요약본</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isEditing ? (
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="h-full bg-input-background resize-none"
                />
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 h-full overflow-y-auto">
                  <div className="space-y-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {summary}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 삭제 얼럿 모달 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>문서 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}