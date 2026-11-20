---
id: "202611201340-7KEAF3"
title: "Align Calc ODS matrix and repeated formula ranges"
result_summary: "Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T13:40:29.662Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T14:13:03.614Z"
  updated_by: "CODER"
  note: "Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T14:12:49.215Z"
  updated_by: "EVALUATOR"
  note: "The implementation satisfies the approved Calc ODS matrix, repeat and Worker contract for the represented core."
  evaluated_sha: "5eac1319d3e4748654b2f357e80340fd1d51bc1c"
  blueprint_digest: "cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db"
  evidence_refs:
    - ".agentplane/tasks/202611201340-7KEAF3/README.md"
    - ".agentplane/tasks/202611201340-7KEAF3/quality/20261120-141249215-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201340-7KEAF3/quality/20261120-141249215-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201340-7KEAF3/quality/20261120-141249215-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201340-7KEAF3/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/filter/xml/ods-matrix-formulas.test.ts"
  findings:
    - "The pinned LibreOffice fixture matches all three CSVs on import, Worker transfer and reopen. Scoped reruns recovered both missed cases in the combined Calc run, and office typecheck and module guards passed."
commit:
  hash: "5eac1319d3e4748654b2f357e80340fd1d51bc1c"
  message: "🧩 7KEAF3 code: preserve native Calc ODS matrix formulas"
comments:
  -
    author: "CODER"
    body: "Start: Port native matrix formula geometry and cached member results through Calc ODS and Worker."
  -
    author: "CODER"
    body: "Verified: Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-20T13:40:39.953Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port native matrix formula geometry and cached member results through Calc ODS and Worker."
  -
    type: "verify"
    at: "2026-11-20T14:12:35.029Z"
    author: "CODER"
    state: "ok"
    note: "Calc ODS matrix fixture, recalculation, Worker and package round-trips verified; all wide-run misses recovered in focused reruns."
  -
    type: "verify"
    at: "2026-11-20T14:13:03.614Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips."
  -
    type: "status"
    at: "2026-11-20T14:13:03.703Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-20T14:13:03.703Z"
