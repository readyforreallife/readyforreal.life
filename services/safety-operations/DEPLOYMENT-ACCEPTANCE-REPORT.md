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

## Supabase deployment progress (2026-09-10)

- APPLIED: additive staff table and restrictive policies in the existing project; existing portal/profile bucket policies preserved.
- VERIFIED: both Safety buckets have public=false. Only Mike's confirmed existing portal account was assigned enabled owner membership; no other account was added.
- UPLOADED: nine DOCX files (01.docx through 09.docx) and complete.zip. Supabase confirmed all ten successful uploads; files remain outside public repository/static deployments.
- PASS: anonymous HTTP requests to all ten known-existing public storage object URLs returned HTTP 400 and did not serve documents.
- PASS: deployed SQL transaction using authenticated role saw zero Safety objects and had neither SELECT nor INSERT privileges on safety_staff. Transaction rolled back; no test data changes.
- RESOLVED: project is accessible and hostname now resolves. Earlier DNS/sign-in observations above describe the earlier state.
- STILL BLOCKED: deployed backend, server credentials, Stripe webhook and email settings, and full real-session/browser/sandbox purchase acceptance. Database-role checks do not substitute for that end-to-end test.
