---
id: "202611211833-1AZNPZ"
title: "Connect Calc Calculate and Formula options"
result_summary: "Calc Calculate and Formula options connected through the source Options command. Task five of the ten-task cycle."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:33:45.890Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:53:53.867Z"
  updated_by: "CODER"
  note: "183 focused tests across 21 suites passed, including the original Options interaction in tdf137617, document recalculation and criteria, source automatic labels, Excel A1 and R1C1, and ODS reopen. Office typecheck, changed-path lint and format, Calc resources, provenance, dependency boundaries and policy routing passed. The optional whole-repository file-size scan reports seven unchanged baseline violations."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:53:55.240Z"
  updated_by: "EVALUATOR"
  note: "The native Calc Calculate and Formula option controls reach the current document through the actual source command. Focused regression and static evidence support accepting the approved scope."
  evaluated_sha: "253e837a94d401e6fc03358db0827c2b671850c9"
  blueprint_digest: "6153338cbc5647593dc961cce3ea18c501a10436ee5128ad1e69e85365ed5ac6"
  evidence_refs:
    - ".agentplane/tasks/202611211833-1AZNPZ/README.md"
    - ".agentplane/tasks/202611211833-1AZNPZ/quality/20261121-185355240-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211833-1AZNPZ/quality/20261121-185355240-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211833-1AZNPZ/quality/20261121-185355240-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211833-1AZNPZ/blueprint/resolved-snapshot.json"
    - "output/calc-1AZNPZ-verification.md"
    - "output/calc-1AZNPZ-final-tests.log"
  findings:
    - "Compared the Calculate and Formula draft commits, grammar admission, automatic label selection and interpreter area expansion with the pinned source. The existing file-size findings do not include task paths."
commit:
  hash: "253e837a94d401e6fc03358db0827c2b671850c9"
  message: "🧩 1AZNPZ code: connect Calc Calculate and Formula options"
comments:
  -
    author: "CODER"
    body: "Start: Connect the native Calc Calculate and Formula options pages to live document settings and formula syntax."
  -
    author: "CODER"
    body: "Verified: connected the Calc Calculate and Formula pages through Tools Options and passed 183 focused tests covering grammar, calculation, labels, and ODS."
events:
  -
    type: "status"
    at: "2026-11-21T18:33:46.354Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Calc Calculate and Formula options pages to live document settings and formula syntax."
  -
    type: "verify"
    at: "2026-11-21T18:53:53.867Z"
    author: "CODER"
    state: "ok"
    note: "183 focused tests across 21 suites passed, including the original Options interaction in tdf137617, document recalculation and criteria, source automatic labels, Excel A1 and R1C1, and ODS reopen. Office typecheck, changed-path lint and format, Calc resources, provenance, dependency boundaries and policy routing passed. The optional whole-repository file-size scan reports seven unchanged baseline violations."
  -
    type: "status"
    at: "2026-11-21T18:55:19.152Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: connected the Calc Calculate and Formula pages through Tools Options and passed 183 focused tests covering grammar, calculation, labels, and ODS."
