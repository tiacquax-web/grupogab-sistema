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
import { Plus, Trash2, ChevronRight, Layers, Calendar, User, MoveRight } from "lucide-react";
import { useForm } from "react-hook-form";

const projectStatusConfig: any = {
  planejamento: { label: "Planejamento", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  pausado: { label: "Pausado", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  concluido: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelado: { label: "Cancelado", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const taskStatusConfig: any = {
  backlog: { label: "Backlog", color: "border-t-zinc-500" },
  em_andamento: { label: "Em Andamento", color: "border-t-blue-500" },
  revisao: { label: "Revisão", color: "border-t-amber-500" },
  concluido: { label: "Concluído", color: "border-t-emerald-500" },
};

const priorityColors: any = { baixa: "text-zinc-400", media: "text-amber-400", alta: "text-red-400", urgente: "text-red-500" };
const TASK_STATUSES = ["backlog", "em_andamento", "revisao", "concluido"];

function formatDate(val: any) { if (!val) return "-"; return new Date(val + "T12:00:00").toLocaleDateString("pt-BR"); }

export default function Projetos() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [openNewTask, setOpenNewTask] = useState(false);

  const { data: projects = [], refetch: refetchProjects } = trpc.projects.list.useQuery();
  const { data: tasks = [], refetch: refetchTasks } = trpc.projects.listTasks.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );
  const { data: costCenters = [] } = trpc.costCenters.list.useQuery();

  const createProjectMutation = trpc.projects.create.useMutation({ onSuccess: () => { toast.success("Projeto criado!"); setOpenNewProject(false); refetchProjects(); resetProject(); }, onError: () => toast.error("Erro") });
  const deleteProjectMutation = trpc.projects.delete.useMutation({ onSuccess: () => { toast.success("Projeto removido"); setSelectedProject(null); refetchProjects(); } });
  const createTaskMutation = trpc.projects.createTask.useMutation({ onSuccess: () => { toast.success("Tarefa criada!"); setOpenNewTask(false); refetchTasks(); resetTask(); }, onError: () => toast.error("Erro") });
  const updateTaskMutation = trpc.projects.updateTaskStatus.useMutation({ onSuccess: () => refetchTasks() });
  const deleteTaskMutation = trpc.projects.deleteTask.useMutation({ onSuccess: () => { toast.success("Tarefa removida"); refetchTasks(); } });

  const { register: registerProject, handleSubmit: handleSubmitProject, reset: resetProject, setValue: setProjectValue } = useForm({ defaultValues: { name: "", description: "", clientName: "", managerName: "", status: "planejamento", priority: "media", startDate: "", endDate: "", budget: "", address: "" } });
  const { register: registerTask, handleSubmit: handleSubmitTask, reset: resetTask, setValue: setTaskValue } = useForm({ defaultValues: { title: "", description: "", phase: "", status: "backlog", priority: "media", assignedToName: "", dueDate: "" } });

  const onSubmitProject = (data: any) => createProjectMutation.mutate({ ...data, budget: data.budget || undefined, startDate: data.startDate || undefined, endDate: data.endDate || undefined });
  const onSubmitTask = (data: any) => createTaskMutation.mutate({ ...data, projectId: selectedProject!, dueDate: data.dueDate || undefined });

  const selectedProjectData = projects.find((p: any) => p.id === selectedProject);
  const getNextStatus = (s: string) => { const i = TASK_STATUSES.indexOf(s); return i < TASK_STATUSES.length - 1 ? TASK_STATUSES[i + 1] : null; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Engenharia & Projetos</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe o andamento de obras e projetos com Kanban</p>
        </div>
        <Dialog open={openNewProject} onOpenChange={setOpenNewProject}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Projeto</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Projeto / Obra</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmitProject(onSubmitProject)} className="space-y-4 pt-2">
              <div className="space-y-1.5"><Label>Nome do Projeto *</Label><Input {...registerProject("name", { required: true })} placeholder="Ex: Obra Residencial Silva..." /></div>
              <div className="space-y-1.5"><Label>Descrição</Label><Textarea {...registerProject("description")} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Cliente</Label><Input {...registerProject("clientName")} placeholder="Nome do cliente" /></div>
                <div className="space-y-1.5"><Label>Responsável</Label><Input {...registerProject("managerName")} placeholder="Gerente do projeto" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select defaultValue="planejamento" onValueChange={v => setProjectValue("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(projectStatusConfig).map(([k, v]: any) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Prioridade</Label>
                  <Select defaultValue="media" onValueChange={v => setProjectValue("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem><SelectItem value="urgente">Urgente</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Início</Label><Input {...registerProject("startDate")} type="date" /></div>
                <div className="space-y-1.5"><Label>Prazo</Label><Input {...registerProject("endDate")} type="date" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Orçamento</Label><Input {...registerProject("budget")} type="number" step="0.01" placeholder="0.00" /></div>
                <div className="space-y-1.5"><Label>Centro de Custo</Label>
                  <Select onValueChange={v => setProjectValue("costCenterId" as any, parseInt(v))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>{costCenters.map((cc: any) => <SelectItem key={cc.id} value={String(cc.id)}>{cc.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Endereço da Obra</Label><Input {...registerProject("address")} placeholder="Endereço completo..." /></div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenNewProject(false); resetProject(); }}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={createProjectMutation.isPending}>{createProjectMutation.isPending ? "Salvando..." : "Criar Projeto"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Projetos ({projects.length})</h2>
          {projects.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">Nenhum projeto criado</div>}
          {(projects as any[]).map((project: any) => (
            <Card key={project.id} onClick={() => setSelectedProject(project.id)}
              className={`border-border cursor-pointer transition-all hover:border-primary/50 ${selectedProject === project.id ? "border-primary ring-1 ring-primary/30" : ""}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm flex-1">{project.name}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs border ${projectStatusConfig[project.status]?.color}`}>{projectStatusConfig[project.status]?.label}</Badge>
                  <span className={`text-xs font-medium ${priorityColors[project.priority]}`}>● {project.priority}</span>
                </div>
                {project.clientName && <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{project.clientName}</p>}
                {project.endDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Prazo: {formatDate(project.endDate)}</p>}
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={e => { e.stopPropagation(); deleteProjectMutation.mutate({ id: project.id }); }}><Trash2 className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedProject ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl text-muted-foreground gap-3">
              <Layers className="h-12 w-12 opacity-20" />
              <p>Selecione um projeto para ver o Kanban</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{selectedProjectData?.name}</h2>
                  <p className="text-xs text-muted-foreground">Kanban de tarefas e fases</p>
                </div>
                <Dialog open={openNewTask} onOpenChange={setOpenNewTask}>
                  <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" />Nova Tarefa</Button></DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmitTask(onSubmitTask)} className="space-y-4 pt-2">
                      <div className="space-y-1.5"><Label>Título *</Label><Input {...registerTask("title", { required: true })} placeholder="Ex: Fundação, Alvenaria..." /></div>
                      <div className="space-y-1.5"><Label>Fase</Label><Input {...registerTask("phase")} placeholder="Ex: Estrutura, Acabamento..." /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label>Status</Label>
                          <Select defaultValue="backlog" onValueChange={v => setTaskValue("status", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(taskStatusConfig).map(([k, v]: any) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5"><Label>Prioridade</Label>
                          <Select defaultValue="media" onValueChange={v => setTaskValue("priority", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem><SelectItem value="urgente">Urgente</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label>Responsável</Label><Input {...registerTask("assignedToName")} placeholder="Nome" /></div>
                        <div className="space-y-1.5"><Label>Prazo</Label><Input {...registerTask("dueDate")} type="date" /></div>
                      </div>
                      <div className="space-y-1.5"><Label>Descrição</Label><Textarea {...registerTask("description")} rows={2} /></div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpenNewTask(false); resetTask(); }}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={createTaskMutation.isPending}>{createTaskMutation.isPending ? "Salvando..." : "Criar"}</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {Object.entries(taskStatusConfig).map(([status, config]: any) => {
                  const statusTasks = (tasks as any[]).filter((t: any) => t.status === status);
                  return (
                    <div key={status} className="space-y-2">
                      <div className={`flex items-center gap-2 p-2.5 rounded-lg border-t-2 bg-card ${config.color}`}>
                        <span className="font-semibold text-xs flex-1">{config.label}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{statusTasks.length}</Badge>
                      </div>
                      <div className="space-y-2 min-h-20">
                        {statusTasks.map((task: any) => (
                          <Card key={task.id} className="border-border hover:border-primary/30 transition-colors">
                            <CardContent className="p-2.5 space-y-1.5">
                              <p className="text-xs font-semibold leading-tight">{task.title}</p>
                              {task.phase && <Badge variant="outline" className="text-[10px] h-4">{task.phase}</Badge>}
                              {task.assignedToName && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-2.5 w-2.5" />{task.assignedToName}</p>}
                              {task.dueDate && <p className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</p>}
                              <div className="flex gap-1">
                                {getNextStatus(task.status) && (
                                  <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] gap-0.5"
                                    onClick={() => updateTaskMutation.mutate({ id: task.id, status: getNextStatus(task.status) as any })}>
                                    Avançar <MoveRight className="h-2.5 w-2.5" />
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="h-6 w-6 p-0 text-destructive border-destructive/30"
                                  onClick={() => deleteTaskMutation.mutate({ id: task.id })}><Trash2 className="h-2.5 w-2.5" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
