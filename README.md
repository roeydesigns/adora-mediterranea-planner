# Adora Mediterranea cruise planner

A standalone cabin comparison and quotation planner for Manila sailings in December 2026 and January 2027.

- Exact-size cabin combinations for 2–10 guests, using quoted twin, triple and quad arrangements.
- Per-guest fares, cabin assignments, fare discounts and 3+1 promotions.
- Cabin fare plus port charges, exclusions, overall costs and USD 300 down payment per guest.
- Original USD / HKD / PHP prices with optional conversion to PHP at USD × 63 and HKD × 8.
- Sailing-specific gratuities and excursions, original flyer viewers, onboard Wi-Fi and beverage packages.

This is a quotation tool. It does not reserve cabins or collect payments. Insurance and optional extras are not included in the computed overall cost. Age-based port and gratuity exemptions require a separate quote.

## Local preview

```sh
python3 -m http.server 8769 --directory dist
```

Open http://localhost:8769/.

## Checks

```sh
node --check dist/app.js
node --check dist/groups.js
node tests/groups.test.cjs
```

## GitHub Pages

Enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow validates the quotation computations and deploys only `dist/` on pushes to `main`.

All assets use relative paths and work under a GitHub Pages project URL. No environment variables, API credentials or external build dependencies are required.

## Offline copy

```sh
python3 build-portable.py
```

This generates `adora-cruise-planner.html` with the code and source images embedded.

## Sources

Rates and policies were transcribed from the supplied Adora quotation and flyers. Corrected shore excursion flyers advertise USD 92 for Miyakojima Routes A/B, USD 78 for Naha A and USD 88 for Naha B, with booking and payment before October 21, 2026. The original images are included in `dist/sources/`.
