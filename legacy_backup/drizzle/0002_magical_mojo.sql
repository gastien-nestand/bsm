ALTER TABLE `orders` ADD `paymentMethod` enum('online','pickup') DEFAULT 'pickup' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` enum('pending','paid','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `stripeSessionId` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `stripePaymentIntentId` varchar(255);