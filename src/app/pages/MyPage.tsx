import React, { useState } from "react"; 
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { changePasswordAPI } from "../api/auth";

export default function MyPage() {
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Retrieve the raw string data
  const rawData = sessionStorage.getItem('user_session');

  // Parse it back into an object if it was JSON
  const sessionData = rawData ? JSON.parse(rawData) : null;

  const userInfo = {
    name: sessionData?.user_name ?? sessionData?.name ?? "사용자",
    email: sessionData?.email ?? "no-reply@example.com",
    department: "개인정보보호과",
    position: "주무관",
    roles: (sessionData?.roles ?? []) as string[],
    joinDate: "2025.03.15",
  };

  const handlePasswordChange = async(e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordData.new.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    try {
      await changePasswordAPI(
        userInfo.email,
        sessionData?.id,          // 로그인 시 저장해둔 id
        passwordData.current,
        passwordData.new
      );
      toast.success("비밀번호가 변경되었습니다.");
      setIsChangingPassword(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  const roleColors: Record<string, string> = {
    "실무 담당자": "bg-[var(--status-info)] text-white border-transparent",
    결재권자: "bg-[var(--status-pending)] text-white border-transparent",
    관리자: "bg-primary text-white border-transparent",
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header userName={userInfo.name} userRole={userInfo.roles[0]??"실무자"} notifications={[]} />

      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/staff/dashboard")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-medium">마이페이지</h2>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>내 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="size-10 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-medium text-foreground">
                      {userInfo.name}
                    </h3>
                    <div className="flex gap-1">
                      {userInfo.roles.map((role, idx) => (
                        <Badge key={idx} className={roleColors[role]}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userInfo.department} · {userInfo.position}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">이메일</span>
                    <p className="text-foreground mt-1">{userInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">가입일</span>
                    <p className="text-foreground mt-1">{userInfo.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
          </CardHeader>
          <CardContent>
            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">현재 비밀번호</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current: e.target.value })
                    }
                    className="bg-input-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new">새 비밀번호</Label>
                  <Input
                    id="new"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    className="bg-input-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">새 비밀번호 확인</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    className="bg-input-background"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ current: "", new: "", confirm: "" });
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="flex-1">
                    비밀번호 변경
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  보안을 위해 주기적으로 비밀번호를 변경해주세요.
                </p>
                <Button onClick={() => setIsChangingPassword(true)}>
                  비밀번호 변경하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
