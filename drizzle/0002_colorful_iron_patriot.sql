CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`userEmail` varchar(320),
	`action` varchar(128) NOT NULL,
	`module` varchar(64) NOT NULL,
	`description` text,
	`entityType` varchar(64),
	`entityId` int,
	`ipAddress` varchar(64),
	`userAgent` varchar(512),
	`status` enum('success','error','warning') NOT NULL DEFAULT 'success',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`module` varchar(64) NOT NULL,
	`canView` int NOT NULL DEFAULT 1,
	`canCreate` int NOT NULL DEFAULT 0,
	`canEdit` int NOT NULL DEFAULT 0,
	`canDelete` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`)
);
