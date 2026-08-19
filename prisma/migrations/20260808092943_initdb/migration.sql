-- CreateIndex
CREATE INDEX "ai_conversation_updatedAt_idx" ON "ai_conversation"("updatedAt");

-- CreateIndex
CREATE INDEX "ai_proposal_createdAt_idx" ON "ai_proposal"("createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_log_status_idx" ON "ai_usage_log"("status");

-- CreateIndex
CREATE INDEX "ai_usage_log_createdAt_idx" ON "ai_usage_log"("createdAt");

-- CreateIndex
CREATE INDEX "automation_execution_startedAt_idx" ON "automation_execution"("startedAt");
