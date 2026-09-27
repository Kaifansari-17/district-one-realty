-- AlterTable
ALTER TABLE `ActivityLog` MODIFY `metadata` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `Project` MODIFY `configurations` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `Setting` MODIFY `value` LONGTEXT NULL;
