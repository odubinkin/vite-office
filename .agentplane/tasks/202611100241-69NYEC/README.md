---
id: "202611100241-69NYEC"
title: "Integrate current native Writer filters and Calc CSV changes into main"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-11-10T02:42:04.354Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-11-11T09:59:07.415Z"
  updated_by: "CODER"
  note: "Application and browser failures repaired; inventory coverage is 100%. Full application coverage remains below the unchanged 100% gate (97.64% statements, 95.43% branches). Publish and reverse-sync the authorized integration while retaining this open rework status."
  attempts: 1
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-10T02:42:08.314Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-11T09:59:07.415Z"
    author: "CODER"
    state: "needs_rework"
    note: "Application and browser failures repaired; inventory coverage is 100%. Full application coverage remains below the unchanged 100% gate (97.64% statements, 95.43% branches). Publish and reverse-sync the authorized integration while retaining this open rework status."
doc_version: 3
doc_updated_at: "2026-11-11T09:59:07.521Z"
doc_updated_by: "CODER"
description: "November synchronization of Writer 0d5e5b16c and Calc 2eded1223 with main, including full verification, integration regression repairs, and reverse synchronization. Prior integration 581KM2 retains its historical coverage dependency."
sections:
  Summary: "Publish the current Writer and Calc tips, integrate both branches into main, and synchronize the development branches."
  Scope: "The three named checkouts, fast-forward pushes, merges, conflict resolution, verification, regression repairs and tests, and the Calc and Writer upstream findings journals."
  Plan: "Publish writer and calc, fetch all three refs in vite-office, merge both branches into main, resolve conflicts and verify, publish main, then fetch and merge main back into writer and calc and publish those refs."
  Verify Steps: |-
    1. Run npm run verify on integrated main. If the aggregate script stops early, run the remaining component checks and record any failed gates.
    2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    3. Verify that main contains both input tips, both development branches contain published main, each checkout is on its designated branch, and all three local tips match origin. Check full Git status and preserve pre-existing Calc output.
  Verification: |-
    Command: npm run verify, followed by the remaining declared component commands when the aggregate stopped.
    Result: fail; the application 100% coverage gate remains unmet. No coverage thresholds or semantic assertions were disabled.
    Evidence: Full Node 24 app coverage executed 29,837 tests (29,824 initially passed, 13 initially failed), with two additional worker startup errors. The 13 failures and both startup-error files were repaired/replayed: all 106 affected tests pass across the focused and final recovery logs; another 11 numbering tests pass. The original 537-case browser run had 495 passing cases and 42 failures; all 42 subsequently passed targeted recovery, including two final isolated timeout cases. Full tooling (174 tests, with repaired cases replayed), build/static smoke, lint, typecheck, formatting, dependencies, resources, docs, size, source-tree, hint IDs, source provenance, invariants and parity passed. Broad app coverage recorded statements 97.64%, branches 95.43%, functions 99.33%, lines 98.26%; 4,106 branches were uncovered. These are the full-run measurements, not a fresh full measurement after targeted repairs.
    Scope: Integrated Writer, Calc and shared runtime. Recovery used Node 24, higher temporary app/browser infrastructure timeouts, and unchanged 100% coverage gates. The registry CLI composition test now has a 120-second technical timeout because full instrumented registry validation exceeded 30 seconds; its result assertions are unchanged.
    Evidence files: .agentplane/tmp/69NYEC/{verify.log,coverage-node24.log,resume-focused.log,writer-replay-final.log,patched-replay-final.log,numbering-regressions-final.log,e2e-final.log,e2e-replay-filtered.log,e2e-resume-replay.log,e2e-last-two.log,resume-static.log,resume-types-final.log,resume-docs.log,resume-deps.log,resume-provenance.log,resume-routing.log,resume-doctor.log}. Temporary logs are local and ignored.
    Command: npm run test:inventory:coverage.
    Result: pass.
    Evidence: 38 test files and 130 tests pass; statements 1,734/1,734, branches 1,291/1,291, functions 437/437 and lines 1,670/1,670, all 100%. See .agentplane/tmp/69NYEC/inventory-fixed-final.log.
    Git evidence: final-git.json records the final designated branches, local/origin equality, input-tip ancestry, clean tracked state and preserved pre-existing Calc output after publication and reverse synchronization.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-11T09:59:07.415Z — VERIFY — needs_rework

    By: CODER

    Note: Application and browser failures repaired; inventory coverage is 100%. Full application coverage remains below the unchanged 100% gate (97.64% statements, 95.43% branches). Publish and reverse-sync the authorized integration while retaining this open rework status.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-11T09:59:06.135Z, excerpt_hash=sha256:b9f19d622eb9bcedf7e13f3df3938faf22fc68887b8770374bfe32973d29ab65

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611100241-69NYEC/blueprint/resolved-snapshot.json
    - old_digest: e6736f70324a1411043b303b8d93f516cc916f612b5c62e7ef58d737e6fc5e8d
    - current_digest: e6736f70324a1411043b303b8d93f516cc916f612b5c62e7ef58d737e6fc5e8d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611100241-69NYEC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611100241-69NYEC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Keep the original tips in history. Resolve locally before publishing main and use revert commits if a published correction is needed."
  Findings: |-
    Published the November Writer and Calc input tips and resolved their shared native-source merge conflicts in main. The stock ICU Unicode word observation fixture remains intact. A second independent fixture was generated by applying the pinned LibreOffice Khmer patch to native ICU source objects, loading the exact pinned LibreOffice Khmer dictionary, compiling the original C++ word methods, and comparing 2,020 boundary operations. ANY_WORD keeps stock ICU semantics; explicit LibreOffice rules use the patched native fixture. No expected boundaries were generated from the TypeScript implementation.

    The XML numbering importer emitted ListFormat before ParentNumbering, unlike pinned xmloff/source/style/xmlnumi.cxx. Restoring native order fixes explicit-pattern ODT round trips without weakening their existing assertions. WRITER424 records the underlying order-sensitive upstream UNO contract. Other stale fixtures now assert native rejected-object destruction, style-handle names, document destruction order, relative table-width normalization, explicit border construction/replay and integrated RTL encoding support. Real character-format ownership replaces a synthetic registration mock.

    The full application coverage gate remains red. The broad run left 4,106 uncovered branches; the largest gaps include sw/source/filter/html/htmltab.reader.ts (140), svl/source/numbers/zformat.date.ts (82), sw/source/core/table/swnewtable.ts (72), and svl/source/numbers/zformat.number.ts (62). Coverage percentages are not lowered and the task must not be reported as fully green or closed solely because branch synchronization succeeds. Node 24 avoids the Node 26/jsdom global-storage incompatibility observed during the initial run.
