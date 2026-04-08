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
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Phone,
  Mail,
  Building2,
  Calendar,
  MoreVertical,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

const STAGES = [
  { 
    key: "novo", 
    label: "Novo Lead", 
    color: "bg-gray-100 border-gray-300",
    textColor: "text-gray-700",
    icon: <Users className="w-4 h-4" />
  },
  { 
    key: "primeira_tentativa", 
    label: "1ª Tentativa", 
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-700",
    icon: <Phone className="w-4 h-4" />
  },
  { 
    key: "segunda_tentativa", 
    label: "2ª Tentativa", 
    color: "bg-indigo-100 border-indigo-300",
    textColor: "text-indigo-700",
    icon: <Phone className="w-4 h-4" />
  },
  { 
    key: "terceira_tentativa", 
    label: "3ª Tentativa", 
    color: "bg-violet-100 border-violet-300",
    textColor: "text-violet-700",
    icon: <Phone className="w-4 h-4" />
  },
  { 
    key: "proposta", 
    label: "Proposta", 
    color: "bg-amber-100 border-amber-300",
    textColor: "text-amber-700",
    icon: <FileText className="w-4 h-4" />
  },
  { 
    key: "negociacao", 
    label: "Negociação", 
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-700",
    icon: <TrendingUp className="w-4 h-4" />
  },
  { 
    key: "fechado_ganho", 
    label: "Fechado ✓", 
    color: "bg-green-100 border-green-300",
    textColor: "text-green-700",
    icon: <Target className="w-4 h-4" />
  },
  { 
    key: "fechado_perdido", 
    label: "Perdido ✗", 
    color: "bg-red-100 border-red-300",
    textColor: "text-red-700",
    icon: <Trash2 className="w-4 h-4" />
  },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  baixa: { bg: "bg-gray-100", text: "text-gray-700", label: "Baixa" },
  media: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Média" },
  alta: { bg: "bg-red-100", text: "text-red-700", label: "Alta" },
};

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

function LeadCard({ lead, onAdvance, onDelete }: any) {
  const priority = PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.media;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {lead.name}
          </h4>
          <Badge variant="outline" className={`mt-1 ${priority.bg} ${priority.text} border-0`}>
            {priority.label}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        {lead.company && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}
        
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>

      {/* Value */}
      {lead.value && (
        <div className="mb-3">
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(lead.value)}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 gap-2"
          onClick={() => onAdvance(lead)}
        >
          Avançar
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 hover:bg-red-50"
          onClick={() => onDelete(lead.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function CRMModerno() {
  const [search, setSearch] = useState("");

  // Queries
  const { data: stats } = trpc.crm.stats.useQuery();
  const { data: leads = [] } = trpc.crm.listLeads.useQuery({ search });
  
  // Mutations
  const updateStageMutation = trpc.crm.updateLeadStage.useMutation({
    onSuccess: () => {
      // Refetch leads
    }
  });
  
  const deleteMutation = trpc.crm.deleteLead.useMutation({
    onSuccess: () => {
      // Refetch leads
    }
  });

  const handleAdvance = (lead: any) => {
    const currentIndex = STAGES.findIndex(s => s.key === lead.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].key;
      updateStageMutation.mutate({ id: lead.id, stage: nextStage as any });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM - Funil de Vendas</h1>
          <p className="text-gray-600 mt-1">Acompanhe seus leads em cada etapa do processo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total de Leads"
          value={stats?.total || 0}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="border-l-blue-500"
        />
        
        <SummaryCard
          title="Em Negociação"
          value={stats?.inNegotiation || 0}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          color="border-l-orange-500"
        />
        
        <SummaryCard
          title="Fechados (Mês)"
          value={stats?.closedThisMonth || 0}
          icon={<Target className="w-6 h-6 text-green-600" />}
          color="border-l-green-500"
        />
        
        <SummaryCard
          title="Valor Potencial"
          value={formatCurrency(stats?.totalValue || 0)}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          color="border-l-purple-500"
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar leads por nome, empresa, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage, idx) => {
            const stageLeads = leads.filter((l: any) => l.stage === stage.key);
            const stageValue = stageLeads.reduce((sum, l: any) => sum + (Number(l.value) || 0), 0);

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="w-80 shrink-0"
              >
                {/* Stage Header */}
                <Card className={`mb-4 border-t-4 ${stage.color.split(' ')[1]}`}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stage.icon}
                        <CardTitle className="text-sm font-semibold">
                          {stage.label}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">
                          {stageLeads.length}
                        </Badge>
                      </div>
                    </div>
                    {stageValue > 0 && (
                      <p className="text-sm font-medium text-green-600 mt-2">
                        {formatCurrency(stageValue)}
                      </p>
                    )}
                  </CardHeader>
                </Card>

                {/* Leads */}
                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">Nenhum lead nesta etapa</p>
                      </div>
                    ) : (
                      stageLeads.map((lead: any) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onAdvance={handleAdvance}
                          onDelete={handleDelete}
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
    </div>
  );
}
