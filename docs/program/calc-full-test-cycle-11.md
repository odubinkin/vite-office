# Calc full test cycle 11

Task111 `202610140644-DXESQV` verifies the complete current application after tasks102 through110 in `vite-office-calc`, branch `calc`. This is the second upcoming full run requested by the user, following cycle10/task101. After verification and clean task closure, the active goal is paused as requested; the Calc implementation is not complete.

## Full results

| Stage | Result | Evidence |
| --- | --- | --- |
| Office application tests | Pass | 15,801 tests in 792 files |
| Inventory | Pass, coverage100 | 123 tests in 38 files |
| Tooling | Pass | 38 tests in 10 files |
| Browser scenarios | Pass | 316: Writer314, shared2, Calc0 |
| Static application build | Pass | Relative assets, two JavaScript bundles, no backend endpoints |

All five stages passed on their first run in this cycle. No runtime, test, assertion, configuration, threshold or coverage repair was required. The explicit exclusion of Writer-only coverage repairs was respected; no Writer gap occurred. Browser projects remain disjoint. Calc has no editable-grid browser scenarios, so this checkpoint does not certify Calc UI readiness.

## Raw office coverage

The unmodified `apps/office/coverage/all/coverage-final.json` contains497 executable owners. Every raw statement, branch and function counter is positive; line counts use actual statement locations.

| Configured coverage owner | Executable owners | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Calc | 32 | 4,006 | 2,654 | 787 | 3,570 |
| Shared | 252 | 15,866 | 9,777 | 2,930 | 14,512 |
| Writer | 213 | 15,942 | 11,429 | 3,603 | 14,507 |
| Total | 497 | 35,814 | 23,860 | 7,320 | 32,589 |

All four metrics are100 for every group. Ownership follows the configured roots: `sw` is Writer, `sc` is Calc and all other runtime roots are shared. Registry storage ownership and declared consumer suites are retained separately in the raw audit. Shared modules are counted once.

## Source absence and traceability

The office, inventory, tooling, browser and static stages ran sequentially with the LibreOffice, mdds, ICU and Boost reference links absent. A finally block restored all four exact targets. The browser configuration disallows reusing an existing server and tested this checkout's own built preview. No native compilation, sanitizer, network or memory-management experiment was performed.

The pre-run snapshot covers3,425 tracked non-task files. Runtime, tests, fixtures and configuration remain unchanged; intentional non-task changes are this report and the checkpoint in [Calc core boundaries](calc-core.md). Complete stage logs, raw-counter/ownership audit, gate results and exact source hashes are retained under ignored `output/playwright/task111-checks/`.

Fourteen remaining serial repository gates, exact committed-source review, a separate same-agent EVALUATOR phase and canonical closure are recorded in [the task README](../../.agentplane/tasks/202610140644-DXESQV/README.md). The evaluator phase is not independent review. Inventory and tooling full stages supply the other two of the sixteen repository checks.

The shared XML pull reader added in task110 is covered by this full run; native file mapping is explicitly replaced by browser-supplied bytes. Actual configuration schema/backend and Calc locale/color/default services, ScTokenArray/ScFormulaCell, column/table/document, grid/input/view and ODS filters remain pending. ODS must reuse the existing shared package, ZIP, manifest, SAX and xmloff modules, while configuration XML uses the separate upstream xmlreader responsibility. These missing integrations are not certified by passing current tests.
