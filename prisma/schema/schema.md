// ============================================================
// AI Agency SaaS Platform — MVP Schema
// Based on: ai-agency-saas-table-specs.md
// ============================================================


generator client {
  provider = "prisma-client"
  output   = "../../generated/prisma"
}

datasource db {
  provider = "postgresql"
}


// ============================================================
// ENUMS
// ============================================================

enum UserRole {
  SUPER_ADMIN
  ADMIN
  TEAM_MEMBER
  CLIENT
  USER
}

enum LeadStatus {
  NEW
  CONTACTED
  QUOTED
  MEETING_SCHEDULED
  NEGOTIATION
  WON
  LOST
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  REVIEW
  COMPLETED
  ON_HOLD
  CANCELLED
}

enum ProposalStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
}

enum TriggerType {
  MANUAL
  SCHEDULE
  WEBHOOK
}

enum AutomationExecutionStatus {
  RUNNING
  SUCCESS
  FAILED
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

enum AIUsageStatus {
  SUCCESS
  FAILED
}

enum NotificationType {
  LEAD
  PROJECT
  SYSTEM
  AI
}

enum ProjectMemberRole {
  LEAD
  DEVELOPER
  DESIGNER
  MANAGER
}

enum LeadSource {
  CONTACT_FORM
  QUOTE_FORM
  ORGANIC
  GOOGLE
  LINKEDIN
  FACEBOOK
  REFERRAL
  OTHER
}

enum AIFeature {
  AI_CHAT
  PROPOSAL_GENERATOR
  WORKFLOW_AUTOMATION
  QUOTE_ESTIMATOR
}

enum ProjectCurrency {
  USD
  EUR
  BDT
}

enum FileCategory {
  IMAGE
  DOCUMENT
  VIDEO
  ARCHIVE
  OTHER
}

enum NotificationEntityType {
  LEAD
  PROJECT
  MILESTONE
  CLIENT
  PROPOSAL
}

enum BudgetRange {
  UNDER_1K
  RANGE_1K_5K
  RANGE_5K_10K
  RANGE_10K_25K
  ABOVE_25K
  NOT_SURE
}

enum SettingGroup {
  GENERAL
  SEO
  SOCIAL
  CONTACT
}

enum InvoiceStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  STRIPE
  BANK_TRANSFER
  CASH
  OTHER
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

// ============================================================
// MODULE 1 — AUTHENTICATION (Better Auth core tables)
// ============================================================

model User {
  id               String    @id @default(cuid())
  name             String
  email            String    @unique
  emailVerified    Boolean   @default(false)
  image            String?
  phone            String?
  role             UserRole  @default(USER)
  isActive         Boolean   @default(true)
  lastLoginAt      DateTime?

  // better-auth `twoFactor` plugin field — DOUBLE-CHECK this against
  // `npx @better-auth/cli generate` for your installed version before
  // relying on it; plugin schemas occasionally change between releases.
  twoFactorEnabled Boolean?  @default(false)

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  deletedAt        DateTime?

  sessions      Session[]
  accounts      Account[]
  twoFactor     TwoFactor[]

  // Business relations
  clientProfile      Client?
  assignedLeads       Lead[]            @relation("AssignedLeads")
  projectMemberships  ProjectMember[]
  timelineUpdates     Timeline[]        @relation("TimelineUpdatedBy")
  generatedProposals  AIProposal[]      @relation("ProposalGeneratedBy")
  aiConversations     AIConversation[]
  aiUsageLogs         AIUsageLog[]
  automationExecutions AutomationExecution[]
  notifications       Notification[]
  activityLogs        ActivityLog[]
  uploadedFiles       ProjectFile[]     @relation("ProjectFileUploadedBy")
  createdApiKeys      ApiKey[]

  @@index([role])
  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  providerId            String
  accountId             String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

// better-auth `twoFactor` plugin table. Best-effort shape based on the
// plugin's documented behaviour (secret + hashed backup codes per user).
// Run `npx @better-auth/cli generate` after adding this and diff it
// against what the CLI proposes for your exact better-auth version.
model TwoFactor {
  id          String @id @default(cuid())
  secret      String
  backupCodes String
  userId      String

  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("two_factor")
}

// ============================================================
// MODULE 2 — AGENCY (Services, Portfolio, Site content)
// ============================================================

model Service {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String   @db.Text
  icon        String?
  isActive    Boolean  @default(true)
  order       Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  packages    ServicePackage[]
  portfolios  Portfolio[]
  leads       Lead[]

  @@index([slug])
  @@map("service")
}

model ServicePackage {
  id        String   @id @default(cuid())
  serviceId String
  name      String
  price     Decimal  @db.Decimal(10, 2)
  features  Json
  order     Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([serviceId])
  @@map("service_package")
}

model Portfolio {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String   @db.Text
  thumbnail   String
  liveUrl     String?
  serviceId   String?
  isFeatured  Boolean  @default(false)
  order       Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  service      Service?              @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  images       PortfolioImage[]
  technologies PortfolioTechnology[]

  @@index([serviceId])
  @@map("portfolio")
}

model PortfolioImage {
  id          String    @id @default(cuid())
  portfolioId String
  url         String
  alt         String?
  order       Int       @default(0)

  createdAt   DateTime  @default(now())

  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  @@index([portfolioId])
  @@map("portfolio_image")
}

model Technology {
  id   String @id @default(cuid())
  name String @unique
  icon String?

  portfolios PortfolioTechnology[]

  @@map("technology")
}

model PortfolioTechnology {
  portfolioId  String
  technologyId String

  portfolio    Portfolio  @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  technology   Technology @relation(fields: [technologyId], references: [id], onDelete: Cascade)

  @@id([portfolioId, technologyId])
  @@map("portfolio_technology")
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  group     SettingGroup?
  updatedAt DateTime @updatedAt

  @@map("site_setting")
}

model Testimonial {
  id         String   @id @default(cuid())
  clientName String
  role       String?
  company    String?
  avatarUrl  String?
  content    String   @db.Text
  rating     Int      @default(5)
  isFeatured Boolean  @default(false)
  order      Int      @default(0)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("testimonial")
}

// ============================================================
// MODULE 3 — LEAD MANAGEMENT
// ============================================================

model Lead {
  id           String     @id @default(cuid())
  name         String
  email        String
  phone        String?
  company      String?
  serviceId    String?
  message      String     @db.Text
  budget       BudgetRange @default(NOT_SURE)
  notes        String?    @db.Text
  status       LeadStatus @default(NEW)
  source       LeadSource @default(OTHER)

  assignedToId String?
  meetingAt    DateTime?
  convertedAt  DateTime?

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  service      Service?     @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  assignedTo   User?        @relation("AssignedLeads", fields: [assignedToId], references: [id], onDelete: SetNull)
  client       Client?
  proposals    AIProposal[]
  conversations AIConversation[]

  @@index([status])
  @@index([assignedToId])
  @@index([serviceId])
  @@index([email])
  @@index([phone])
  @@map("lead")
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  @@map("newsletter_subscriber")
}

// ============================================================
// MODULE 4 — CLIENT & PROJECT MANAGEMENT
// ============================================================

model Client {
  id          String    @id @default(cuid())
  userId      String?   @unique
  leadId      String?   @unique
  companyName String?
  billingInfo Json?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  user        User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  lead        Lead?        @relation(fields: [leadId], references: [id], onDelete: SetNull)
  projects    Project[]
  proposals   AIProposal[]
  invoices    Invoice[]

  @@index([userId])
  @@map("client")
}

model Project {
  id          String        @id @default(cuid())
  clientId    String
  title       String
  description String        @db.Text
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime?
  dueDate     DateTime?
  budget      Decimal?      @db.Decimal(10, 2)
  currency    ProjectCurrency @default(USD)
  completedAt DateTime?

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  client      Client          @relation(fields: [clientId], references: [id], onDelete: Cascade)
  members     ProjectMember[]
  milestones  Milestone[]
  timeline    Timeline[]
  files       ProjectFile[]
  invoices    Invoice[]

  @@index([clientId, status])
  @@index([status])
  @@map("project")
}

model ProjectMember {
  projectId   String
  userId      String
  projectRole ProjectMemberRole @default(DEVELOPER)
  joinedAt    DateTime          @default(now())

  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([projectId, userId])
  @@map("project_member")
}

model Milestone {
  id          String    @id @default(cuid())
  projectId   String
  title       String
  description String?
  dueDate     DateTime?
  status      MilestoneStatus @default(PENDING)
  order       Int       @default(0)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  invoices    Invoice[]

  @@index([projectId])
  @@index([status])
  @@map("milestone")
}

model Timeline {
  id            String   @id @default(cuid())
  projectId     String
  title         String
  description   String?
  statusDate    DateTime @default(now())
  updatedById   String

  createdAt     DateTime @default(now())

  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  updatedBy     User     @relation("TimelineUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict)

  @@index([projectId])
  @@map("timeline")
}

model ProjectFile {
  id           String       @id @default(cuid())
  projectId    String
  url          String
  name         String
  category     FileCategory @default(OTHER)
  mimeType     String
  size         Int
  uploadedById String?

  uploadedAt   DateTime     @default(now())

  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  uploadedBy   User?        @relation("ProjectFileUploadedBy", fields: [uploadedById], references: [id], onDelete: SetNull)

  @@index([projectId])
  @@index([uploadedById])
  @@map("project_file")
}

// ============================================================
// MODULE 5 — AI FEATURES (Project USP)
// ============================================================

model AIConversation {
  id        String   @id @default(cuid())
  userId    String?
  leadId    String?
  title     String?
  messages  Json

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  lead      Lead?    @relation(fields: [leadId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([leadId])
  @@map("ai_conversation")
}

model AIProposal {
  id              String          @id @default(cuid())
  leadId          String?
  clientId        String?
  title           String
  content         String          @db.Text
  status          ProposalStatus  @default(DRAFT)
  generatedById   String

  // Added for Proposal -> Invoice auto-conversion. Nullable because a
  // proposal can exist as a pure narrative draft before pricing is set.
  amount          Decimal?        @db.Decimal(10, 2)
  currency        ProjectCurrency @default(USD)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  lead            Lead?  @relation(fields: [leadId], references: [id], onDelete: SetNull)
  client          Client? @relation(fields: [clientId], references: [id], onDelete: SetNull)
  generatedBy     User   @relation("ProposalGeneratedBy", fields: [generatedById], references: [id], onDelete: Restrict)

  @@index([leadId])
  @@index([clientId])
  @@index([generatedById])
  @@map("ai_proposal")
}

model AIUsageLog {
  id           String         @id @default(cuid())
  userId       String?
  feature      AIFeature
  promptTokens Int
  outputTokens Int
  cost         Decimal?       @db.Decimal(10, 4)
  status       AIUsageStatus  @default(SUCCESS)

  createdAt    DateTime       @default(now())

  user         User?          @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([feature])
  @@map("ai_usage_log")
}

model AutomationExecution {
  id            String           @id @default(cuid())
  workflowName  String
  triggerType   TriggerType                @default(MANUAL)
  status        AutomationExecutionStatus  @default(RUNNING)
  executionTime Int?
  startedAt     DateTime         @default(now())
  completedAt   DateTime?
  error         String?          @db.Text
  userId        String?

  user          User?            @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([status])
  @@index([workflowName])
  @@index([userId])
  @@map("automation_execution")
}

// ============================================================
// MODULE 6 — SYSTEM (Notification, Audit)
// ============================================================

model Notification {
  id         String                   @id @default(cuid())
  userId     String
  title      String
  message    String
  type       NotificationType         @default(SYSTEM)
  entityType NotificationEntityType?
  entityId   String?
  isRead     Boolean                  @default(false)
  readAt     DateTime?
  link       String?

  createdAt  DateTime                 @default(now())

  user       User                     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notification")
}

model ActivityLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String
  entityId   String
  metadata   Json?

  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([entityType, entityId])
  @@index([userId])
  @@map("activity_log")
}

// ============================================================
// MODULE 7 — BILLING & PAYMENTS
// ============================================================

model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  clientId      String
  projectId     String?
  milestoneId   String?

  items         Json
  subtotal      Decimal       @db.Decimal(10, 2)
  tax           Decimal       @default(0) @db.Decimal(10, 2)
  total         Decimal       @db.Decimal(10, 2)
  currency      ProjectCurrency @default(USD)

  status        InvoiceStatus @default(DRAFT)
  dueDate       DateTime?
  issuedAt      DateTime?
  paidAt        DateTime?

  notes         String?       @db.Text

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  client        Client        @relation(fields: [clientId], references: [id], onDelete: Restrict)
  project       Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  milestone     Milestone?    @relation(fields: [milestoneId], references: [id], onDelete: SetNull)
  payments      Payment[]

  @@index([clientId])
  @@index([projectId])
  @@index([status])
  @@map("invoice")
}

model Payment {
  id                     String        @id @default(cuid())
  invoiceId              String
  amount                 Decimal       @db.Decimal(10, 2)
  currency               ProjectCurrency @default(USD)
  method                 PaymentMethod @default(STRIPE)
  status                 PaymentStatus @default(PENDING)

  stripePaymentIntentId  String?       @unique
  stripeChargeId         String?
  stripeRefundId         String?       @unique

  paidAt                 DateTime?
  notes                  String?       @db.Text

  createdAt               DateTime     @default(now())
  updatedAt               DateTime     @updatedAt

  invoice                Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([status])
  @@map("payment")
}

// Deduplicates Stripe webhook deliveries — Stripe may send the same event
// more than once (network retries), and without this a payment could be
// processed twice or an invoice could be marked PAID redundantly.
model StripeWebhookEvent {
  id            String   @id @default(cuid())
  stripeEventId String   @unique
  type          String
  processedAt   DateTime @default(now())

  @@map("stripe_webhook_event")
}

// ============================================================
// MODULE 8 — INTEGRATIONS (Service-to-service auth)
// ============================================================

model ApiKey {
  id          String    @id @default(cuid())
  name        String
  keyHash     String    @unique
  prefix      String
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  createdById String?

  createdAt   DateTime  @default(now())

  createdBy   User?     @relation(fields: [createdById], references: [id], onDelete: SetNull)

  @@index([keyHash])
  @@map("api_key")
}