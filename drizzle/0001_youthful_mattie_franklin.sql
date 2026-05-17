CREATE TABLE `aether_recon_findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`targetType` varchar(64) NOT NULL,
	`targetValue` text NOT NULL,
	`findingType` varchar(64) NOT NULL,
	`findingData` text NOT NULL,
	`source` varchar(255),
	`confidence` int DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aether_recon_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`target` text,
	`status` enum('active','paused','completed','archived') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ghost_c2_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`channelName` varchar(255) NOT NULL,
	`channelType` enum('https','dns','icmp','steganographic','custom') NOT NULL DEFAULT 'https',
	`encryptionMethod` varchar(64) DEFAULT 'aes256',
	`heartbeatInterval` int DEFAULT 3600,
	`lastHeartbeat` timestamp,
	`status` enum('active','inactive','compromised') NOT NULL DEFAULT 'inactive',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ghost_c2_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loot_vault_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`itemType` enum('hash','credential','document','key','token','other') NOT NULL DEFAULT 'other',
	`category` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`encryptedData` text NOT NULL,
	`dataHash` varchar(255),
	`source` varchar(255),
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loot_vault_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nexus_exploit_findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`cveId` varchar(64),
	`vulnerabilityName` varchar(255) NOT NULL,
	`affectedTarget` text,
	`severity` enum('critical','high','medium','low','info') NOT NULL DEFAULT 'medium',
	`exploitStatus` enum('discovered','attempted','successful','failed') NOT NULL DEFAULT 'discovered',
	`heuristicScore` int DEFAULT 0,
	`executionLog` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nexus_exploit_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operator_session_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`userId` int NOT NULL,
	`module` varchar(64) NOT NULL,
	`action` varchar(255) NOT NULL,
	`details` text,
	`status` enum('success','failure','pending') NOT NULL DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operator_session_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operator_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`theme` enum('dark','light') NOT NULL DEFAULT 'dark',
	`moduleConfig` text,
	`apiKeys` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operator_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `operator_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `shadow_exfil_transfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`transferName` varchar(255) NOT NULL,
	`dataType` varchar(64) NOT NULL,
	`totalSize` int DEFAULT 0,
	`transferredSize` int DEFAULT 0,
	`chunkCount` int DEFAULT 0,
	`completedChunks` int DEFAULT 0,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shadow_exfil_transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specter_evasion_signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`payloadName` varchar(255) NOT NULL,
	`originalHash` varchar(255),
	`polymorphicHash` varchar(255),
	`edrBypassStatus` enum('unknown','bypassed','detected','flagged') NOT NULL DEFAULT 'unknown',
	`lastTestedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specter_evasion_signatures_id` PRIMARY KEY(`id`)
);