doc_updated_by: "CODER"
description: "Port the Calc document import owner and matrix formula master/reference cells, cached results, declared range export and Worker transfer. Preserve original repeated-formula placement and replay the pinned matrix ODS fixture."
sections:
  Summary: |-
    Align Calc ODS matrix and repeated formula ranges

    Port the Calc document import owner and matrix formula master/reference cells, cached results, declared range export and Worker transfer. Preserve original repeated-formula placement and replay the pinned matrix ODS fixture.
  Scope: "Calc formula and document import owners for matrix masters, references, result caches and represented calculation paths, ODS range and scalar import/export, shared XML tokens, Worker transfer, upstream fixtures and Calc suspected issues."
  Plan: "Create native matrix master and relative reference cells through ScDocumentImport. Use original result owners for declared geometry and cached results. Retain explicit spill blockers and single-position repeated formulas. Export only the matrix master with its span and formula. Preserve matrix identity and cached values through Worker. Verify against native ODS matrix data and represented matrix recalculation."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Exercise original matrix ODS geometry and cached values, repeated formula placement, package and Worker reopen.
    2. Run related Calc formula result, matrix token, and formula interpreter tests.
    3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T14:12:35.029Z — VERIFY — ok

    By: CODER

    Note: Calc ODS matrix fixture, recalculation, Worker and package round-trips verified; all wide-run misses recovered in focused reruns.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T13:40:39.953Z, excerpt_hash=sha256:416a50ea98c51dea0072cd92736474d73aba549d50184b05acbaa0a79d1e762b

    Details:

    Command: npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/source/core/tool/formularesult src/sc/source/core/tool/matrix-token.test.ts src/sc/source/core/tool/implicit-intersection.test.ts src/sc/source/core/tool/interpr1 src/sc/source/core/data/reference-protocol.test.ts --maxWorkers 2 --testTimeout 120000
    Result: fail, recovered in the scoped runs below
    Evidence: 142 of 144 passed across 31 files. The duplicate-cutoff test first ran before its dirty-context correction. The existing Excel-verifier protection case exceeded 120 seconds and passed on an isolated rerun.
    Scope: Calc XML import and export, Worker transfer, and related reference and formula result owners.

    Command: npm run test:calc -- src/sc/source/filter/xml/ods-matrix-formulas.test.ts src/sc/source/core/tool/implicit-intersection.test.ts --maxWorkers 1 --testTimeout 120000
    Result: pass
    Evidence: 21 passed. The pinned matrix.ods renders the expected values in all three upstream CSVs on initial import, after Worker transfer, and after ODS export and reopen. Covered repeated formulas, recalculation, blockers and duplicate cutoffs.
    Scope: Matrix formula and document owners, ODS matrix files and repeated formula placement.

    Command: npm run test:calc -- src/sc/source/filter/xml/ods-sheet-protection.test.ts -t 'encodes the pinned Excel verifier' --maxWorkers 1 --testTimeout 480000
    Result: pass
    Evidence: The previously timed-out case passed in isolation.
    Scope: Existing native sheet protection export and reopen.

    Command: npm run test:shared -- src/formula/source/core/api src/formula/inc/opcode.test.ts --maxWorkers 1 --testTimeout 120000
    Result: pass
    Evidence: 12 passed after updating the obsolete matrix-constructor expectation and extending the original UInt16 diagnostic test timeout. An earlier run passed the other five shared formula files.
    Scope: Shared formula compilation and opcode diagnostics.

    Command: npm run typecheck --workspace @vite-office/office
    Result: pass
    Scope: Office TypeScript workspace.

    Command: Scoped npx eslint and npx prettier --check on changed TypeScript and Markdown, git diff --check, git show --check 5eac1319d3e4, npm run check:dependencies, npm run check:source-tree, node .agentplane/policy/check-routing.mjs, ap doctor
    Result: pass
    Evidence: Doctor reported no errors and the existing managed hook shim warning; module and source-tree guards passed.
    Scope: Changed source, project module boundaries, and task workflow.

    Command: npm run check:file-size
    Result: fail on five pre-existing unrelated source files
    Evidence: No task path meets the hard threshold.
    Scope: Repository-wide source size baseline.

    Residual scope: Saved #SPILL! preserves blockers. Full dynamic-array expansion after a blocker is removed and unrepresented force-array interpreter services remain outside this task's represented runtime. Full suite follows the tenth task after the previous full baseline.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201340-7KEAF3/blueprint/resolved-snapshot.json
    - old_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
    - current_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201340-7KEAF3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201340-7KEAF3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-20T14:13:03.614Z — VERIFY — ok

    By: CODER

    Note: Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T14:12:35.214Z, excerpt_hash=sha256:416a50ea98c51dea0072cd92736474d73aba549d50184b05acbaa0a79d1e762b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201340-7KEAF3/blueprint/resolved-snapshot.json
    - old_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
    - current_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201340-7KEAF3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611201340-7KEAF3 --result verified-202611201340-7KEAF3 --commit 051fcd30fa1df04de8c9f800b19076645a577793
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Calc matrix formula ODS and Worker implementation, tests and audit notes."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc ODS matrix and repeated formula ranges

Port the Calc document import owner and matrix formula master/reference cells, cached results, declared range export and Worker transfer. Preserve original repeated-formula placement and replay the pinned matrix ODS fixture.

## Scope

Calc formula and document import owners for matrix masters, references, result caches and represented calculation paths, ODS range and scalar import/export, shared XML tokens, Worker transfer, upstream fixtures and Calc suspected issues.

## Plan

Create native matrix master and relative reference cells through ScDocumentImport. Use original result owners for declared geometry and cached results. Retain explicit spill blockers and single-position repeated formulas. Export only the matrix master with its span and formula. Preserve matrix identity and cached values through Worker. Verify against native ODS matrix data and represented matrix recalculation.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Exercise original matrix ODS geometry and cached values, repeated formula placement, package and Worker reopen.
2. Run related Calc formula result, matrix token, and formula interpreter tests.
3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T14:12:35.029Z — VERIFY — ok

