# Money Engine

A Vercel-ready autonomous opportunity-to-revenue operating system.

## What this first build contains

- Command-centre dashboard for revenue, pipeline, agents and approvals.
- Opportunity scoring and drill-down UI.
- Explicit green / amber / red autonomy model.
- Revenue feedback-loop view.
- Integration registry for vidIQ, Canva, HeyGen, Stripe, GitHub, Gmail, Notion and Supabase.
- Supabase schema for opportunities, assets, agent runs, revenue events and system events.
- Server API boundaries ready to replace demo data.
- Safe orchestration gate that blocks destructive, production-code and over-budget actions.

## Architecture

```text
vidIQ / external signals
        |
        v
  Opportunity Scout
        |
        v
  Scoring + validation
        |
        v
  Product / content plan
   |       |        |
 Canva   HeyGen   Web assets
   \       |       /
        Publisher
            |
      Vercel storefront
            |
          Stripe
            |
        Revenue ledger
            |
    scoring feedback loop
```

Supabase is the source of truth. Integrations should write normalized events into Supabase rather than coupling the UI directly to every provider.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

Import the GitHub repository into Vercel. The prototype deploys without environment variables and automatically runs in demo mode.

For persistent data, create a Supabase project, run `supabase/schema.sql`, then add:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Integration strategy

The connected ChatGPT plugins are orchestration capabilities rather than browser-side SDKs. The production architecture should expose narrow server endpoints/queues for requested jobs and persist their results as normalized `agent_runs`, `assets`, `system_events`, and `revenue_events`.

Recommended rollout order:

1. Supabase persistence.
2. vidIQ discovery ingestion.
3. Stripe products + revenue webhooks.
4. Canva asset job adapter.
5. HeyGen video job adapter.
6. GitHub controlled publishing workflow.
7. Gmail operational inbox classifier/draft queue.
8. Notion SOP and experiment knowledge sync.

## Autonomy policy

- Green: research, scoring, analytics, drafts, internal writes.
- Amber: paid generation/publishing under budget and daily-volume limits.
- Red: production code, refunds, destructive operations and meaningful spend.

The objective is autonomy with bounded downside, not unrestricted automation.
