-- CreateTable
CREATE TABLE `contract_editions` (
    `id` CHAR(36) NOT NULL,
    `version` VARCHAR(30) NOT NULL,
    `contentHash` CHAR(64) NOT NULL,
    `snapshot` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_editions_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_workspaces` (
    `id` CHAR(36) NOT NULL,
    `coupleId` CHAR(36) NOT NULL,
    `editionId` CHAR(36) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_workspaces_coupleId_editionId_key`(`coupleId`, `editionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_sessions` (
    `id` CHAR(36) NOT NULL,
    `workspaceId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `memberId` CHAR(36) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    `payload` LONGTEXT NOT NULL,
    `consentedAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contract_sessions_memberId_idx`(`memberId`),
    UNIQUE INDEX `contract_sessions_workspaceId_userId_key`(`workspaceId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_evaluations` (
    `id` CHAR(36) NOT NULL,
    `workspaceId` CHAR(36) NOT NULL,
    `basisHash` CHAR(64) NOT NULL,
    `engineVersion` VARCHAR(30) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_evaluations_workspaceId_basisHash_key`(`workspaceId`, `basisHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_decisions` (
    `id` CHAR(36) NOT NULL,
    `workspaceId` CHAR(36) NOT NULL,
    `moduleId` VARCHAR(50) NOT NULL,
    `revision` INTEGER NOT NULL,
    `activeKey` VARCHAR(191) NULL,
    `basisHash` CHAR(64) NOT NULL,
    `contentHash` CHAR(64) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
    `confirmations` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_decisions_activeKey_key`(`activeKey`),
    UNIQUE INDEX `contract_decisions_workspaceId_moduleId_revision_key`(`workspaceId`, `moduleId`, `revision`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_documents` (
    `id` CHAR(36) NOT NULL,
    `workspaceId` CHAR(36) NOT NULL,
    `basisHash` CHAR(64) NOT NULL,
    `contentHash` CHAR(64) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_documents_workspaceId_basisHash_key`(`workspaceId`, `basisHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contract_workspaces` ADD CONSTRAINT `contract_workspaces_coupleId_fkey` FOREIGN KEY (`coupleId`) REFERENCES `couples`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_workspaces` ADD CONSTRAINT `contract_workspaces_editionId_fkey` FOREIGN KEY (`editionId`) REFERENCES `contract_editions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_sessions` ADD CONSTRAINT `contract_sessions_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `contract_workspaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_sessions` ADD CONSTRAINT `contract_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_sessions` ADD CONSTRAINT `contract_sessions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `couple_members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_evaluations` ADD CONSTRAINT `contract_evaluations_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `contract_workspaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_decisions` ADD CONSTRAINT `contract_decisions_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `contract_workspaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_documents` ADD CONSTRAINT `contract_documents_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `contract_workspaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