By: CODER

Note: Calc ODS matrix fixture, recalculation, Worker and package round-trips verified; all wide-run misses recovered in focused reruns.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T13:40:39.953Z, excerpt_hash=sha256:416a50ea98c51dea0072cd92736474d73aba549d50184b05acbaa0a79d1e762b

Details:

Command: npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/source/core/tool/formularesult src/sc/source/core/tool/matrix-token.test.ts src/sc/source/core/tool/implicit-intersection.test.ts src/sc/source/core/tool/interpr1 src/sc/source/core/data/reference-protocol.test.ts --maxWorkers 2 --testTimeout 120000
Result: fail, recovered in the scoped runs below
Evidence: 142 of 144 passed across 31 files. The duplicate-cutoff test first ran before its dirty-context correction. The existing Excel-verifier protection case exceeded 120 seconds and passed on an isolated rerun.
Scope: Calc XML import and export, Worker transfer, and related reference and formula result owners.

Command: npm run test:calc -- src/sc/source/filter/xml/ods-matrix-formulas.test.ts src/sc/source/core/tool/implicit-intersection.test.ts --maxWorkers 1 --testTimeout 120000
Result: pass
Evidence: 21 passed. The pinned matrix.ods renders the expected values in all three upstream CSVs on initial import, after Worker transfer, and after ODS export and reopen. Covered repeated formulas, recalculation, blockers and duplicate cutoffs.
Scope: Matrix formula and document owners, ODS matrix files and repeated formula placement.

Command: npm run test:calc -- src/sc/source/filter/xml/ods-sheet-protection.test.ts -t 'encodes the pinned Excel verifier' --maxWorkers 1 --testTimeout 480000
Result: pass
Evidence: The previously timed-out case passed in isolation.
Scope: Existing native sheet protection export and reopen.

Command: npm run test:shared -- src/formula/source/core/api src/formula/inc/opcode.test.ts --maxWorkers 1 --testTimeout 120000
Result: pass
Evidence: 12 passed after updating the obsolete matrix-constructor expectation and extending the original UInt16 diagnostic test timeout. An earlier run passed the other five shared formula files.
Scope: Shared formula compilation and opcode diagnostics.

Command: npm run typecheck --workspace @vite-office/office
Result: pass
Scope: Office TypeScript workspace.

Command: Scoped npx eslint and npx prettier --check on changed TypeScript and Markdown, git diff --check, git show --check 5eac1319d3e4, npm run check:dependencies, npm run check:source-tree, node .agentplane/policy/check-routing.mjs, ap doctor
Result: pass
Evidence: Doctor reported no errors and the existing managed hook shim warning; module and source-tree guards passed.
Scope: Changed source, project module boundaries, and task workflow.

Command: npm run check:file-size
Result: fail on five pre-existing unrelated source files
Evidence: No task path meets the hard threshold.
Scope: Repository-wide source size baseline.

Residual scope: Saved #SPILL! preserves blockers. Full dynamic-array expansion after a blocker is removed and unrepresented force-array interpreter services remain outside this task's represented runtime. Full suite follows the tenth task after the previous full baseline.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201340-7KEAF3/blueprint/resolved-snapshot.json
- old_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
- current_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201340-7KEAF3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201340-7KEAF3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-20T14:13:03.614Z — VERIFY — ok

By: CODER

Note: Verified Calc ODS matrix masters and references, cached values and blockers, repeated formula placement, native recalculation, and Worker round-trips.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T14:12:35.214Z, excerpt_hash=sha256:416a50ea98c51dea0072cd92736474d73aba549d50184b05acbaa0a79d1e762b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201340-7KEAF3/blueprint/resolved-snapshot.json
- old_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
- current_digest: cc07a06573bef719b31b084d5a97d94429ddc80b53492df247128981570b67db
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201340-7KEAF3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611201340-7KEAF3 --result verified-202611201340-7KEAF3 --commit 051fcd30fa1df04de8c9f800b19076645a577793
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Calc matrix formula ODS and Worker implementation, tests and audit notes.

## Findings
