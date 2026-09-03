# Canberraroofkind website

Local source for the Canberraroofkind Canberra roof repair enquiry website.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm audit:prod
```

Use `pnpm dev` only for local development. The browser content editor is development-only; it is not authentication, a database, or a shared CMS. A real shared CMS remains a pending review addition.

## Vercel build settings

- Framework: Vite
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- Node: 22.x
- Function: `api/contact.js` with a 60-second maximum duration

Enter these environment variable names only through the authorized Vercel owner workflow, never in source, commits, tickets, screenshots, or chat:

- `CONTACT_SMTP_HOST`
- `CONTACT_SMTP_PORT`
- `CONTACT_SMTP_SECURE`
- `CONTACT_SMTP_USER`
- `CONTACT_SMTP_PASS`
- `CONTACT_SMTP_TO`
- `CONTACT_SMTP_FROM`

The owner alone enters the Gmail App Password. Confirm Preview before Production. The approved WAF rule is POST `/api/contact`, keyed by source IP, fixed 10-minute window, five requests, deny with status 429. Follow [the release checklist](ops/release-checklist.md) and [the rollback runbook](ops/rollback.md). Do not put secrets, customer data, tokens, or authorization codes in the repository.