doc_version: 3
doc_updated_at: "2026-11-21T18:55:19.153Z"
doc_updated_by: "CODER"
description: "Connect the original Calc options pages to document calculation settings, formula syntax and existing recalculation paths."
sections:
  Summary: "Open native-shaped Calc Calculate and Formula settings through the original Tools Options slot."
  Scope: "Calc-only options dialog host with a tree and the two source calculation pages, native document settings and grammar changes, formula and label admission/recalculation integration where needed, and focused tests and registry records. Task 5 of the approved ten-task verification cycle."
  Plan: "Reuse ScDocOptions, ScTpCalcItem, grammar commands, and recalculation owners for dialog activation, edited values, reset, and transactional apply. Complete supported Excel A1 grammar and explicit/automatic label selection behavior needed by the represented controls. Verify actual changed calculation behavior and number formatting, the source tdf137617 UI syntax transition and label defaults, cancellation and round trips."
  Verify Steps: "Run focused Calc options UI, formula grammar, names/labels, calculation settings and workbook tests, including the source tdf137617 options workflow. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor."
  Verification: |-
    | Command | Result | Evidence and scope |
    | --- | --- | --- |
    | `node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-options calc-named-ranges calc-label-ranges calc-workbench calc-view-options native-a1-formula address document.formula ods-calculation-settings docoptio calcconfig interpr1.reference --maxWorkers 1 --testTimeout 600000 --reporter verbose` from `apps/office` | pass | 21 suites, 183 tests. Covers the actual menu, source tdf137617 transition, both label axes and connected-area extension, ODS round trips, calculation config scope, number formatting and reference parsers. |
    | `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo` | pass | Office TypeScript. |
    | `rg '^apps/.*\.tsx?$' output/calc-1AZNPZ-paths.txt \| xargs node_modules/.bin/eslint --max-warnings 0` and `xargs node_modules/.bin/prettier --check < output/calc-1AZNPZ-paths.txt` | pass | All changed source and registry paths. |
    | `npm run check:calc-resources` | pass | Pinned 477-command Calc resource, including Options and its accelerator. |
    | `npm run check:source-provenance` and `npm run check:dependencies` | pass | 2,998 inventoried runtime modules, 2,997 module-boundary runtime sources and 315 permitted cross-module edges. |
    | `git diff --cached --check`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor` | pass | Clean patch and routing, existing managed-hook shim warning. |
    | `npm run check:file-size` | fail | Seven unchanged baseline paths exceed the global threshold. All changed paths are below the threshold. |

    Implementation commit is `253e837a94d4`. This is task five of the ten-task cycle. The full test run remains scheduled for task ten.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:53:53.867Z — VERIFY — ok

    By: CODER

    Note: 183 focused tests across 21 suites passed, including the original Options interaction in tdf137617, document recalculation and criteria, source automatic labels, Excel A1 and R1C1, and ODS reopen. Office typecheck, changed-path lint and format, Calc resources, provenance, dependency boundaries and policy routing passed. The optional whole-repository file-size scan reports seven unchanged baseline violations.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:53:52.580Z, excerpt_hash=sha256:67bd772752420450b2eb3f470f29fb8d9b63d1acaa4ae81ef4791ee9e3e3b004

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211833-1AZNPZ/blueprint/resolved-snapshot.json
    - old_digest: 6153338cbc5647593dc961cce3ea18c501a10436ee5128ad1e69e85365ed5ac6
    - current_digest: 6153338cbc5647593dc961cce3ea18c501a10436ee5128ad1e69e85365ed5ac6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211833-1AZNPZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211833-1AZNPZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the source commit for this task to restore the previous options UI and grammar dispatch."
  Findings: |-
    Pinned LibreOffice 26.8.0.2 references include ScTpCalcOptions, ScTpFormulaOptions, ScModule::ModifyOptions, the calculation settings child dialog, and the named-range tdf137617 UI test. Automatic names follow the source position precedence, row/column classification and interpreter data-area expansion. Existing explicit label resolution remains available with automatic lookup disabled.

    CALC-811 records the source recalculation ordering where a Calculate item can replace the Formula configuration recalculation request. Date and automatic lookup changes do not independently enter the native CalcAll comparison. The port retains this ordering and comparison.

    The Calculate page edits native iterative-reference and precision-as-shown document fields. The current core slice does not yet provide the full iterative circular-reference solver or calculation-as-shown rounding. The Formula page uses the existing in-process calculation config scope. Desktop preferences persistence, custom formula separators, desktop CPU/OpenCL settings and file-load recalculation controls are outside this slice. Full automatic-name cache and native differential parity are outside the focused verification.
id_source: "generated"
---
## Summary

Open native-shaped Calc Calculate and Formula settings through the original Tools Options slot.

## Scope

Calc-only options dialog host with a tree and the two source calculation pages, native document settings and grammar changes, formula and label admission/recalculation integration where needed, and focused tests and registry records. Task 5 of the approved ten-task verification cycle.

## Plan

Reuse ScDocOptions, ScTpCalcItem, grammar commands, and recalculation owners for dialog activation, edited values, reset, and transactional apply. Complete supported Excel A1 grammar and explicit/automatic label selection behavior needed by the represented controls. Verify actual changed calculation behavior and number formatting, the source tdf137617 UI syntax transition and label defaults, cancellation and round trips.

## Verify Steps

Run focused Calc options UI, formula grammar, names/labels, calculation settings and workbook tests, including the source tdf137617 options workflow. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor.

## Verification

| Command | Result | Evidence and scope |
| --- | --- | --- |
| `node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-options calc-named-ranges calc-label-ranges calc-workbench calc-view-options native-a1-formula address document.formula ods-calculation-settings docoptio calcconfig interpr1.reference --maxWorkers 1 --testTimeout 600000 --reporter verbose` from `apps/office` | pass | 21 suites, 183 tests. Covers the actual menu, source tdf137617 transition, both label axes and connected-area extension, ODS round trips, calculation config scope, number formatting and reference parsers. |
| `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo` | pass | Office TypeScript. |
| `rg '^apps/.*\.tsx?$' output/calc-1AZNPZ-paths.txt \| xargs node_modules/.bin/eslint --max-warnings 0` and `xargs node_modules/.bin/prettier --check < output/calc-1AZNPZ-paths.txt` | pass | All changed source and registry paths. |
| `npm run check:calc-resources` | pass | Pinned 477-command Calc resource, including Options and its accelerator. |
| `npm run check:source-provenance` and `npm run check:dependencies` | pass | 2,998 inventoried runtime modules, 2,997 module-boundary runtime sources and 315 permitted cross-module edges. |
| `git diff --cached --check`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor` | pass | Clean patch and routing, existing managed-hook shim warning. |
| `npm run check:file-size` | fail | Seven unchanged baseline paths exceed the global threshold. All changed paths are below the threshold. |

