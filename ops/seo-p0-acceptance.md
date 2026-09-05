# SEO-CBR-002 local acceptance

Baseline: `9d7be39179bc50135ec7819eb72e680750c26fc2`. Use Node 22 and the checked-in pnpm lockfile.

```text
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:browser
```

The browser suite uses installed Microsoft Edge. `pnpm preview` starts the local acceptance server on port 4173. This server never delivers enquiries; browser submission tests supply controlled responses. The server emulates the relevant checked-in routing configuration and does not replace provider acceptance.

`pnpm build` creates 19 published HTML pages and `404.html`, then runs `scripts/verify-dist.mjs`. The final step rereads files from disk and fails on missing/truncated documents, unexpanded placeholders, missing root/main/head, unbalanced structural tags, wrong title/H1/canonical, missing main script, or missing/truncated script/style assets. Minimum HTML size is 4096 bytes; main text must be at least 100 characters (60 for the short 404). These are corruption guardrails, not SEO word-count targets. The short existing Google verification and contact fallback files are preserved and tested separately.

The HTML contract suite additionally compares all 19 complete main texts and original links with fixtures captured before SEO implementation. Titles/descriptions come from the approved audit v1.1 CSV; H1/body copy remains the existing version. Raw results can be saved by setting `SEO_REPORT_DIR` before `pnpm test:seo`.

Routes use exact rewrites to published HTML files, with no homepage catch-all and no global `.html` redirects. FIX-CBR-001 adds explicit permanent redirects for published HTML and trailing-slash aliases, plus client alias handling for static previews. See `ops/fix-cbr-001.md` for the complete routing and regression contract. Unknown paths rely on the provider's static `404.html` behavior. Recheck real HTTP status, MIME, query preservation and all 19 page heads on the authorized Preview before production release.

Deploy only the complete verified build from this commit. Do not publish the intermediate Vite `dist/index.html` before prerender and integrity verification. Client assets, all HTML files and routing configuration are one release unit. Keep the last verified production deployment as the rollback target; the source baseline has a truncated Contact client module and is not a rebuildable rollback artifact.

Scope: P0 HTML/head/404 only. Sitemap remains 18 URLs; Privacy remains accessible and self-canonical. P1 business schema/content expansion and existing GA/CSP behavior remain separate work. Contact API server files are unchanged; the truncated client adapter was recovered verbatim from repository ancestor `a4f6e909317d92468b21270dbe62e211695567cb`.
