# ⚡ Nexivo AI Backend

### AI-Powered Agency Management & SaaS Backend

Nexivo AI is a scalable backend platform for modern digital agencies, combining **lead management, project management, AI workflows, proposals, invoicing, payments, notifications, and integrations** into a unified SaaS architecture.

Built with **TypeScript, Express 5, Prisma 7, PostgreSQL, Better Auth, Zod, Stripe, Cloudinary, and Resend**, the system is designed around a modular architecture that is easy to maintain, extend, and scale.

---

## ✨ Highlights

* 🔐 Secure authentication with **Better Auth**
* 👥 Role-based access control
* 🧩 Modular service architecture
* 📩 Lead & CRM management
* 🏢 Client & project management
* 📊 Milestones, timelines & project files
* 🤖 AI conversations & AI proposal generation
* ⚙️ Workflow automation tracking
* 💰 Invoice & Stripe payment management
* 🔔 Real-time notification infrastructure
* 🔑 API key management
* 📝 Activity & audit logging
* ☁️ Cloudinary file storage
* 📧 Resend email integration
* ✅ Zod-powered request validation
* 🚦 Pagination, filtering & sorting
* 🛡️ Helmet, CORS & rate limiting

---

# 🏗 Architecture

```text
Client
   │
   ▼
Express API
   │
   ├── Authentication
   ├── Authorization
   ├── Validation
   ├── Upload
   └── Error Handling
          │
          ▼
     Controllers
          │
          ▼
       Services
          │
    ┌─────┼───────────────┐
    ▼     ▼               ▼
 Prisma Stripe        Cloudinary
    │
    ▼
PostgreSQL
```

The project follows a **Controller → Service → Prisma** pattern with reusable middleware and module-level separation.

---

# 🛠 Tech Stack

| Layer          | Technology         |
| -------------- | ------------------ |
| Runtime        | Node.js            |
| Language       | TypeScript         |
| Framework      | Express 5          |
| Database       | PostgreSQL         |
| ORM            | Prisma 7           |
| Authentication | Better Auth        |
| Validation     | Zod 4              |
| Payments       | Stripe             |
| File Storage   | Cloudinary         |
| Uploads        | Multer             |
| Email          | Resend             |
| Security       | Helmet             |
| CORS           | CORS Middleware    |
| Rate Limiting  | express-rate-limit |
| Build          | tsup               |
| Development    | tsx                |

---

# 📦 Core Modules

## 🔐 Authentication

Better Auth powers the authentication layer with support for:

* Email authentication
* Sessions
* Accounts
* Verification
* Two-factor authentication
* User roles
* User activation state

Supported roles:

```text
SUPER_ADMIN
ADMIN
TEAM_MEMBER
CLIENT
USER
```

The database schema is designed around Better Auth-compatible core tables including `User`, `Session`, `Account`, `Verification`, and `TwoFactor`.

---

## 👥 User Management

Administrative user management includes:

```http
GET    /api/v1/users
GET    /api/v1/users/me
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id/role
PATCH  /api/v1/users/:id/status
```

Supports pagination, sorting and authenticated access.

---

## 🔑 API Keys

```http
POST   /api/v1/api-keys
GET    /api/v1/api-keys
DELETE /api/v1/api-keys/:id
```

API keys are stored using hashed values, allowing Nexivo to safely support service-to-service integrations.

---

## 🏢 Agency Management

### Services

```http
GET    /api/v1/services
POST   /api/v1/services
GET    /api/v1/services/:id
PATCH  /api/v1/services/:id
DELETE /api/v1/services/:id
```

### Packages

```http
POST   /api/v1/services/:serviceId/packages
PATCH  /api/v1/services/packages/:id
DELETE /api/v1/services/packages/:id
```

### Technologies

```http
GET    /api/v1/technologies
POST   /api/v1/technologies
PATCH  /api/v1/technologies/:id
DELETE /api/v1/technologies/:id
```

### Portfolio

```http
GET    /api/v1/portfolios
POST   /api/v1/portfolios
GET    /api/v1/portfolios/:id
PATCH  /api/v1/portfolios/:id
DELETE /api/v1/portfolios/:id
```

Portfolio images are managed independently and can be attached or removed without modifying the portfolio itself.

---

# 📈 Lead Management

Nexivo supports a complete lead lifecycle:

```text
NEW
  ↓
CONTACTED
  ↓
QUOTED
  ↓
MEETING_SCHEDULED
  ↓
NEGOTIATION
  ↓
WON / LOST
```

The lead model supports:

* Contact information
* Company
* Service association
* Budget range
* Source
* Assignment
* Meeting time
* Conversion tracking

Lead management is directly connected with clients, proposals and AI conversations.

---

# 🤝 Client & Project Management

Projects are connected to clients and can contain:

* Team members
* Milestones
* Timeline updates
* Project files
* Invoices

### Project API

```http
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Milestones

```http
POST   /api/v1/projects/:id/milestones
PATCH  /api/v1/projects/milestones/:id
DELETE /api/v1/projects/milestones/:id
```

### Timelines

```http
POST   /api/v1/projects/:id/timelines
PATCH  /api/v1/projects/timelines/:id
DELETE /api/v1/projects/timelines/:id
```

### Project Files

```http
POST   /api/v1/projects/:id/files
GET    /api/v1/projects/:id/files
DELETE /api/v1/project-files/:id
```

---

# 🤖 AI Infrastructure

AI is a first-class module inside Nexivo.

## AI Conversations

```http
POST   /api/v1/ai/conversations
POST   /api/v1/ai/conversations/:id/messages
GET    /api/v1/ai/conversations
GET    /api/v1/ai/conversations/:id
DELETE /api/v1/ai/conversations/:id
```

## AI Proposals

```http
POST   /api/v1/ai/proposals
GET    /api/v1/ai/proposals
GET    /api/v1/ai/proposals/:id
PATCH  /api/v1/ai/proposals/:id/status
POST   /api/v1/ai/proposals/:id/accept
```

## AI Usage & Automation

```http
GET  /api/v1/ai/usage-logs

