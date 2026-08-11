---
name: forge-orchestrator
description: Route every approved commercial opportunity through the correct Forge specialist skills and enforce a paid-product quality bar before release.
---

# Forge Orchestrator

## Objective

Turn an approved opportunity into a finished customer product, not a draft.

## Required workflow

1. Define the buyer, job-to-be-done, promised outcome, delivery format and price before creating files.
2. Load `customer-value` for every product.
3. Load format skills:
   - spreadsheet/tracker/calculator: `spreadsheet-engineering` + `data-integrity`
   - guide/workbook/report/checklist: `document-design`
   - every customer-facing product: `commercial-copy` + `accessibility`
4. Build all deliverables.
5. Load `product-packaging` and assemble the delivery bundle.
6. Load `quality-assurance` and run the release gate.
7. Mark `ready` only if all blocking checks pass.

## Release standard

Reject or revise a product when any of these are true:

- the main deliverable is raw Markdown, plain text or a bare CSV when a richer format would materially improve use;
- calculations have not been tested;
- the customer must design, format or repair the product themselves;
- instructions assume knowledge that the target buyer may not have;
- the bundle contains placeholder copy, empty example sections or developer-facing notes;
- value is mostly explanatory text that could have been returned in a short chat response;
- the product does not plausibly justify its price.

## Progressive disclosure

Load only specialist skills required by the product type, but always load `customer-value` and `quality-assurance`.

## Source pattern

Structured as a portable skill with specialist references loaded on demand, following the Agent Skills pattern used by Vercel and MCP.
