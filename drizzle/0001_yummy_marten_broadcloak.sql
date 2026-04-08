CREATE TABLE `accounts_payable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(512) NOT NULL,
	`supplierId` int,
	`supplierName` varchar(255),
	`amount` decimal(15,2) NOT NULL,
	`dueDate` date NOT NULL,
	`paidDate` date,
	`paidAmount` decimal(15,2),
	`status` enum('a_pagar','em_aberto','pago','cancelado') NOT NULL DEFAULT 'a_pagar',
	`category` varchar(128),
	`costCenterId` int,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurrenceType` enum('diario','semanal','mensal','anual'),
	`recurrenceEndDate` date,
	`parentId` int,
	`isInstallment` boolean NOT NULL DEFAULT false,
	`installmentNumber` int,
	`totalInstallments` int,
	`installmentGroupId` varchar(64),
	`attachmentUrl` text,
	`attachmentKey` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_payable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounts_receivable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(512) NOT NULL,
	`clientId` int,
	`clientName` varchar(255),
	`amount` decimal(15,2) NOT NULL,
	`dueDate` date NOT NULL,
	`receivedDate` date,
	`receivedAmount` decimal(15,2),
	`status` enum('a_receber','em_aberto','recebido','cancelado') NOT NULL DEFAULT 'a_receber',
	`category` varchar(128),
	`costCenterId` int,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurrenceType` enum('diario','semanal','mensal','anual'),
	`recurrenceEndDate` date,
	`parentId` int,
	`isInstallment` boolean NOT NULL DEFAULT false,
	`installmentNumber` int,
	`totalInstallments` int,
	`installmentGroupId` varchar(64),
	`attachmentUrl` text,
	`attachmentKey` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_receivable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agenda_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(512),
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`allDay` boolean NOT NULL DEFAULT false,
	`type` enum('reuniao','visita','ligacao','prazo','outro') NOT NULL DEFAULT 'outro',
	`status` enum('agendado','realizado','cancelado') NOT NULL DEFAULT 'agendado',
	`userId` int NOT NULL,
	`relatedLeadId` int,
	`relatedProjectId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agenda_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`isGroup` boolean NOT NULL DEFAULT false,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderName` varchar(255),
	`content` text NOT NULL,
	`attachmentUrl` text,
	`attachmentKey` text,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`cpfCnpj` varchar(32),
	`type` enum('pessoa_fisica','pessoa_juridica') NOT NULL DEFAULT 'pessoa_fisica',
	`address` text,
	`city` varchar(128),
	`state` varchar(2),
	`zipCode` varchar(16),
	`notes` text,
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cost_centers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(64),
	`type` enum('obra','servico','administrativo','outro') NOT NULL DEFAULT 'outro',
	`description` text,
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cost_centers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`type` enum('ligacao','email','reuniao','visita','whatsapp','outro') NOT NULL,
	`description` text,
	`outcome` text,
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`company` varchar(255),
	`stage` enum('novo','primeira_tentativa','segunda_tentativa','terceira_tentativa','proposta','negociacao','fechado_ganho','fechado_perdido') NOT NULL DEFAULT 'novo',
	`value` decimal(15,2),
	`source` varchar(128),
	`assignedToId` int,
	`assignedToName` varchar(255),
	`nextFollowUp` date,
	`notes` text,
	`priority` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`mimeType` varchar(128),
	`fileSize` int,
	`category` varchar(128),
	`relatedType` enum('cliente','projeto','ordem_compra','conta_pagar','conta_receber','geral') NOT NULL DEFAULT 'geral',
	`relatedId` int,
	`relatedName` varchar(255),
	`uploadedById` int,
	`uploadedByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`phase` varchar(128),
	`status` enum('backlog','em_andamento','revisao','concluido') NOT NULL DEFAULT 'backlog',
	`priority` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`assignedToId` int,
	`assignedToName` varchar(255),
	`dueDate` date,
	`completedAt` timestamp,
	`position` int NOT NULL DEFAULT 0,
	`attachmentUrl` text,
	`attachmentKey` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`clientId` int,
	`clientName` varchar(255),
	`costCenterId` int,
	`status` enum('planejamento','em_andamento','pausado','concluido','cancelado') NOT NULL DEFAULT 'planejamento',
	`priority` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`startDate` date,
	`endDate` date,
	`budget` decimal(15,2),
	`managerId` int,
	`managerName` varchar(255),
	`address` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(64) NOT NULL,
	`description` text,
	`supplierId` int,
	`supplierName` varchar(255),
	`responsiblePersonId` int,
	`responsiblePersonName` varchar(255),
	`destinedToUserId` int,
	`destinedToName` varchar(255),
	`sector` varchar(128),
	`costCenterId` int,
	`totalAmount` decimal(15,2),
	`status` enum('rascunho','pendente','aprovado','recebido','cancelado') NOT NULL DEFAULT 'pendente',
	`requestedDate` date,
	`expectedDate` date,
	`receivedDate` date,
	`attachmentUrl` text,
	`attachmentKey` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;