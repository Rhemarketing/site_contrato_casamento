-- Add nullable lifecycle keys before backfilling existing current records.
ALTER TABLE `couple_members`
  ADD COLUMN `active_membership_key` VARCHAR(191) NULL;

ALTER TABLE `couple_invites`
  ADD COLUMN `active_invite_key` VARCHAR(191) NULL;

-- Preserve valid historical data while marking only current memberships/invites.
UPDATE `couple_members` AS `member`
INNER JOIN `couples` AS `couple` ON `couple`.`id` = `member`.`couple_id`
SET `member`.`active_membership_key` = `member`.`user_id`
WHERE `couple`.`status` IN ('PENDING', 'ACTIVE');

UPDATE `couple_invites`
SET `active_invite_key` = `couple_id`
WHERE `status` = 'PENDING';

-- Database-enforced cardinality and concurrency guarantees.
CREATE UNIQUE INDEX `uq_couple_members_active_membership_key`
  ON `couple_members`(`active_membership_key`);

CREATE UNIQUE INDEX `uq_couple_members_couple_role`
  ON `couple_members`(`couple_id`, `role`);

CREATE UNIQUE INDEX `uq_couple_invites_active_invite_key`
  ON `couple_invites`(`active_invite_key`);
