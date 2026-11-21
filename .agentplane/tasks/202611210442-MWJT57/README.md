---
id: "202611210442-MWJT57"
title: "Align Writer ODT bookmark ranges and properties"
result_summary: "Verified Writer ODT ordinary bookmark ranges, placement and hidden properties against LibreOffice"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:42:20.944Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T04:53:45.973Z"
  updated_by: "CODER"
  note: "Pinned ODF bookmark fixtures, 106 related cases, final targeted replays, Office typecheck and shared inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T04:53:28.652Z"
  updated_by: "EVALUATOR"
  note: "The connected ordinary bookmark model preserves native ODF pairing, portion order, and property serialization."
  evaluated_sha: "5e931355f4d8f0a01a1eb694ce8dd27a08b08079"
  blueprint_digest: "492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469"
  evidence_refs:
    - ".agentplane/tasks/202611210442-MWJT57/README.md"
    - ".agentplane/tasks/202611210442-MWJT57/quality/20261121-045328652-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210442-MWJT57/quality/20261121-045328652-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210442-MWJT57/quality/20261121-045328652-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210442-MWJT57/blueprint/resolved-snapshot.json"
    - "output/playwright/MWJT57/writer-bookmarks.log"
    - "output/playwright/MWJT57/bookmarks-final.log"
    - "output/playwright/MWJT57/bookmark-uno-final.log"
    - "docs/program/writer-upstream-suspected-issues.md"
  findings:
    - "Pinned bookmark ordering and hidden ranges round-trip through actual Writer packages. Focused final checks cover anchored frame phases, worker transfer, native properties and edited bookmark history."
commit:
  hash: "5e931355f4d8f0a01a1eb694ce8dd27a08b08079"
  message: "🧩 MWJT57 code: align Writer ODT bookmark range ownership and export"
comments:
  -
    author: "CODER"
    body: "Start: port ordinary Writer ODT bookmark ranges and attributes against the pinned source and fixtures."
  -
    author: "CODER"
    body: "Verified: Verified Writer ODT ordinary bookmark ranges, placement and hidden properties against LibreOffice. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-21T04:42:33.278Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port ordinary Writer ODT bookmark ranges and attributes against the pinned source and fixtures."
  -
    type: "verify"
    at: "2026-11-21T04:53:27.980Z"
    author: "CODER"
    state: "ok"
    note: "Verified pinned Writer ODT bookmark order, range recovery and hidden properties across real package, Worker and history boundaries."
  -
    type: "verify"
    at: "2026-11-21T04:53:45.973Z"
    author: "CODER"
    state: "ok"
    note: "Pinned ODF bookmark fixtures, 106 related cases, final targeted replays, Office typecheck and shared inventory passed."
  -
    type: "status"
    at: "2026-11-21T04:53:46.063Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Verified Writer ODT ordinary bookmark ranges, placement and hidden properties against LibreOffice. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-21T04:53:46.063Z"
