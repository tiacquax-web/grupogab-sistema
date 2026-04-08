import { useState, useRef } from "react";
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
import { Upload, Search, Trash2, FileText, Image, File, Download, Filter } from "lucide-react";

const relatedTypeConfig: any = {
  geral: { label: "Geral", color: "bg-zinc-500/15 text-zinc-400" },
  cliente: { label: "Cliente", color: "bg-blue-500/15 text-blue-400" },
  projeto: { label: "Projeto", color: "bg-violet-500/15 text-violet-400" },
  ordem_compra: { label: "Ordem de Compra", color: "bg-amber-500/15 text-amber-400" },
  conta_pagar: { label: "Conta a Pagar", color: "bg-red-500/15 text-red-400" },
  conta_receber: { label: "Conta a Receber", color: "bg-emerald-500/15 text-emerald-400" },
};

function getFileIcon(mimeType: string | null | undefined) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileText;
  return File;
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documentos() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [relatedType, setRelatedType] = useState<any>("geral");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [relatedName, setRelatedName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], refetch } = trpc.documents.list.useQuery({ relatedType: filterType !== "all" ? filterType : undefined, search });
  const uploadMutation = trpc.documents.upload.useMutation({ onSuccess: () => { toast.success("Documento enviado!"); setOpenUpload(false); refetch(); setSelectedFile(null); setDescription(""); setCategory(""); setRelatedName(""); }, onError: () => toast.error("Erro ao enviar documento") });
  const deleteMutation = trpc.documents.delete.useMutation({ onSuccess: () => { toast.success("Documento removido"); refetch(); } });

  const handleUpload = async () => {
    if (!selectedFile) { toast.error("Selecione um arquivo"); return; }
    if (selectedFile.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande. Máximo 10MB."); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        await uploadMutation.mutateAsync({ name: selectedFile.name, mimeType: selectedFile.type, fileBase64: base64, fileSize: selectedFile.size, category: category || undefined, relatedType, relatedName: relatedName || undefined, description: description || undefined });
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Documentos</h1><p className="text-muted-foreground text-sm mt-1">Gerencie todos os arquivos e documentos da empresa</p></div>
        <Dialog open={openUpload} onOpenChange={setOpenUpload}>
          <DialogTrigger asChild><Button className="gap-2"><Upload className="h-4 w-4" />Enviar Documento</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Enviar Documento</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Arquivo *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para selecionar ou arraste aqui</p>
                      <p className="text-xs text-muted-foreground">Máximo 10MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={relatedType} onValueChange={setRelatedType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(relatedTypeConfig).map(([k, v]: any) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Categoria</Label><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Contrato, NF..." /></div>
              </div>
              <div className="space-y-1.5"><Label>Relacionado a</Label><Input value={relatedName} onChange={e => setRelatedName(e.target.value)} placeholder="Nome do cliente, projeto..." /></div>
              <div className="space-y-1.5"><Label>Descrição</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setOpenUpload(false); setSelectedFile(null); }}>Cancelar</Button>
                <Button className="flex-1" onClick={handleUpload} disabled={!selectedFile || uploading}>{uploading ? "Enviando..." : "Enviar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar documentos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(relatedTypeConfig).map(([k, v]: any) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-muted-foreground gap-3">
          <FileText className="h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">Nenhum documento encontrado</p>
          <p className="text-sm">Clique em "Enviar Documento" para começar</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(documents as any[]).map((doc: any) => {
          const FileIcon = getFileIcon(doc.mimeType);
          return (
            <Card key={doc.id} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)} · {doc.mimeType?.split("/")[1]?.toUpperCase() || "FILE"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${relatedTypeConfig[doc.relatedType]?.color}`}>{relatedTypeConfig[doc.relatedType]?.label}</Badge>
                  {doc.category && <Badge variant="outline" className="text-xs">{doc.category}</Badge>}
                </div>
                {doc.relatedName && <p className="text-xs text-muted-foreground">{doc.relatedName}</p>}
                {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                <p className="text-xs text-muted-foreground">Por: {doc.uploadedByName || "Sistema"}</p>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="h-3 w-3" />Baixar</a>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate({ id: doc.id })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
