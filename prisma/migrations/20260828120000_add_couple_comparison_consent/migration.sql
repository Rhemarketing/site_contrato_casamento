CREATE TABLE `couple_comparison_consents` (
    `id` CHAR(36) NOT NULL,
    `couple_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `questionnaire_version` VARCHAR(20) NOT NULL,
    `status` ENUM('PENDING', 'CONSENTED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    `consented_at` DATETIME(3) NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_comparison_consents_couple_user_version`(`couple_id`, `user_id`, `questionnaire_version`),
    INDEX `idx_comparison_consents_user`(`user_id`),
    INDEX `idx_comparison_consents_availability`(`couple_id`, `questionnaire_version`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `couple_comparison_consents`
    ADD CONSTRAINT `fk_comparison_consents_couple`
    FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `couple_comparison_consents`
    ADD CONSTRAINT `fk_comparison_consents_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