doc_updated_by: "CODER"
description: "Port the pinned ordinary bookmark SAX context, pairing and same-position text-portion order, native hidden and condition properties, and transfer and history lifetime. Replay native ODF regressions."
sections:
  Summary: "Align Writer's ordinary bookmark ODT import, export, and native bookmark metadata with the pinned LibreOffice owners."
  Scope: "Shared XML bookmark parsing and range lifetime, native Writer bookmarks and UNO bookmark properties, bookmark ordering including frame boundaries, Worker transfer and bookmark history, pinned fixtures, source registry and documented source edge cases. Specialized cross-reference bookmark and reference field services, RDF metadata, unrelated ODF markers, and file workflow changes are outside the represented ordinary bookmark model."
  Plan: "Port XMLTextMarkImportContext and the real Writer bookmark properties. Preserve same-text checks, matching semantics, endpoint ordering, Worker transfer and editing history. Add pinned regressions and focused edge cases, then verify and close."
  Verify Steps: "Run the Writer ODT bookmark and frame tests, native bookmark/UNO and history tests, Worker transfer tests, and shared text SAX tests. Replay bookmark_order.fodt and both tdf101856 ODT fixtures. Check office typecheck, scoped Prettier and ESLint, dependency guard, provenance, routing, doctor and git diff."
  Verification: |-
    Pending implementation and focused checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T04:53:27.980Z — VERIFY — ok

    By: CODER

    Note: Verified pinned Writer ODT bookmark order, range recovery and hidden properties across real package, Worker and history boundaries.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:42:33.278Z, excerpt_hash=sha256:da133de75248fb955858432646fc78eb3410cc121f29787cea2ba0b265cfa48a

    Details:

    - Command: npm run test:writer -- src/sw/source/filter/xml/odt-markers.test.ts src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/unocore/native-text-import-api.test.ts src/sw/source/filter/xml/odt-worker-runtime.test.ts src/sw/source/filter/xml/odt-worker-client.test.ts src/sw/source/filter/ww8/docxexport.drawing.test.ts src/sw/source/writerfilter/rtftok/rtf-text-frame.test.ts src/xmloff/source/text/txtimp.test.ts src/xmloff/source/text/txtparai.test.ts --maxWorkers 2 --testTimeout 180000. Result: 106 passed across 9 suites. Covers the native ODT fixtures, bookmark history, API boundaries, Worker, Writer frame regression and shared parser.
    - Command: npm run test:writer -- src/sw/source/filter/xml/odt-markers.test.ts src/sw/source/filter/xml/odt-page-stories.test.ts src/xmloff/source/text/txtimp.test.ts src/xmloff/source/text/txtparai.test.ts --maxWorkers 2 --testTimeout 120000. Result: 22 passed on the final importer. Scope: bookmark_order.fodt, tdf101856.odt, tdf101856_overlapped.odt, partial and cross-story ranges, anchored text frames, page stories, shared SAX.
    - Command: npm run test:writer -- src/sw/source/core/unocore/native-text-import-api.test.ts -t 'attaches collapsed bookmark descriptors' --maxWorkers 1 --testTimeout 120000. Result: focused final test passed. Scope: typed UNO properties before and after attachment.
    - Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1. Result: passed. The earlier structural return-type error in the shared test mock was resolved by preserving the text import helper's void operation.
    - Checks: scoped Prettier and ESLint, npm run check:dependencies, npm run check:source-provenance, npm run inventory:parity:shared, node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check. Result: passed. Provenance checked 2,912 modules. Shared inventory reports zero semantic violations. Doctor retains its existing hook-shim warning.
    - Evidence: output/playwright/MWJT57. Writer findings WRITER-688 and WRITER-689 record the preserved source behavior. The source control-frame regression is represented by a native text frame exercising the same bookmark boundary phases. Specialized heading cross-references, RDFa, reference fields and form controls were outside this ordinary bookmark scope.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210442-MWJT57/blueprint/resolved-snapshot.json
    - old_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
    - current_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210442-MWJT57

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210442-MWJT57
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-21T04:53:45.973Z — VERIFY — ok

    By: CODER

    Note: Pinned ODF bookmark fixtures, 106 related cases, final targeted replays, Office typecheck and shared inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:53:28.032Z, excerpt_hash=sha256:da133de75248fb955858432646fc78eb3410cc121f29787cea2ba0b265cfa48a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210442-MWJT57/blueprint/resolved-snapshot.json
    - old_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
    - current_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210442-MWJT57

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611210442-MWJT57 --result verified-202611210442-MWJT57 --commit e3d2e79973400c998e188721b502229f2674e1e0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the bookmark implementation commits. The new transfer fields are optional and require no migration."
  Findings: "Record preserved source edge cases and verified boundaries."
id_source: "generated"
---
## Summary

Align Writer's ordinary bookmark ODT import, export, and native bookmark metadata with the pinned LibreOffice owners.

## Scope

Shared XML bookmark parsing and range lifetime, native Writer bookmarks and UNO bookmark properties, bookmark ordering including frame boundaries, Worker transfer and bookmark history, pinned fixtures, source registry and documented source edge cases. Specialized cross-reference bookmark and reference field services, RDF metadata, unrelated ODF markers, and file workflow changes are outside the represented ordinary bookmark model.

