---
name: spreadsheet-engineering
description: Build polished Excel/Google Sheets-compatible workbooks with useful formulas, clear inputs, summaries, tables and customer-ready structure.
---

# Spreadsheet Engineering

## Default workbook structure

Prefer a real workbook over a bare CSV whenever formulas, multiple views, instructions or repeat use add value.

Use purpose-driven sheets such as:
- `Start Here` — short instructions and assumptions;
- `Dashboard` — key outputs and summary metrics where useful;
- `Inputs` — clearly identifiable customer-editable fields;
- `Transactions` / `Data` — structured source table;
- `Plan` / `Tracker` — main working view;
- `Lists` — validation lists only when needed.

Do not add sheets merely to look substantial.

## Tables and formulas

- Use descriptive table names instead of generic `Table1` names.
- Prefer structured table references for formulas where supported.
- Provide explicit column headers.
- Use formulas for totals, variances, percentages and status indicators where those calculations help the job.
- Guard divisions and empty-input cases to avoid `#DIV/0!`, `#REF!` and misleading outputs.
- Keep formulas separate from intended input cells.
- Do not hard-code values that should be derived.

## Customer experience

- Put a useful title/instruction in A1 on each important sheet.
- Make editable fields obvious through labels and layout, not colour alone.
- Freeze useful header rows for long tables.
- Use sensible number formats: currency, percentage, dates and integers.
- Keep widths, wrapping and row heights readable.
- Include at least one populated example when it materially reduces setup friction.

## Quality expectation

A paid workbook should feel complete on first open. A buyer should not have to add totals, repair formulas, create categories, format columns or work out how to use it.

## Sources

Microsoft guidance informs the use of simple named tables, structured references, data integrity, descriptive worksheet names and accessible workbook structure:
- https://support.microsoft.com/en-US/Excel/overview-of-excel-tables
- https://support.microsoft.com/en-gb/office/accessibility-best-practices-with-excel-spreadsheets-6cc05fc5-1314-48b5-8eb3-683e49b3e593
