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
import { Plus, Trash2, Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";

const typeConfig: any = {
  reuniao: { label: "Reunião", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  visita: { label: "Visita", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  ligacao: { label: "Ligação", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  prazo: { label: "Prazo", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  outro: { label: "Outro", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
};

const statusConfig: any = {
  agendado: { label: "Agendado", color: "bg-blue-500/15 text-blue-400" },
  realizado: { label: "Realizado", color: "bg-emerald-500/15 text-emerald-400" },
  cancelado: { label: "Cancelado", color: "bg-red-500/15 text-red-400" },
};

export default function Agenda() {
  const [openNew, setOpenNew] = useState(false);
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split("T")[0];

  const { data: events = [], refetch } = trpc.agenda.list.useQuery({ startDate: startOfMonth, endDate: endOfMonth });
  const createMutation = trpc.agenda.create.useMutation({ onSuccess: () => { toast.success("Compromisso criado!"); setOpenNew(false); refetch(); reset(); }, onError: () => toast.error("Erro") });
  const updateMutation = trpc.agenda.update.useMutation({ onSuccess: () => { toast.success("Atualizado!"); refetch(); } });
  const deleteMutation = trpc.agenda.delete.useMutation({ onSuccess: () => { toast.success("Removido"); refetch(); } });

  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues: { title: "", description: "", location: "", startAt: "", endAt: "", type: "outro" } });
  const onSubmit = (data: any) => createMutation.mutate({ title: data.title, description: data.description || undefined, location: data.location || undefined, startAt: data.startAt, endAt: data.endAt || undefined, type: data.type });

  const upcoming = events.filter((e: any) => e.status === "agendado" && new Date(e.startAt) >= today).slice(0, 20);
  const past = events.filter((e: any) => e.status !== "agendado" || new Date(e.startAt) < today).slice(0, 10);

  const formatDateTime = (dt: any) => {
    const d = new Date(dt);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Agenda</h1><p className="text-muted-foreground text-sm mt-1">Seus compromissos e marcações pessoais</p></div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Compromisso</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Compromisso</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-1.5"><Label>Título *</Label><Input {...register("title", { required: true })} placeholder="Ex: Reunião com cliente..." /></div>
              <div className="space-y-1.5"><Label>Tipo</Label>
                <Select defaultValue="outro" onValueChange={v => setValue("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeConfig).map(([k, v]: any) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Início *</Label><Input {...register("startAt", { required: true })} type="datetime-local" /></div>
                <div className="space-y-1.5"><Label>Fim</Label><Input {...register("endAt")} type="datetime-local" /></div>
              </div>
              <div className="space-y-1.5"><Label>Local</Label><Input {...register("location")} placeholder="Endereço ou link..." /></div>
              <div className="space-y-1.5"><Label>Descrição</Label><Textarea {...register("description")} rows={2} /></div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenNew(false); reset(); }}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>{createMutation.isPending ? "Salvando..." : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Próximos Compromissos</h2>
          {upcoming.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">Nenhum compromisso agendado</div>}
          {upcoming.map((event: any) => (
            <Card key={event.id} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-sm">{event.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{formatDateTime(event.startAt)}
                    </div>
                    {event.location && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{event.location}</div>}
                  </div>
                  <Badge className={`text-xs border ${typeConfig[event.type]?.color}`}>{typeConfig[event.type]?.label}</Badge>
                </div>
                {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                <div className="flex gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={() => updateMutation.mutate({ id: event.id, data: { status: "realizado" } })}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />Realizado
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate({ id: event.id })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Histórico Recente</h2>
          {past.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">Nenhum histórico</div>}
          {past.map((event: any) => (
            <Card key={event.id} className="border-border opacity-70">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{event.title}</p>
                  <Badge className={`text-xs ${statusConfig[event.status]?.color}`}>{statusConfig[event.status]?.label}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDateTime(event.startAt)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
