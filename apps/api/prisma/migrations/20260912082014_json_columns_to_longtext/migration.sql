-- AlterTable
ALTER TABLE `activitylog` MODIFY `metadata` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `project` MODIFY `configurations` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `setting` MODIFY `value` LONGTEXT NULL;
