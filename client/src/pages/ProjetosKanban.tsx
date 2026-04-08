import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, ArrowRight, User, Calendar, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

const PHASES = [
  { key: "backlog", label: "Backlog", color: "border-t-zinc-500", badge: "bg-zinc-500/15 text-zinc-400" },
  { key: "em_andamento", label: "Em Andamento", color: "border-t-amber-500", badge: "bg-amber-500/15 text-amber-400" },
  { key: "revisao", label: "Revisão", color: "border-t-violet-500", badge: "bg-violet-500/15 text-violet-400" },
  { key: "concluido", label: "Concluído", color: "border-t-emerald-500", badge: "bg-emerald-500/15 text-emerald-400" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgente: "bg-red-500/15 text-red-400",
  alta: "bg-orange-500/15 text-orange-400",
  media: "bg-amber-500/15 text-amber-400",
  baixa: "bg-zinc-500/15 text-zinc-400",
};

export default function ProjetosKanban() {
  const [openNew, setOpenNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [openTask, setOpenTask] = useState(false);

  const { data: projects = [], refetch: refetchProjects } = trpc.projects.list.useQuery();
  const { data: tasks = [], refetch: refetchTasks } = trpc.projects.listTasks.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => { toast.success("Projeto criado!"); setOpenNew(false); refetchProjects(); resetProject(); },
    onError: () => toast.error("Erro ao criar projeto"),
  });
  const createTaskMutation = trpc.projects.createTask.useMutation({
    onSuccess: () => { toast.success("Tarefa criada!"); setOpenTask(false); refetchTasks(); resetTask(); },
    onError: () => toast.error("Erro ao criar tarefa"),
  });
  const updateTaskMutation = trpc.projects.updateTaskStatus.useMutation({
    onSuccess: () => refetchTasks(),
  });
  const deleteTaskMutation = trpc.projects.deleteTask.useMutation({
    onSuccess: () => { toast.success("Tarefa removida"); refetchTasks(); },
  });

  const { register: registerProject, handleSubmit: handleProject, reset: resetProject } = useForm({
    defaultValues: { name: "", description: "", managerName: "", startDate: "", endDate: "" }
  });
  const { register: registerTask, handleSubmit: handleTask, reset: resetTask, setValue: setTaskValue } = useForm({
    defaultValues: { title: "", description: "", assignedToName: "", dueDate: "", status: "backlog", priority: "media" }
  });

  const onSubmitProject = (data: any) => createProjectMutation.mutate({ name: data.name, description: data.description, managerName: data.managerName, startDate: data.startDate || undefined, endDate: data.endDate || undefined });
  const onSubmitTask = (data: any) => {
    if (!selectedProject) return;
    createTaskMutation.mutate({ projectId: selectedProject, title: data.title, description: data.description, assignedToName: data.assignedToName || undefined, dueDate: data.dueDate || undefined, status: data.status, priority: data.priority });
  };

  const moveTask = (taskId: number, currentStatus: string) => {
    const idx = PHASES.findIndex(p => p.key === currentStatus);
    if (idx < PHASES.length - 1) {
      updateTaskMutation.mutate({ id: taskId, status: PHASES[idx + 1].key as any });
    }
  };

  const getTasksByPhase = (phase: string) => (tasks as any[]).filter((t: any) => t.status === phase);

  const selectedProjectData = (projects as any[]).find((p: any) => p.id === selectedProject);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kanban de Projetos</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe as fases e andamento das obras</p>
        </div>
        <div className="flex gap-2">
          {selectedProject && (
            <Dialog open={openTask} onOpenChange={setOpenTask}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Nova Tarefa</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Nova Tarefa — {selectedProjectData?.name}</DialogTitle></DialogHeader>
                <form onSubmit={handleTask(onSubmitTask)} className="space-y-4 pt-2">
                  <div className="space-y-1.5"><Label>Título *</Label><Input {...registerTask("title", { required: true })} placeholder="Título da tarefa" /></div>
                  <div className="space-y-1.5"><Label>Descrição</Label><Textarea {...registerTask("description")} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Fase Inicial</Label>
                      <Select defaultValue="backlog" onValueChange={v => setTaskValue("status", v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PHASES.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Prioridade</Label>
                      <Select defaultValue="media" onValueChange={v => setTaskValue("priority", v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Responsável</Label><Input {...registerTask("assignedToName")} placeholder="Nome" /></div>
                    <div className="space-y-1.5"><Label>Prazo</Label><Input {...registerTask("dueDate")} type="date" /></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenTask(false); resetTask(); }}>Cancelar</Button>
                    <Button type="submit" className="flex-1" disabled={createTaskMutation.isPending}>{createTaskMutation.isPending ? "Salvando..." : "Criar"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Projeto</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Novo Projeto / Obra</DialogTitle></DialogHeader>
              <form onSubmit={handleProject(onSubmitProject)} className="space-y-4 pt-2">
                <div className="space-y-1.5"><Label>Nome *</Label><Input {...registerProject("name", { required: true })} placeholder="Nome do projeto/obra" /></div>
                <div className="space-y-1.5"><Label>Descrição</Label><Textarea {...registerProject("description")} rows={2} /></div>
                <div className="space-y-1.5"><Label>Responsável / Gestor</Label><Input {...registerProject("managerName")} placeholder="Nome do gestor" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Início</Label><Input {...registerProject("startDate")} type="date" /></div>
                  <div className="space-y-1.5"><Label>Previsão Término</Label><Input {...registerProject("endDate")} type="date" /></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenNew(false); resetProject(); }}>Cancelar</Button>
                  <Button type="submit" className="flex-1" disabled={createProjectMutation.isPending}>{createProjectMutation.isPending ? "Salvando..." : "Criar"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project selector */}
      <div className="flex gap-2 flex-wrap">
        {(projects as any[]).map((p: any) => (
          <button key={p.id} onClick={() => setSelectedProject(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              selectedProject === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40 text-foreground"
            }`}>
            {p.name}
          </button>
        ))}
        {(projects as any[]).length === 0 && <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado. Crie o primeiro!</p>}
      </div>

      {/* Kanban board */}
      {selectedProject ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PHASES.map((phase, phaseIndex) => {
            const phaseTasks = getTasksByPhase(phase.key);
            return (
              <div key={phase.key} className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border-t-2 bg-card ${phase.color}`}>
                  <span className="font-semibold text-sm">{phase.label}</span>
                  <Badge className={`text-xs ${phase.badge}`}>{phaseTasks.length}</Badge>
                </div>
                <div className="space-y-2 min-h-32">
                  {phaseTasks.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-lg">Sem tarefas</div>
                  )}
                  {phaseTasks.map((task: any) => (
                    <Card key={task.id} className="border-border hover:border-primary/30 transition-colors">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-medium leading-tight flex-1">{task.title}</p>
                          <Badge className={`text-[10px] shrink-0 ${PRIORITY_COLORS[task.priority] || ""}`}>{task.priority}</Badge>
                        </div>
                        {task.description && <p className="text-[10px] text-muted-foreground line-clamp-2">{task.description}</p>}
                        {task.assignedToName && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <User className="h-2.5 w-2.5" />{task.assignedToName}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />{new Date(task.dueDate + "T12:00:00").toLocaleDateString("pt-BR")}
                          </div>
                        )}
                        <div className="flex gap-1 pt-1">
                          {phaseIndex < PHASES.length - 1 && (
                            <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] gap-1"
                              onClick={() => moveTask(task.id, task.status)}
                              disabled={updateTaskMutation.isPending}>
                              Avançar <ArrowRight className="h-2.5 w-2.5" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => deleteTaskMutation.mutate({ id: task.id })}>
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <p className="text-sm">Selecione um projeto acima para ver o Kanban</p>
        </div>
      )}
    </div>
  );
}
