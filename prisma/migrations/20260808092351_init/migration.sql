/*
  Warnings:

  - Added the required column `amount` to the `ai_proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_proposal" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "currency" "ProjectCurrency" NOT NULL DEFAULT 'USD';

-- CreateIndex
CREATE INDEX "ai_proposal_status_idx" ON "ai_proposal"("status");
