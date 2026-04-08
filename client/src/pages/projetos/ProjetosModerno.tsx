import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  MapPin,
  ArrowRight,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

const PROJECT_STATUS = [
  { key: "planejamento", label: "Planejamento", color: "bg-gray-100 border-gray-300", icon: <Clock className="w-4 h-4" /> },
  { key: "em_andamento", label: "Em Andamento", color: "bg-blue-100 border-blue-300", icon: <TrendingUp className="w-4 h-4" /> },
  { key: "pausado", label: "Pausado", color: "bg-yellow-100 border-yellow-300", icon: <AlertCircle className="w-4 h-4" /> },
  { key: "concluido", label: "Concluído", color: "bg-green-100 border-green-300", icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: "cancelado", label: "Cancelado", color: "bg-red-100 border-red-300", icon: <Trash2 className="w-4 h-4" /> },
];

const TASK_STATUS = [
  { key: "backlog", label: "Backlog", color: "bg-gray-100 border-gray-300" },
  { key: "em_andamento", label: "Em Andamento", color: "bg-blue-100 border-blue-300" },
  { key: "revisao", label: "Revisão", color: "bg-yellow-100 border-yellow-300" },
  { key: "concluido", label: "Concluído", color: "bg-green-100 border-green-300" },
];

function SummaryCard({ title, value, icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-l-4 ${color} hover:shadow-md transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-2">{value}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProjectCard({ project, onClick, onDelete }: any) {
  const status = PROJECT_STATUS.find(s => s.key === project.status) || PROJECT_STATUS[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(project)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {project.name}
          </h4>
          <Badge variant="outline" className={`mt-2 ${status.color} border-0`}>
            {status.label}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        {project.clientName && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="truncate">{project.clientName}</span>
          </div>
        )}
        
        {project.managerName && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="truncate">Responsável: {project.managerName}</span>
          </div>
        )}
        
        {project.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{project.address}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {project.budget && (
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(project.budget)}
          </p>
        )}
        
        {project.endDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-4 h-4" />
            {new Date(project.endDate).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onAdvance, onDelete }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-medium text-sm text-gray-900 flex-1">{task.title}</h5>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-3 h-3 text-red-600" />
        </Button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.phase && (
        <Badge variant="outline" className="text-xs mb-2">
          {task.phase}
        </Badge>
      )}

      {task.assignedToName && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <User className="w-3 h-3" />
          {task.assignedToName}
        </div>
      )}

      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Calendar className="w-3 h-3" />
          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
        </div>
      )}

      <Button 
        size="sm" 
        variant="outline" 
        className="w-full mt-2 gap-1 text-xs h-7"
        onClick={() => onAdvance(task)}
      >
        Avançar
        <ArrowRight className="w-3 h-3" />
      </Button>
    </motion.div>
  );
}

export default function ProjetosModerno() {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Queries
  const { data: stats } = trpc.projects.stats.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const { data: tasks = [] } = trpc.projects.listTasks.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  // Mutations
  const updateTaskMutation = trpc.projects.updateTaskStatus.useMutation({
    onSuccess: () => {
      // Refetch tasks
    }
  });

  const deleteTaskMutation = trpc.projects.deleteTask.useMutation({
    onSuccess: () => {
      // Refetch tasks
    }
  });

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      setSelectedProject(null);
      // Refetch projects
    }
  });

  const handleAdvanceTask = (task: any) => {
    const currentIndex = TASK_STATUS.findIndex(s => s.key === task.status);
    if (currentIndex < TASK_STATUS.length - 1) {
      const nextStatus = TASK_STATUS[currentIndex + 1].key;
      updateTaskMutation.mutate({ taskId: task.id, status: nextStatus as any });
    }
  };

  const selectedProjectData = projects.find((p: any) => p.id === selectedProject);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedProject ? "Kanban de Tarefas" : "Engenharia & Projetos"}
          </h1>
          <p className="text-gray-600 mt-1">
            {selectedProject 
              ? `Projeto: ${selectedProjectData?.name}` 
              : "Gerencie obras e projetos de engenharia"}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProject && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedProject(null)}
            >
              ← Voltar para Projetos
            </Button>
          )}
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            {selectedProject ? "Nova Tarefa" : "Novo Projeto"}
          </Button>
        </div>
      </div>

      {!selectedProject ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total de Projetos"
              value={stats?.total || 0}
              icon={<Briefcase className="w-6 h-6 text-blue-600" />}
              color="border-l-blue-500"
            />
            
            <SummaryCard
              title="Em Andamento"
              value={stats?.inProgress || 0}
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              color="border-l-green-500"
            />
            
            <SummaryCard
              title="Atrasados"
              value={stats?.delayed || 0}
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
              color="border-l-red-500"
            />
            
            <SummaryCard
              title="Concluídos (Mês)"
              value={stats?.completedThisMonth || 0}
              icon={<CheckCircle2 className="w-6 h-6 text-purple-600" />}
              color="border-l-purple-500"
            />
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar projetos por nome, cliente, endereço..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter((p: any) => 
                !search || 
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
                p.address?.toLowerCase().includes(search.toLowerCase())
              )
              .map((project: any) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={(p: any) => setSelectedProject(p.id)}
                  onDelete={(id: number) => deleteProjectMutation.mutate({ id })}
                />
              ))}
          </div>
        </>
      ) : (
        <>
          {/* Kanban Board */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {TASK_STATUS.map((status, idx) => {
                const statusTasks = tasks.filter((t: any) => t.status === status.key);

                return (
                  <motion.div
                    key={status.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="w-80 shrink-0"
                  >
                    {/* Status Header */}
                    <Card className={`mb-4 border-t-4 ${status.color.split(' ')[1]}`}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">
                            {status.label}
                          </CardTitle>
                          <Badge variant="outline" className="bg-white">
                            {statusTasks.length}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Tasks */}
                    <div className="space-y-3 min-h-[200px]">
                      <AnimatePresence>
                        {statusTasks.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <p className="text-sm">Nenhuma tarefa</p>
                          </div>
                        ) : (
                          statusTasks.map((task: any) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onAdvance={handleAdvanceTask}
                              onDelete={(id: number) => deleteTaskMutation.mutate({ taskId: id })}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
