# महिला समूह व्यवस्थापन

React + Vite frontend and a Sites Worker API with Cloudflare D1 storage. Imported from the audited release `ada1a23417dd8d65380cf40ba94a474deff75479`.

## Features
- Role-aware operations center and owner, president, secretary, treasurer and member permissions.
- Member registration, KYC consent, family details and duplicate review.
- Meeting attendance, configurable quorum, minutes approval and decision-linked responsibilities.
- Members submit their own task progress; president/owner reviews completion.
- Separate savings passbooks, membership fees and operating income/expense records.
- Approval/rejection, audit history, idempotent requests and linked reversal corrections.
- Program enrollment and attendance, notices, invitation and ID card design.
- Isolated synthetic simulation mode at `/?simulation=1`.

## Local development
Node.js 22 or newer recommended.

```sh
npm ci
npm run dev
npm test
npm run build
```

The local Vite adapter uses simulated identity and local SQLite for development. It is excluded from the production Worker. Do not expose the development server as an authenticated production service.

## Standalone Cloudflare deployment

Cloudflare Worker + D1 + owner-only email-code Access login are configured. Use `npm run build:cloudflare` and the checked-in `wrangler.jsonc`; the existing Workers Builds pipeline runs tests before deployment. See [Cloudflare setup and verification](docs/cloudflare-deployment.md). The new Cloudflare database starts empty; Sites data has not been migrated. First live authenticated verification requires the owner's email login.

## Sites deployment (separate target)
The current app is hosted through Sites. Production requires the trusted Sites dispatch identity headers, configured OWNER_EMAIL and a provisioned D1 DB binding. `.openai/hosting.json` identifies the existing Sites project. A GitHub upload alone does not deploy the app or migrate its database.

To host independently on Cloudflare or another service, implement and verify a suitable authentication adapter, deployment configuration and database migrations first. Do not accept untrusted client-supplied identity headers.

Schema-only D1 migrations are in `drizzle/`. `database/schema.sql` is a historical PostgreSQL reference, not the active runtime database. Do not reapply or edit already-applied migrations.

## Validation
The imported release passed 42 automated domain/API tests and its production build. Browser simulation verified member progress submission and chairperson completion review. See [workflow audit](docs/workflow-audit-2026-11-13.md).

## Limits
No live SMS/WhatsApp delivery, complete offline synchronization, tested backup restoration or large-scale load certification. Savings and operating funds are separate; this is not a complete double-entry ledger or bank reconciliation system. The small-group store uses revision-controlled JSON snapshots, not a normalized large-scale database. Earlier documents under docs may describe historical demo behavior; the current code and latest workflow audit take precedence.

No operational database, local development database, node_modules or built artifacts are included. Illustrative images and synthetic fixtures are included.
