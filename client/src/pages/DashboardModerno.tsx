import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  ShoppingCart,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Link } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

// Design tokens
const ds = {
  card: {
    hover: 'hover:shadow-lg transition-shadow duration-300',
    gradient: 'bg-gradient-to-br',
  },
  metric: 'text-3xl font-bold',
  label: 'text-sm font-medium text-muted-foreground',
  trend: {
    positive: 'text-green-600 flex items-center gap-1',
    negative: 'text-red-600 flex items-center gap-1',
  }
};

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  gradient: string;
  link?: string;
  delay?: number;
}

function MetricCard({ title, value, trend, icon, gradient, link, delay = 0 }: MetricCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`${ds.card.hover} ${gradient} text-white border-none`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
          <div className="text-white/90">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className={`${ds.metric} text-white`}>{value}</div>
          {trend && (
            <div className={`mt-2 text-sm text-white/80 flex items-center gap-1`}>
              {trend.isPositive ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>+{trend.value}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span>{trend.value}%</span>
                </>
              )}
              <span className="ml-1">vs mês anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  link: string;
  variant?: 'default' | 'primary' | 'success';
}

function QuickAction({ label, icon, link, variant = 'default' }: QuickActionProps) {
  const variantStyles = {
    default: 'bg-white hover:bg-gray-50 border-gray-200',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
  };

  return (
    <Link href={link}>
      <Button 
        className={`w-full justify-start gap-2 ${variantStyles[variant]}`}
        variant={variant === 'default' ? 'outline' : 'default'}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
}

export default function DashboardModerno() {
  // Queries
  const { data: financialSummary } = trpc.financial.summary.useQuery();
  const { data: projectsStats } = trpc.projects.stats.useQuery();
  const { data: crmStats } = trpc.crm.stats.useQuery();
  const { data: clientsCount } = trpc.clients.count.useQuery();

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vinda de volta, Giulia! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está o resumo do seu negócio hoje
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Abril 2026
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="w-4 h-4" />
            Relatório Completo
          </Button>
        </div>
      </motion.div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Contas a Receber"
          value={formatCurrency(financialSummary?.receivable || 0)}
          trend={{ value: 15, isPositive: true }}
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-green-500 to-emerald-600"
          link="/financeiro/contas-receber"
          delay={0}
        />
        
        <MetricCard
          title="Contas a Pagar"
          value={formatCurrency(financialSummary?.payable || 0)}
          trend={{ value: -8, isPositive: false }}
          icon={<FileText className="w-6 h-6" />}
          gradient="from-red-500 to-rose-600"
          link="/financeiro/contas-pagar"
          delay={0.1}
        />
        
        <MetricCard
          title="Leads Ativos"
          value={crmStats?.activeLeads || 0}
          trend={{ value: 23, isPositive: true }}
          icon={<Users className="w-6 h-6" />}
          gradient="from-blue-500 to-indigo-600"
          link="/crm"
          delay={0.2}
        />
        
        <MetricCard
          title="Projetos em Andamento"
          value={projectsStats?.inProgress || 0}
          trend={{ value: 12, isPositive: true }}
          icon={<Briefcase className="w-6 h-6" />}
          gradient="from-purple-500 to-violet-600"
          link="/projetos"
          delay={0.3}
        />
      </div>

      {/* Ações Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickAction
                label="Nova Conta a Pagar"
                icon={<FileText className="w-4 h-4" />}
                link="/financeiro/contas-pagar?novo=true"
              />
              <QuickAction
                label="Nova Conta a Receber"
                icon={<DollarSign className="w-4 h-4" />}
                link="/financeiro/contas-receber?novo=true"
              />
              <QuickAction
                label="Novo Lead"
                icon={<Users className="w-4 h-4" />}
                link="/crm?novo=true"
                variant="primary"
              />
              <QuickAction
                label="Nova Ordem de Compra"
                icon={<ShoppingCart className="w-4 h-4" />}
                link="/compras?novo=true"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráficos e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo de Caixa */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Fluxo de Caixa
                </span>
                <Link href="/relatorios">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver mais
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Gráfico de fluxo de caixa aqui</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribuição por Centro de Custo */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Centro de Custo
                </span>
                <Link href="/financeiro/centro-custo">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver mais
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Gráfico de pizza aqui</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Atividades Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Atividades Recentes</span>
              <Link href="/admin/logs">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Nova conta a pagar criada</p>
                    <p className="text-sm text-gray-600">por Giulia Marques • há 2 horas</p>
                  </div>
                  <div className="text-sm text-gray-500">R$ 1.234,56</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
