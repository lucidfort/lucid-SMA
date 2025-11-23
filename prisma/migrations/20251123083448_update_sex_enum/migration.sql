/*
  Warnings:

  - The values [OTHER] on the enum `UserSex` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserSex_new" AS ENUM ('MALE', 'FEMALE');
ALTER TABLE "public"."Student" ALTER COLUMN "sex" TYPE "public"."UserSex_new" USING ("sex"::text::"public"."UserSex_new");
ALTER TABLE "public"."Staff" ALTER COLUMN "sex" TYPE "public"."UserSex_new" USING ("sex"::text::"public"."UserSex_new");
ALTER TYPE "public"."UserSex" RENAME TO "UserSex_old";
ALTER TYPE "public"."UserSex_new" RENAME TO "UserSex";
DROP TYPE "public"."UserSex_old";
COMMIT;
