CREATE TABLE `harvested_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`source` varchar(255) NOT NULL,
	`username` varchar(255),
	`password` text,
	`extraData` text,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `harvested_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`target` text NOT NULL,
	`scanType` varchar(64) DEFAULT 'port_scan',
	`results` text,
	`status` enum('pending','queued','running','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `osint_nexus_findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`target` varchar(255) NOT NULL,
	`findingType` varchar(64) NOT NULL,
	`data` text NOT NULL,
	`rawResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `osint_nexus_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ghost_c2_channels` MODIFY COLUMN `status` enum('active','inactive','compromised','killed') NOT NULL DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE `shadow_exfil_transfers` MODIFY COLUMN `status` enum('pending','in_progress','completed','failed','terminated') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `shadow_exfil_transfers` ADD `progress` int DEFAULT 0;