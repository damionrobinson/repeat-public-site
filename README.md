# repeit.com

A one-page static site: `index.html` plus `assets/` copied from the brand site kit (`docs/designs/brand/assets/site-kit/repeit/`). There's no build step and no script dependencies; the only external request is the Atkinson Hyperlegible font from Google Fonts.

- **Headline test:** version A (students) is the default. Version B (developers) is at `?v=b`. Everything below the hero is identical. The sign-up form sends the version with each entry.
- **Sign-up form:** not connected yet. `FORM_ENDPOINT` in `index.html` is empty, so the form only shows "Thanks" and sends nothing. Pick a free form backend before launch.
- **Checkout:** `buy.html` opens a Paddle overlay checkout for the one-time licence price. On `checkout.completed` it sends the buyer to `thanks.html?transaction_id=…`, which polls the licence server's `GET /purchase` for the key that the webhook mints (the emailed key is the main copy). All settings live in `assets/checkout-config.js`: environment, client token, price ID and licence-server URL. Swap all four together when going live. While any is empty, the page says "Not on sale yet". `buy.html` isn't linked from the home page yet, because the home page is still the beta sign-up page. Paddle.js (cdn.paddle.com) loads only on `buy.html`.
- **Brand rules:** "Repeit" only in the brand. Coral is used only for the squiggle. Light and dark follow the system setting.

## Hosting (free)

**GitHub Pages (recommended for now).**
1. Create a new **public** repo, e.g. `repeit-site`. Pages on a private repo needs a paid plan, and `repeat.app` should stay private.
2. Copy this folder's contents to the repo root and push.
3. Go to Settings › Pages › Deploy from branch › `main` / root.
4. For the domain: add a `CNAME` file containing `repeit.com`, then at the registrar point `A` records to `185.199.108.153`, `.109.153`, `.110.153` and `.111.153`, and `www` as a CNAME to `<user>.github.io`. Tick "Enforce HTTPS" once the certificate is issued.

**Alternative: Cloudflare Pages** (also free). Upload the folder or connect the repo. It gives you redirects (faithfully.io → repeit.com) and privacy-friendly Web Analytics in the same place, which suits the headline test.

Publishing and buying the domain are the founder's call (AGENTS.md: zero spend, no publishing without authorisation).
