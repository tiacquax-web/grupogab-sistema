# 🐛 LISTA DE BUGS E ISSUES ENCONTRADOS

**Data:** 08 de Abril de 2026
**Sistema:** GrupoGab ERP
**Severidade:** 🔴 Crítico | 🟠 Alto | 🟡 Médio | 🟢 Baixo

---

## 🔴 CRÍTICOS (Resolver Imediatamente)

### SEC-001: Acesso Não Autorizado a Mensagens de Chat
**Severidade:** 🔴 Crítico
**Módulo:** Chat Router
**Arquivo:** `server/routers/chat.ts:45`

**Descrição:**
Qualquer usuário autenticado pode acessar mensagens de qualquer conversa, apenas fornecendo o `conversationId`.

**Reprodução:**
1. Login como Usuário A
2. Obter `conversationId` de conversa do Usuário B
3. Chamar `chat.listMessages({ conversationId })`
4. Resultado: Acesso concedido indevidamente

**Impacto:**
- Violação de privacidade
- Exposição de dados sensíveis
- Não conformidade com LGPD

**Correção:**
```typescript
// Verificar se usuário é participante da conversa
const participant = await db.select()
  .from(chatParticipants)
  .where(
    and(
      eq(chatParticipants.conversationId, input.conversationId),
      eq(chatParticipants.userId, ctx.user.id)
    )
  );

if (!participant.length) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

**Prioridade:** P0
**Tempo Estimado:** 2h

---

### SEC-002: Usuário Pode Ver Agenda de Qualquer Outro Usuário
**Severidade:** 🔴 Crítico
**Módulo:** Agenda Router
**Arquivo:** `server/routers/agenda.ts:12`

**Descrição:**
Endpoint `list` permite que qualquer usuário veja a agenda de outros usuários.

**Reprodução:**
1. Login como Usuário A
2. Chamar `agenda.list({ userId: <id_usuario_B> })`
3. Resultado: Agenda completa de B é retornada

**Impacto:**
- Violação de privacidade
- Exposição de compromissos sensíveis

**Correção:**
```typescript
if (input?.userId && input.userId !== ctx.user.id && ctx.user.role !== "admin") {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

**Prioridade:** P0
**Tempo Estimado:** 1h

---

### SEC-003: Upload de Arquivo Sem Validação de Tipo
**Severidade:** 🔴 Crítico
**Módulo:** Documents Router
**Arquivo:** `server/routers/documents.ts:25`

**Descrição:**
Upload aceita qualquer tipo de arquivo. `mimeType` vem do cliente e não é validado no servidor.

**Reprodução:**
1. Upload de arquivo `.exe` declarado como `.pdf`
2. Sistema aceita sem validação
3. Arquivo malicioso armazenado

**Impacto:**
- Risco de malware
- Possível XSS via SVG
- Storage abuse

**Correção:**
```typescript
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const buffer = Buffer.from(input.fileBase64, "base64");

if (buffer.length > MAX_SIZE) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Arquivo muito grande (máximo 10MB)"
  });
}

const fileType = await fileTypeFromBuffer(buffer);
if (!fileType || !ALLOWED_TYPES.includes(fileType.mime)) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Tipo de arquivo não permitido"
  });
}
```

**Prioridade:** P0
**Tempo Estimado:** 4h

---

### DB-001: Ausência de Foreign Keys
**Severidade:** 🔴 Crítico
**Módulo:** Database Schema
**Arquivo:** `drizzle/schema.ts`

**Descrição:**
Nenhuma FK definida com `references()`. Sem integridade referencial no banco de dados.

**Impacto:**
- Possibilidade de dados órfãos
- Queries incorretas sem erro
- Impossível cascades automáticas
- Dificulta debugging

**Exemplos:**
- `accountsPayable.costCenterId` → não referencia `costCenters.id`
- `projects.clientId` → não referencia `clients.id`
- `chatMessages.conversationId` → não referencia `chatConversations.id`

**Correção:**
```typescript
// Exemplo para accountsPayable:
costCenterId: int("costCenterId")
  .references(() => costCenters.id, { onDelete: 'restrict' }),

clientId: int("clientId")
  .references(() => clients.id, { onDelete: 'restrict' }),

createdById: int("createdById")
  .references(() => users.id, { onDelete: 'restrict' }),
```

**Prioridade:** P0
**Tempo Estimado:** 8h (revisar todas as tabelas)

---

### DB-002: Tabela `suppliers` Não Existe
**Severidade:** 🔴 Crítico
**Módulo:** Database Schema
**Arquivo:** `drizzle/schema.ts`

**Descrição:**
`accountsPayable.supplierId` e `purchaseOrders.supplierId` referenciam tabela inexistente.

**Impacto:**
- Impossível vincular fornecedores
- Dados desnormalizados (supplierName)
- Duplicação de informações

**Correção:**
```typescript
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 32 }).notNull().unique(), // CNPJ
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 16 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

**Prioridade:** P0
**Tempo Estimado:** 2h

---

### PERF-001: N+1 Query em Financial Summary
**Severidade:** 🔴 Crítico
**Módulo:** Financial Router
**Arquivo:** `server/routers/financial.ts:146`

**Descrição:**
Carrega TODOS os registros de `accountsPayable` para calcular somas por status.

**Código Problemático:**
```typescript
const rows = await db.select().from(accountsPayable); // Carrega TODOS!
const aPagar = rows.filter(r => r.status === "a_pagar")
  .reduce((acc, r) => acc + parseFloat(r.amount), 0);
```

**Impacto:**
- Com 10k registros: ~500ms query + processamento em memória
- Com 100k registros: timeout ou OOM
- Alto uso de memória no servidor

**Correção:**
```typescript
const [result] = await db.select({
  aPagar: sum(sql`CASE WHEN status = 'a_pagar' THEN amount ELSE 0 END`).mapWith(Number),
  emAberto: sum(sql`CASE WHEN status = 'em_aberto' THEN amount ELSE 0 END`).mapWith(Number),
  pago: sum(sql`CASE WHEN status = 'pago' THEN amount ELSE 0 END`).mapWith(Number),
}).from(accountsPayable);
```

**Prioridade:** P0
**Tempo Estimado:** 2h

---

### CODE-001: Type Assertions `as any` (7 ocorrências)
**Severidade:** 🔴 Crítico
**Módulo:** Múltiplos routers
**Arquivos:**
- `server/routers/crm.ts:21`
- `server/routers/financial.ts:116,125,134,193`
- `server/routers/projects.ts:16,39`
- `server/routers/purchaseOrders.ts:19`

**Descrição:**
Uso de `as any` desativa type checking do TypeScript completamente.

**Exemplo:**
```typescript
await db.insert(crmLeads).values({
  ...input,
  value: input.value ?? null,
} as any); // ⚠️
```

**Impacto:**
- Perda de type safety
- Bugs em produção
- Dados incorretos no banco

**Correção:**
```typescript
// Opção 1: Definir tipo explícito
type CRMLeadInsert = typeof crmLeads.$inferInsert;

await db.insert(crmLeads).values({
  ...input,
  value: input.value ?? null,
} satisfies CRMLeadInsert);

// Opção 2: Ajustar schema para aceitar os tipos corretos
```

**Prioridade:** P0
**Tempo Estimado:** 8h

---

## 🟠 ALTOS (Resolver em 1 Semana)

### SEC-004: Falta de Paginação em listUsers
**Severidade:** 🟠 Alto
**Módulo:** Admin Router
**Arquivo:** `server/routers/admin.ts:42`

**Descrição:**
`listUsers` retorna TODOS os usuários sem limite ou paginação.

**Impacto:**
- DoS se sistema tiver 10k+ usuários
- Alto uso de memória
- Performance degradada

**Correção:**
Implementar paginação padrão (vide PERF-002).

**Prioridade:** P1
**Tempo Estimado:** 2h

---

### SEC-005: Information Disclosure - Lista Todos Usuários
**Severidade:** 🟠 Alto
**Módulo:** Chat Router
**Arquivo:** `server/routers/chat.ts:12`

**Descrição:**
`listUsers` retorna todos os usuários do sistema para qualquer usuário autenticado.

**Impacto:**
- Enumeração de usuários
- Violação de privacidade
- Possível target para ataques

**Correção:**
```typescript
// Retornar apenas usuários do mesmo departamento ou empresa
const users = await db.select()
  .from(users)
  .where(eq(users.companyId, ctx.user.companyId));
```

**Prioridade:** P1
**Tempo Estimado:** 2h

---

### DB-003: Falta de Índices Críticos (30+)
**Severidade:** 🟠 Alto
**Módulo:** Database Schema
**Arquivo:** `drizzle/schema.ts`

**Descrição:**
Campos usados em filtros, joins e ordenação não têm índices.

**Exemplos:**
```sql
-- Faltando:
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(dueDate);
CREATE INDEX idx_projects_client_id ON projects(clientId);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversationId);
```

**Impacto:**
- Queries lentas (full table scans)
- Degradação com crescimento de dados
- Alto uso de CPU no banco

**Correção:**
```typescript
export const accountsPayableIndexes = {
  statusIdx: index("idx_accounts_payable_status").on(accountsPayable.status),
  dueDateIdx: index("idx_accounts_payable_due_date").on(accountsPayable.dueDate),
  costCenterIdx: index("idx_accounts_payable_cost_center").on(accountsPayable.costCenterId),
  companyStatusIdx: index("idx_accounts_payable_company_status")
    .on(accountsPayable.companyId, accountsPayable.status),
};
```

**Prioridade:** P1
**Tempo Estimado:** 6h

---

### DB-004: Sem Suporte Multi-Empresa
**Severidade:** 🟠 Alto
**Módulo:** Database Schema
**Arquivo:** `drizzle/schema.ts`

**Descrição:**
Sistema não suporta múltiplas empresas. Falta campo `companyId` em todas as tabelas.

**Impacto:**
- Limitado a 1 empresa por instalação
- Dados misturados se tentar adaptar
- Impossível SaaS multi-tenant

**Correção:**
```typescript
// 1. Criar tabela companies
export const companies = mysqlTable("companies", { ... });

