# Standalone Cloudflare deployment

URL: https://mahila-samuha.globaleramultiservice.workers.dev/

The Worker is protected by Cloudflare Access with email one-time-code login. Initially only the Cloudflare account owner's email is allowed. The app accepts only Cloudflare runtime `ctx.access` with the configured audience, obtains the authenticated email, and replaces supplied identity headers before invoking the shared API. Missing/wrong Access context fails closed. This is separate from the Sites build, which continues to use trusted Sites dispatch identity.

## Build

```sh
npm ci
npm test
npm run build:cloudflare
```

Upload `dist/cloudflare/index.js` as an ES-module Worker with the metadata in `deploy/cloudflare-metadata.json`. Assets are embedded in this build; do not deploy only `dist/client`. Do not use the regular Sites build for this standalone Worker. The existing Workers Builds pipeline uses Wrangler. It is configured to run `npm test && npm run build:cloudflare`, then `npx wrangler deploy` using `wrangler.jsonc`.

D1 `mahila-samuha-db` is a new database. Its two tables were initialized from the schema in `drizzle/0000_strong_miss_america.sql`. Existing Sites records were NOT copied. Initial owner access is created only after the configured owner successfully authenticates. No demo records or balances are inserted.

## Access and staff

Add each authorized staff email in both the Cloudflare Access application's allow policy and the app's Access panel with the correct role/member link. The edge policy initially remains owner-only. Removing application access prevents API use even if the email still passes the edge login. Logout uses `/cdn-cgi/access/logout`.

The Access policy protects the entire Worker, including previews and the website page. No public website exception is configured.

## Verification

45 tests passed, including forged-header rejection, wrong audience rejection, trusted identity replacement, owner bootstrap and denial of uninvited accounts. Production Worker upload and D1 schema setup succeeded. Browser reaches the actual Cloudflare Access email-code login screen. Live authenticated API read/write still requires the owner to complete email verification; local tests are not a substitute for that final check.

Reference: https://developers.cloudflare.com/workers/configuration/cloudflare-access/
