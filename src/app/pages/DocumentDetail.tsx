import { useState } from "react";
import { useNavigate, useParams } from "react-router";
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

export default function DocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [title, setTitle] = useState("신규_공모사업_지침");
  const [category, setCategory] = useState("공모사업");
  const [summary, setSummary] = useState(
    `○ 공모 대상: 가명정보 활용 데이터 분석 과제
○ 신청 기간: 2026.06.15 ~ 07.15
○ 지원 규모: 과제당 최대 5천만원
○ 제출 서류: 사업계획서, 개인정보 처리방침
○ 평가 기준: 데이터 활용 적정성, 개인정보 보호 계획, 사업 수행 역량
○ 문의처: 개인정보보호위원회 데이터정책과 (02-2100-3000)`
  );

  const originalText = `제1조 (목적)
이 지침은 「개인정보 보호법」 제28조의2 및 같은 법 시행령 제29조의2에 따른 가명정보의 처리에 관한 세부 사항을 정함으로써 가명정보를 활용한 신규 서비스 창출과 기존 서비스 개선을 도모하고 개인정보를 보호하는 데 그 목적이 있다.

제2조 (공모사업 개요)
가명정보를 활용한 데이터 분석 과제를 발굴하여 지원하는 것을 목적으로 한다. 신청 기간은 2026년 6월 15일부터 7월 15일까지이며, 선정된 과제에 대하여 과제당 최대 5천만원을 지원한다.

제3조 (신청 자격 및 제출 서류)
공공기관, 민간기업, 연구기관 등 가명정보 처리가 필요한 법인 및 단체가 신청할 수 있다. 제출 서류는 사업계획서, 개인정보 처리방침, 가명처리 계획서를 포함한다.

제4조 (평가 기준)
데이터 활용의 적정성, 개인정보 보호 계획의 충실성, 사업 수행 역량 등을 종합적으로 평가한다.

제5조 (문의처)
사업 관련 문의는 개인정보보호위원회 데이터정책과(전화: 02-2100-3000)로 연락하시기 바랍니다.`;

  const handleSave = () => {
    setIsEditing(false);
    toast.success("문서가 수정되었습니다.");
  };

  const handleDelete = () => {
    toast.error("문서가 삭제되었습니다.");
    navigate("/staff/dashboard");
  };

  const categories = ["감사", "공모사업", "가이드라인", "기타"];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header userName="김주무관" userRole="실무 담당자" notificationCount={2} />
    

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
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle("신규_공모사업_지침");
                    setCategory("공모사업");
                  }}
                >
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
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
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

      <main className="container mx-auto px-6 py-8 max-w-7xl h-[calc(100vh-200px)]">
        <div className="grid grid-cols-2 gap-6 h-full">
          <Card className="flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">원문</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="bg-muted/30 rounded-lg p-4 h-full overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="space-y-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {originalText}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
