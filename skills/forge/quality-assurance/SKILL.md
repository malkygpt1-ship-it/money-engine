---
name: quality-assurance
description: Run the mandatory Forge release gate across usefulness, correctness, usability, polish, accessibility and packaging before any product can be sold.
---

# Forge Quality Assurance

## Blocking release gate

Score each category 0-5. A paid product must score at least 4 in every category and at least 27/30 overall.

1. **Utility** — materially helps the promised customer job.
2. **Correctness** — calculations, instructions and examples are internally consistent and tested.
3. **Usability** — a target buyer can begin without guessing what to do.
4. **Polish** — looks and feels like a finished product in its target format.
5. **Accessibility** — passes the relevant Forge accessibility checks and any available native checker validation.
6. **Packaging** — delivery bundle is clean, named, documented and free of internal debris.

## Mandatory adversarial review

Before release, pretend to be:
- a buyer opening it for the first time;
- a buyer entering incomplete or unexpected data;
- a buyer using a phone, high zoom or assistive navigation to read instructions;
- a buyer asking whether the price feels justified.

Record failures and revise before rescoring.

## Spreadsheet-specific blocking checks

- no obvious formula errors;
- totals reconcile;
- inputs and calculated fields are distinguishable;
- example data does not contaminate a clean-use version;
- formulas continue through expected working ranges;
- common zero/blank cases behave sensibly;
- tables use explicit headers and avoid navigation-breaking merged/split structures;
- sheet/table names and A1 orientation are meaningful;
- run the spreadsheet accessibility checker when available in the production toolchain.

## Document-specific blocking checks

- headings form a clear, logical hierarchy using structural styles when supported;
- no raw Markdown artifacts leak into the final customer format;
- no placeholder sections;
- readable page/table layout without layout-only or fixed-width tables that harm navigation;
- worksheets/checklists are actually usable;
- meaningful visuals have alt text when supported;
- run the document accessibility checker when available in the production toolchain.

## Hard stop

If the product resembles a generic AI answer placed into files, mark it `revision_required`, not `ready`.
