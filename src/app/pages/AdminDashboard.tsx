import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, FileText, MessageSquare, Cpu, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import toast from "react-hot-toast";
import { getMeAPI, getUsersAPI, resetUserPasswordAPI, forceLogoutUserAPI } from "../api/auth";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  user_rank: number;
  user_login: string | null;
  user_create: string | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const userList = await getUsersAPI();
      setUsers(userList);
    } catch (error: any) {
      toast.error(error?.message || "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      const meData = await getMeAPI();
      if (meData?.user_rank >= 7) {
        setIsAdmin(true);
        await loadUsers();
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin === false) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  const stats = [
    {
      icon: Users,
      label: "전체 사용자 수",
      value: loadingUsers ? "..." : users.length.toString(),
      trend: "+3",
      trendLabel: "이번 달",
    },
    {
      icon: FileText,
      label: "총 업로드 문서 수",
      value: "1,234",
      trend: "+156",
      trendLabel: "이번 달",
    },
    {
      icon: MessageSquare,
      label: "RAG 질의 건수(누적)",
      value: "8,921",
      trend: "+421",
      trendLabel: "이번 주",
    },
    {
      icon: Cpu,
      label: "로컬 LLM 호출 횟수",
      value: "12,456",
      trend: "+892",
      trendLabel: "이번 주",
    },
  ];

  const getRolesFromRank = (rank: number) => {
    if (rank >= 7) return ["결재권자", "관리자"];
    if (rank >= 3) return ["결재권자"];
    return ["실무 담당자"];
  };

  const handleResetPassword = async (userId: number) => {
    setPendingActionId(userId);
    try {
      await resetUserPasswordAPI(userId);
      toast.success("암호가 초기화되었습니다.");
      await loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "암호 초기화에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleForceLogout = async (userId: number) => {
    setPendingActionId(userId);
    try {
      await forceLogoutUserAPI(userId);
      toast.success("사용자가 로그아웃되었습니다.");
      await loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "로그아웃 처리에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  };

  const roleColors: Record<string, string> = {
    "실무 담당자": "bg-[var(--status-info)] text-white border-transparent",
    결재권자: "bg-[var(--status-pending)] text-white border-transparent",
    관리자: "bg-primary text-white border-transparent",
  };

  const categoryData = [
    { name: "감사", value: 234, color: "#DC2626" },
    { name: "공모사업", value: 189, color: "#F59E0B" },
    { name: "가이드라인", value: 445, color: "#2B6E72" },
    { name: "기타", value: 366, color: "#3B82F6" },
  ];

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-base text-muted-foreground">관리자 인증 중...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-foreground">관리자 대시보드</h1>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-medium text-foreground">
                        {stat.value}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-[var(--status-approved)]">
                        <TrendingUp className="size-3" />
                        {stat.trend}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.trendLabel}
                    </p>
                  </div>
                  <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="size-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>문서 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>사용자 목록</CardTitle>
            <Button onClick={() => navigate("/admin/users/create")}>
              <Users className="size-4" />
              유저 생성
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      권한
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      가입일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      최근 활동
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roles = getRolesFromRank(user.user_rank);
                    const joinDate = user.user_create
                      ? new Date(user.user_create).toLocaleDateString("ko-KR")
                      : "-";
                    const lastActive = user.user_login
                      ? new Date(user.user_login).toLocaleString("ko-KR")
                      : "접속 기록 없음";

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/users/${user.id}/activity`)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {roles.map((role, idx) => (
                              <Badge
                                key={idx}
                                className={roleColors[role]}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {joinDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {lastActive}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pendingActionId === user.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetPassword(user.id);
                              }}
                            >
                              암호 리셋
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={pendingActionId === user.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleForceLogout(user.id);
                              }}
                            >
                              로그아웃
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
