# 🏢 GrupoGab ERP - Sistema de Gestão Empresarial

Sistema ERP moderno desenvolvido com React 19, TypeScript, tRPC e MySQL para gestão completa de operações empresariais.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be)](https://trpc.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalação](#instalação)
- [Documentação](#documentação)
- [Status do Projeto](#status-do-projeto)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)

---

## 🎯 Sobre o Projeto

GrupoGab ERP é um sistema completo de gestão empresarial que integra:
- **Financeiro:** Contas a pagar/receber, centro de custos
- **CRM:** Gestão de leads e pipeline de vendas
- **Projetos:** Gerenciamento de projetos de engenharia/obras
- **Operacional:** Clientes, ordens de compra, documentos
- **Comunicação:** Chat interno, agenda compartilhada
- **Administração:** Gestão de usuários e permissões

---

## ✨ Funcionalidades

### 💰 Módulo Financeiro
- ✅ Contas a Pagar com recorrência e parcelamento
- ✅ Contas a Receber com gestão de inadimplência
- ✅ Centro de Custos por obra/serviço
- ✅ Relatórios financeiros consolidados
- ✅ Importação de planilhas CSV

### 📊 CRM & Vendas
- ✅ Funil de vendas com múltiplos estágios
- ✅ Kanban de leads interativo
- ✅ Histórico de atividades
- ✅ Agendamento de follow-ups

### 🏗️ Projetos & Engenharia
- ✅ Gestão de projetos de obras
- ✅ Kanban de tarefas por fase
- ✅ Acompanhamento de prazos
- ✅ Vinculação com centro de custos

### 👥 Gestão de Clientes
- ✅ Cadastro completo (PF/PJ)
- ✅ Importação via planilha
- ✅ Histórico de transações

### 📦 Ordem de Compras
- ✅ Workflow de aprovação
- ✅ Rastreamento de recebimento
- ✅ Vinculação com projetos

### 💬 Comunicação
- ✅ Chat interno em tempo real
- ✅ Agenda compartilhada
- ✅ Notificações

### 🔐 Administração
- ✅ Gestão de usuários
- ✅ Controle de permissões por módulo
- ✅ Logs de auditoria
- ✅ Painel administrativo

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **Wouter 3** - Routing
- **TailwindCSS 4** - Styling
- **Radix UI** - Headless components
- **shadcn/ui** - Component library
- **React Query** - Server state
- **React Hook Form** - Form handling
- **Zod 4** - Schema validation
- **Recharts** - Data visualization

### Backend
- **Express 4** - Web framework
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - Type-safe ORM
- **MySQL 2** - Database
- **Jose** - JWT handling
- **SuperJSON** - Data serialization
- **AWS SDK** - File storage

### Development
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Prettier** - Code formatting
- **ESLint** - Linting
- **pnpm** - Package manager

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm 10+ (`npm install -g pnpm`)
- MySQL 8+ ([Download](https://dev.mysql.com/downloads/))

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/grupogab-erp.git
   cd grupogab-erp
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

4. **Execute as migrações:**
   ```bash
   pnpm db:push
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

6. **Acesse:** http://localhost:5173

---

## 📚 Documentação

### Documentos Disponíveis

- **[SUMARIO_EXECUTIVO.md](./SUMARIO_EXECUTIVO.md)** - Visão geral e decisões estratégicas
- **[ANALISE_COMPLETA.md](./ANALISE_COMPLETA.md)** - Análise técnica detalhada
- **[BUGS_E_ISSUES.md](./BUGS_E_ISSUES.md)** - Lista de bugs e issues conhecidos
- **[PLANO_DE_ACAO.md](./PLANO_DE_ACAO.md)** - Roadmap de correções e melhorias
- **[ROADMAP_MODERNIZACAO_UI.md](./ROADMAP_MODERNIZACAO_UI.md)** - Plano de modernização UI/UX
- **[todo.md](./todo.md)** - Lista de funcionalidades e progresso

### Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Inicia servidor de produção
pnpm check        # Type checking
pnpm format       # Formata código com Prettier
pnpm test         # Executa testes
pnpm db:push      # Aplica migrações do banco
```

---

## 📊 Status do Projeto

### Avaliação Atual (08/04/2026)

| Categoria | Nota | Status |
|-----------|------|--------|
| Arquitetura | 8/10 | ✅ Boa |
| Banco de Dados | 6/10 | ⚠️ Precisa Melhorias |
| Segurança | 4/10 | 🔴 Crítico |
| Performance | 5/10 | ⚠️ Precisa Melhorias |
| UX/UI | 7/10 | ✅ Boa |
| Código | 6/10 | ⚠️ Precisa Melhorias |

**Média Geral:** 6.0/10

### Issues Conhecidos

- 🔴 **7 Críticos** - Segurança e integridade de dados
- 🟠 **6 Altos** - Performance e escalabilidade
- 🟡 **9 Médios** - UX e qualidade de código
- 🟢 **4 Baixos** - Melhorias futuras

Veja [BUGS_E_ISSUES.md](./BUGS_E_ISSUES.md) para detalhes completos.

---

## 🗺️ Roadmap

### Fase 1: Correções Críticas (4 semanas)
- [x] Análise completa do sistema
- [ ] Resolver vulnerabilidades de segurança
- [ ] Adicionar Foreign Keys ao banco
- [ ] Implementar paginação universal
- [ ] Remover type assertions

### Fase 2: Database & Escalabilidade (4 semanas)
- [ ] Criar tabela suppliers
- [ ] Adicionar 30+ índices críticos
- [ ] Implementar suporte multi-empresa
- [ ] Soft delete em tabelas principais

### Fase 3: Performance (4 semanas)
- [ ] Corrigir N+1 queries
- [ ] Code splitting e lazy loading
- [ ] Otimizar re-renders
- [ ] Bundle size < 500KB

### Fase 4: UI/UX Modernização (8 semanas)
- [ ] Design system completo
- [ ] Responsividade mobile
- [ ] Dark mode otimizado
- [ ] Acessibilidade WCAG AA
- [ ] Dashboard modernizado

### Fase 5: Features Avançadas (2 semanas)
- [ ] Busca global (Cmd+K)
- [ ] Filtros avançados
- [ ] Centro de notificações
- [ ] Onboarding tour

**Timeline Total:** 12 semanas (3 meses)

Veja [PLANO_DE_ACAO.md](./PLANO_DE_ACAO.md) para cronograma detalhado.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `perf:` Performance
- `test:` Testes
- `chore:` Manutenção

### Code Review

- [ ] Código segue o style guide
- [ ] Testes passam (`pnpm test`)
- [ ] Type checking sem erros (`pnpm check`)
- [ ] Documentação atualizada
- [ ] Performance não degradada

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

- **Tech Lead:** [Nome]
- **Backend:** [Nome]
- **Frontend:** [Nome]
- **UI/UX:** [Nome]
- **QA:** [Nome]

---

## 📞 Suporte

- **Email:** suporte@grupogab.com
- **Slack:** #grupogab-dev
- **Issues:** [GitHub Issues](https://github.com/seu-usuario/grupogab-erp/issues)

---

## 🙏 Agradecimentos

- [Radix UI](https://www.radix-ui.com/) - Headless components
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM

---

**Construído com ❤️ pela equipe GrupoGab**

**Última atualização:** 08/04/2026
