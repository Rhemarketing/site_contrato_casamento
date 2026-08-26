-- Prevent duplicate result flags when an admission result is reprocessed or
-- completed concurrently. Compatible with MariaDB through Prisma's MySQL connector.
CREATE UNIQUE INDEX `uq_result_flags_attempt_code`
  ON `result_flags`(`attempt_id`, `code`);