// 2. Adicionar companyId em TODAS as tabelas de negócio
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id),
  // ... resto dos campos
});

// 3. Criar associação empresa-usuário
export const companyUsers = mysqlTable("company_users", {
  companyId: int("companyId").notNull().references(() => companies.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["admin", "manager", "user"]).notNull(),
});
```

**Prioridade:** P1
**Tempo Estimado:** 20h

---

### PERF-002: Falta de Paginação em 8+ Endpoints
**Severidade:** 🟠 Alto
**Módulo:** Múltiplos routers

**Endpoints sem paginação:**
- `admin.listUsers` - ❌ SEM limite
- `agenda.list` - ❌ SEM paginação
- `costCenters.list` - ❌ SEM limite
- `projects.list` - ❌ SEM limite

**Endpoints com limite hardcoded:**
- `admin.listLogs` - ⚠️ 500 fixo
- `chat.listMessages` - ⚠️ 100 fixo
- `clients.list` - ⚠️ 500 fixo
- `crm.listLeads` - ⚠️ 500 fixo
- `documents.list` - ⚠️ 200 fixo
- `financial.listPayable` - ⚠️ 200 fixo

**Correção:**
```typescript
// Padrão universal de paginação
const paginationInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

list: protectedProcedure
  .input(z.object({
    ...paginationInput.shape,
    // outros filtros
  }))
  .query(async ({ input }) => {
    const offset = (input.page - 1) * input.limit;

    const [data, [{ total }]] = await Promise.all([
      db.select().from(table)
        .limit(input.limit)
        .offset(offset)
        .orderBy(desc(table.createdAt)),
      db.select({ total: count() }).from(table),
    ]);

    return {
      data,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        pages: Math.ceil(total / input.limit),
      },
    };
  })