## Plan

Port XMLTextMarkImportContext and the real Writer bookmark properties. Preserve same-text checks, matching semantics, endpoint ordering, Worker transfer and editing history. Add pinned regressions and focused edge cases, then verify and close.

## Verify Steps

Run the Writer ODT bookmark and frame tests, native bookmark/UNO and history tests, Worker transfer tests, and shared text SAX tests. Replay bookmark_order.fodt and both tdf101856 ODT fixtures. Check office typecheck, scoped Prettier and ESLint, dependency guard, provenance, routing, doctor and git diff.

## Verification

Pending implementation and focused checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T04:53:27.980Z — VERIFY — ok

By: CODER

Note: Verified pinned Writer ODT bookmark order, range recovery and hidden properties across real package, Worker and history boundaries.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:42:33.278Z, excerpt_hash=sha256:da133de75248fb955858432646fc78eb3410cc121f29787cea2ba0b265cfa48a

Details:

- Command: npm run test:writer -- src/sw/source/filter/xml/odt-markers.test.ts src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/unocore/native-text-import-api.test.ts src/sw/source/filter/xml/odt-worker-runtime.test.ts src/sw/source/filter/xml/odt-worker-client.test.ts src/sw/source/filter/ww8/docxexport.drawing.test.ts src/sw/source/writerfilter/rtftok/rtf-text-frame.test.ts src/xmloff/source/text/txtimp.test.ts src/xmloff/source/text/txtparai.test.ts --maxWorkers 2 --testTimeout 180000. Result: 106 passed across 9 suites. Covers the native ODT fixtures, bookmark history, API boundaries, Worker, Writer frame regression and shared parser.
- Command: npm run test:writer -- src/sw/source/filter/xml/odt-markers.test.ts src/sw/source/filter/xml/odt-page-stories.test.ts src/xmloff/source/text/txtimp.test.ts src/xmloff/source/text/txtparai.test.ts --maxWorkers 2 --testTimeout 120000. Result: 22 passed on the final importer. Scope: bookmark_order.fodt, tdf101856.odt, tdf101856_overlapped.odt, partial and cross-story ranges, anchored text frames, page stories, shared SAX.
- Command: npm run test:writer -- src/sw/source/core/unocore/native-text-import-api.test.ts -t 'attaches collapsed bookmark descriptors' --maxWorkers 1 --testTimeout 120000. Result: focused final test passed. Scope: typed UNO properties before and after attachment.
- Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1. Result: passed. The earlier structural return-type error in the shared test mock was resolved by preserving the text import helper's void operation.
- Checks: scoped Prettier and ESLint, npm run check:dependencies, npm run check:source-provenance, npm run inventory:parity:shared, node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check. Result: passed. Provenance checked 2,912 modules. Shared inventory reports zero semantic violations. Doctor retains its existing hook-shim warning.
- Evidence: output/playwright/MWJT57. Writer findings WRITER-688 and WRITER-689 record the preserved source behavior. The source control-frame regression is represented by a native text frame exercising the same bookmark boundary phases. Specialized heading cross-references, RDFa, reference fields and form controls were outside this ordinary bookmark scope.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210442-MWJT57/blueprint/resolved-snapshot.json
- old_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
- current_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210442-MWJT57

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210442-MWJT57
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-21T04:53:45.973Z — VERIFY — ok

By: CODER

Note: Pinned ODF bookmark fixtures, 106 related cases, final targeted replays, Office typecheck and shared inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:53:28.032Z, excerpt_hash=sha256:da133de75248fb955858432646fc78eb3410cc121f29787cea2ba0b265cfa48a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210442-MWJT57/blueprint/resolved-snapshot.json
- old_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
- current_digest: 492a610a85b3799642445c6126e0b7f08549b9f70ba91362a7e17c34ddc1a469
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210442-MWJT57

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611210442-MWJT57 --result verified-202611210442-MWJT57 --commit e3d2e79973400c998e188721b502229f2674e1e0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the bookmark implementation commits. The new transfer fields are optional and require no migration.

## Findings

Record preserved source edge cases and verified boundaries.
