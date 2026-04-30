# Branded Supabase Auth Email Templates

These templates replace the default "Supabase Auth" messages with Ready for
Real Life branding.

## Recommended Supabase settings

In the Supabase dashboard, open:

`Authentication` -> `Emails`

Set these values:

- Sender name: `Ready for Real Life Instruction and Education`
- Sender email: `support@readyforreal.life` or `no-reply@readyforreal.life`
- Custom SMTP: enabled, using the SMTP credentials from your mail provider

Supabase recommends custom SMTP for production auth email. The default Supabase
mailer is for testing and may keep Supabase branding or delivery limits.

## Template subjects

Use these subject lines:

- Confirm signup: `Confirm your Ready for Real Life account`
- Magic link: `Sign in to Ready for Real Life`
- Reset password: `Reset your Ready for Real Life password`

## Template files

Copy the full HTML from each file into the matching Supabase Auth email
template:

- `confirm-signup.html` -> Confirm signup
- `magic-link.html` -> Magic link
- `reset-password.html` -> Reset password

These templates use Supabase's `{{ .ConfirmationURL }}` variable, so keep that
exact text in the button link and fallback URL.

## Deliverability checklist

For customers to clearly recognize the message and for inboxes to trust it:

- Use a domain email address, not a Gmail sender.
- Add the SPF, DKIM, and DMARC records from your email provider to DNS.
- Disable click tracking for auth emails if your provider offers it.
- Keep auth emails short and focused on the account action.

Official docs:

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
