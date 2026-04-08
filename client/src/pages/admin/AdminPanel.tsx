import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldCheck, Activity, BarChart3, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AdminUsers from "./AdminUsers";
import AdminPermissions from "./AdminPermissions";
import AdminLogs from "./AdminLogs";

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user || user.role !== "admin") return <Redirect to="/" />;

  return <AdminPanelContent />;
}

function AdminPanelContent() {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: logStats } = trpc.admin.logStats.useQuery();

  const statusColors: Record<string, string> = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
  };

  const moduleColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#f97316", "#84cc16"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Painel de Administração
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie usuários, permissões e monitore atividades do sistema</p>
        </div>
        <Badge className="bg-primary/15 text-primary border border-primary/30 px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
          Acesso Admin
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">Total Usuários</p>
              <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats?.adminUsers ?? 0} admins</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">Usuários Comuns</p>
              <div className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Users className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats?.activeUsers ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">role: user</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">Total de Logs</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{Number(stats?.totalLogs ?? 0).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground mt-1">ações registradas</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">Ações (24h)</p>
              <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{Number(stats?.recentActions ?? 0).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground mt-1">últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">Status Sistema</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-400">Operacional</p>
            <p className="text-xs text-muted-foreground mt-1">todos os módulos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity by Day */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Atividade por Dia (últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(logStats?.byDay?.length ?? 0) === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Nenhuma atividade registrada ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={logStats?.byDay ?? []}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ações" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Logs por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(logStats?.byStatus ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados ainda</p>
            ) : (
              (logStats?.byStatus ?? []).map((s: any) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[s.name] ?? "#888" }} />
                    <span className="text-xs capitalize">{s.name}</span>
                  </div>
                  <Badge className="text-xs" style={{ backgroundColor: `${statusColors[s.name]}20`, color: statusColors[s.name] }}>
                    {s.count}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modules activity */}
      {(logStats?.byModule?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Atividade por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {(logStats?.byModule ?? []).slice(0, 8).map((m: any, i: number) => (
                <div key={m.name} className="text-center p-3 rounded-lg border border-border bg-muted/20">
                  <p className="text-xl font-bold" style={{ color: moduleColors[i] }}>{m.count}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">{m.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for management sections */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="users" className="gap-2 text-xs">
            <Users className="h-3.5 w-3.5" />Usuários
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />Permissões
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 text-xs">
            <Activity className="h-3.5 w-3.5" />Logs de Atividade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="permissions"><AdminPermissions /></TabsContent>
        <TabsContent value="logs"><AdminLogs /></TabsContent>
      </Tabs>
    </div>
  );
}
