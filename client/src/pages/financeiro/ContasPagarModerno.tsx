import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Download, 
  Upload,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  FileText,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

// Componente de Métrica Resumo
function SummaryCard({ title, value, icon, trend, color }: any) {
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
              {trend && (
                <p className="text-sm text-muted-foreground mt-1">{trend}</p>
              )}
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

// Componente de Status Badge
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    a_pagar: { 
      label: "A Pagar", 
      className: "bg-yellow-100 text-yellow-800 border-yellow-200" 
    },
    em_aberto: { 
      label: "Em Aberto", 
      className: "bg-blue-100 text-blue-800 border-blue-200" 
    },
    pago: { 
      label: "Pago", 
      className: "bg-green-100 text-green-800 border-green-200" 
    },
    cancelado: { 
      label: "Cancelado", 
      className: "bg-gray-100 text-gray-800 border-gray-200" 
    },
  };

  const variant = variants[status] || variants.a_pagar;

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

export default function ContasPagarModerno() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Queries
  const { data: summary } = trpc.financial.summaryPayable.useQuery();
  const { data: accounts = [], isLoading } = trpc.financial.listPayable.useQuery({
    status: statusFilter === "all" ? "all" : statusFilter,
    search,
  });

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="text-gray-600 mt-1">Gerencie suas despesas e pagamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar CSV
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total a Pagar"
          value={formatCurrency(summary?.total || 0)}
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          trend={`${summary?.count || 0} contas`}
          color="border-l-yellow-500"
        />
        
        <SummaryCard
          title="Vencidas"
          value={formatCurrency(summary?.overdue || 0)}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          trend="Atenção necessária"
          color="border-l-red-500"
        />
        
        <SummaryCard
          title="Vence esta Semana"
          value={formatCurrency(summary?.thisWeek || 0)}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          trend="Próximos 7 dias"
          color="border-l-orange-500"
        />
        
        <SummaryCard
          title="Pago este Mês"
          value={formatCurrency(summary?.paidThisMonth || 0)}
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          trend={`${summary?.paidCount || 0} pagamentos`}
          color="border-l-green-500"
        />
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por descrição, fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Status */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "a_pagar" ? "default" : "outline"}
                onClick={() => setStatusFilter("a_pagar")}
                size="sm"
              >
                A Pagar
              </Button>
              <Button
                variant={statusFilter === "em_aberto" ? "default" : "outline"}
                onClick={() => setStatusFilter("em_aberto")}
                size="sm"
              >
                Em Aberto
              </Button>
              <Button
                variant={statusFilter === "pago" ? "default" : "outline"}
                onClick={() => setStatusFilter("pago")}
                size="sm"
              >
                Pago
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contas ({accounts.length})</span>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando contas...
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {search 
                  ? "Tente ajustar sua busca ou filtros" 
                  : "Comece adicionando uma nova conta a pagar"}
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Conta
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((account: any, idx: number) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {account.description}
                        </h4>
                        <StatusBadge status={account.status} />
                        {account.isRecurring && (
                          <Badge variant="outline" className="gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Recorrente
                          </Badge>
                        )}
                        {account.isInstallment && (
                          <Badge variant="outline">
                            {account.installmentNumber}/{account.totalInstallments}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {account.supplierName && (
                          <span>Fornecedor: {account.supplierName}</span>
                        )}
                        {account.category && (
                          <span>• {account.category}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Vence: {new Date(account.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(account.amount)}
                        </p>
                        {account.paidDate && (
                          <p className="text-sm text-green-600">
                            Pago em {new Date(account.paidDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
