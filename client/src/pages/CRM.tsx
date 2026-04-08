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
import { Plus, Search, Trash2, Phone, Mail, Building2, MoveRight } from "lucide-react";
import { useForm } from "react-hook-form";

const STAGES = [
  { key: "novo", label: "Novo Lead", color: "border-t-zinc-500", badge: "bg-zinc-500/15 text-zinc-400" },
  { key: "primeira_tentativa", label: "1ª Tentativa", color: "border-t-blue-500", badge: "bg-blue-500/15 text-blue-400" },
  { key: "segunda_tentativa", label: "2ª Tentativa", color: "border-t-indigo-500", badge: "bg-indigo-500/15 text-indigo-400" },
  { key: "terceira_tentativa", label: "3ª Tentativa", color: "border-t-violet-500", badge: "bg-violet-500/15 text-violet-400" },
  { key: "proposta", label: "Proposta", color: "border-t-amber-500", badge: "bg-amber-500/15 text-amber-400" },
  { key: "negociacao", label: "Negociação", color: "border-t-orange-500", badge: "bg-orange-500/15 text-orange-400" },
  { key: "fechado_ganho", label: "Fechado ✓", color: "border-t-emerald-500", badge: "bg-emerald-500/15 text-emerald-400" },
  { key: "fechado_perdido", label: "Perdido ✗", color: "border-t-red-500", badge: "bg-red-500/15 text-red-400" },
];

const priorityColors: any = { baixa: "text-zinc-400", media: "text-amber-400", alta: "text-red-400" };

export default function CRM() {
  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const { data: leads = [], refetch } = trpc.crm.listLeads.useQuery({ search });
  const createMutation = trpc.crm.createLead.useMutation({ onSuccess: () => { toast.success("Lead criado!"); setOpenNew(false); refetch(); reset(); }, onError: () => toast.error("Erro") });
  const updateStageMutation = trpc.crm.updateLeadStage.useMutation({ onSuccess: () => { toast.success("Estágio atualizado!"); refetch(); } });
  const deleteMutation = trpc.crm.deleteLead.useMutation({ onSuccess: () => { toast.success("Lead removido"); refetch(); } });
  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues: { name: "", email: "", phone: "", company: "", stage: "novo", value: "", source: "", priority: "media", notes: "" } });
  const onSubmit = (data: any) => createMutation.mutate({ ...data, value: data.value || undefined });

  const getNextStage = (current: string) => {
    const idx = STAGES.findIndex(s => s.key === current);
    return idx < STAGES.length - 1 ? STAGES[idx + 1].key : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">CRM — Funil de Vendas</h1><p className="text-muted-foreground text-sm mt-1">Acompanhe seus leads em cada etapa do funil</p></div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Lead</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-1.5"><Label>Nome *</Label><Input {...register("name", { required: true })} placeholder="Nome do lead" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>E-mail</Label><Input {...register("email")} type="email" placeholder="email@..." /></div>
                <div className="space-y-1.5"><Label>Telefone</Label><Input {...register("phone")} placeholder="(00) 00000-0000" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Empresa</Label><Input {...register("company")} placeholder="Nome da empresa" /></div>
                <div className="space-y-1.5"><Label>Valor estimado</Label><Input {...register("value")} type="number" step="0.01" placeholder="0.00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Estágio</Label>
                  <Select defaultValue="novo" onValueChange={v => setValue("stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Prioridade</Label>
                  <Select defaultValue="media" onValueChange={v => setValue("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Origem</Label><Input {...register("source")} placeholder="Ex: Site, Indicação..." /></div>
                <div className="space-y-1.5"><Label>Responsável</Label><Input {...register("assignedToName" as any)} placeholder="Nome do responsável" /></div>
              </div>
              <div className="space-y-1.5"><Label>Observações</Label><Textarea {...register("notes")} rows={2} /></div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenNew(false); reset(); }}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>{createMutation.isPending ? "Salvando..." : "Criar Lead"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar leads..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => {
            const stageLeads = leads.filter((l: any) => l.stage === stage.key);
            return (
              <div key={stage.key} className="w-64 shrink-0 space-y-3">
                <div className={`flex items-center gap-2 p-3 rounded-lg border-t-2 bg-card ${stage.color}`}>
                  <span className="font-semibold text-sm flex-1">{stage.label}</span>
                  <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                </div>
                <div className="space-y-2 min-h-32">
                  {stageLeads.length === 0 && <div className="text-center py-6 text-muted-foreground text-xs">Nenhum lead</div>}
                  {stageLeads.map((lead: any) => (
                    <Card key={lead.id} className="border-border hover:border-primary/30 transition-colors cursor-default">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-semibold leading-tight flex-1">{lead.name}</p>
                          <span className={`text-xs font-medium ${priorityColors[lead.priority]}`}>●</span>
                        </div>
                        {lead.company && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="h-3 w-3" />{lead.company}</div>}
                        {lead.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{lead.phone}</div>}
                        {lead.value && <p className="text-xs font-medium text-emerald-400">R$ {parseFloat(lead.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>}
                        <div className="flex gap-1.5 pt-1">
                          {getNextStage(lead.stage) && (
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1"
                              onClick={() => updateStageMutation.mutate({ id: lead.id, stage: getNextStage(lead.stage) as any })}>
                              Avançar <MoveRight className="h-3 w-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => deleteMutation.mutate({ id: lead.id })}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