```

**Prioridade:** P1
**Tempo Estimado:** 10h (todos os endpoints)

---

### DB-005: Campos Nullable Inapropriados
**Severidade:** 🟠 Alto
**Módulo:** Database Schema

**Campos que deveriam ser NOT NULL:**
```typescript
users.name          // NULL → Usuário sem nome?
users.email         // NULL → Como fazer login?
clients.cpfCnpj     // NULL → Cliente sem documento?
accountsPayable.supplierId  // NULL → Conta sem fornecedor?
purchaseOrders.totalAmount  // NULL → OC sem valor?
projects.managerId  // NULL → Projeto sem gerente?
```

**Impacto:**
- Validações extras no código
- Possíveis bugs com valores null
- Dados incompletos

**Correção:**
```typescript
name: text("name").notNull(),
email: varchar("email", { length: 320 }).notNull(),
cpfCnpj: varchar("cpfCnpj", { length: 32 }).notNull(),
// etc
```

**Prioridade:** P1
**Tempo Estimado:** 4h

---

## 🟡 MÉDIOS (Resolver em 2 Semanas)

### CODE-002: Código Duplicado (20-30%)
**Severidade:** 🟡 Médio
**Módulo:** Frontend

**Duplicações identificadas:**

1. **Função `initials()`** - aparece em 3+ arquivos
2. **Função `formatCurrency()`** - aparece em 5+ arquivos
3. **Status configs** - duplicado em 5+ páginas
4. **Form dialog pattern** - repetido 15+ vezes
5. **Filtros de busca** - mesmo código em 8+ routers

**Correção:**
```typescript
// lib/format.ts
export const formatCurrency = (value: number) => {...}
export const initials = (name: string) => {...}
export const formatDate = (date: Date) => {...}

