import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, FileText, MessageSquare, Cpu, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: Users,
      label: "전체 사용자 수",
      value: "47",
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

  const users = [
    {
      id: 1,
      name: "김주무관",
      email: "kim@agency.go.kr",
      roles: ["실무 담당자"],
      joinDate: "2025.03.15",
      lastActive: "2026.06.02 14:32",
    },
    {
      id: 2,
      name: "박과장",
      email: "park@agency.go.kr",
      roles: ["결재권자", "관리자"],
      joinDate: "2024.01.10",
      lastActive: "2026.06.02 15:10",
    },
    {
      id: 3,
      name: "이대리",
      email: "lee@agency.go.kr",
      roles: ["실무 담당자"],
      joinDate: "2025.06.20",
      lastActive: "2026.06.01 16:45",
    },
    {
      id: 4,
      name: "최팀장",
      email: "choi@agency.go.kr",
      roles: ["결재권자"],
      joinDate: "2023.09.05",
      lastActive: "2026.06.02 09:15",
    },
    {
      id: 5,
      name: "정주임",
      email: "jung@agency.go.kr",
      roles: ["실무 담당자"],
      joinDate: "2025.11.12",
      lastActive: "2026.05.31 17:20",
    },
  ];

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
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
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
                          {user.roles.map((role, idx) => (
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
                        {user.joinDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
