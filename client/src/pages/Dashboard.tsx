import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, CreditCard, FolderKanban, MessageSquare, ShoppingCart, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const areaData = [
  { mes: "Out", pagar: 18000, receber: 24000 },
  { mes: "Nov", pagar: 22000, receber: 28000 },
  { mes: "Dez", pagar: 19000, receber: 31000 },
  { mes: "Jan", pagar: 25000, receber: 27000 },
  { mes: "Fev", pagar: 21000, receber: 35000 },
  { mes: "Mar", pagar: 28000, receber: 42000 },
];

const pieData = [
  { name: "Obras", value: 45, color: "#e07040" },
  { name: "Serviços", value: 30, color: "#4090c0" },
  { name: "Administrativo", value: 15, color: "#40b080" },
  { name: "Outros", value: 10, color: "#808090" },
];

const kpiCards = [
  { title: "Contas a Pagar", value: "R$ 28.450", change: "+12%", trend: "up", icon: CreditCard, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", path: "/financeiro/contas-pagar", detail: "8 vencendo esta semana" },
  { title: "Contas a Receber", value: "R$ 42.800", change: "+8%", trend: "up", icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", path: "/financeiro/contas-receber", detail: "5 a receber hoje" },
  { title: "Clientes Ativos", value: "124", change: "+3", trend: "up", icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", path: "/clientes", detail: "3 novos este mês" },
  { title: "Projetos em Andamento", value: "7", change: "2 atrasados", trend: "down", icon: FolderKanban, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", path: "/projetos", detail: "2 com prazo crítico" },
];

const recentActivities = [
  { text: "Conta de fornecedor vencendo amanhã", value: "R$ 3.200", urgent: true },
  { text: "Pagamento recebido - Cliente Silva", value: "R$ 8.500", urgent: false },
  { text: "Novo lead: Construtora Horizonte", value: "R$ 45.000", urgent: false },
  { text: "Obra Residencial Fase 2 - Atrasada", value: "3 dias", urgent: true },
  { text: "OC #0042 aguardando aprovação", value: "R$ 12.800", urgent: false },
];

const quickActions = [
  { label: "Nova Conta a Pagar", icon: CreditCard, path: "/financeiro/contas-pagar", color: "text-amber-400" },
  { label: "Novo Cliente", icon: Users, path: "/clientes", color: "text-blue-400" },
  { label: "Nova Ordem de Compra", icon: ShoppingCart, path: "/ordens-compra", color: "text-green-400" },
  { label: "Novo Lead CRM", icon: BarChart3, path: "/crm", color: "text-purple-400" },
  { label: "Agendar Compromisso", icon: CalendarDays, path: "/agenda", color: "text-pink-400" },
  { label: "Enviar Mensagem", icon: MessageSquare, path: "/chat", color: "text-cyan-400" },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {user?.name?.split(" ")[0] || "bem-vindo"}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resumo operacional do Grupo GAB — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/30 text-primary">Sistema Ativo</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={`border ${kpi.borderColor} hover:bg-accent/30 transition-all cursor-pointer group`} onClick={() => setLocation(kpi.path)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}><kpi.icon className={`h-5 w-5 ${kpi.color}`} /></div>
                <div className="flex items-center gap-1 text-xs">
                  {kpi.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                  <span className={kpi.trend === "up" ? "text-emerald-400" : "text-red-400"}>{kpi.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{kpi.title}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{kpi.detail}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <span>Ver detalhes</span><ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Fluxo Financeiro — Últimos 6 meses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPagar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e07040" stopOpacity={0.3} /><stop offset="95%" stopColor="#e07040" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReceber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40b080" stopOpacity={0.3} /><stop offset="95%" stopColor="#40b080" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#1a1c2a", border: "1px solid #333", borderRadius: "8px", fontSize: 12 }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                <Area type="monotone" dataKey="pagar" name="A Pagar" stroke="#e07040" fill="url(#colorPagar)" strokeWidth={2} />
                <Area type="monotone" dataKey="receber" name="A Receber" stroke="#40b080" fill="url(#colorReceber)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-3 h-0.5 bg-amber-500 rounded" /><span>A Pagar</span></div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-3 h-0.5 bg-emerald-500 rounded" /><span>A Receber</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Centro de Custo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1c2a", border: "1px solid #333", borderRadius: "8px", fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} /><span className="text-muted-foreground">{item.name}</span></div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Atividades Recentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${a.urgent ? "bg-red-400" : "bg-emerald-400"}`} />
                <p className="text-sm flex-1 truncate">{a.text}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">{a.value}</span>
                  {a.urgent && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Ações Rápidas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" className="h-auto py-3 px-3 flex items-center gap-2.5 justify-start hover:bg-accent/50 border-border text-left" onClick={() => setLocation(action.path)}>
                  <action.icon className={`h-4 w-4 shrink-0 ${action.color}`} />
                  <span className="text-xs font-medium leading-tight">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