Implementation commit is `253e837a94d4`. This is task five of the ten-task cycle. The full test run remains scheduled for task ten.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:53:53.867Z — VERIFY — ok

By: CODER

Note: 183 focused tests across 21 suites passed, including the original Options interaction in tdf137617, document recalculation and criteria, source automatic labels, Excel A1 and R1C1, and ODS reopen. Office typecheck, changed-path lint and format, Calc resources, provenance, dependency boundaries and policy routing passed. The optional whole-repository file-size scan reports seven unchanged baseline violations.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:53:52.580Z, excerpt_hash=sha256:67bd772752420450b2eb3f470f29fb8d9b63d1acaa4ae81ef4791ee9e3e3b004

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211833-1AZNPZ/blueprint/resolved-snapshot.json
- old_digest: 6153338cbc5647593dc961cce3ea18c501a10436ee5128ad1e69e85365ed5ac6
- current_digest: 6153338cbc5647593dc961cce3ea18c501a10436ee5128ad1e69e85365ed5ac6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211833-1AZNPZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211833-1AZNPZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the source commit for this task to restore the previous options UI and grammar dispatch.

## Findings

Pinned LibreOffice 26.8.0.2 references include ScTpCalcOptions, ScTpFormulaOptions, ScModule::ModifyOptions, the calculation settings child dialog, and the named-range tdf137617 UI test. Automatic names follow the source position precedence, row/column classification and interpreter data-area expansion. Existing explicit label resolution remains available with automatic lookup disabled.

CALC-811 records the source recalculation ordering where a Calculate item can replace the Formula configuration recalculation request. Date and automatic lookup changes do not independently enter the native CalcAll comparison. The port retains this ordering and comparison.

The Calculate page edits native iterative-reference and precision-as-shown document fields. The current core slice does not yet provide the full iterative circular-reference solver or calculation-as-shown rounding. The Formula page uses the existing in-process calculation config scope. Desktop preferences persistence, custom formula separators, desktop CPU/OpenCL settings and file-load recalculation controls are outside this slice. Full automatic-name cache and native differential parity are outside the focused verification.
