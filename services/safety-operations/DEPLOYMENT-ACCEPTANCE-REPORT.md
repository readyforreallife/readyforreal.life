# Deployment acceptance — 2026-09-10

Release status: **BLOCKED. Draft PR #1 remains unmerged; no production publication.**

- PASS: nine local tests, including real PostgreSQL restrictive storage-policy checks and backend tests with mocked external providers. Zero local test failures.
- PASS: dependency installation audit reports zero vulnerabilities.
- BLOCKED: configuration preflight exits 2 because server environment values are absent. Stripe CLI reports unauthenticated.
- BLOCKED: deployed acceptance probes exit 2; no deployed API origin, real test sessions, or known uploaded object was supplied. These are not passes.
- BLOCKED: actual paid sandbox purchase, email receipt, scope acknowledgment/intake/upload, cross-customer isolation, and SMTP failure/restart remain unverified on deployed infrastructure.
- OBSERVED: existing project hostname did not resolve from this machine. The supplied Supabase dashboard link redirects to sign-in in the connected browser; project status could not be established.
- NOT RUN: Docker image build (Docker unavailable).

Private source documents remain outside website worktrees. The frontend API origin remains empty and the purchase/onboarding deployment is not enabled. See README for exact required settings and test commands. Successful local tests do not substitute for live-provider acceptance.
