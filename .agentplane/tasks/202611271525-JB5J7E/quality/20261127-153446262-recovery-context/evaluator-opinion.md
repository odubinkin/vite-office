# EVALUATOR opinion: pass

The native subtotal owner registers formula cells, invalidates by actual reference range and produces filtered AutoSum formulas from the original ODS case.

## Findings
- The immutable checkpoint failure was an obsolete constructor rejection. Calc preserves the pinned fixed range selection offset in CALC-870.

## Evidence
- .agentplane/tasks/202611271525-JB5J7E/README.md
- /Users/odubinkin/Projects/vite-office/output/playwright/odf-subtotal-followup/verification.md
- a8ab58df230b0c221797b1815ff9e372d34c2f74

## Missing Tests
- none recorded

## Hidden Assumptions
- none recorded

## Residual Risks
- none recorded