POST /api/v1/ai/automation-executions
GET  /api/v1/ai/automation-executions
```

Supported AI capabilities:

```text
AI_CHAT
PROPOSAL_GENERATOR
WORKFLOW_AUTOMATION
QUOTE_ESTIMATOR
```

---

# 💳 Billing & Payments

Nexivo provides an invoice-driven payment architecture.

### Invoice

```http
POST   /api/v1/invoices
GET    /api/v1/invoices
GET    /api/v1/invoices/:id
PATCH  /api/v1/invoices/:id/status
DELETE /api/v1/invoices/:id
```

### Stripe

```http
POST /api/v1/payments/create-checkout-session
GET  /api/v1/payments
GET  /api/v1/payments/:id
POST /api/v1/payments/webhook
```

### Payment Flow

```text
Invoice
   ↓
Checkout Session
   ↓
Stripe
   ↓
Webhook
   ↓
Payment
   ↓
Invoice Status
```

The database also includes a dedicated `StripeWebhookEvent` table to prevent duplicate webhook processing.

---

# 🔔 Notifications

```http
GET   /api/v1/notifications
GET   /api/v1/notifications/unread-count
PATCH /api/v1/notifications/:id/read
PATCH /api/v1/notifications/read-all
```

Notifications can be associated with:

```text
LEAD
PROJECT
MILESTONE
CLIENT
PROPOSAL
```

---

# 📝 Activity & Audit Logs

```http
GET /api/v1/activity-logs
```

Activity logs provide an audit trail with:

* User
* Action
* Entity type
* Entity ID
* Metadata
* Timestamp

---

# ✅ Validation

All request payloads are validated before reaching application services.

```text
Request
   ↓
Validation Middleware
   ↓
Zod Schema
   ↓
Controller
   ↓
Service
   ↓
Prisma
```

This keeps controllers clean and ensures consistent input validation.

---

# 📊 Pagination

List endpoints support:

```text
page
limit
sortBy
sortOrder
```

Example:

```http
GET /api/v1/projects?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

---

# 📡 API Structure

The Postman test suite is organized around **18 backend modules**, including:

```text
01  Auth
02  User Management
03  API Keys
04  Services & Packages
05  Technologies
06  Portfolios
07  Testimonials
08  Site Settings
09  Newsletter
10  Leads
11  Clients
12  Projects & Sub-resources
13  Invoices
14  Payments
15  AI Module
16  Notifications
17  Activity Logs
18  Security Tests
```

These modules are covered by the project's standard Postman collection.

---

# 🌍 Environment

Create a `.env` file in the project root.

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=

CLIENT_URL=http://localhost:3000

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:5000

GOOGLE_CLIENT_ID=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
EMAIL_FROM=
```

> Keep production secrets out of GitHub.

---

# 🚀 Getting Started

## 1. Clone

```bash
git clone <repository-url>
cd nexivo-ai-backend
```

## 2. Install

```bash
pnpm install
```

## 3. Configure Environment

Create:

```text
.env
```

and add the required credentials.

## 4. Generate Prisma Client

```bash
pnpm run generate
```

## 5. Run Migration

```bash
pnpm run migrate
```

## 6. Seed Database

```bash
pnpm run seed
```

## 7. Start Development Server

```bash
pnpm run dev
```

API:

```text
http://localhost:5000
```

---

# 🧰 Scripts

```bash
pnpm run dev
pnpm run build
pnpm start
pnpm run seed
pnpm run generate
pnpm run migrate
pnpm run migrate:deploy
pnpm run studio
pnpm run reset
pnpm run db:setup
```

---

# 🧪 Postman

The project includes a standardized Postman environment for local testing.

Core environment variables include:

```text
baseUrl
authUrl

adminToken
teamMemberToken
userToken
apiKey

capturedUserId
capturedLeadId
capturedClientId
capturedProjectId
capturedMilestoneId
capturedTimelineId
capturedProjectFileId
capturedServiceId
capturedPackageId
capturedTechnologyId
capturedPortfolioId
capturedPortfolioImageId
capturedTestimonialId
capturedInvoiceId
capturedPaymentId
capturedApiKeyId
capturedNotificationId
capturedAiConversationId
capturedAiProposalId
capturedAutomationExecutionId
```

The collection automatically stores generated IDs and tokens between requests, making module-by-module testing easier.

---

# 🔐 Security

Nexivo is designed with security in mind:

* Better Auth based authentication
* Role-based authorization
* Request validation
* Helmet security headers
* CORS protection
* Rate limiting
* Secure API key hashing
* Stripe webhook verification
* Audit logging
* Soft delete support

---

# 📌 Project Vision

Nexivo AI is designed to become a **single operational platform for AI-powered digital agencies**.

```text
Lead
  ↓
Client
  ↓
Project
  ↓
Milestones
  ↓
Proposal
  ↓
Invoice
  ↓
Payment
  ↓
Delivery
  ↓
AI Automation
```

The architecture is intentionally modular so new AI tools, integrations, workflows, and business modules can be added without rewriting the core system.

---

# 👨‍💻 Author

**Alamin Ahmed**

Full Stack Developer

GitHub: [@Alaminahmedariyan](https://github.com/Alaminahmedariyan)

---

# 📄 License

This project is licensed under the **ISC License**.
