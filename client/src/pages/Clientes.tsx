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
import { Plus, Search, Trash2, Phone, Mail, Building2, MapPin, Upload } from "lucide-react";
import { useForm } from "react-hook-form";

const typeConfig: any = {
  pessoa_fisica: { label: "Pessoa Física", color: "bg-blue-500/15 text-blue-400" },
  pessoa_juridica: { label: "Pessoa Jurídica", color: "bg-violet-500/15 text-violet-400" },
};
const statusConfig: any = {
  ativo: { label: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  inativo: { label: "Inativo", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  prospecto: { label: "Prospecto", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ativo" | "inativo" | undefined>("all");
  const [openNew, setOpenNew] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [csvData, setCsvData] = useState("");

  const { data: clients = [], refetch } = trpc.clients.list.useQuery({ search, status: filterStatus !== "all" ? filterStatus : undefined });
  const createMutation = trpc.clients.create.useMutation({ onSuccess: () => { toast.success("Cliente criado!"); setOpenNew(false); refetch(); reset(); }, onError: () => toast.error("Erro") });
  const deleteMutation = trpc.clients.delete.useMutation({ onSuccess: () => { toast.success("Cliente removido"); refetch(); } });
  const importMutation = trpc.clients.importCsv.useMutation({ onSuccess: (res: any) => { toast.success(`${res.imported} clientes importados!`); setOpenImport(false); setCsvData(""); refetch(); }, onError: () => toast.error("Erro na importação") });

  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues: { name: "", type: "pessoa_fisica", email: "", phone: "", document: "", company: "", address: "", city: "", state: "", zipCode: "", status: "ativo", notes: "" } });
  const onSubmit = (data: any) => createMutation.mutate(data);

  const handleImport = () => {
    if (!csvData.trim()) { toast.error("Cole os dados CSV"); return; }
    importMutation.mutate({ csvContent: csvData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Clientes</h1><p className="text-muted-foreground text-sm mt-1">Gerencie sua base de clientes</p></div>
        <div className="flex gap-2">
          <Dialog open={openImport} onOpenChange={setOpenImport}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />Importar CSV</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Importar Clientes via CSV</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Formato esperado (cabeçalho obrigatório):</p>
                  <code className="block">nome,tipo,email,telefone,documento,empresa,cidade,estado</code>
                </div>
                <div className="space-y-1.5"><Label>Cole os dados CSV aqui</Label><Textarea value={csvData} onChange={e => setCsvData(e.target.value)} rows={8} placeholder="nome,tipo,email,telefone..." className="font-mono text-xs" /></div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setOpenImport(false)}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleImport} disabled={importMutation.isPending}>{importMutation.isPending ? "Importando..." : "Importar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Cliente</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="space-y-1.5"><Label>Nome *</Label><Input {...register("name", { required: true })} placeholder="Nome completo ou razão social" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Tipo</Label>
                    <Select defaultValue="pessoa_fisica" onValueChange={v => setValue("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="pessoa_fisica">Pessoa Física</SelectItem><SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Status</Label>
                    <Select defaultValue="ativo" onValueChange={v => setValue("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem><SelectItem value="prospecto">Prospecto</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>E-mail</Label><Input {...register("email")} type="email" placeholder="email@..." /></div>
                  <div className="space-y-1.5"><Label>Telefone</Label><Input {...register("phone")} placeholder="(00) 00000-0000" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>CPF/CNPJ</Label><Input {...register("document")} placeholder="000.000.000-00" /></div>
                  <div className="space-y-1.5"><Label>Empresa</Label><Input {...register("company")} placeholder="Nome da empresa" /></div>
                </div>
                <div className="space-y-1.5"><Label>Endereço</Label><Input {...register("address")} placeholder="Rua, número, bairro..." /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-2"><Label>Cidade</Label><Input {...register("city")} placeholder="Cidade" /></div>
                  <div className="space-y-1.5"><Label>Estado</Label><Input {...register("state")} placeholder="UF" maxLength={2} /></div>
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
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="ativo">Ativos</SelectItem><SelectItem value="inativo">Inativos</SelectItem><SelectItem value="prospecto">Prospectos</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(clients as any[]).length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
        {(clients as any[]).map((client: any) => (
          <Card key={client.id} className="border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-sm">{client.name}</p>
                  {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge className={`text-xs border ${statusConfig[client.status]?.color}`}>{statusConfig[client.status]?.label}</Badge>
                  <Badge className={`text-xs ${typeConfig[client.type]?.color}`}>{typeConfig[client.type]?.label}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                {client.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{client.email}</div>}
                {client.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{client.phone}</div>}
                {client.city && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{client.city}{client.state ? `, ${client.state}` : ""}</div>}
              </div>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate({ id: client.id })}><Trash2 className="h-3 w-3" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