id_source: "generated"
---
## Summary

Publish the current Writer and Calc tips, integrate both branches into main, and synchronize the development branches.

## Scope

The three named checkouts, fast-forward pushes, merges, conflict resolution, verification, regression repairs and tests, and the Calc and Writer upstream findings journals.

## Plan

Publish writer and calc, fetch all three refs in vite-office, merge both branches into main, resolve conflicts and verify, publish main, then fetch and merge main back into writer and calc and publish those refs.

## Verify Steps

1. Run npm run verify on integrated main. If the aggregate script stops early, run the remaining component checks and record any failed gates.
2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
3. Verify that main contains both input tips, both development branches contain published main, each checkout is on its designated branch, and all three local tips match origin. Check full Git status and preserve pre-existing Calc output.

## Verification

Command: npm run verify, followed by the remaining declared component commands when the aggregate stopped.
Result: fail; the application 100% coverage gate remains unmet. No coverage thresholds or semantic assertions were disabled.
Evidence: Full Node 24 app coverage executed 29,837 tests (29,824 initially passed, 13 initially failed), with two additional worker startup errors. The 13 failures and both startup-error files were repaired/replayed: all 106 affected tests pass across the focused and final recovery logs; another 11 numbering tests pass. The original 537-case browser run had 495 passing cases and 42 failures; all 42 subsequently passed targeted recovery, including two final isolated timeout cases. Full tooling (174 tests, with repaired cases replayed), build/static smoke, lint, typecheck, formatting, dependencies, resources, docs, size, source-tree, hint IDs, source provenance, invariants and parity passed. Broad app coverage recorded statements 97.64%, branches 95.43%, functions 99.33%, lines 98.26%; 4,106 branches were uncovered. These are the full-run measurements, not a fresh full measurement after targeted repairs.
Scope: Integrated Writer, Calc and shared runtime. Recovery used Node 24, higher temporary app/browser infrastructure timeouts, and unchanged 100% coverage gates. The registry CLI composition test now has a 120-second technical timeout because full instrumented registry validation exceeded 30 seconds; its result assertions are unchanged.
Evidence files: .agentplane/tmp/69NYEC/{verify.log,coverage-node24.log,resume-focused.log,writer-replay-final.log,patched-replay-final.log,numbering-regressions-final.log,e2e-final.log,e2e-replay-filtered.log,e2e-resume-replay.log,e2e-last-two.log,resume-static.log,resume-types-final.log,resume-docs.log,resume-deps.log,resume-provenance.log,resume-routing.log,resume-doctor.log}. Temporary logs are local and ignored.
Command: npm run test:inventory:coverage.
Result: pass.
Evidence: 38 test files and 130 tests pass; statements 1,734/1,734, branches 1,291/1,291, functions 437/437 and lines 1,670/1,670, all 100%. See .agentplane/tmp/69NYEC/inventory-fixed-final.log.
Git evidence: final-git.json records the final designated branches, local/origin equality, input-tip ancestry, clean tracked state and preserved pre-existing Calc output after publication and reverse synchronization.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-11T09:59:07.415Z — VERIFY — needs_rework

