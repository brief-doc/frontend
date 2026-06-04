import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PasswordChangeModal } from "../components/PasswordChangeModal";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 초기 비밀번호 체크
    if (password === "000000") {
      setShowPasswordModal(true);
      return;
    }

    if (username === "admin" || username.includes("관리자")) {
      navigate("/admin/dashboard");
    } else if (username === "approver" || username.includes("박과장")) {
      navigate("/staff/dashboard/approver");
    } else {
      navigate("/staff/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <div className="text-2xl">🏛️</div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-medium text-foreground">
              가명정보 처리 자동화
            </h1>
            <Badge
              variant="outline"
              className="bg-muted border-border text-muted-foreground"
            >
              🔒 폐쇄망
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="bg-input-background"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              로그인
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            본 시스템은 폐쇄망 내부에서만 접속 가능합니다
          </p>
        </CardContent>
      </Card>

      <PasswordChangeModal
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          if (username === "admin" || username.includes("관리자")) {
            navigate("/admin/dashboard");
          } else if (username === "approver" || username.includes("박과장")) {
            navigate("/staff/dashboard/approver");
          } else {
            navigate("/staff/dashboard");
          }
        }}
      />
    </div>
  );
}
