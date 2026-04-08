import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Search, MoreVertical, ShieldCheck, ShieldOff, Trash2, UserCheck, Crown } from "lucide-react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { user: currentUser } = useAuth();
  const { data: users = [], refetch } = trpc.admin.listUsers.useQuery({ search: search || undefined });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role atualizada com sucesso!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => { toast.success("Usuário removido."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <p className="text-sm text-muted-foreground">{(users as any[]).length} usuário(s)</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Usuário</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">E-mail</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Login</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Cadastro</th>
              <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(users as any[]).length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Nenhum usuário encontrado</td></tr>
            )}
            {(users as any[]).map((u: any) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{u.name ?? "Sem nome"}</p>
                      {u.id === currentUser?.id && <span className="text-[10px] text-primary">Você</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge className={u.role === "admin"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  }>
                    {u.role === "admin" ? <Crown className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.loginMethod ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUser?.id ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {u.role === "user" ? (
                          <DropdownMenuItem
                            className="gap-2 text-amber-400 focus:text-amber-400"
                            onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "admin" })}
                          >
                            <Crown className="h-4 w-4" />
                            Promover a Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="gap-2 text-blue-400 focus:text-blue-400"
                            onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "user" })}
                          >
                            <ShieldOff className="h-4 w-4" />
                            Rebaixar para User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onSelect={e => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remover Usuário
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover <strong>{u.name ?? u.email}</strong>? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteUserMutation.mutate({ userId: u.id })}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-xs text-muted-foreground pr-2">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
