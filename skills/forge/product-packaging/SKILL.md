---
name: product-packaging
description: Package Forge outputs into a professional customer bundle with clean file names, README guidance, sensible formats and no development debris.
---

# Product Packaging

## Bundle rules

A delivery bundle should contain only files useful to the buyer.

Prefer:
- one primary deliverable;
- one concise README / Start Here;
- supporting worksheets/templates only when they add distinct value;
- editable source plus PDF/export where both are useful.

Avoid:
- duplicate content in several formats without reason;
- raw prompt files;
- internal JSON;
- developer notes;
- generic filenames such as `final2.csv`;
- empty placeholders;
- Markdown as the only customer format where a PDF/document is more appropriate.

## Naming

Use lowercase or title-safe human-readable names that explain the file, e.g.:
- `monthly-budget-planner.xlsx`
- `quick-start-guide.pdf`
- `monthly-review-checklist.pdf`

## README

The Start Here file must state:
- what is included;
- which file to open first;
- compatible applications where relevant;
- how to make a clean copy before editing where useful;
- any important limitations/disclaimers.

## Versioning

Store product version in metadata. Never make the customer infer whether files belong together.
