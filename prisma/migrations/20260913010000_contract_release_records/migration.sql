-- CreateTable
CREATE TABLE `contract_purchases` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `productCode` VARCHAR(40) NOT NULL DEFAULT 'CONTRATO_CASAMENTO',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PAID',
    `amountCents` INTEGER NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'BRL',
    `source` VARCHAR(30) NOT NULL DEFAULT 'FREE_CHECKOUT',
    `acquiredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `contract_purchases_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_records` (
    `id` CHAR(36) NOT NULL,
    `workspaceId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `kind` VARCHAR(30) NOT NULL,
    `recordKey` VARCHAR(100) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 0,
    `payload` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contract_records_updatedAt_idx`(`updatedAt`),
    UNIQUE INDEX `contract_records_workspaceId_userId_kind_recordKey_key`(`workspaceId`, `userId`, `kind`, `recordKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_private_reviews` (
    `id` CHAR(36) NOT NULL,
    `workspaceId` CHAR(36) NOT NULL,
    `ownerId` CHAR(36) NOT NULL,
    `reviewerId` CHAR(36) NOT NULL,
    `basisHash` CHAR(64) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    `consentedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,
    `decidedAt` DATETIME(3) NULL,

    INDEX `contract_private_reviews_reviewerId_status_idx`(`reviewerId`, `status`),
    INDEX `contract_private_reviews_ownerId_workspaceId_idx`(`ownerId`, `workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contract_purchases` ADD CONSTRAINT `contract_purchases_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_records` ADD CONSTRAINT `contract_records_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `contract_workspaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_records` ADD CONSTRAINT `contract_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_private_reviews` ADD CONSTRAINT `contract_private_reviews_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `contract_workspaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_private_reviews` ADD CONSTRAINT `contract_private_reviews_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_private_reviews` ADD CONSTRAINT `contract_private_reviews_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
