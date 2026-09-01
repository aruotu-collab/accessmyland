# AccessMyLand

The operating system for obtaining **third-party land access** for infrastructure.

This is a working demo of [accessmyland.com](https://accessmyland.com): identify land, negotiate compensation, generate an access licence, evidence the visit, pay the landowner, and outsource overflow to independent land agents.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo seats

No password. Pick a role on `/login`:

- **Sarah Chen** — infrastructure land team (Northern Grid Alliance)
- **James Whitfield** — independent land agent (Whitfield Land)
- **Margaret Ellis** — landowner (Ellis Farm)

Data is stored in the browser. Reset it from **Payments**.

## What to click

1. Sign in as Sarah.
2. Open **AML-2026-0142** (Ellis Farm) and continue the negotiation.
3. Switch to Margaret and counter or accept.
4. Generate and sign the licence, then schedule the visit.
5. List a case on the **Marketplace** and claim it as James.
6. Open **Intelligence** for Lincolnshire settlement medians.

## Stack

Next.js, React, Tailwind CSS. No backend — the product logic lives in `lib/store.tsx`.
