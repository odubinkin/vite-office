# Calc full test cycle 10

Task101 `202610132042-9WMC0E` verifies the complete current application after tasks92 through100 in `vite-office-calc`, branch `calc`. This tenth scheduled full run follows task91. The user requested pausing after the second upcoming full run: this is the first, so the goal continues; the next full cycle at task111 is the requested pause boundary after relevant Calc/shared repairs.

## Full results

| Stage | Result | Evidence |
| --- | --- | --- |
| Office application tests | Pass | 15,730 tests in 778 files |
| Inventory | Pass, coverage100 | 123 tests in 38 files |
| Tooling | Pass | 36 tests in 10 files |
| Browser scenarios | Pass | 316: Writer314, shared2, Calc0 |
| Static application build | Pass | Existing static-build checks pass |

All five stages pass on their first full run. No runtime, assertion, inventory or coverage repair is needed. Global thresholds remain100 without exclusions. Writer-only coverage repair was explicitly excluded; no Writer gap occurred. Browser projects remain disjoint and Calc has no editable-grid scenarios yet.

## Raw office coverage

The unmodified `apps/office/coverage/all/coverage-final.json` contains473 executable owners. Every raw statement, branch and function counter is positive; line coverage is calculated from actual statement locations.

| Configured coverage owner | Executable owners | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Calc | 29 | 3,898 | 2,602 | 752 | 3,467 |
| Shared | 231 | 14,871 | 9,275 | 2,778 | 13,610 |
| Writer | 213 | 15,942 | 11,429 | 3,603 | 14,507 |
| Total | 473 | 34,711 | 23,306 | 7,133 | 31,584 |

All four metrics are100 for every group. Ownership follows `createOfficeTestOptions`: `sw` is Writer, `sc` is Calc and all other runtime roots are shared. Registry storage ownership and declared consumer suites are retained separately in the audit. Shared modules are counted once.

## Source absence and traceability

All five full stages ran with the LibreOffice, mdds, ICU and Boost reference links absent. A finally block restored their exact targets. No native compilation, sanitizer, network or memory-management experiment was part of this cycle.

Pre-run hashes cover3,314 tracked non-task files. Runtime, tests, fixtures and configuration remain unchanged; intentional non-task changes are this report and the checkpoint in [Calc core boundaries](calc-core.md). Complete stage logs, raw-counter audit, gate results and source hashes are retained under ignored `output/playwright/task101-checks/`.

The fourteen remaining repository gates, exact committed-source review, separate same-agent EVALUATOR phase and canonical closure are recorded in [the task README](../../.agentplane/tasks/202610132042-9WMC0E/README.md). The evaluator phase is not independent review. Actual Calc configuration/locale/color services, ScTokenArray/ScFormulaCell, column/table/document, editable grid/input/view and ODS filters remain pending. Existing Writer/shared package, ZIP, manifest, SAX and xmloff owners must be reused for spreadsheet ODS. This full test checkpoint does not certify missing owners or editable Calc UI.
