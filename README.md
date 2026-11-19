# PennyLane

> **An open-source, zero-cost, self-updating real-estate discovery index** surfacing architectural outliers, underpriced market deals, and fresh-to-market Zillow finds — automatically pruning listings the day they go under contract.

Designed to run **100% free on GitHub Pages + GitHub Actions** with no backend server, no database hosting bill, and a pluggable data-ingestion layer.

---

## How It Works (Zero-Cost Automated Architecture)

```text
  GitHub Actions Cron (daily @ 13:00 UTC)
            │
            ▼
  scripts/sync-listings.mjs
    ├── Pluggable Provider:
    │     • open-curated (default — 100% free, zero API keys, merges PR watchlist)
    │     • rapidapi-zillow (optional — activates via ZILLOW_API_KEY secret)
    │     • rentcast (optional — activates via RENTCAST_API_KEY secret)
    ├── scripts/scoring.mjs
    │     • Architectural Rarity Score (0–100)
    │     • Deal Score (vs. Zip Median $/sqft + recent price cuts)
    │     • Freshness Score (days on market)
    └── Contract Pruning Engine
          • Any PENDING / CONTINGENT / UNDER_CONTRACT / SOLD listing is
            removed from public/data/listings.json and logged in
            public/data/changelog.json
            │
            ▼
  Commits updated JSON ──▶ .github/workflows/deploy.yml ──▶ GitHub Pages
```

## Quick Start (Local Development)

```bash
npm install
npm run sync          # Generates public/data/listings.json & changelog.json
npm run dev           # Starts Vite dev server
```

To test the daily automated lifecycle locally (adds fresh listings, ages days-on-market, applies price cuts, and prunes under-contract listings into the removal ledger):

```bash
npm run sync:simulate
```

## Deploy Free to GitHub Pages (2 Minutes)

1. Push this repository to a public GitHub repository.
2. In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open **Settings → Actions → General → Workflow permissions** and ensure **Read and write permissions** is enabled (so the daily sync workflow can commit updated JSON editions).
4. Push to `main` (or manually trigger **Daily Property Sync** under the **Actions** tab). Your site will automatically publish and refresh every morning at 13:00 UTC.

## Optional: Connect a Live Free-Tier Real-Estate API

By default, PennyLane runs in **`open-curated`** mode (zero keys required, combining the curated architectural pool + open-source community submissions in `data/watchlist.json`).

To pull live listings from official APIs without scraping:

1. **RapidAPI Zillow** (free tier available):
   - Add repository secret `ZILLOW_API_KEY` (and optionally `ZILLOW_API_HOST`, defaulting to `zillow-com1.p.rapidapi.com`).
   - Optionally add repository variable `PENNYLANE_MARKETS` (e.g. `Hudson, NY;Marfa, TX;Palm Springs, CA;Savannah, GA`).
2. **RentCast API** (50 free calls/month):
   - Add repository secret `RENTCAST_API_KEY`.

The daily sync worker automatically detects whichever secret is configured and verifies status changes to remove under-contract properties.

## Lead Generation & Revenue Capture (Zero Backend)

PennyLane includes 3 built-in real-estate monetization funnels compatible with free GitHub Pages:

1. **Buyer / Investor Tour & Agent Referral Leads** — Triggered directly from every property dossier with full property attribution (asking price, Zestimate, location, financing status, timeline).
2. **Daily Deal Alerts & Mortgage Lender Referrals** — Top-bar CTA and inline gallery capture banner collecting target city/state/ZIP, budget, and pre-approval needs.
3. **Agent & Lender Territory Sponsorships** — B2B partner intake form for local agents and brokers claiming exclusive state/ZIP referrals.

To route captured leads directly into your CRM or inbox, set a single environment variable at build time (supports **Formspree**, **Web3Forms**, **Zapier**, **Make**, **HubSpot**, or **Airtable**):

```bash
VITE_LEAD_WEBHOOK_URL=https://formspree.io/f/your-form-id
```

Without a webhook configured, leads are stored locally in the built-in **Lead Inbox** modal with one-click **CSV export**.

## Community Contributions

Found an architectural gem or outrageous deal on Zillow? Open a pull request adding an entry to [`data/watchlist.json`](data/watchlist.json) — see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT © PennyLane Contributors

