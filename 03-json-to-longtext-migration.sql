ALTER TABLE `ActivityLog` MODIFY `metadata` LONGTEXT NULL;
ALTER TABLE `Project` MODIFY `configurations` LONGTEXT NULL;
ALTER TABLE `Setting` MODIFY `value` LONGTEXT NULL;

INSERT INTO `_prisma_migrations`
  (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
VALUES
  (UUID(), '90ae4e4a8ba39bd811c39ba40b41d5babe58e40f7330c926a9c7f1194f478719', NOW(3), '20260912082014_json_columns_to_longtext', NULL, NULL, NOW(3), 1);
