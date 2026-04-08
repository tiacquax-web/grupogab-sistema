# 🚀 PLANO DE AÇÃO - MODERNIZAÇÃO GRUPOGAB ERP

**Data de Criação:** 08 de Abril de 2026
**Versão:** 1.0.0
**Duração Estimada:** 12 semanas (3 meses)
**Esforço Total:** ~400 horas

---

## 🎯 OBJETIVOS ESTRATÉGICOS

### 1. Segurança
- ✅ Resolver todas vulnerabilidades críticas
- ✅ Implementar ownership checks
- ✅ Validação de uploads
- ✅ RBAC consistente

### 2. Escalabilidade
- ✅ Suporte multi-empresa
- ✅ Performance otimizada (< 2s loads)
- ✅ Paginação universal
- ✅ Índices otimizados

### 3. Experiência do Usuário
- ✅ Design system consistente
- ✅ Mobile-first responsivo
- ✅ Acessibilidade WCAG AA
- ✅ Dark mode otimizado

### 4. Qualidade de Código
- ✅ Type safety 100%
- ✅ Redução de duplicação (<5%)
- ✅ Test coverage >80%
- ✅ Documentação completa

---

## 📅 CRONOGRAMA GERAL (12 Semanas)

```
Semana 1-2:   🔐 Segurança Crítica
Semana 3-4:   🗄️ Database Refactoring
Semana 5-6:   ⚡ Performance & RBAC
Semana 7-8:   🎨 Design System & Mobile
Semana 9-10:  ♿ Acessibilidade & Dark Mode
Semana 11-12: 🚀 Features Avançadas & Polish
```

---

## 🔥 SPRINT 1 (Semana 1-2): Segurança Crítica

**Objetivo:** Resolver todas vulnerabilidades P0
**Duração:** 10 dias úteis
**Esforço:** 40 horas

### Tarefas

#### 1.1 Implementar Ownership Checks (12h)
**Responsável:** Backend Dev
**Prioridade:** 🔴 P0

**Tarefas:**
- [ ] Criar middleware `checkOwnership()`
- [ ] Aplicar em Chat router (SEC-001)
- [ ] Aplicar em Agenda router (SEC-002)
- [ ] Aplicar em Documents router
- [ ] Aplicar em CRM router
- [ ] Aplicar em Financial router
- [ ] Aplicar em Projects router
- [ ] Aplicar em PurchaseOrders router
- [ ] Testes unitários para cada caso

**Entregável:** PR #1 - Ownership checks implementados

---

#### 1.2 Remover Type Assertions `as any` (8h)
**Responsável:** Backend Dev
**Prioridade:** 🔴 P0

**Arquivos afetados:**
- `server/routers/crm.ts`
- `server/routers/financial.ts`
- `server/routers/projects.ts`
- `server/routers/purchaseOrders.ts`

**Tarefas:**
- [ ] Definir tipos explícitos para inserções
- [ ] Substituir `as any` por `satisfies`
- [ ] Validar com TypeScript strict mode
- [ ] Testes de tipo com tsd

**Entregável:** PR #2 - Type safety 100%

---

#### 1.3 File Upload Security (4h)
**Responsável:** Backend Dev
**Prioridade:** 🔴 P0

**Tarefas:**
- [ ] Instalar `file-type` package
- [ ] Implementar validação de MIME type
- [ ] Implementar validação de tamanho (10MB max)
- [ ] Sanitizar nomes de arquivo
- [ ] Adicionar rate limiting
- [ ] Testes de segurança

**Entregável:** PR #3 - Upload seguro

---

#### 1.4 Implementar Paginação Universal (10h)
**Responsável:** Backend Dev
**Prioridade:** 🔴 P0

**Tarefas:**
- [ ] Criar helper `paginationSchema`
- [ ] Criar helper `paginateQuery()`
- [ ] Aplicar em Admin router
- [ ] Aplicar em Clients router
- [ ] Aplicar em CRM router
- [ ] Aplicar em Documents router
- [ ] Aplicar em Financial router
- [ ] Aplicar em Projects router
- [ ] Aplicar em PurchaseOrders router
- [ ] Atualizar frontend para usar paginação

**Entregável:** PR #4 - Paginação universal

---

#### 1.5 Consolidar Helpers Frontend (6h)
**Responsável:** Frontend Dev
**Prioridade:** 🔴 P0

**Tarefas:**
- [ ] Criar `lib/format.ts` (formatCurrency, initials, formatDate)
- [ ] Criar `lib/configs.ts` (STATUS_CONFIGS, PRIORITY_CONFIGS)
- [ ] Remover duplicações em páginas
- [ ] Testes unitários para helpers

