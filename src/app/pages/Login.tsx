import React, { useState } from "react"; 
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PasswordChangeModal } from "../components/PasswordChangeModal";
import { API_BASE_URL } from "../../lib/api";
import {getMeAPI} from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    sessionStorage.removeItem("user_session");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.detail || data.message || "로그인에 실패했습니다.");
        return;
      }

      // 초기 비밀번호로 로그인할 때 user_login이 null인지 확인
      if (data.user_login === null) {
        setUserData(data);
        console.log("stupid ", data.user_login);
        setShowPasswordModal(true);
        return;
      }

      if (data.name && data.email) {
        sessionStorage.setItem(
          "user_session",
          JSON.stringify({
            user_name: data.user_name ?? data.name,
            name: data.name,
            email: data.email,
            id: data.id,
            roles: data.roles ?? [],
          })
        );
      } else {
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });
        const meData = await meResponse.json().catch(() => ({}));
        if (meResponse.ok && meData.authenticated) {
          sessionStorage.setItem(
            "user_session",
            JSON.stringify({
              user_name: meData.user_name ?? meData.name,
              name: meData.name,
              email: meData.email,
              id: meData.id,
              roles: meData.roles ?? [],
            })
          );
        } else {
          sessionStorage.removeItem("user_session");
        }
      }

      // Retrieve the raw string data
      const rawData = sessionStorage.getItem('user_session');

      // Parse it back into an object if it was JSON
      const sessionData = rawData ? JSON.parse(rawData) : null;

      const roles: string[] = sessionData?.roles ?? [];
      
      if (roles.includes("관리자")) {
        navigate("/admin/dashboard");
      } else if (roles.includes("결재권자")) {
        navigate("/staff/dashboard/approver");
      } else if (roles.includes("실무 담당자")) {
        navigate("/staff/dashboard");
      } else {
        navigate("/rag-search");
      }
    } catch (error) {
      console.error("login error:", error); 
      setErrorMessage("서버에 연결할 수 없습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
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
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-input-background"
                required
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
                required
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            본 시스템은 폐쇄망 내부에서만 접속 가능합니다
          </p>
        </CardContent>
      </Card>

      <PasswordChangeModal
        open={showPasswordModal}
        email={email}
        userId={userData?.id}
        onClose={async () => {
          setShowPasswordModal(false);
          const meData = await getMeAPI();
          const roles: string[] = meData?.roles ?? [];
          if (roles.includes("관리자")) {
            navigate("/admin/dashboard");
          } else if (roles.includes("결재권자")) {
            navigate("/staff/dashboard/approver");
          } else if (roles.includes("실무 담당자")) {
            navigate("/staff/dashboard");
          } else {
            navigate("/rag-search");
          }
        }}
      />
    </div>
  );
}
