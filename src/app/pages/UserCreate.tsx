import { useState } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { signupAPI } from "../api/auth";

export default function UserCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    //department: "",
    //position: "",
    roles: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  //const departments = ["기획조정실", "정보화담당관", "개인정보보호과", "데이터정책과", "감사담당관"];
  //const positions = ["주무관", "사무관", "서기관", "과장", "팀장", "국장"];

  const availableRoles = [
    { id: "staff", label: "실무 담당자" },
    { id: "approver", label: "결재권자" },
    { id: "admin", label: "관리자" },
  ];

  const toggleRole = (roleId: string, roleName: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      //!formData.department ||
      //!formData.position ||
      formData.roles.length === 0
    ) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await signupAPI(formData.email, formData.name, formData.roles);
      toast.success("계정이 생성되었습니다.");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "계정 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="size-4" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-medium text-foreground">유저 생성</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 사용자 계정 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">사용자 이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="홍길동"
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="hong@agency.go.kr"
                  className="bg-input-background"
                />
              </div>
              {/* 부서와 직급 우선 주석 처리}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">선택하세요</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">직급</Label>
                  <select
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">선택하세요</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>*/}

              <div className="space-y-3">
                <Label>권한 설정</Label>
                <p className="text-sm text-muted-foreground">
                  한 사용자에게 여러 권한을 부여할 수 있습니다
                </p>
                <div className="space-y-3">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={formData.roles.includes(role.label)}
                        onCheckedChange={() => toggleRole(role.id, role.label)}
                      />
                      <label
                        htmlFor={role.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm text-foreground">
                  초기 비밀번호는 <code className="px-1.5 py-0.5 bg-muted rounded text-primary font-mono">000000</code>으로 설정되며,
                  최초 로그인 시 비밀번호 변경이 필요합니다.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  취소
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "생성중..." : "계정 생성"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
