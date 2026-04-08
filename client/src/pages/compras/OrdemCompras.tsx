import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, Trash2, CheckCircle2, User, Building2, Package } from "lucide-react";
import { useForm } from "react-hook-form";

const statusConfig: any = {
  rascunho: { label: "Rascunho", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  pendente: { label: "Pendente", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  aprovado: { label: "Aprovado", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  recebido: { label: "Recebido", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelado: { label: "Cancelado", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function formatCurrency(val: any) { if (!val) return "-"; return `R$ ${parseFloat(String(val)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }
function formatDate(val: any) { if (!val) return "-"; return new Date(val + "T12:00:00").toLocaleDateString("pt-BR"); }

export default function OrdemCompras() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openNew, setOpenNew] = useState(false);
  const { data: orders = [], refetch } = trpc.purchaseOrders.list.useQuery({ status: filterStatus, search });
  const { data: costCenters = [] } = trpc.costCenters.list.useQuery();
  const createMutation = trpc.purchaseOrders.create.useMutation({ onSuccess: () => { toast.success("Ordem criada!"); setOpenNew(false); refetch(); reset(); }, onError: () => toast.error("Erro") });
  const updateMutation = trpc.purchaseOrders.update.useMutation({ onSuccess: () => { toast.success("Atualizado!"); refetch(); } });
  const deleteMutation = trpc.purchaseOrders.delete.useMutation({ onSuccess: () => { toast.success("Removido"); refetch(); } });
  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues: { orderNumber: "", description: "", supplierName: "", responsiblePersonName: "", destinedToName: "", sector: "", totalAmount: "", requestedDate: "", expectedDate: "", notes: "" } });
  const onSubmit = (data: any) => createMutation.mutate({ ...data, totalAmount: data.totalAmount || undefined, requestedDate: data.requestedDate || undefined, expectedDate: data.expectedDate || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Ordens de Compra</h1><p className="text-muted-foreground text-sm mt-1">Gerencie todas as solicitações de compra</p></div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Nova Ordem</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nova Ordem de Compra</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Nº da Ordem *</Label><Input {...register("orderNumber", { required: true })} placeholder="Ex: OC-001" /></div>
                <div className="space-y-1.5"><Label>Valor Total</Label><Input {...register("totalAmount")} type="number" step="0.01" placeholder="0.00" /></div>
              </div>
              <div className="space-y-1.5"><Label>Descrição</Label><Textarea {...register("description")} rows={2} placeholder="Descreva os itens..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Fornecedor</Label><Input {...register("supplierName")} placeholder="Nome do fornecedor" /></div>
                <div className="space-y-1.5"><Label>Responsável</Label><Input {...register("responsiblePersonName")} placeholder="Quem solicitou" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Destinado a (Pessoa)</Label><Input {...register("destinedToName")} placeholder="Nome da pessoa" /></div>
                <div className="space-y-1.5"><Label>Setor</Label><Input {...register("sector")} placeholder="Ex: Engenharia, TI..." /></div>
              </div>
              <div className="space-y-1.5"><Label>Centro de Custo</Label>
                <Select onValueChange={v => setValue("costCenterId" as any, v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>{costCenters.map((cc: any) => <SelectItem key={cc.id} value={String(cc.id)}>{cc.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Data Solicitação</Label><Input {...register("requestedDate")} type="date" /></div>
                <div className="space-y-1.5"><Label>Previsão Entrega</Label><Input {...register("expectedDate")} type="date" /></div>
              </div>
              <div className="space-y-1.5"><Label>Observações</Label><Textarea {...register("notes")} rows={2} /></div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenNew(false); reset(); }}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>{createMutation.isPending ? "Salvando..." : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos</SelectItem>{Object.entries(statusConfig).map(([k, v]: any) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {orders.length === 0 && <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">Nenhuma ordem de compra encontrada</div>}
        {orders.map((order: any) => (
          <Card key={order.id} className="border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{order.orderNumber}</span>
                    <Badge className={`text-xs border ${statusConfig[order.status]?.color}`}>{statusConfig[order.status]?.label}</Badge>
                    {order.totalAmount && <span className="text-sm font-semibold text-emerald-400 ml-auto">{formatCurrency(order.totalAmount)}</span>}
                  </div>
                  {order.description && <p className="text-sm text-muted-foreground">{order.description}</p>}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {order.supplierName && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{order.supplierName}</span>}
                    {order.responsiblePersonName && <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.responsiblePersonName}</span>}
                    {order.destinedToName && <span className="flex items-center gap-1"><User className="h-3 w-3" />Para: {order.destinedToName}</span>}
                    {order.sector && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{order.sector}</span>}
                    {order.expectedDate && <span>Entrega: {formatDate(order.expectedDate as string)}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {order.status === "pendente" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => updateMutation.mutate({ id: order.id, data: { status: "aprovado" } })}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Aprovar
                    </Button>
                  )}
                  {order.status === "aprovado" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => updateMutation.mutate({ id: order.id, data: { status: "recebido" } })}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Recebido
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate({ id: order.id })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
