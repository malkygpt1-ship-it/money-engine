---
name: data-integrity
description: Test spreadsheet formulas, validation, edge cases and data-entry constraints before Forge releases a workbook or calculator.
---

# Data Integrity

## Formula QA

For every calculated field, test:
- normal values;
- zero values;
- blanks;
- negative values where plausible;
- unusually large values;
- copied rows / expanded tables.

Check specifically for `#REF!`, `#DIV/0!`, `#VALUE!`, circular references and ranges that omit adjacent rows.

## Validation

Use data validation when restricting dates, numeric ranges, categories or enumerated choices improves correctness. Validation must have understandable labels/instructions and must not make ordinary editing frustrating.

## Reconciliation

Where totals can be independently checked, add a reconciliation test. Examples:
- opening + inflows - outflows = closing;
- category totals = overall total;
- planned total = sum of planned lines;
- allocation percentages = 100% where applicable.

## Golden cases

Create at least three test scenarios with known expected outputs and store them with the build/evaluation record. Do not release if outputs differ.

## Sources

Microsoft Excel guidance on data validation and formula-error detection:
- https://support.microsoft.com/en-us/excel/more-on-data-validation
- https://support.microsoft.com/en-us/excel/detect-formula-errors-in-excel
