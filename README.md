<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c69a3589-75c2-44f8-86d6-92717e28d923

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Live Rainfall Tracker

The **Live Rainfall Tracker** panel (top of the Forecast tab) is wired to real
data instead of mock data. It works in three layers, so you always have
something to look at:

1. **Live NASA feed (best option).** Run the data pipeline in `scripts/`
   from this project's root folder:
   ```
   pip install -r scripts/requirements.txt
   export NASA_PPS_EMAIL="you@example.com"   # free registration at
                                              # https://registration.pps.eosdis.nasa.gov/registration/
   python scripts/live_rainfall_automation.py
   ```
   This checks NASA GPM IMERG every 30 minutes and writes to
   `data/rainfall/processed/rainfall_history.csv` and `rainfall_latest.json`
   *inside this same project folder* — the dashboard's backend
   (`server.ts`) reads those files directly, so once the script is running
   the dashboard updates automatically on its next 60-second poll. No
   restart needed.

2. **Manual readings (works immediately, no setup).** Open the "Add a
   reading manually" section inside the Live Rainfall Tracker panel and log
   a value (location, rainfall in mm, time). It's saved to
   `data/rainfall/processed/manual_entries.csv` and shows up in the chart
   and summary cards right away — useful for field gauge readings, or for
   testing the dashboard before the NASA pipeline is connected.

3. **Empty state.** If neither of the above has run yet, the panel shows a
   clear "No live data yet" message instead of silently showing fake
   numbers.

Backend endpoints added for this (in `server.ts`):
- `GET /api/rainfall/status` — whether the pipeline is connected, row counts
- `GET /api/rainfall/latest` — 1h / 24h / 72h / 7-day totals per location
- `GET /api/rainfall/history` — full combined time series (for charting)
- `POST /api/rainfall/manual` — add a manual reading

The rest of the dashboard (GIS heatmap, road status, field reports, etc.)
still runs on the illustrative `src/data/mockData.ts` simulation — that part
models an 8-state monitoring network that isn't backed by your current data
collection, so it's left as a demo model. The Live Rainfall Tracker is the
one section connected to your actual pipeline.