**Entregável:** PR #5 - Helpers consolidados

---

### Critérios de Aceitação Sprint 1
- [ ] Nenhuma vulnerabilidade P0 aberta
- [ ] Type checking sem erros
- [ ] Upload de arquivos validado
- [ ] Paginação em todos os endpoints
- [ ] Código duplicado < 15%

---

## 🗄️ SPRINT 2 (Semana 3-4): Database Refactoring

**Objetivo:** Corrigir estrutura do banco de dados
**Duração:** 10 dias úteis
**Esforço:** 40 horas

### Tarefas

#### 2.1 Adicionar Foreign Keys (8h)
**Responsável:** Backend Dev
**Prioridade:** 🔴 P0

**Tarefas:**
- [ ] Revisar todas as relações
- [ ] Adicionar `references()` em accountsPayable
- [ ] Adicionar `references()` em accountsReceivable
- [ ] Adicionar `references()` em purchaseOrders
- [ ] Adicionar `references()` em crmActivities
- [ ] Adicionar `references()` em chatParticipants
- [ ] Adicionar `references()` em chatMessages
- [ ] Adicionar `references()` em agendaEvents
- [ ] Adicionar `references()` em projectTasks
- [ ] Adicionar `references()` em userPermissions
- [ ] Gerar migration
- [ ] Testar rollback

**Entregável:** PR #6 - Foreign Keys

---

#### 2.2 Criar Tabela Suppliers (2h)
**Responsável:** Backend Dev
**Prioridade:** 🔴 P0

**Tarefas:**
- [ ] Definir schema de suppliers
- [ ] Criar migration
- [ ] Atualizar router de suppliers
- [ ] Migrar dados de supplierName existentes
- [ ] Remover campo supplierName

**Entregável:** PR #7 - Suppliers table

---

#### 2.3 Adicionar Índices Críticos (6h)
**Responsável:** Backend Dev + DBA
**Prioridade:** 🟠 P1

**Tarefas:**
- [ ] Analisar queries mais frequentes
- [ ] Criar índices em status fields
- [ ] Criar índices em FK fields
- [ ] Criar índices em date fields
- [ ] Criar índices compostos para filtros
- [ ] Benchmarking antes/depois
- [ ] Documentar estratégia de índices

**Entregável:** PR #8 - Database indexes

---

#### 2.4 Implementar Multi-Empresa (20h)
**Responsável:** Backend Dev + Frontend Dev
**Prioridade:** 🟠 P1

**Fase 1: Schema (10h)**
- [ ] Criar tabela `companies`
- [ ] Criar tabela `companyUsers`
- [ ] Adicionar `companyId` em todas as tabelas de negócio
- [ ] Gerar migrations
- [ ] Seed com empresa demo

**Fase 2: Backend (6h)**
- [ ] Middleware de validação de companyId
- [ ] Atualizar todos routers para filtrar por companyId
- [ ] Router de companies (CRUD)
- [ ] Endpoint de seleção de empresa

**Fase 3: Frontend (4h)**
- [ ] UI de seleção de empresa (header)
- [ ] Context de empresa ativa
- [ ] Persistir empresa selecionada
- [ ] Filtros automáticos por empresa

**Entregável:** PR #9 - Multi-empresa

---

#### 2.5 Implementar Soft Delete (4h)
**Responsável:** Backend Dev
**Prioridade:** 🟠 P1

**Tarefas:**
- [ ] Adicionar `deletedAt` em tabelas críticas
- [ ] Atualizar routers para soft delete
- [ ] Filtrar registros deletados nas queries
- [ ] Endpoint de restauração (admin)

**Entregável:** PR #10 - Soft delete

---

### Critérios de Aceitação Sprint 2
- [ ] FKs definidas e ativas
- [ ] Tabela suppliers funcionando
- [ ] Índices aplicados (>30)
- [ ] Multi-empresa implementado
- [ ] Soft delete em tabelas críticas

---

## ⚡ SPRINT 3 (Semana 5-6): Performance & RBAC

**Objetivo:** Otimizar performance e segurança
**Duração:** 10 dias úteis
**Esforço:** 40 horas

### Tarefas

#### 3.1 Corrigir N+1 Queries (8h)
**Responsável:** Backend Dev

**Tarefas:**
- [ ] Financial.summaryPayable → usar SUM aggregation
- [ ] Financial.summaryReceivable → usar SUM aggregation
- [ ] Admin.stats → otimizar com subqueries
- [ ] Admin.logStats → usar GROUP BY
- [ ] Chat.getParticipants → JOIN único

