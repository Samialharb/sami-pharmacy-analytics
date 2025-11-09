CREATE TABLE `analyticsCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cacheKey` varchar(255) NOT NULL,
	`cacheData` text NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `analyticsCache_cacheKey_unique` UNIQUE(`cacheKey`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` varchar(100) NOT NULL,
	`customerName` text NOT NULL,
	`phoneNumber` varchar(20),
	`customerType` enum('individual','company') DEFAULT 'individual',
	`vipStatus` enum('regular','vip') DEFAULT 'regular',
	`discount` int NOT NULL DEFAULT 0,
	`totalPurchases` int NOT NULL DEFAULT 0,
	`totalValue` int NOT NULL DEFAULT 0,
	`lastPurchaseDate` timestamp,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_customerId_unique` UNIQUE(`customerId`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`reserved` int NOT NULL DEFAULT 0,
	`available` int NOT NULL DEFAULT 0,
	`inventoryValue` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productCode` varchar(100) NOT NULL,
	`productName` text NOT NULL,
	`category` varchar(100),
	`purchasePrice` int NOT NULL DEFAULT 0,
	`salePrice` int NOT NULL DEFAULT 0,
	`profitMargin` int NOT NULL DEFAULT 0,
	`quantity` int NOT NULL DEFAULT 0,
	`reserved` int NOT NULL DEFAULT 0,
	`available` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_productCode_unique` UNIQUE(`productCode`)
);
--> statement-breakpoint
CREATE TABLE `salesOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(100) NOT NULL,
	`customerId` int NOT NULL,
	`orderDate` timestamp NOT NULL,
	`totalAmount` int NOT NULL DEFAULT 0,
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`itemCount` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `salesOrders_orderId_unique` UNIQUE(`orderId`)
);
