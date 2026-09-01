# AccessMyLand

The operating system for obtaining **third-party land access** for infrastructure.

This is a working demo of [accessmyland.com](https://accessmyland.com): identify land, negotiate compensation, generate an access licence, evidence the visit, pay the landowner, and outsource overflow to independent land agents.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sign in

Enter your email on `/login`. AccessMyLand sends a magic link via Resend — no password. The first visit asks for your name and, optionally, your company.

After you are in, **Switch workspace** still opens the three demo seats (operator, land agent, landowner) so you can walk the Lincolnshire programme.

Data for those seats is stored in the browser. Reset it from **Payments**.

## What to click

1. Sign in with your email, then open the operator workspace (or Sarah Chen).
2. Open **AML-2026-0142** (Ellis Farm) and continue the negotiation.
3. Switch workspace to Margaret and counter or accept.
4. Generate and sign the licence, then schedule the visit.
5. List a case on the **Marketplace** and claim it as James.
6. Open **Intelligence** for Lincolnshire settlement medians.

## Stack

Next.js, React, Tailwind CSS. Magic-link email via Resend. Case data still lives in `lib/store.tsx`.
