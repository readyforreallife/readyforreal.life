# Decision Lab (Option B)

A lightweight, local-first scenario game where students practice higher-stakes decision-making and justify choices using unit language. The AI role-play panel is optional and can be pointed at any compatible endpoint.

## Quick start
1. Open `index.html` in a browser.
2. Choose a scenario.
3. Make a decision and justify it in writing.
4. (Optional) Enable AI role-play.

## Customize unit language
Edit `rubric.json` to update the unit vocabulary and scoring criteria.

## Add or edit scenarios
Edit `scenarios.json`. Each scenario contains:
- `steps` with prompts and choices
- `meterImpact` values to simulate stakes
- `aiPrompts` for the built-in scripted role-play

## AI role-play (optional)
- Open **Settings** to add an `endpointUrl` and optional `apiKey` and `modelName`.
- The app sends a simple JSON payload and expects a JSON response with `reply` or `response`.

Example request payload:
```json
{
  "model": "model-id",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "Student message"}
  ],
  "rubric": {"criteria": []}
}
```

Example response:
```json
{"reply": "Short stakeholder response + a question."}
```

## Data export
Use **Export** to download a JSON file of student decisions and scores.
