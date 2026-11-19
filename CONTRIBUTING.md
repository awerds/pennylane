# Contributing to PennyLane

We welcome both **code contributions** and **property submissions**!

## Submitting a Wild or Underpriced Property (No Code Required)

1. Fork this repository and edit `data/watchlist.json`.
2. Append a new property object following this schema:

```json
{
  "id": "pl-community-your-slug",
  "zpid": "12345678",
  "title": "Short editorial headline describing what makes it extraordinary",
  "address": "123 Main St",
  "city": "Town",
  "state": "NY",
  "zip": "12534",
  "region": "Northeast",
  "price": 650000,
  "previousPrice": 725000,
  "zipMedianPricePerSqft": 380,
  "beds": 3,
  "baths": 2,
  "sqft": 2400,
  "lotAcres": 1.5,
  "yearBuilt": 1962,
  "daysOnMarket": 1,
  "status": "FOR_SALE",
  "architecturalStyle": "Mid-Century Modern",
  "raritySignals": ["Cantilevered Deck", "Original Terrazzo", "Private Creek"],
  "editorialNote": "Two sentences explaining why this home belongs in the daily index.",
  "zillowUrl": "https://www.zillow.com/homedetails/...",
  "images": ["https://images.unsplash.com/..."],
  "source": "community-watchlist",
  "submittedBy": "your-github-handle"
}
```

3. Run `npm run sync` locally (or let CI verify it) and open a Pull Request.
4. When the listing eventually goes under contract, submit a 1-line PR changing `"status": "UNDER_CONTRACT"` (or let the configured API provider detect it automatically) and the next daily sync will archive it in the Contract Removal Ledger.

