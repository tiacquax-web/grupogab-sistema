import { Route, Switch } from "wouter";
import DashboardModerno from "@/pages/DashboardModerno";
import ContasPagarModerno from "@/pages/financeiro/ContasPagarModerno";
import ContasReceberModerno from "@/pages/financeiro/ContasReceberModerno";
import CRMModerno from "@/pages/crm/CRMModerno";
import ProjetosModerno from "@/pages/projetos/ProjetosModerno";
import RelatoriosModerno from "@/pages/RelatoriosModerno";
import LayoutModerno from "@/components/LayoutModerno";
import "./index.css";

export default function App() {
  return (
    <LayoutModerno>
      <Switch>
        <Route path="/" component={DashboardModerno} />
        <Route path="/dashboard" component={DashboardModerno} />
        <Route path="/financeiro/contas-pagar" component={ContasPagarModerno} />
        <Route path="/financeiro/contas-receber" component={ContasReceberModerno} />
        <Route path="/crm" component={CRMModerno} />
        <Route path="/projetos" component={ProjetosModerno} />
        <Route path="/relatorios" component={RelatoriosModerno} />
        <Route>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-600">Página não encontrada</p>
            </div>
          </div>
        </Route>
      </Switch>
    </LayoutModerno>
  );
}
