---
id: "202611211813-7C1WVT"
title: "Connect Calc row and column label ranges"
result_summary: "Connect Calc's explicit row and column label pairs through the native dialog, formula tokens and ODS"
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
  updated_at: "2026-11-21T18:14:01.104Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:30:22.095Z"
  updated_by: "CODER"
  note: "All 44 focused Calc tests and all declared static checks passed, including the tdf131170 dialog, live label formulas, ODS and range-pair movement."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:30:23.258Z"
  updated_by: "EVALUATOR"
  note: "The native row and column label dialog, indexed reference behavior, document pair state, and ODS filter passed focused production-path checks."
  evaluated_sha: "ad3928c0ec14d459539b7bbf0de65c9510cb3a11"
  blueprint_digest: "d026304f79aa5bf721cc78c602f7e3d75221136ead65985beaaf932d37704044"
  evidence_refs:
    - ".agentplane/tasks/202611211813-7C1WVT/README.md"
    - ".agentplane/tasks/202611211813-7C1WVT/quality/20261121-183023258-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211813-7C1WVT/quality/20261121-183023258-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211813-7C1WVT/quality/20261121-183023258-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211813-7C1WVT/blueprint/resolved-snapshot.json"
    - "output/calc-7C1WVT-verification.md"
    - "output/calc-7C1WVT-tests-final.log"
    - "ad3928c0ec14d459539b7bbf0de65c9510cb3a11"
  findings:
    - "The pinned fixture label-list deletion assertions passed through the real Sheet menu and the browser confirmation."
    - "Column and row references, label-range deletion, ODS reopening and preceding-sheet changes use native persisted pairs."
commit:
  hash: "ad3928c0ec14d459539b7bbf0de65c9510cb3a11"
  message: "🧩 7C1WVT code: connect Calc row and column label ranges"
comments:
  -
    author: "CODER"
    body: "Start: Connect native paired label ranges across Calc document, formula, ODS and reference dialog."
  -
    author: "CODER"
    body: "Verified: 44 scoped Calc tests passed with the declared type, format, lint, generated-resource, provenance and dependency checks."
events:
  -
    type: "status"
    at: "2026-11-21T18:14:01.529Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native paired label ranges across Calc document, formula, ODS and reference dialog."
  -
    type: "verify"
    at: "2026-11-21T18:30:22.095Z"
    author: "CODER"
    state: "ok"
    note: "All 44 focused Calc tests and all declared static checks passed, including the tdf131170 dialog, live label formulas, ODS and range-pair movement."
  -
    type: "status"
    at: "2026-11-21T18:32:02.126Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 44 scoped Calc tests passed with the declared type, format, lint, generated-resource, provenance and dependency checks."