// lib/configs.ts
export const STATUS_CONFIGS = {...}
export const PRIORITY_CONFIGS = {...}

// components/FormDialog.tsx
export function FormDialog<T>({...}: FormDialogProps<T>) {...}
```

**Prioridade:** P2
**Tempo Estimado:** 8h

---

### PERF-003: Re-renders Desnecessários
**Severidade:** 🟡 Médio
**Módulo:** Frontend

**Problemas:**
- Funções inline em props
- Sem `useMemo` em valores computados
- Múltiplos `useState` em vez de `useReducer`

**Exemplos:**
```typescript
// ❌ Re-render a cada render do pai
<Button onClick={() => handleDelete(item.id)}>Delete</Button>

// ❌ Recomputa a cada render
const filteredItems = items.filter(i => i.status === filter);

// ❌ Múltiplas atualizações
const [name, setName] = useState("");
const [email, setEmail] = useState("");
```

**Correção:**
```typescript
// ✅ useCallback
const handleDelete = useCallback((id) => {...}, []);

// ✅ useMemo
const filteredItems = useMemo(
  () => items.filter(i => i.status === filter),
  [items, filter]
);

// ✅ useReducer
const [state, dispatch] = useReducer(reducer, initialState);
```

**Prioridade:** P2
**Tempo Estimado:** 10h

---

### UX-001: Chat Polling Excessivo
**Severidade:** 🟡 Médio
**Módulo:** Chat Page
**Arquivo:** `client/src/pages/Chat.tsx`

**Descrição:**
Polling a cada 3 segundos para buscar novas mensagens.

**Impacto:**
- Alto uso de banda
- Alto uso de CPU
- Queries desnecessárias

**Correção:**
```typescript
// Aumentar intervalo
refetchInterval: 30000, // 30s

// Ou implementar WebSocket
import { io } from 'socket.io-client';

const socket = io('/chat');
socket.on('new-message', (message) => {
  queryClient.setQueryData(['messages'], (old) => [...old, message]);
});
```

**Prioridade:** P2
**Tempo Estimado:** 4h (polling) ou 12h (WebSocket)

---

### A11Y-001: Acessibilidade Insuficiente (~50%)
**Severidade:** 🟡 Médio
**Módulo:** Frontend

**Problemas:**
- Ícones sem `aria-label`
- Tabelas sem navegação por teclado
- Inputs sem labels associadas
- Sem `focus-visible` customizado

**Exemplos:**
```typescript
// ❌ Sem label
<Button><Trash2 /></Button>

// ❌ Sem tabindex/onKeyDown
<TableRow onClick={handleClick}>

// ❌ Sem associação
<Input />
<label>Nome</label>
```

**Correção:**
```typescript
// ✅ Com aria-label
<Button aria-label="Deletar cliente">
  <Trash2 />
</Button>

// ✅ Com teclado
<TableRow
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  role="button"
>

// ✅ Associação via FormField
<FormField name="name" label="Nome">
  <Input />
</FormField>
```

**Prioridade:** P2
**Tempo Estimado:** 8h

---

### UX-002: Tabelas Não Responsivas Mobile
**Severidade:** 🟡 Médio
**Módulo:** Frontend (todas as páginas com tabelas)

**Descrição:**
Tabelas usam `overflow-x-auto` como única solução mobile.

**Impacto:**
- UX ruim em mobile
- Difícil navegação horizontal
- Dados cortados

**Correção:**
```typescript
<div className="hidden md:block">
  <Table>{/* desktop */}</Table>
</div>

