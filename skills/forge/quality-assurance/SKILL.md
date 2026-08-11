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
5. **Accessibility** — passes the relevant Forge accessibility checks.
6. **Packaging** — delivery bundle is clean, named, documented and free of internal debris.

## Mandatory adversarial review

Before release, pretend to be:
- a buyer opening it for the first time;
- a buyer entering incomplete or unexpected data;
- a buyer using a phone to read instructions;
- a buyer asking whether the price feels justified.

Record failures and revise before rescoring.

## Spreadsheet-specific blocking checks

- no obvious formula errors;
- totals reconcile;
- inputs and calculated fields are distinguishable;
- example data does not contaminate a clean-use version;
- formulas continue through expected working ranges;
- common zero/blank cases behave sensibly.

## Document-specific blocking checks

- headings form a clear hierarchy;
- no raw Markdown artifacts leak into the final customer format;
- no placeholder sections;
- readable page/table layout;
- worksheets/checklists are actually usable.

## Hard stop

If the product resembles a generic AI answer placed into files, mark it `revision_required`, not `ready`.