doc_version: 3
doc_updated_at: "2026-11-21T18:32:02.127Z"
doc_updated_by: "CODER"
description: "Connect document label range pairs, native formula references, ODS persistence and the Define Label Range ref dialog."
sections:
  Summary: "Enable the original Calc Define Label Range command with document-owned explicit column and row label mappings."
  Scope: "Calc range pair ownership, explicit label reference scanning and evaluation, ODS label ranges, shared formula-token hooks if necessary, source-shaped modal and reference input, corresponding tests and registry evidence. Task 4 of the approved ten-task verification cycle."
  Plan: "Wire the existing ScRangePairList and column/row label tokens to the pinned source semantics. Port the dialog state, orientation and overlap rules, existing labels, Add, Delete, grid reference input and OK/Cancel behavior. Keep stored pairs and references consistent across ODS load and save."
  Verify Steps: "Run focused Calc label-range, range-pair, formula, workbook interaction, and ODS tests including the pinned tdf131170 delete-button regression. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor."
  Verification: |-
    - Command: `cd apps/office && node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-label-ranges calc-named-ranges calc-workbench rangepair address.r1c1 compiler.external native-a1-formula named-arrays ods-matrix-formulas ui-resources --maxWorkers 1 --testTimeout 600000 --reporter verbose`.
      Result: pass. Evidence: 44 tests across 10 files.
      Scope: tdf131170 source fixture, picker and draft behavior, explicit row and column formulas, recalculation, ODS round trips and pair movement, named arrays, external references and supported menu paths.
    - Command: `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo`.
      Result: pass. Scope: Office TypeScript.
    - Commands: `sed -nE '/[.]tsx?$/p' output/calc-7C1WVT-paths.txt | xargs node_modules/.bin/eslint --max-warnings 0`, `xargs node_modules/.bin/prettier --check < output/calc-7C1WVT-paths.txt`, and `git diff --check`.
      Result: pass. Scope: changed-path lint, format and whitespace.
    - Commands: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies`.
      Result: pass. Evidence: 477 Calc commands, 2993 provenance modules and 2992 dependency-checked runtime sources.
    - Commands: `node .agentplane/policy/check-routing.mjs` and `ap doctor`.
      Result: pass. Evidence: policy routing OK, doctor OK with its existing hook-shim readiness warning.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:30:22.095Z — VERIFY — ok

    By: CODER

    Note: All 44 focused Calc tests and all declared static checks passed, including the tdf131170 dialog, live label formulas, ODS and range-pair movement.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:30:21.204Z, excerpt_hash=sha256:e24e85287599d16e1d731ecf27d51abff18bceabe02642f01efdfb2cf7b938a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211813-7C1WVT/blueprint/resolved-snapshot.json
    - old_digest: d026304f79aa5bf721cc78c602f7e3d75221136ead65985beaaf932d37704044
    - current_digest: d026304f79aa5bf721cc78c602f7e3d75221136ead65985beaaf932d37704044
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211813-7C1WVT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211813-7C1WVT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the source commit for this task to restore the previous label-range and formula behavior."
  Findings: |-
    - CALC-810 records the original default inclusive extent of right-edge row labels and the later overlap correction on Add.
    - Label lists now live on the Calc document, reusing the source range-pair owner. Formula code keeps its lexical label tokens while evaluating the native scalar or range operand. The explicit pairs and label formulas round-trip through ODS.
    - The tdf131170 port uses the pinned fixture, preserving its labels, pair ranges, and label formulas. The fixture adapter retains the cached value of its unrelated SUMPRODUCT cell.
    - This task covers explicit label pairs. The source's automatic discovery of unconfigured labels and its cache are outside the current explicit-pair slice.
    - AgentPlane doctor returned success with its existing hook shim readiness warning.
    - This is task 4 of the ten-task verification cycle. Full verification is due after six more AgentPlane tasks.
id_source: "generated"
---
## Summary

Enable the original Calc Define Label Range command with document-owned explicit column and row label mappings.

## Scope

Calc range pair ownership, explicit label reference scanning and evaluation, ODS label ranges, shared formula-token hooks if necessary, source-shaped modal and reference input, corresponding tests and registry evidence. Task 4 of the approved ten-task verification cycle.

## Plan

Wire the existing ScRangePairList and column/row label tokens to the pinned source semantics. Port the dialog state, orientation and overlap rules, existing labels, Add, Delete, grid reference input and OK/Cancel behavior. Keep stored pairs and references consistent across ODS load and save.

## Verify Steps

Run focused Calc label-range, range-pair, formula, workbook interaction, and ODS tests including the pinned tdf131170 delete-button regression. Run Office TypeScript, changed-path lint and formatting, Calc resources, source provenance, dependency boundaries, AgentPlane policy routing and doctor.

## Verification

- Command: `cd apps/office && node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-label-ranges calc-named-ranges calc-workbench rangepair address.r1c1 compiler.external native-a1-formula named-arrays ods-matrix-formulas ui-resources --maxWorkers 1 --testTimeout 600000 --reporter verbose`.
  Result: pass. Evidence: 44 tests across 10 files.
  Scope: tdf131170 source fixture, picker and draft behavior, explicit row and column formulas, recalculation, ODS round trips and pair movement, named arrays, external references and supported menu paths.
- Command: `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo`.
  Result: pass. Scope: Office TypeScript.
- Commands: `sed -nE '/[.]tsx?$/p' output/calc-7C1WVT-paths.txt | xargs node_modules/.bin/eslint --max-warnings 0`, `xargs node_modules/.bin/prettier --check < output/calc-7C1WVT-paths.txt`, and `git diff --check`.
  Result: pass. Scope: changed-path lint, format and whitespace.
- Commands: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies`.
  Result: pass. Evidence: 477 Calc commands, 2993 provenance modules and 2992 dependency-checked runtime sources.
- Commands: `node .agentplane/policy/check-routing.mjs` and `ap doctor`.
  Result: pass. Evidence: policy routing OK, doctor OK with its existing hook-shim readiness warning.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:30:22.095Z — VERIFY — ok

By: CODER

Note: All 44 focused Calc tests and all declared static checks passed, including the tdf131170 dialog, live label formulas, ODS and range-pair movement.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:30:21.204Z, excerpt_hash=sha256:e24e85287599d16e1d731ecf27d51abff18bceabe02642f01efdfb2cf7b938a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211813-7C1WVT/blueprint/resolved-snapshot.json
- old_digest: d026304f79aa5bf721cc78c602f7e3d75221136ead65985beaaf932d37704044
- current_digest: d026304f79aa5bf721cc78c602f7e3d75221136ead65985beaaf932d37704044
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211813-7C1WVT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211813-7C1WVT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the source commit for this task to restore the previous label-range and formula behavior.

## Findings

- CALC-810 records the original default inclusive extent of right-edge row labels and the later overlap correction on Add.
- Label lists now live on the Calc document, reusing the source range-pair owner. Formula code keeps its lexical label tokens while evaluating the native scalar or range operand. The explicit pairs and label formulas round-trip through ODS.
- The tdf131170 port uses the pinned fixture, preserving its labels, pair ranges, and label formulas. The fixture adapter retains the cached value of its unrelated SUMPRODUCT cell.
- This task covers explicit label pairs. The source's automatic discovery of unconfigured labels and its cache are outside the current explicit-pair slice.
- AgentPlane doctor returned success with its existing hook shim readiness warning.
- This is task 4 of the ten-task verification cycle. Full verification is due after six more AgentPlane tasks.
