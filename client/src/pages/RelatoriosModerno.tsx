import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Building2,
  Users,
  Briefcase,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

function MetricCard({ title, value, change, icon, color }: any) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-l-4 ${color} hover:shadow-md transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {icon}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="text-gray-500">vs mês anterior</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChartPlaceholder({ title, type, height = 300 }: any) {
  const icons: Record<string, any> = {
    bar: <BarChart3 className="w-8 h-8 text-gray-400" />,
    pie: <PieChart className="w-8 h-8 text-gray-400" />,
    line: <TrendingUp className="w-8 h-8 text-gray-400" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300"
          style={{ height: `${height}px` }}
        >
          {icons[type] || icons.bar}
          <p className="text-sm text-gray-500 mt-2">Gráfico {type === 'bar' ? 'de barras' : type === 'pie' ? 'de pizza' : 'de linha'}</p>
          <p className="text-xs text-gray-400 mt-1">Integração Recharts em andamento</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TopItem({ rank, name, value, icon }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
        {rank}
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon}
        <span className="font-medium text-gray-900 truncate">{name}</span>
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default function RelatoriosModerno() {
  const [period, setPeriod] = useState("month");

  // Queries
  const { data: financialSummary } = trpc.financial.summary.useQuery();
  const { data: crmStats } = trpc.crm.stats.useQuery();
  const { data: projectsStats } = trpc.projects.stats.useQuery();

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios & Analytics</h1>
          <p className="text-gray-600 mt-1">Visão completa do desempenho da empresa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {period === "month" ? "Este Mês" : period === "quarter" ? "Trimestre" : "Ano"}
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(financialSummary?.totalRevenue || 0)}
          change={15.3}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          color="border-l-green-500"
        />
        
        <MetricCard
          title="Despesas"
          value={formatCurrency(financialSummary?.totalExpenses || 0)}
          change={-8.2}
          icon={<FileText className="w-5 h-5 text-red-600" />}
          color="border-l-red-500"
        />
        
        <MetricCard
          title="Novos Clientes"
          value={crmStats?.newClients || 0}
          change={23.5}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          color="border-l-blue-500"
        />
        
        <MetricCard
          title="Projetos Concluídos"
          value={projectsStats?.completed || 0}
          change={12.1}
          icon={<Briefcase className="w-5 h-5 text-purple-600" />}
          color="border-l-purple-500"
        />
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
        </TabsList>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="space-y-6 mt-6">
          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder 
              title="Fluxo de Caixa Mensal" 
              type="bar"
              height={350}
            />
            
            <ChartPlaceholder 
              title="Receitas vs Despesas" 
              type="line"
              height={350}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder 
              title="Distribuição por Centro de Custo" 
              type="pie"
              height={300}
            />
            
            {/* Top Despesas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 5 Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <TopItem 
                    rank={1}
                    name="Folha de Pagamento"
                    value={formatCurrency(85000)}
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={2}
                    name="Aluguel e Condomínio"
                    value={formatCurrency(32000)}
                    icon={<Building2 className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={3}
                    name="Fornecedores"
                    value={formatCurrency(28500)}
                    icon={<FileText className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={4}
                    name="Marketing"
                    value={formatCurrency(15000)}
                    icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={5}
                    name="TI e Software"
                    value={formatCurrency(12000)}
                    icon={<FileText className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Contas a Receber</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialSummary?.receivable || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{financialSummary?.receivableCount || 0} contas</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Contas a Pagar</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialSummary?.payable || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{financialSummary?.payableCount || 0} contas</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Saldo Projetado</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency((financialSummary?.receivable || 0) - (financialSummary?.payable || 0))}
                  </p>
                  <p className="text-sm text-gray-500">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRM */}
        <TabsContent value="crm" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder 
              title="Funil de Vendas" 
              type="bar"
              height={350}
            />
            
            <ChartPlaceholder 
              title="Taxa de Conversão por Estágio" 
              type="line"
              height={350}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder 
              title="Leads por Origem" 
              type="pie"
              height={300}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 5 Vendedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <TopItem 
                    rank={1}
                    name="João Silva"
                    value="12 fechados"
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={2}
                    name="Maria Santos"
                    value="9 fechados"
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={3}
                    name="Pedro Oliveira"
                    value="7 fechados"
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={4}
                    name="Ana Costa"
                    value="5 fechados"
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  />
                  <TopItem 
                    rank={5}
                    name="Carlos Lima"
                    value="4 fechados"
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projetos */}
        <TabsContent value="projetos" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder 
              title="Projetos por Status" 
              type="pie"
              height={350}
            />
            
            <ChartPlaceholder 
              title="Timeline de Entregas" 
              type="bar"
              height={350}
            />
          </div>
        </TabsContent>

        {/* Operacional */}
        <TabsContent value="operacional" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder 
              title="Ordens de Compra por Mês" 
              type="bar"
              height={350}
            />
            
            <ChartPlaceholder 
              title="Documentos Processados" 
              type="line"
              height={350}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
