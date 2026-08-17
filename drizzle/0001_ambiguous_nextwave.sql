CREATE TABLE `poc_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` varchar(60) NOT NULL,
	`orderId` varchar(60) NOT NULL,
	`contractNumber` varchar(40) NOT NULL,
	`html` text NOT NULL,
	`checksum` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poc_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `poc_contracts_contractId_unique` UNIQUE(`contractId`),
	CONSTRAINT `poc_contracts_orderId_unique` UNIQUE(`orderId`),
	CONSTRAINT `poc_contracts_contractNumber_unique` UNIQUE(`contractNumber`),
	CONSTRAINT `poc_contract_order_idx` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `poc_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` varchar(60) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`visitorId` varchar(100) NOT NULL,
	`source` varchar(80) NOT NULL,
	`marketingOptIn` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poc_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `poc_leads_contactId_unique` UNIQUE(`contactId`)
);
--> statement-breakpoint
CREATE TABLE `poc_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(60) NOT NULL,
	`visitorId` varchar(100) NOT NULL,
	`persona` varchar(20) NOT NULL,
	`customerName` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`planSku` varchar(40) NOT NULL,
	`planName` varchar(120) NOT NULL,
	`addonSkus` json NOT NULL,
	`billingCycle` varchar(20) NOT NULL,
	`subtotalPiastres` int NOT NULL,
	`discountPiastres` int NOT NULL,
	`vatPiastres` int NOT NULL,
	`totalPiastres` int NOT NULL,
	`status` enum('PENDING_DEMO','PAID_DEMO') NOT NULL DEFAULT 'PENDING_DEMO',
	`paymentTokenHash` varchar(128) NOT NULL,
	`paymentExpiresAt` timestamp NOT NULL,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `poc_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `poc_orders_orderId_unique` UNIQUE(`orderId`),
	CONSTRAINT `poc_orders_paymentTokenHash_unique` UNIQUE(`paymentTokenHash`)
);
--> statement-breakpoint
CREATE TABLE `poc_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(100) NOT NULL,
	`eventName` varchar(80) NOT NULL,
	`visitorId` varchar(100) NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`pagePath` varchar(250) NOT NULL,
	`persona` varchar(20),
	`uiContext` varchar(120),
	`consentAnalytics` int NOT NULL DEFAULT 0,
	`consentMarketing` int NOT NULL DEFAULT 0,
	`firstTouch` json,
	`lastTouch` json,
	`properties` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poc_tracking_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `poc_tracking_events_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `poc_visitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(100) NOT NULL,
	`persona` varchar(20),
	`firstTouch` json,
	`lastTouch` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `poc_visitors_id` PRIMARY KEY(`id`),
	CONSTRAINT `poc_visitors_visitorId_unique` UNIQUE(`visitorId`)
);
--> statement-breakpoint
CREATE INDEX `poc_orders_status_created_idx` ON `poc_orders` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `poc_events_name_created_idx` ON `poc_tracking_events` (`eventName`,`createdAt`);--> statement-breakpoint
CREATE INDEX `poc_events_visitor_idx` ON `poc_tracking_events` (`visitorId`);