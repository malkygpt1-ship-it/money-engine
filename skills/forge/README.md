# Forge Skill Library

Forge does not ship raw AI drafts. It assembles specialist skills by product type, builds the customer deliverable, and only releases it after QA.

## Skill routing

- `forge-orchestrator` — mandatory entry skill for every Forge job.
- `customer-value` — validates that the deliverable is worth paying for.
- `spreadsheet-engineering` — Excel/Sheets workbooks, trackers, calculators and templates.
- `data-integrity` — formulas, validation, edge cases and calculation testing.
- `document-design` — guides, workbooks, checklists, reports and PDF-ready documents.
- `commercial-copy` — product-facing instructions, naming, onboarding and concise customer copy.
- `accessibility` — readable, navigable and inclusive artifacts.
- `product-packaging` — file naming, bundle structure, README, versions and delivery package.
- `quality-assurance` — mandatory final release gate.

## Quality rule

A product may not be marked `ready` merely because valid content exists. It must be usable without editing, clearly instructed, visually coherent for its format, technically tested, appropriately packaged, and materially more useful than a generic chat response.

## Sources

The skill structure follows the open Agent Skills pattern described by Vercel and Model Context Protocol. Artifact-quality rules are informed by Microsoft Excel guidance and W3C WCAG 2.2.

- https://vercel.com/docs/agent-resources/skills
- https://vercel.com/kb/guide/agent-skills-creating-installing-and-sharing-reusable-agent-context
- https://modelcontextprotocol.io/docs/develop/build-with-agent-skills
- https://support.microsoft.com/en-gb/office/accessibility-best-practices-with-excel-spreadsheets-6cc05fc5-1314-48b5-8eb3-683e49b3e593
- https://support.microsoft.com/en-US/Excel/overview-of-excel-tables
- https://support.microsoft.com/en-us/excel/more-on-data-validation
- https://support.microsoft.com/en-us/excel/detect-formula-errors-in-excel
- https://www.w3.org/TR/WCAG22/
