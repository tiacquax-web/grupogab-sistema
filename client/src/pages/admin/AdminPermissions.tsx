import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, ChevronDown, ChevronUp, Eye, Plus, Edit, Trash2 } from "lucide-react";

const MODULES = [
  { key: "financeiro", label: "Financeiro", description: "Contas a pagar, receber e centro de custo" },
  { key: "clientes", label: "Clientes", description: "Cadastro e gestão de clientes" },
  { key: "crm", label: "CRM", description: "Funil de vendas e leads" },
  { key: "compras", label: "Ordem de Compras", description: "Ordens de compra e fornecedores" },
  { key: "chat", label: "Chat", description: "Mensagens internas" },
  { key: "agenda", label: "Agenda", description: "Compromissos e eventos" },
  { key: "projetos", label: "Projetos / Obras", description: "Kanban de engenharia" },
  { key: "documentos", label: "Documentos", description: "Upload e gestão de arquivos" },
  { key: "relatorios", label: "Relatórios", description: "Análises e gráficos" },
];

export default function AdminPermissions() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const { data: users = [] } = trpc.admin.listUsers.useQuery();
  const { data: permissions = [], refetch: refetchPerms } = trpc.admin.getPermissions.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  const setPermMutation = trpc.admin.setPermission.useMutation({
    onSuccess: () => { toast.success("Permissão atualizada!"); refetchPerms(); },
    onError: () => toast.error("Erro ao atualizar permissão"),
  });

  const getPermForModule = (moduleKey: string) => {
    const perm = (permissions as any[]).find((p: any) => p.module === moduleKey);
    return {
      canView: perm ? perm.canView === 1 : true,
      canCreate: perm ? perm.canCreate === 1 : false,
      canEdit: perm ? perm.canEdit === 1 : false,
      canDelete: perm ? perm.canDelete === 1 : false,
    };
  };

  const updatePerm = (moduleKey: string, field: string, value: boolean) => {
    if (!selectedUserId) return;
    const current = getPermForModule(moduleKey);
    setPermMutation.mutate({
      userId: selectedUserId,
      module: moduleKey,
      ...current,
      [field]: value,
    });
  };

  const selectedUser = (users as any[]).find((u: any) => u.id === selectedUserId);
  const nonAdminUsers = (users as any[]).filter((u: any) => u.role !== "admin");

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* User selector */}
        <Card className="w-64 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Selecionar Usuário</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {nonAdminUsers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum usuário comum</p>
            )}
            {nonAdminUsers.map((u: any) => (
              <button key={u.id} onClick={() => setSelectedUserId(u.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedUserId === u.id ? "bg-primary/15 border border-primary/30" : "hover:bg-muted/40"
                }`}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-blue-500/20 text-blue-400">{getInitials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{u.name ?? "Sem nome"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email ?? u.openId}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Permissions panel */}
        <div className="flex-1 space-y-3">
          {!selectedUserId ? (
            <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
              <div className="text-center">
                <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Selecione um usuário para gerenciar suas permissões</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">{getInitials(selectedUser?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{selectedUser?.name ?? "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">Permissões por módulo</p>
                </div>
                <Badge className="ml-auto bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs">user</Badge>
              </div>

              {MODULES.map(mod => {
                const perm = getPermForModule(mod.key);
                const isExpanded = expandedModule === mod.key;
                const activeCount = [perm.canView, perm.canCreate, perm.canEdit, perm.canDelete].filter(Boolean).length;

                return (
                  <div key={mod.key} className="border border-border rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedModule(isExpanded ? null : mod.key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${perm.canView ? "bg-emerald-400" : "bg-zinc-600"}`} />
                        <div className="text-left">
                          <p className="text-sm font-medium">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-muted/50">{activeCount}/4 permissões</Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          {[
                            { key: "canView", label: "Visualizar", icon: Eye, color: "text-blue-400" },
                            { key: "canCreate", label: "Criar", icon: Plus, color: "text-emerald-400" },
                            { key: "canEdit", label: "Editar", icon: Edit, color: "text-amber-400" },
                            { key: "canDelete", label: "Excluir", icon: Trash2, color: "text-red-400" },
                          ].map(({ key, label, icon: Icon, color }) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-3.5 w-3.5 ${color}`} />
                                <Label className="text-xs cursor-pointer">{label}</Label>
                              </div>
                              <Switch
                                checked={perm[key as keyof typeof perm]}
                                onCheckedChange={v => updatePerm(mod.key, key, v)}
                                disabled={setPermMutation.isPending}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
