import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import toast, { Toaster } from "react-hot-toast";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowLeft, X, FileText, File } from "lucide-react";

export default function DraftCreation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [approver, setApprover] = useState("park");

  const attachedSource = {
    type: "summary",
    name: "신규_공모사업_지침.pdf 요약",
    icon: <FileText className="size-4" />,
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h2 className="text-lg font-medium">기안 작성</h2>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
        {attachedSource && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📎 근거:</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    {attachedSource.icon}
                    <span className="font-medium">{attachedSource.name}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="size-7">
                  <X className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">기안 제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="기안 제목을 입력하세요"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">본문</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상신 내용을 작성하세요. 첨부된 근거를 인용할 수 있습니다."
                className="bg-input-background min-h-[300px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">결재자</Label>
              <Select value={approver} onValueChange={setApprover}>
                <SelectTrigger id="approver" className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="park">박과장 (결재권자)</SelectItem>
                  <SelectItem value="kim">김팀장 (부결재권자)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1">
                임시저장
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("기안이 상신되었습니다.");
                  navigate("/staff/dashboard");
                }}
              >
                상신
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              상신 시 결재자에게 알림이 전송됩니다
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
