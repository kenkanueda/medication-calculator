# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # Start development server
pnpm build     # Production build (TypeScript errors are ignored)
pnpm lint      # Run ESLint
pnpm start     # Start production server
```

No test suite is configured.

## Architecture

This is a **Next.js 15 / React 19** app using the App Router. The application is a Japanese medication overdose calculator (薬剤計算機) that checks ingested drug totals against toxic/lethal thresholds.

### Key files

- **`medication-calculator.tsx`** — The single main component containing all application logic. `app/page.tsx` simply re-exports it.
- **`lib/supabase.ts`** — Supabase client initialized from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars.
- **`components/ui/`** — shadcn/ui component library (do not edit directly).

### Data flow

On mount, the component fetches from two Supabase tables:
- `dangerousDoses` — active ingredient master data (name, toxic/lethal thresholds, half-life, symptoms, treatment)
- `medications` — brand name → ingredient mapping via `drugMasterId` foreign key to `dangerousDoses.id`

These are transformed into two in-memory objects:
- `medications`: `{ [brandName]: { [ingredientName]: { amount, unit } } }`
- `dangerousDoses`: `{ [ingredientName]: DangerousDose }`

When the user adds a brand-name medication with a tablet count, the component calculates cumulative ingredient amounts and compares them against `dangerousDoses` thresholds to produce `info` / `toxic` / `lethal` status alerts.

### Path alias

`@/*` maps to the project root (e.g., `@/lib/supabase`, `@/components/ui/button`).

### Notes

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — TypeScript errors won't block builds.
- UI is built with **Tailwind CSS** + **shadcn/ui** (Radix UI primitives). Component config is in `components.json`.
- Vercel Analytics is included in the root layout.