**Entregável:** PR #11 - N+1 fixes

---

#### 3.2 Implementar RBAC Consistente (6h)
**Responsável:** Backend Dev

**Tarefas:**
- [ ] Criar middleware `requireRole()`
- [ ] Definir permissões por módulo
- [ ] Aplicar em todos routers
- [ ] Testes de autorização

**Entregável:** PR #12 - RBAC

---

#### 3.3 Code Splitting Frontend (3h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Lazy load todas as páginas
- [ ] Suspense boundaries
- [ ] Loading skeletons
- [ ] Preload em hover

**Entregável:** PR #13 - Lazy loading

---

#### 3.4 Otimizar Re-renders (10h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] useCallback para handlers
- [ ] useMemo para valores computados
- [ ] useReducer para forms complexos
- [ ] React.memo para components pesados
- [ ] Profiler analysis

**Entregável:** PR #14 - Performance frontend

---

#### 3.5 Fixar Chat Polling (2h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Aumentar intervalo para 30s
- [ ] Implementar exponential backoff
- [ ] Stop polling quando tab inativa

**Entregável:** PR #15 - Chat optimization

---

#### 3.6 Corrigir CSV Parser (3h)
**Responsável:** Backend Dev

**Tarefas:**
- [ ] Instalar `papaparse`
- [ ] Substituir parser manual
- [ ] Validação de schema
- [ ] Error reporting melhorado

**Entregável:** PR #16 - CSV import fix

---

#### 3.7 Bundle Optimization (8h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Analisar bundle com webpack-bundle-analyzer
- [ ] Tree-shake imports (lucide-react, etc)
- [ ] Code splitting por rota
- [ ] Comprimir assets
- [ ] Meta: < 500KB gzipped

**Entregável:** PR #17 - Bundle size

---

### Critérios de Aceitação Sprint 3
- [ ] Queries otimizadas (< 100ms médio)
- [ ] RBAC implementado
- [ ] Bundle < 500KB
- [ ] Re-renders reduzidos 50%
- [ ] Lighthouse score > 80

---

## 🎨 SPRINT 4 (Semana 7-8): Design System & Mobile

**Objetivo:** UI/UX consistente e responsivo
**Duração:** 10 dias úteis
**Esforço:** 40 horas

### Tarefas

#### 4.1 Design Tokens (6h)
**Responsável:** Frontend Dev + Designer

**Tarefas:**
- [ ] Definir color palette completa
- [ ] Definir spacing system
- [ ] Definir typography scale
- [ ] Definir shadows e borders
- [ ] Documentar no Storybook

**Entregável:** PR #18 - Design tokens

---

#### 4.2 Componentes Base (12h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Melhorar Button variants
- [ ] Criar StatusBadge component
- [ ] Criar StatCard component
- [ ] Criar PageHeader component
- [ ] Criar EmptyState component
- [ ] Criar skeleton screens
- [ ] Storybook stories

**Entregável:** PR #19 - Base components

---

#### 4.3 FormDialog Genérico (6h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Implementar FormDialog<T>
- [ ] Integrar react-hook-form + zod
- [ ] Substituir em 5+ páginas
- [ ] Documentar uso

**Entregável:** PR #20 - FormDialog

---

#### 4.4 Responsividade Mobile (12h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Implementar breakpoint system
- [ ] Bottom navigation mobile
- [ ] Responsive tables (card view)
- [ ] Touch gestures (swipe actions)
- [ ] Testar em 3+ dispositivos

**Entregável:** PR #21 - Mobile responsive

---

#### 4.5 DataTable Component (4h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Criar DataTable genérico
- [ ] Sorting, filtering, search
- [ ] Paginação integrada
- [ ] Actions column
- [ ] Substituir em 3+ páginas

**Entregável:** PR #22 - DataTable

---

### Critérios de Aceitação Sprint 4
- [ ] Design system documentado
- [ ] 10+ componentes reutilizáveis
- [ ] Mobile UX em todas as páginas
- [ ] Código duplicado < 10%

---

## ♿ SPRINT 5 (Semana 9-10): Acessibilidade & Dark Mode

**Objetivo:** WCAG AA compliance e tema otimizado
**Duração:** 10 dias úteis
**Esforço:** 40 horas

### Tarefas

#### 5.1 Aria Labels (8h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Adicionar aria-labels em ícones
- [ ] Adicionar aria-describedby em tooltips
- [ ] Roles apropriados (button, menu, etc)
- [ ] Landmarks (nav, main, aside)
- [ ] Testar com screen reader

