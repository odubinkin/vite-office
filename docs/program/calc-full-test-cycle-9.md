# Calc full test cycle 9

Task91 `202610131622-FVA807` verifies the complete current application after tasks82 through90 in `vite-office-calc`, branch `calc`. This ninth scheduled full run follows task81. The active goal prioritizes missing core owners for editable UI and ODS spreadsheet reading/saving; this checkpoint does not implement those missing owners.

## Full results

| Stage | Result | Evidence |
| --- | --- | --- |
| Office application tests | Pass | 15,720 tests in 769 files |
| Inventory | Pass, coverage100 | 123 tests in 38 files |
| Tooling | Pass | 36 tests in 10 files |
| Browser scenarios | Pass | 316: Writer314, shared2, Calc0 |
| Static application build | Pass | Existing static-build checks pass |

All five stages pass on their first full run. No runtime, assertion, inventory implementation or Writer coverage repair is needed. Global thresholds remain100 without exclusions. Browser projects remain disjoint; Calc has no editable-grid browser scenarios yet.

## Raw office coverage

The unmodified `apps/office/coverage/all/coverage-final.json` contains465 executable owners. Every raw statement, branch and function counter is positive; lines are calculated from actual statement locations.

| Configured coverage owner | Executable owners | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Calc | 25 | 3,579 | 2,400 | 658 | 3,178 |
| Shared | 227 | 14,766 | 9,223 | 2,741 | 13,512 |
| Writer | 213 | 15,942 | 11,429 | 3,603 | 14,507 |
| Total | 465 | 34,287 | 23,052 | 7,002 | 31,197 |

All four metrics are100 for every group. There is no Writer-only gap in this cycle. Inventory coverage is also100:1,734 statements,1,292 branches,436 functions and1,668 lines.

Coverage ownership follows `createOfficeTestOptions`: `sw` is Writer, `sc` is Calc and other runtime roots are shared. Fifteen shared architecture records declare Writer consumers; the audit retains those declarations separately from coverage ownership and does not duplicate modules.

## Source absence and traceability

All five full stages run with all four original source links absent: LibreOffice, mdds, ICU and Boost. A finally block restores their exact targets. No native compilation, sanitizer or network operation is part of this cycle.

Pre-run hashes cover3,240 tracked non-task files. Runtime, tests, fixtures and configuration remain unchanged during verification. Planned non-task changes are this report and the checkpoint in calc-core. Complete logs, raw counter audits, command results and source hashes are retained under ignored `output/playwright/task91-checks/`.

The fourteen remaining repository gates, exact committed-source review, same-agent separate EVALUATOR phase and canonical closure are recorded in [the task README](../../.agentplane/tasks/202610131622-FVA807/README.md). A separate evaluator role phase is not an independent reviewer. The actual ScTokenArray/ScFormulaCell, column/table/document, editing/undo/input/view and ODS filters remain pending; [Calc core boundaries](calc-core.md) describe the current partial owners. Existing shared package/ZIP, manifest, SAX and xmloff owners must be reused for ODS. The goal remains active; the next scheduled full run is task101.
