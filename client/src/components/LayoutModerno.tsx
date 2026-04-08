import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Briefcase, 
  ShoppingCart,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
  },
  {
    label: "Financeiro",
    icon: <DollarSign className="w-5 h-5" />,
    href: "/financeiro",
    children: [
      { label: "Contas a Pagar", icon: <FileText className="w-4 h-4" />, href: "/financeiro/contas-pagar" },
      { label: "Contas a Receber", icon: <DollarSign className="w-4 h-4" />, href: "/financeiro/contas-receber" },
      { label: "Centro de Custo", icon: <Building2 className="w-4 h-4" />, href: "/financeiro/centro-custo" },
    ],
  },
  {
    label: "CRM",
    icon: <Users className="w-5 h-5" />,
    href: "/crm",
    badge: 12,
  },
  {
    label: "Projetos",
    icon: <Briefcase className="w-5 h-5" />,
    href: "/projetos",
  },
  {
    label: "Compras",
    icon: <ShoppingCart className="w-5 h-5" />,
    href: "/compras",
  },
  {
    label: "Agenda",
    icon: <Calendar className="w-5 h-5" />,
    href: "/agenda",
  },
  {
    label: "Chat",
    icon: <MessageSquare className="w-5 h-5" />,
    href: "/chat",
    badge: 3,
  },
  {
    label: "Documentos",
    icon: <FileText className="w-5 h-5" />,
    href: "/documentos",
  },
  {
    label: "Relatórios",
    icon: <BarChart3 className="w-5 h-5" />,
    href: "/relatorios",
  },
  {
    label: "Configurações",
    icon: <Settings className="w-5 h-5" />,
    href: "/admin",
  },
];

interface LayoutProps {
  children: ReactNode;
}

export default function LayoutModerno({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/" || location === "/dashboard";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-gray-900 text-white border-r border-gray-800 z-50"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Grupo GAB</h1>
                <p className="text-xs text-gray-400">Gestão Empresarial</p>
              </div>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.href}>
              <Link href={item.href}>
                <button
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive(item.href)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }
                  `}
                  onClick={() => {
                    if (item.children) {
                      setExpandedItem(expandedItem === item.label ? null : item.label);
                    }
                  }}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                      )}
                    </>
                  )}
                </button>
              </Link>

              {/* Submenu */}
              {!sidebarCollapsed && item.children && expandedItem === item.label && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 mt-1 space-y-1 overflow-hidden"
                >
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <button
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          transition-colors
                          ${isActive(child.href)
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }
                        `}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </button>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        {/* User Info (bottom) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600">GM</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Giulia Marques</p>
                <p className="text-xs text-gray-400 truncate">Administrador</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarCollapsed ? 80 : 280,
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="h-16 px-6 flex items-center justify-between">
            {/* Company Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px]">
                  <Building2 className="w-4 h-4" />
                  <span className="flex-1 text-left">Acqua X - Matriz</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]">
                <DropdownMenuLabel>Selecione a Empresa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Building2 className="w-4 h-4 mr-2" />
                  Acqua X - Matriz
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="w-4 h-4 mr-2" />
                  Acqua X - Filial RJ
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="w-4 h-4 mr-2" />
                  Acqua X - Filial SP
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="w-4 h-4 mr-2" />
                  Acqua X - Filial ES
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Consolidado
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Empresas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="py-2 text-sm text-gray-600 text-center">
                    Nenhuma notificação nova
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white">GM</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">Giulia Marques</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