**Entregável:** PR #23 - ARIA compliance

---

#### 5.2 Keyboard Navigation (8h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Tabindex em elementos interativos
- [ ] Focus visible customizado
- [ ] Atalhos de teclado (Cmd+K, etc)
- [ ] Trap focus em modals
- [ ] Escape para fechar

**Entregável:** PR #24 - Keyboard nav

---

#### 5.3 Color Contrast (6h)
**Responsável:** Frontend Dev + Designer

**Tarefas:**
- [ ] Auditar com axe DevTools
- [ ] Ajustar cores que não passam AA
- [ ] Testar com daltonismo simulator
- [ ] Documentar palette acessível

**Entregável:** PR #25 - Color contrast

---

#### 5.4 Dark Mode Otimizado (8h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Revisar theme tokens
- [ ] Otimizar contraste em dark mode
- [ ] Transição suave (200ms)
- [ ] Preferência do sistema
- [ ] Persistir escolha

**Entregável:** PR #26 - Dark mode

---

#### 5.5 Testes de Acessibilidade (6h)
**Responsável:** QA + Frontend Dev

**Tarefas:**
- [ ] Testar com NVDA
- [ ] Testar com JAWS
- [ ] Lighthouse accessibility score
- [ ] Documentar issues encontrados
- [ ] Meta: score > 95

**Entregável:** Relatório de acessibilidade

---

#### 5.6 Validação de Datas (4h)
**Responsável:** Backend Dev

**Tarefas:**
- [ ] Implementar validações com z.refine()
- [ ] endDate > startDate
- [ ] paidDate <= dueDate
- [ ] Mensagens de erro claras

**Entregável:** PR #27 - Date validation

---

### Critérios de Aceitação Sprint 5
- [ ] WCAG 2.1 AA compliance
- [ ] Lighthouse accessibility > 95
- [ ] Dark mode otimizado
- [ ] Navegação 100% por teclado

---

## 🚀 SPRINT 6 (Semana 11-12): Features Avançadas & Polish

**Objetivo:** Recursos enterprise e refinamento
**Duração:** 10 dias úteis
**Esforço:** 40 horas

### Tarefas

#### 6.1 Busca Global (Cmd+K) (12h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Implementar Command Palette
- [ ] Indexar todas as páginas
- [ ] Indexar ações principais
- [ ] Navegação por teclado
- [ ] Fuzzy search

**Entregável:** PR #28 - Global search

---

#### 6.2 Dashboard Modernizado (8h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Redesign KPI cards
- [ ] Gráficos interativos (Recharts)
- [ ] Quick actions
- [ ] Recent activity feed

**Entregável:** PR #29 - Dashboard v2

---

#### 6.3 Filtros Avançados (10h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Advanced filter component
- [ ] Multi-select, date range, range slider
- [ ] Save/load filter presets
- [ ] Apply to 3+ páginas

**Entregável:** PR #30 - Advanced filters

---

#### 6.4 Animações (4h)
**Responsável:** Frontend Dev

**Tarefas:**
- [ ] Loading states (skeletons)
- [ ] Transições (Framer Motion)
- [ ] Success states (confetti)
- [ ] Hover effects

**Entregável:** PR #31 - Animations

---

#### 6.5 Testes Unitários (12h)
**Responsável:** QA + Devs

**Tarefas:**
- [ ] Testes de routers (Vitest)
- [ ] Testes de componentes (Testing Library)
- [ ] Testes de hooks
- [ ] Meta: coverage > 80%

**Entregável:** Test suite completo

---

#### 6.6 Documentação (8h)
**Responsável:** Tech Lead

**Tarefas:**
- [ ] README atualizado
- [ ] API documentation
- [ ] Component documentation (Storybook)
- [ ] Deployment guide
- [ ] Contributing guide

**Entregável:** Documentação completa

---

### Critérios de Aceitação Sprint 6
- [ ] Busca global funcionando
- [ ] Dashboard modernizado
- [ ] Filtros avançados em 3+ páginas
- [ ] Test coverage > 80%
- [ ] Documentação completa

---

## 📊 RESUMO CONSOLIDADO

### Esforço Total por Área

| Área | Horas | % |
|------|-------|---|
| Segurança | 40h | 17% |
| Database | 40h | 17% |
| Performance | 40h | 17% |
| UI/UX | 80h | 33% |
| Qualidade | 40h | 17% |
| **TOTAL** | **240h** | **100%** |

### Timeline Visual

