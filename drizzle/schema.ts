import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/mysql-core";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  department: varchar("department", { length: 128 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── COST CENTERS (Centro de Custo) ───────────────────────────────────────────
export const costCenters = mysqlTable("cost_centers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 64 }),
  type: mysqlEnum("type", ["obra", "servico", "administrativo", "outro"]).default("outro").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  cpfCnpj: varchar("cpfCnpj", { length: 32 }),
  type: mysqlEnum("type", ["pessoa_fisica", "pessoa_juridica"]).default("pessoa_fisica").notNull(),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 16 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── ACCOUNTS PAYABLE (Contas a Pagar) ────────────────────────────────────────
export const accountsPayable = mysqlTable("accounts_payable", {
  id: int("id").autoincrement().primaryKey(),
  description: varchar("description", { length: 512 }).notNull(),
  supplierId: int("supplierId"),
  supplierName: varchar("supplierName", { length: 255 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("dueDate").notNull(),
  paidDate: date("paidDate"),
  paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["a_pagar", "em_aberto", "pago", "cancelado"]).default("a_pagar").notNull(),
  category: varchar("category", { length: 128 }),
  costCenterId: int("costCenterId"),
  // Recurrence
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurrenceType: mysqlEnum("recurrenceType", ["diario", "semanal", "mensal", "anual"]),
  recurrenceEndDate: date("recurrenceEndDate"),
  parentId: int("parentId"),
  // Installments
  isInstallment: boolean("isInstallment").default(false).notNull(),
  installmentNumber: int("installmentNumber"),
  totalInstallments: int("totalInstallments"),
  installmentGroupId: varchar("installmentGroupId", { length: 64 }),
  // Attachment
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  notes: text("notes"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── ACCOUNTS RECEIVABLE (Contas a Receber) ───────────────────────────────────
export const accountsReceivable = mysqlTable("accounts_receivable", {
  id: int("id").autoincrement().primaryKey(),
  description: varchar("description", { length: 512 }).notNull(),
  clientId: int("clientId"),
  clientName: varchar("clientName", { length: 255 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("dueDate").notNull(),
  receivedDate: date("receivedDate"),
  receivedAmount: decimal("receivedAmount", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["a_receber", "em_aberto", "recebido", "cancelado"]).default("a_receber").notNull(),
  category: varchar("category", { length: 128 }),
  costCenterId: int("costCenterId"),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurrenceType: mysqlEnum("recurrenceType", ["diario", "semanal", "mensal", "anual"]),
  recurrenceEndDate: date("recurrenceEndDate"),
  parentId: int("parentId"),
  isInstallment: boolean("isInstallment").default(false).notNull(),
  installmentNumber: int("installmentNumber"),
  totalInstallments: int("totalInstallments"),
  installmentGroupId: varchar("installmentGroupId", { length: 64 }),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  notes: text("notes"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── PURCHASE ORDERS (Ordem de Compras) ───────────────────────────────────────
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull(),
  description: text("description"),
  supplierId: int("supplierId"),
  supplierName: varchar("supplierName", { length: 255 }),
  responsiblePersonId: int("responsiblePersonId"),
  responsiblePersonName: varchar("responsiblePersonName", { length: 255 }),
  destinedToUserId: int("destinedToUserId"),
  destinedToName: varchar("destinedToName", { length: 255 }),
  sector: varchar("sector", { length: 128 }),
  costCenterId: int("costCenterId"),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["rascunho", "pendente", "aprovado", "recebido", "cancelado"]).default("pendente").notNull(),
  requestedDate: date("requestedDate"),
  expectedDate: date("expectedDate"),
  receivedDate: date("receivedDate"),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  notes: text("notes"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CRM LEADS ────────────────────────────────────────────────────────────────
export const crmLeads = mysqlTable("crm_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 255 }),
  stage: mysqlEnum("stage", [
    "novo",
    "primeira_tentativa",
    "segunda_tentativa",
    "terceira_tentativa",
    "proposta",
    "negociacao",
    "fechado_ganho",
    "fechado_perdido",
  ]).default("novo").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  source: varchar("source", { length: 128 }),
  assignedToId: int("assignedToId"),
  assignedToName: varchar("assignedToName", { length: 255 }),
  nextFollowUp: date("nextFollowUp"),
  notes: text("notes"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta"]).default("media").notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CRM ACTIVITIES ───────────────────────────────────────────────────────────
export const crmActivities = mysqlTable("crm_activities", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  type: mysqlEnum("type", ["ligacao", "email", "reuniao", "visita", "whatsapp", "outro"]).notNull(),
  description: text("description"),
  outcome: text("outcome"),
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CHAT CONVERSATIONS ───────────────────────────────────────────────────────
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  isGroup: boolean("isGroup").default(false).notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const chatParticipants = mysqlTable("chat_participants", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  senderName: varchar("senderName", { length: 255 }),
  content: text("content").notNull(),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── AGENDA / CALENDAR ────────────────────────────────────────────────────────
export const agendaEvents = mysqlTable("agenda_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 512 }),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  allDay: boolean("allDay").default(false).notNull(),
  type: mysqlEnum("type", ["reuniao", "visita", "ligacao", "prazo", "outro"]).default("outro").notNull(),
  status: mysqlEnum("status", ["agendado", "realizado", "cancelado"]).default("agendado").notNull(),
  userId: int("userId").notNull(),
  relatedLeadId: int("relatedLeadId"),
  relatedProjectId: int("relatedProjectId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── ENGINEERING PROJECTS ─────────────────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  clientId: int("clientId"),
  clientName: varchar("clientName", { length: 255 }),
  costCenterId: int("costCenterId"),
  status: mysqlEnum("status", ["planejamento", "em_andamento", "pausado", "concluido", "cancelado"]).default("planejamento").notNull(),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  managerId: int("managerId"),
  managerName: varchar("managerName", { length: 255 }),
  address: text("address"),
  notes: text("notes"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectTasks = mysqlTable("project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  phase: varchar("phase", { length: 128 }),
  status: mysqlEnum("status", ["backlog", "em_andamento", "revisao", "concluido"]).default("backlog").notNull(),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  assignedToId: int("assignedToId"),
  assignedToName: varchar("assignedToName", { length: 255 }),
  dueDate: date("dueDate"),
  completedAt: timestamp("completedAt"),
  position: int("position").default(0).notNull(),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  fileSize: int("fileSize"),
  category: varchar("category", { length: 128 }),
  // Relations
  relatedType: mysqlEnum("relatedType", ["cliente", "projeto", "ordem_compra", "conta_pagar", "conta_receber", "geral"]).default("geral").notNull(),
  relatedId: int("relatedId"),
  relatedName: varchar("relatedName", { length: 255 }),
  uploadedById: int("uploadedById"),
  uploadedByName: varchar("uploadedByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  userEmail: varchar("userEmail", { length: 320 }),
  action: varchar("action", { length: 128 }).notNull(),
  module: varchar("module", { length: 64 }).notNull(),
  description: text("description"),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  status: mysqlEnum("status", ["success", "error", "warning"]).default("success").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── USER PERMISSIONS ─────────────────────────────────────────────────────────
export const userPermissions = mysqlTable("user_permissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  module: varchar("module", { length: 64 }).notNull(),
  canView: int("canView").default(1).notNull(),
  canCreate: int("canCreate").default(0).notNull(),
  canEdit: int("canEdit").default(0).notNull(),
  canDelete: int("canDelete").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CostCenter = typeof costCenters.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type AccountPayable = typeof accountsPayable.$inferSelect;
export type AccountReceivable = typeof accountsReceivable.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type CrmLead = typeof crmLeads.$inferSelect;
export type CrmActivity = typeof crmActivities.$inferSelect;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type AgendaEvent = typeof agendaEvents.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type UserPermission = typeof userPermissions.$inferSelect;
