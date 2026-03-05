# Decision Lab Feedback Worker

This Cloudflare Worker proxies OpenAI and returns JSON feedback for the Decision Lab app.

## What it does
- Accepts POST JSON from the app
- Calls OpenAI
- Returns JSON with: `feedback`, `options`, `video_query`

## Required secrets
- `OPENAI_API_KEY` (secret)
- Optional: `MODEL` (default: gpt-4o-mini)
- Optional: `ALLOWED_ORIGIN` (restrict CORS to your site domain)

## Deploy (Cloudflare dashboard)
1. Go to Cloudflare Dashboard → Workers & Pages → Create → Worker.
2. Paste `worker.js` content.
3. Add secrets in **Settings → Variables**:
   - `OPENAI_API_KEY`
   - `MODEL` (optional)
   - `ALLOWED_ORIGIN` (optional, e.g. https://readyforreal.life)
4. Save and Deploy.
5. Copy the Worker URL and paste it into **Teacher Mode → Settings** in the app.

## Response format (expected by the app)
```json
{
  "feedback": "Short, specific feedback...",
  "options": ["Option 1", "Option 2", "Option 3"],
  "video_query": "search terms"
}
```