```
┌─────────────────────────────────────────────────────────────┐
│ Semana 1-2:   █████ Segurança Crítica                       │
│ Semana 3-4:   █████ Database Refactoring                    │
│ Semana 5-6:   █████ Performance & RBAC                      │
│ Semana 7-8:   █████ Design System & Mobile                  │
│ Semana 9-10:  █████ Acessibilidade & Dark Mode              │
│ Semana 11-12: █████ Features Avançadas                      │
└─────────────────────────────────────────────────────────────┘
```

### Prioridades por Sprint

| Sprint | Foco | Issues Resolvidos | PRs |
|--------|------|-------------------|-----|
| 1 | Segurança | 7 críticos | 5 |
| 2 | Database | 4 críticos | 5 |
| 3 | Performance | 6 altos | 7 |
| 4 | UI/UX | 5 médios | 5 |
| 5 | A11y | 4 médios | 4 |
| 6 | Polish | 3 baixos | 3 |

---

## 🎯 KPIs DE SUCESSO

### Métricas Técnicas
- [ ] Lighthouse Score > 90
- [ ] Test Coverage > 80%
- [ ] Type Safety 100%
- [ ] Bundle Size < 500KB
- [ ] Initial Load < 2s
- [ ] No vulnerabilidades P0/P1

### Métricas de Negócio
- [ ] Mobile Usage > 30%
- [ ] User Satisfaction > 4/5
- [ ] Support Tickets < 10/mês
- [ ] Task Completion Rate > 85%

### Métricas de Código
- [ ] Code Duplication < 5%
- [ ] Component Reusability > 70%
- [ ] WCAG AA Compliance
- [ ] Zero `as any` assertions

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Quebra de Funcionalidades Existentes
**Probabilidade:** Média
**Impacto:** Alto
**Mitigação:**
- Testes E2E antes de cada PR
- Feature flags para rollback rápido
- Staging environment obrigatório

### Risco 2: Atraso na Entrega
**Probabilidade:** Média
**Impacto:** Médio
**Mitigação:**
- Buffer de 20% no cronograma
- Daily standups
- Sprints podem ser ajustados

### Risco 3: Resistência de Usuários
**Probabilidade:** Baixa
**Impacto:** Médio
**Mitigação:**
- Comunicação prévia de mudanças
- Onboarding tour
- Suporte dedicado pós-deploy

---

## 📋 CHECKLIST DE PRÉ-DEPLOY

### Antes de Cada Sprint
- [ ] Branch criada a partir de `main`
- [ ] Testes passando (unit + E2E)
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Lighthouse score verificado

### Antes do Deploy Final
- [ ] Backup do banco de dados
- [ ] Migrations testadas em staging
- [ ] Load testing (500+ concurrent users)
- [ ] Security audit
- [ ] Rollback plan documentado
- [ ] Equipe de suporte treinada

---

## 👥 EQUIPE SUGERIDA

### Core Team
- **1x Tech Lead** - Coordenação e arquitetura
- **2x Backend Developers** - Database + APIs
- **2x Frontend Developers** - UI/UX + Components
- **1x QA Engineer** - Testes e automação
- **1x Designer** - Design system e UX

### Part-time
- **1x DBA** - Otimização de queries
- **1x Security Specialist** - Auditoria de segurança

---

## 📞 COMUNICAÇÃO

### Daily Standup (15min)
- What did you do yesterday?
- What will you do today?
- Any blockers?

### Sprint Review (2h)
- Demo de funcionalidades
- Retrospectiva
- Planning próximo sprint

### Slack Channels
- `#grupogab-dev` - Desenvolvimento
- `#grupogab-bugs` - Bugs e issues
- `#grupogab-deploys` - Notificações de deploy

---

## 🎉 CONCLUSÃO

Este plano de ação fornece um roadmap claro para modernizar o GrupoGab ERP em 12 semanas, priorizando:

1. **Segurança** - Resolver vulnerabilidades críticas primeiro
2. **Escalabilidade** - Database robusto e multi-empresa
3. **UX** - Design moderno e acessível
4. **Qualidade** - Código testado e documentado

Com este plano, o GrupoGab ERP estará pronto para escalar, atender múltiplas empresas e proporcionar uma experiência de classe mundial aos usuários.

---

**Plano criado automaticamente**
**Claude Code - Anthropic**
**08/04/2026 13:13 UTC**

**Próximos passos:**
1. Revisão do plano com stakeholders
2. Aprovação de orçamento e recursos
3. Kickoff Sprint 1
4. Let's build something amazing! 🚀
