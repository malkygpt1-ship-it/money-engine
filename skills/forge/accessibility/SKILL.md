---
name: accessibility
description: Review Forge artifacts for readable structure, contrast, labels, navigation and inclusive spreadsheet/document design before release.
---

# Accessibility

## Minimum checks

- Do not use colour as the only signal.
- Keep normal text contrast at least 4.5:1 and large text at least 3:1 where visual styling is under Forge control.
- Use descriptive headings and labels with a logical hierarchy; do not skip heading levels in editable documents when styles support hierarchy.
- Use meaningful link text that makes sense out of context.
- Add alternative text to meaningful visuals when the target format supports it.
- Keep data tables simple with explicit headers; avoid nested, split or merged data cells.
- Avoid fixed-width document tables where responsive/flexible widths are available.
- Avoid completely blank rows/columns inside data tables when they may break navigation; use an intentional label such as `N/A` where a blank must be represented.
- Give spreadsheet sheets and tables descriptive names.
- Remove empty sheets and unexplained blank structures.
- Put orientation/instructions at the start of complex sheets/documents; for spreadsheets, place meaningful orientation text in cell A1.

## Native checker requirement

When the target authoring format provides a built-in accessibility checker or equivalent validation, run it before release where tooling allows. Record unresolved issues in QA; do not silently ignore them.

## Small-screen sanity

Even when the primary artifact is desktop-oriented, instructions and purchase/delivery pages should remain understandable on a phone. Avoid requiring horizontal scanning for basic onboarding information. For document tables, verify that the layout remains readable when zoomed or viewed on a narrow screen.

## Sources

- Microsoft Excel accessibility guidance: https://support.microsoft.com/en-us/accessibility/excel/accessibility-best-practices-with-excel-spreadsheets
- Microsoft Word accessibility guidance: https://support.microsoft.com/en-US/accessibility/word/make-your-word-documents-accessible-to-people-with-disabilities
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2.2 contrast guidance: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
