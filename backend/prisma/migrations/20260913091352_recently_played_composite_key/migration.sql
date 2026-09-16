-- AlterTable
ALTER TABLE `recently_played` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`userId`, `songId`);

