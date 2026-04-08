import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import ContasPagar from "./pages/financeiro/ContasPagar";
import ContasReceber from "./pages/financeiro/ContasReceber";
import CentroCusto from "./pages/financeiro/CentroCusto";
import Clientes from "./pages/Clientes";
import OrdensCompra from "./pages/OrdensCompra";
import CRM from "./pages/CRM";
import Chat from "./pages/Chat";
import Agenda from "./pages/Agenda";
import Projetos from "./pages/Projetos";
import ProjetosKanban from "./pages/ProjetosKanban";
import Documentos from "./pages/Documentos";
import Relatorios from "./pages/Relatorios";
import AdminPanel from "./pages/admin/AdminPanel";

function AppRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/financeiro/contas-pagar" component={ContasPagar} />
        <Route path="/financeiro/contas-receber" component={ContasReceber} />
        <Route path="/financeiro/centro-custo" component={CentroCusto} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/ordens-compra" component={OrdensCompra} />
        <Route path="/crm" component={CRM} />
        <Route path="/chat" component={Chat} />
        <Route path="/agenda" component={Agenda} />
        <Route path="/projetos" component={Projetos} />
        <Route path="/projetos/kanban" component={ProjetosKanban} />
        <Route path="/documentos" component={Documentos} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <AppRoutes />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
