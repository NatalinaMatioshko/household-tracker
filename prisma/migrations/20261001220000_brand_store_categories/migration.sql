-- Expand Category enum with legacy household labels.
ALTER TYPE "Category" ADD VALUE 'HOUSEHOLD_CHEMICALS';
ALTER TYPE "Category" ADD VALUE 'LAUNDRY';
ALTER TYPE "Category" ADD VALUE 'KITCHEN';
ALTER TYPE "Category" ADD VALUE 'OTHER';

-- Optional product brand (no photo/storage in this step).
ALTER TABLE "Product" ADD COLUMN "brand" TEXT;

-- Optional purchase store / where bought.
ALTER TABLE "Purchase" ADD COLUMN "store" TEXT;
