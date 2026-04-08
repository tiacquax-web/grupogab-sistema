import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, FolderKanban, DollarSign } from "lucide-react";

function formatCurrency(val: any) { return `R$ ${parseFloat(String(val || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function Relatorios() {
  const { data: payableSummary } = trpc.financial.summaryPayable.useQuery();
  const { data: receivableSummary } = trpc.financial.summaryReceivable.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();

  const payableChartData = [
    { name: "A Pagar", value: parseFloat(String(payableSummary?.aPagar || 0)) },
    { name: "Em Aberto", value: parseFloat(String(payableSummary?.emAberto || 0)) },
    { name: "Pago", value: parseFloat(String(payableSummary?.pago || 0)) },
  ];

  const receivableChartData = [
    { name: "A Receber", value: parseFloat(String(receivableSummary?.aReceber || 0)) },
    { name: "Em Aberto", value: parseFloat(String(receivableSummary?.emAberto || 0)) },
    { name: "Recebido", value: parseFloat(String(receivableSummary?.recebido || 0)) },
  ];

  const totalPagar = parseFloat(String(payableSummary?.aPagar || 0)) + parseFloat(String(payableSummary?.emAberto || 0));
  const totalReceber = parseFloat(String(receivableSummary?.aReceber || 0)) + parseFloat(String(receivableSummary?.emAberto || 0));
  const saldo = parseFloat(String(receivableSummary?.recebido || 0)) - parseFloat(String(payableSummary?.pago || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios & Análises</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão consolidada do negócio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">A Pagar (pendente)</p>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalPagar)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">A Receber (pendente)</p>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-blue-400">{formatCurrency(totalReceber)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Saldo Realizado</p>
              <DollarSign className={`h-4 w-4 ${saldo >= 0 ? "text-emerald-400" : "text-red-400"}`} />
            </div>
            <p className={`text-xl font-bold ${saldo >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(saldo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Clientes Ativos</p>
              <Users className="h-4 w-4 text-violet-400" />
            </div>
            <p className="text-xl font-bold text-violet-400">{(clients as any[]).filter((c: any) => c.status === "ativo").length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Contas a Pagar por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payableChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {payableChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Contas a Receber por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={receivableChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {receivableChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FolderKanban className="h-4 w-4" />Projetos por Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["planejamento","em_andamento","pausado","concluido","cancelado"].map(status => {
              const count = (projects as any[]).filter((p: any) => p.status === status).length;
              const labels: Record<string, string> = { planejamento: "Planejamento", em_andamento: "Em Andamento", pausado: "Pausado", concluido: "Concluído", cancelado: "Cancelado" };
              return (
                <div key={status} className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{labels[status]}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
