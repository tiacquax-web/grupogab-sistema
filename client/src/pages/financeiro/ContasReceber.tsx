import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Search, Upload, Download, Paperclip, RefreshCw,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Trash2,
  FileSpreadsheet, X, Repeat, Layers,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

type ReceivableRow = {
  id: number; description: string; clientName?: string | null;
  amount: string; dueDate: string; receivedDate?: string | null;
  status: string; category?: string | null; notes?: string | null;
  attachmentUrl?: string | null; isRecurring: boolean; isInstallment: boolean;
  installmentNumber?: number | null; totalInstallments?: number | null;
  recurrenceType?: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  a_receber:  { label: "A Receber",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  em_aberto:  { label: "Em Aberto",  color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  recebido:   { label: "Recebido",   color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelado:  { label: "Cancelado",  color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

const RECURRENCE_LABELS: Record<string, string> = {
  diario: "Diário", semanal: "Semanal", mensal: "Mensal", anual: "Anual",
};

function downloadCsvTemplate() {
  const header = "descricao,cliente,valor,data_vencimento,categoria,observacoes";
  const example = "Serviço de consultoria,Cliente ABC,5000.00,2026-05-10,Serviços,Projeto X";
  const blob = new Blob([header + "\n" + example], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = "modelo_contas_receber.csv"; a.click();
  URL.revokeObjectURL(url);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseCsv(text: string) {
  const lines = text.trim().split("\n").slice(1);
  return lines.map(line => {
    const [description, clientName, amount, dueDate, category, notes] = line.split(",").map(s => s.trim());
    return { description, clientName, amount, dueDate, category, notes };
  }).filter(r => r.description && r.amount && r.dueDate);
}

const fmt = (v: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));

export default function ContasReceber() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    description: "", clientName: "", amount: "", dueDate: "",
    category: "", notes: "", status: "a_receber" as const,
    isRecurring: false, recurrenceType: "mensal" as const, recurrenceEndDate: "",
    isInstallment: false, totalInstallments: 2,
    attachmentFile: null as File | null,
  });

  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState("");

  const statusFilter = activeTab === "all" ? "all" : activeTab as any;
  const { data: rawRows = [], isLoading } = trpc.financial.listReceivable.useQuery({ status: statusFilter, search });
  const rows: ReceivableRow[] = (rawRows as any[]).map(r => ({
    ...r,
    dueDate: r.dueDate instanceof Date ? r.dueDate.toISOString().split("T")[0] : String(r.dueDate),
    receivedDate: r.receivedDate instanceof Date ? r.receivedDate.toISOString().split("T")[0] : r.receivedDate ? String(r.receivedDate) : null,
  }));
  const { data: summary } = trpc.financial.summaryReceivable.useQuery();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getQueryKey(trpc.financial.listReceivable) });
    qc.invalidateQueries({ queryKey: getQueryKey(trpc.financial.summaryReceivable) });
  };

  const createMut = trpc.financial.createReceivable.useMutation({
    onSuccess: (res: any) => {
      toast.success(res.installments ? `${res.installments} parcelas criadas!` : "Conta cadastrada!");
      invalidate(); setShowForm(false); resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const markReceivedMut = trpc.financial.markAsReceived.useMutation({
    onSuccess: () => { toast.success("Marcado como recebido!"); invalidate(); },
  });
  const deleteMut = trpc.financial.deleteReceivable.useMutation({
    onSuccess: () => { toast.success("Conta excluída."); invalidate(); },
  });
  const uploadMut = trpc.financial.uploadAttachment.useMutation({
    onSuccess: () => { toast.success("Arquivo anexado!"); invalidate(); setUploadingId(null); },
    onError: (e) => { toast.error("Erro no upload: " + e.message); setUploadingId(null); },
  });
  const importMut = trpc.financial.importReceivableCsv.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.imported} registros importados!`);
      invalidate(); setShowImport(false); setCsvRows([]); setCsvFileName("");
    },
    onError: (e) => toast.error("Erro na importação: " + e.message),
  });

  function resetForm() {
    setForm({
      description: "", clientName: "", amount: "", dueDate: "",
      category: "", notes: "", status: "a_receber",
      isRecurring: false, recurrenceType: "mensal", recurrenceEndDate: "",
      isInstallment: false, totalInstallments: 2, attachmentFile: null,
    });
  }

  async function handleSubmit() {
    if (!form.description || !form.amount || !form.dueDate) {
      toast.error("Preencha os campos obrigatórios."); return;
    }
    let attachmentUrl: string | undefined;
    let attachmentKey: string | undefined;
    if (form.attachmentFile) {
      try {
        const base64 = await fileToBase64(form.attachmentFile);
        const result = await uploadMut.mutateAsync({
          fileName: form.attachmentFile.name,
          fileType: form.attachmentFile.type || "application/octet-stream",
          fileBase64: base64, entityType: "receivable",
        });
        attachmentUrl = result.url; attachmentKey = result.key;
      } catch { toast.error("Erro ao fazer upload."); return; }
    }
    createMut.mutate({
      description: form.description, clientName: form.clientName || undefined,
      amount: form.amount, dueDate: form.dueDate, status: form.status,
      category: form.category || undefined, notes: form.notes || undefined,
      isRecurring: form.isRecurring,
      recurrenceType: form.isRecurring ? form.recurrenceType : undefined,
      isInstallment: form.isInstallment,
      totalInstallments: form.isInstallment ? form.totalInstallments : undefined,
    });
  }

  async function handleAttachToRow(row: ReceivableRow) {
    setUploadingId(row.id);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploadingId === null) { setUploadingId(null); return; }
    if (file.size > 16 * 1024 * 1024) { toast.error("Arquivo muito grande. Máx: 16 MB."); setUploadingId(null); return; }
    const base64 = await fileToBase64(file);
    uploadMut.mutate({
      fileName: file.name, fileType: file.type || "application/octet-stream",
      fileBase64: base64, entityType: "receivable", entityId: uploadingId,
    });
    e.target.value = "";
  }

  function handleCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCsvRows(parseCsv(ev.target?.result as string));
    reader.readAsText(file); e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas a Receber</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie recebimentos, recorrências e parcelamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Importar CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Conta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "A Receber", value: summary?.aReceber ?? 0, icon: AlertCircle, color: "text-blue-400" },
          { label: "Em Aberto", value: summary?.emAberto ?? 0, icon: Clock, color: "text-amber-400" },
          { label: "Recebido", value: summary?.recebido ?? 0, icon: CheckCircle2, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted/50"><Icon className={`h-5 w-5 ${color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{fmt(value)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs px-3">Todas</TabsTrigger>
            <TabsTrigger value="a_receber" className="text-xs px-3">A Receber</TabsTrigger>
            <TabsTrigger value="em_aberto" className="text-xs px-3">Em Aberto</TabsTrigger>
            <TabsTrigger value="recebido" className="text-xs px-3">Recebido</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {["Descrição","Cliente","Valor","Vencimento","Status","Tipo","Anexo","Ações"].map(h => (
                    <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${h === "Valor" || h === "Ações" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Carregando...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma conta encontrada</p>
                  </td></tr>
                ) : rows.map(row => (
                  <tr key={row.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.description}</div>
                      {row.notes && <div className="text-xs text-muted-foreground truncate max-w-[180px]">{row.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.clientName ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{fmt(row.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(row.dueDate + "T12:00:00").toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${STATUS_LABELS[row.status]?.color}`}>
                        {STATUS_LABELS[row.status]?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {row.isRecurring && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1">
                            <Repeat className="h-3 w-3" />{RECURRENCE_LABELS[row.recurrenceType ?? ""] ?? "Recorrente"}
                          </Badge>
                        )}
                        {row.isInstallment && (
                          <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20 gap-1">
                            <Layers className="h-3 w-3" />{row.installmentNumber}/{row.totalInstallments}
                          </Badge>
                        )}
                        {!row.isRecurring && !row.isInstallment && (
                          <span className="text-xs text-muted-foreground">Avulso</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.attachmentUrl ? (
                        <a href={row.attachmentUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Paperclip className="h-3 w-3" /> Ver
                        </a>
                      ) : (
                        <button onClick={() => handleAttachToRow(row)} disabled={uploadingId === row.id}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {uploadingId === row.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          Anexar
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {row.status !== "recebido" && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                            onClick={() => markReceivedMut.mutate({ id: row.id, receivedDate: new Date().toISOString().split("T")[0] })}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Recebido
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("Excluir esta conta?")) deleteMut.mutate({ id: row.id }); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={handleFileSelected} />
      <input ref={csvInputRef} type="file" className="hidden" accept=".csv" onChange={handleCsvSelected} />

      {/* New Account Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Conta a Receber</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Descrição *</Label>
                <Input placeholder="Ex: Serviço de consultoria" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Cliente</Label>
                <Input placeholder="Nome do cliente" value={form.clientName}
                  onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input placeholder="Ex: Serviços, Vendas" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div>
                <Label>Valor (R$) *</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <Label>Data de Vencimento *</Label>
                <Input type="date" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_receber">A Receber</SelectItem>
                    <SelectItem value="em_aberto">Em Aberto</SelectItem>
                    <SelectItem value="recebido">Recebido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium">Recorrência</p>
                    <p className="text-xs text-muted-foreground">Lançamento automático periódico</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isRecurring}
                    onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked, isInstallment: false }))} />
                  <span className="text-sm">Ativar</span>
                </label>
              </div>
              {form.isRecurring && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Frequência</Label>
                    <Select value={form.recurrenceType} onValueChange={(v: any) => setForm(f => ({ ...f, recurrenceType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data de Término</Label>
                    <Input type="date" value={form.recurrenceEndDate}
                      onChange={e => setForm(f => ({ ...f, recurrenceEndDate: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium">Parcelamento</p>
                    <p className="text-xs text-muted-foreground">Dividir em parcelas mensais</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isInstallment}
                    onChange={e => setForm(f => ({ ...f, isInstallment: e.target.checked, isRecurring: false }))} />
                  <span className="text-sm">Parcelar</span>
                </label>
              </div>
              {form.isInstallment && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Número de Parcelas</Label>
                    <Input type="number" min={2} max={360} value={form.totalInstallments}
                      onChange={e => setForm(f => ({ ...f, totalInstallments: parseInt(e.target.value) || 2 }))} />
                  </div>
                  <div className="flex items-end pb-1">
                    <p className="text-sm text-muted-foreground">
                      Por parcela: <strong>{form.amount ? fmt(parseFloat(form.amount) / form.totalInstallments) : "—"}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-orange-400" />
                <p className="text-sm font-medium">Anexo</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="outline" size="sm" type="button"
                  onClick={() => document.getElementById("recv-file-input")?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Selecionar arquivo
                </Button>
                {form.attachmentFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground truncate max-w-[160px]">{form.attachmentFile.name}</span>
                    <button onClick={() => setForm(f => ({ ...f, attachmentFile: null }))}>
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                )}
                <input id="recv-file-input" type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={e => setForm(f => ({ ...f, attachmentFile: e.target.files?.[0] ?? null }))} />
              </div>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC, XLS — máx. 16 MB</p>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Informações adicionais..." value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || uploadMut.isPending}>
              {createMut.isPending ? "Salvando..." : form.isInstallment ? `Criar ${form.totalInstallments} parcelas` : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Importar Contas a Receber via CSV</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center space-y-3">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium">Selecione o arquivo CSV</p>
                <p className="text-xs text-muted-foreground mt-1">Use o modelo abaixo para preencher corretamente</p>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={downloadCsvTemplate}>
                  <Download className="h-4 w-4 mr-2" /> Baixar Modelo CSV
                </Button>
                <Button size="sm" onClick={() => csvInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Selecionar CSV
                </Button>
              </div>
              {csvFileName && (
                <p className="text-xs text-primary font-medium">{csvFileName} — {csvRows.length} registros encontrados</p>
              )}
            </div>
            {csvRows.length > 0 && (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
                  Pré-visualização ({Math.min(csvRows.length, 5)} de {csvRows.length})
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      {["Descrição","Cliente","Valor","Vencimento"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="px-3 py-2">{r.description}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.clientName || "—"}</td>
                        <td className="px-3 py-2">{r.amount}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImport(false); setCsvRows([]); setCsvFileName(""); }}>Cancelar</Button>
            <Button onClick={() => importMut.mutate({ rows: csvRows })}
              disabled={csvRows.length === 0 || importMut.isPending}>
              {importMut.isPending ? "Importando..." : `Importar ${csvRows.length} registros`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