<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card layout mobile */}
    </Card>
  ))}
</div>
```

**Prioridade:** P2
**Tempo Estimado:** 12h (todas as páginas)

---

### CODE-003: Sem Code Splitting
**Severidade:** 🟡 Médio
**Módulo:** Frontend
**Arquivo:** `client/src/App.tsx`

**Descrição:**
Todas as 15 páginas são importadas no bundle inicial.

**Impacto:**
- Bundle grande (~800KB)
- Initial load lento
- TTI alto

**Correção:**
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContasPagar = lazy(() => import('./pages/financeiro/ContasPagar'));
// ... resto

<Suspense fallback={<PageSkeleton />}>
  <Routes />
</Suspense>
```

**Prioridade:** P2
**Tempo Estimado:** 3h

---

### DATA-001: Validação de Datas Ausente
**Severidade:** 🟡 Médio
**Módulo:** Múltiplos routers

**Descrição:**
Nenhum router valida relações de datas:
- `endDate > startDate`
- `paidDate <= dueDate`
- `receivedDate <= dueDate`

**Correção:**
```typescript
const schema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "Data final deve ser posterior à inicial" }
);
```

**Prioridade:** P2
**Tempo Estimado:** 4h

---

### DATA-002: CSV Parser Frágil
**Severidade:** 🟡 Médio
**Módulo:** Clients Router
**Arquivo:** `server/routers/clients.ts:17`

**Descrição:**
Parse CSV manual com `.split(",")` não funciona com:
- Valores entre aspas: `"João, Silva"`
- Valores com vírgulas: `"São Paulo, SP"`
- Quebras de linha em valores

**Correção:**
```typescript
import Papa from 'papaparse';

const result = Papa.parse(input.csvContent, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (h) => h.trim().toLowerCase(),
});

if (result.errors.length) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "CSV inválido",
    cause: result.errors,
  });
}
```

**Prioridade:** P2
**Tempo Estimado:** 3h

---

## 🟢 BAIXOS (Backlog)

### DB-006: Falta Soft Delete
**Severidade:** 🟢 Baixo
**Descrição:** Exclusões são físicas, sem campo `deletedAt`
**Prioridade:** P3
**Tempo Estimado:** 8h

---

### DB-007: Enums de Status Inconsistentes
**Severidade:** 🟢 Baixo
**Descrição:** Status diferentes entre tabelas similares
**Prioridade:** P3
**Tempo Estimado:** 4h

---

### DATA-003: Valores Monetários como String
**Severidade:** 🟢 Baixo
**Descrição:** `amount`, `value`, `budget` são strings em inputs
**Prioridade:** P3
**Tempo Estimado:** 6h

---

### UX-003: localStorage Sem Validação
**Severidade:** 🟢 Baixo
**Descrição:** Dados salvos sem schema validation
**Prioridade:** P3
**Tempo Estimado:** 2h

---

## 📊 RESUMO ESTATÍSTICO

| Severidade | Quantidade | Tempo Total |
|------------|------------|-------------|
| 🔴 Crítico | 7 | 29h |
| 🟠 Alto | 6 | 44h |
| 🟡 Médio | 9 | 62h |
| 🟢 Baixo | 4 | 20h |
| **TOTAL** | **26 issues** | **155h** |

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

### Sprint 1 (P0 - Críticos de Segurança)
- SEC-001, SEC-002, SEC-003
- CODE-001 (type assertions)
- **Total:** 15h

### Sprint 2 (P0 - Críticos de DB/Performance)
- DB-001, DB-002
- PERF-001
- **Total:** 12h

### Sprint 3 (P1 - Altos)
- SEC-004, SEC-005
- DB-003, DB-004
- PERF-002
- **Total:** 40h

### Sprint 4 (P1 - Altos cont.)
- DB-005
- **Total:** 4h

### Sprint 5 (P2 - Médios)
- CODE-002, CODE-003
- PERF-003
- UX-001
- **Total:** 25h

### Sprint 6 (P2 - Médios cont.)
- A11Y-001
- UX-002
- DATA-001, DATA-002
- **Total:** 27h

### Sprint 7 (P3 - Baixos)
- DB-006, DB-007
- DATA-003
- UX-003
- **Total:** 20h

---

**Relatório gerado automaticamente**
**Claude Code - Anthropic**
**08/04/2026 13:13 UTC**