By: CODER

Note: Application and browser failures repaired; inventory coverage is 100%. Full application coverage remains below the unchanged 100% gate (97.64% statements, 95.43% branches). Publish and reverse-sync the authorized integration while retaining this open rework status.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-11T09:59:06.135Z, excerpt_hash=sha256:b9f19d622eb9bcedf7e13f3df3938faf22fc68887b8770374bfe32973d29ab65

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611100241-69NYEC/blueprint/resolved-snapshot.json
- old_digest: e6736f70324a1411043b303b8d93f516cc916f612b5c62e7ef58d737e6fc5e8d
- current_digest: e6736f70324a1411043b303b8d93f516cc916f612b5c62e7ef58d737e6fc5e8d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611100241-69NYEC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611100241-69NYEC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Keep the original tips in history. Resolve locally before publishing main and use revert commits if a published correction is needed.

## Findings

Published the November Writer and Calc input tips and resolved their shared native-source merge conflicts in main. The stock ICU Unicode word observation fixture remains intact. A second independent fixture was generated by applying the pinned LibreOffice Khmer patch to native ICU source objects, loading the exact pinned LibreOffice Khmer dictionary, compiling the original C++ word methods, and comparing 2,020 boundary operations. ANY_WORD keeps stock ICU semantics; explicit LibreOffice rules use the patched native fixture. No expected boundaries were generated from the TypeScript implementation.

The XML numbering importer emitted ListFormat before ParentNumbering, unlike pinned xmloff/source/style/xmlnumi.cxx. Restoring native order fixes explicit-pattern ODT round trips without weakening their existing assertions. WRITER424 records the underlying order-sensitive upstream UNO contract. Other stale fixtures now assert native rejected-object destruction, style-handle names, document destruction order, relative table-width normalization, explicit border construction/replay and integrated RTL encoding support. Real character-format ownership replaces a synthetic registration mock.

The full application coverage gate remains red. The broad run left 4,106 uncovered branches; the largest gaps include sw/source/filter/html/htmltab.reader.ts (140), svl/source/numbers/zformat.date.ts (82), sw/source/core/table/swnewtable.ts (72), and svl/source/numbers/zformat.number.ts (62). Coverage percentages are not lowered and the task must not be reported as fully green or closed solely because branch synchronization succeeds. Node 24 avoids the Node 26/jsdom global-storage incompatibility observed during the initial run.
