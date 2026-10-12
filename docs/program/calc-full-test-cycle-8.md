# Calc full test cycle 8

Task81 `202610121732-1D97V7` verifies the complete current application after Calc tasks72 through80 in `vite-office-calc`, branch `calc`. The eighth scheduled full run follows task71. The user requests pausing the goal after this run and relevant repairs; Writer-only coverage deficits must remain for the Writer branch.

## Full results

| Stage | Result | Evidence |
| --- | --- | --- |
| Office application tests | Pass | 15,550 tests in 740 files |
| Inventory | Pass, coverage100 | 123 tests in 38 files |
| Tooling | Pass | 35 tests in9 files |
| Browser scenarios | Pass | 308: Writer306, shared2, Calc0 |
| Static application build | Pass | Existing static-build checks pass |

All five stages pass on their first full run. No runtime, test expectation, inventory implementation or Writer coverage repair is needed. Global coverage thresholds remain100 and no exclusions or counters are changed. The browser projects remain disjoint; Calc has no actual editable-grid browser scenarios yet.

## Raw office coverage

The unmodified `apps/office/coverage/all/coverage-final.json` has459 executable owners and every statement/function/branch counter is positive. Lines are calculated from the actual statement locations.

| Configured coverage owner | Executable owners | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Calc | 24 | 3,080 | 2,092 | 526 | 2,721 |
| Shared | 226 | 14,475 | 9,083 | 2,654 | 13,261 |
| Writer | 209 | 15,574 | 11,128 | 3,525 | 14,182 |
| Total | 459 | 33,129 | 22,303 | 6,705 | 30,164 |

All four metrics are100 for every configured owner group. There is no Writer-only coverage exception in this cycle. The unmodified inventory JSON summary likewise reports100:1,734 statements,1,292 branches,436 functions and1,668 lines.

Coverage ownership follows `createOfficeTestOptions`: `sw` is Writer, `sc` is Calc and the other runtime roots are shared. Canonical registry storage and current consumer metadata are retained separately: fifteen records live in shared architecture folders while declaring Writer consumers. They are not used to rewrite configured coverage ownership or duplicate shared modules. Initial ignored audit scripts were corrected to preserve this distinction and to classify root-relative browser spec paths by their directory components; no production defect was involved.

## Source absence and traceability

The full office, inventory, tooling, browser and static stages run with all four original reference links absent: LibreOffice, mdds, ICU and Boost. The runner restores their exact targets in a finally block after all stages. No new native build, sanitizer or network action is part of this cycle.

Pre-run hashes cover3,154 tracked non-task source/config/test/fixture/document files. Current runtime, test, fixture and configuration bytes remain unchanged during verification. The only planned tracked checkpoint changes are this document and the cycle note in calc-core, plus task artifacts. Complete logs, raw audits and command/source manifests are retained under ignored `output/playwright/task81-checks/`.

The declared whole repository gates, exact commit-bound same-agent separate EVALUATOR review and canonical closure are recorded in [the task README](../../.agentplane/tasks/202610121732-1D97V7/README.md). A separate evaluator role phase is not an independent reviewer. This cycle does not establish complete Calc core, ScMatrix/document integration or editable UI readiness; [Calc core boundaries](calc-core.md) retain the remaining owners. Goal pause follows verified closure at the explicit user request.
