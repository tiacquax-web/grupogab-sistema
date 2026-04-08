import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  success: { label: "Sucesso", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  warning: { label: "Aviso", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: AlertTriangle },
  error: { label: "Erro", color: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
};

const MODULES_LIST = ["all", "admin", "financeiro", "clientes", "crm", "compras", "chat", "agenda", "projetos", "documentos"];

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [status, setStatus] = useState<"all" | "success" | "error" | "warning">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, refetch, isFetching } = trpc.admin.listLogs.useQuery({
    page,
    limit: LIMIT,
    search: search || undefined,
    module: module !== "all" ? module : undefined,
    status: status !== "all" ? status : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const clearFilters = () => {
    setSearch(""); setModule("all"); setStatus("all");
    setDateFrom(""); setDateTo(""); setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por ação, usuário ou descrição..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        <Select value={module} onValueChange={v => { setModule(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Módulo" /></SelectTrigger>
          <SelectContent>
            {MODULES_LIST.map(m => <SelectItem key={m} value={m}>{m === "all" ? "Todos os módulos" : m}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={v => { setStatus(v as any); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="warning">Aviso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
          </SelectContent>
        </Select>

        <Input type="date" className="w-40" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
        <Input type="date" className="w-40" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />

        <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
          Limpar
        </Button>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} registro(s) encontrado(s)</span>
        {totalPages > 1 && <span>Página {page} de {totalPages}</span>}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data/Hora</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Usuário</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Módulo</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Ação</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Descrição</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  {isFetching ? "Carregando..." : "Nenhum log encontrado para os filtros aplicados"}
                </td>
              </tr>
            )}
            {(logs as any[]).map((log: any) => {
              const statusCfg = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.success;
              const StatusIcon = statusCfg.icon;
              return (
                <tr key={log.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-medium">{log.userName ?? "Sistema"}</p>
                      {log.userEmail && <p className="text-[10px] text-muted-foreground">{log.userEmail}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="text-[10px] bg-muted/50 border border-border capitalize">{log.module}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-[10px] bg-muted/40 px-1.5 py-0.5 rounded font-mono">{log.action}</code>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate" title={log.description ?? ""}>
                    {log.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border gap-1 ${statusCfg.color}`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {statusCfg.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0 text-xs"
                onClick={() => setPage(p)}>
                {p}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
