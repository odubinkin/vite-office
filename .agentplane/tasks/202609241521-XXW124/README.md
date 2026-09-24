---
id: "202609241521-XXW124"
title: "Reproduce and classify certification ODT diagnostics"
result_summary: "Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run the diagnostic harness on tracked upstream ODT fixtures and record categorized warnings and semantic counts without document text."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:15.282Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
verification:
  state: "ok"
  updated_at: "2026-09-24T16:04:47.979Z"
  updated_by: "CODER"
  note: "Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T16:04:05.289Z"
  updated_by: "EVALUATOR"
  note: "Phase 0 meets its diagnostic and privacy gate on the reviewed implementation commit."
  evaluated_sha: "1bfc64705bdfe92411ab4789bbf2065eb5f45df2"
  blueprint_digest: "e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb"
  evidence_refs:
    - ".agentplane/tasks/202609241521-XXW124/README.md"
    - ".agentplane/tasks/202609241521-XXW124/quality/20260924-160405289-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241521-XXW124/quality/20260924-160405289-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241521-XXW124/quality/20260924-160405289-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json"
    - "docs/program/certification-odt-diagnostic-baseline.md"
    - "scripts/libreoffice-inventory/odt-import-diagnostics.test.ts"
    - "npm run verify: pass on commit 1bfc64705bdfe92411ab4789bbf2065eb5f45df2"
  findings:
    - "The callback records structural XML paths, stream and frequency without attribute values; default import warnings remain covered by existing tests."
    - "The authorized private sample produced a numeric semantic baseline and 490 categorized warning occurrences; source bytes and text remain outside Git and tests."
commit:
  hash: "1bfc64705bdfe92411ab4789bbf2065eb5f45df2"
  message: "🧪 XXW124 code: add privacy-safe ODT diagnostic baseline"
comments:
  -
    author: "CODER"
    body: "Start: implement privacy-safe import diagnostics and semantic baseline using pinned LibreOffice references and existing ODT fixtures."
  -
    author: "CODER"
    body: "Verified: Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-24T15:23:42.078Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement privacy-safe import diagnostics and semantic baseline using pinned LibreOffice references and existing ODT fixtures."
  -
    type: "verify"
    at: "2026-09-24T16:02:46.038Z"
    author: "CODER"
    state: "ok"
    note: "Phase 0 diagnostic harness, private baseline, source-backed tests and UI command inventory verified by full npm run verify and local acceptance report."
  -
    type: "verify"
    at: "2026-09-24T16:03:48.211Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609241521-XXW124"
  -
    type: "verify"
    at: "2026-09-24T16:04:22.486Z"
    author: "CODER"
    state: "ok"
    note: "Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates."
  -
    type: "verify"
    at: "2026-09-24T16:04:47.979Z"
    author: "CODER"
    state: "ok"
    note: "Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates."
  -
    type: "status"
    at: "2026-09-24T16:04:48.113Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-24T16:04:48.114Z"
doc_updated_by: "CODER"
description: "Phase 0: privacy-safe import diagnostic harness, semantic baseline and upstream command/dialog matrix; use private file only with separate outside-repo approval."
sections:
  Summary: |-
    Reproduce and classify certification ODT diagnostics

    Phase 0: privacy-safe import diagnostic harness, semantic baseline and upstream command/dialog matrix; use private file only with separate outside-repo approval.
  Scope: "Import diagnostics in Worker/filter, privacy-safe stream/path/count report, canonical semantic baseline, and upstream command/dialog inventory. Private ODT read only after user authorizes its absolute path."
  Plan: |-
    1. Inspect pinned LibreOffice import handlers and current Worker/filter diagnostics.
    2. Add a local harness that records warning/error type, stream, element path, frequency and loss class without document text.
    3. Assert baseline semantics on existing pinned upstream fixtures and minimized synthetic ODTs.
    4. Run the private sample locally after authorization; record counts and feature-control mapping.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. Run `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` and the new diagnostic tests; record exact commands and results.
    3. The private sample report records paragraph/table/link/bookmark/break/page/style baseline and categorized warning counts without text or fonts in Git/logs.
    4. Record upstream command/dialog paths and existing local controls for every planned editable property.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T16:02:46.038Z — VERIFY — ok

    By: CODER

    Note: Phase 0 diagnostic harness, private baseline, source-backed tests and UI command inventory verified by full npm run verify and local acceptance report.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:02:37.420Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
    - old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-XXW124

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241521-XXW124
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T16:03:48.211Z — VERIFY — ok

    By: CODER

    Note: verified-202609241521-XXW124
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:02:46.110Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
    - old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-XXW124

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241521-XXW124 --result verified-202609241521-XXW124 --commit 1bfc64705bdfe92411ab4789bbf2065eb5f45df2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-24T16:04:22.486Z — VERIFY — ok

    By: CODER

    Note: Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:03:48.293Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
    - old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-XXW124

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241521-XXW124 --result verified-202609241521-XXW124 --commit 1bfc64705bdfe92411ab4789bbf2065eb5f45df2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-24T16:04:47.979Z — VERIFY — ok

    By: CODER

    Note: Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:04:22.574Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
    - old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-XXW124

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241521-XXW124 --result verified-202609241521-XXW124 --commit e9b10787bd5c999d061abc8542486d96cb11e8f0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run verify
    Result: pass
    Evidence: 490 app tests and 107 inventory tests passed at 100% coverage; 14 browser tests passed; static build, JSDoc, file-size, source-tree, provenance, invariants and parity gates passed.
    Scope: final phase 0 code, tests, docs and existing regressions.

    Command: npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts scripts/libreoffice-inventory/odt-import-diagnostics.test.ts
    Result: pass
    Evidence: 10 tests passed before the final expanded diagnostic cases; final npm run verify includes the updated 107-test inventory suite.
    Scope: pinned upstream ODT import/export/reimport and privacy-safe diagnostics.

    Command: npx tsx scripts/libreoffice-inventory/odt-import-diagnostics-cli.ts <authorized-local-odt-path> > .agentplane/tmp/certification-diagnostic.json
    Result: pass
    Evidence: import completed; XML 74 paragraphs/15 cells/19 links/8 bookmarks/9 soft breaks versus canonical 59 paragraphs/14 links and no table or markers; 490 warning occurrences in 184 groups. Numeric page and paragraph metrics are recorded in docs/program/certification-odt-diagnostic-baseline.md.
    Scope: authorized private local acceptance file; source bytes and text remain outside Git and test scenarios.

    Residual: phases 1-6 own all identified semantic and UI gaps; phase 0 intentionally only measured them.
id_source: "generated"
---
## Summary

Reproduce and classify certification ODT diagnostics

Phase 0: privacy-safe import diagnostic harness, semantic baseline and upstream command/dialog matrix; use private file only with separate outside-repo approval.

## Scope

Import diagnostics in Worker/filter, privacy-safe stream/path/count report, canonical semantic baseline, and upstream command/dialog inventory. Private ODT read only after user authorizes its absolute path.

## Plan

1. Inspect pinned LibreOffice import handlers and current Worker/filter diagnostics.
2. Add a local harness that records warning/error type, stream, element path, frequency and loss class without document text.
3. Assert baseline semantics on existing pinned upstream fixtures and minimized synthetic ODTs.
4. Run the private sample locally after authorization; record counts and feature-control mapping.

## Verify Steps

1. `npm run verify` passes.
2. Run `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` and the new diagnostic tests; record exact commands and results.
3. The private sample report records paragraph/table/link/bookmark/break/page/style baseline and categorized warning counts without text or fonts in Git/logs.
4. Record upstream command/dialog paths and existing local controls for every planned editable property.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T16:02:46.038Z — VERIFY — ok

By: CODER

Note: Phase 0 diagnostic harness, private baseline, source-backed tests and UI command inventory verified by full npm run verify and local acceptance report.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:02:37.420Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
- old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-XXW124

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241521-XXW124
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T16:03:48.211Z — VERIFY — ok

By: CODER

Note: verified-202609241521-XXW124
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:02:46.110Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
- old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-XXW124

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241521-XXW124 --result verified-202609241521-XXW124 --commit 1bfc64705bdfe92411ab4789bbf2065eb5f45df2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-24T16:04:22.486Z — VERIFY — ok

By: CODER

Note: Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:03:48.293Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
- old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-XXW124

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241521-XXW124 --result verified-202609241521-XXW124 --commit 1bfc64705bdfe92411ab4789bbf2065eb5f45df2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-24T16:04:47.979Z — VERIFY — ok

By: CODER

Note: Privacy-safe ODT diagnostic harness and sample semantic baseline verified with full repository gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:04:22.574Z, excerpt_hash=sha256:009e204e242c3022ce448a451a292941792bc6c0f1681bd2deafcb4e4a3e8188

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-XXW124/blueprint/resolved-snapshot.json
- old_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- current_digest: e2c1867ebc5654f3973d2c8553970bbbb55fb260f7a076dfe28b015a176b72bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-XXW124

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241521-XXW124 --result verified-202609241521-XXW124 --commit e9b10787bd5c999d061abc8542486d96cb11e8f0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run verify
Result: pass
Evidence: 490 app tests and 107 inventory tests passed at 100% coverage; 14 browser tests passed; static build, JSDoc, file-size, source-tree, provenance, invariants and parity gates passed.
Scope: final phase 0 code, tests, docs and existing regressions.

Command: npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts scripts/libreoffice-inventory/odt-import-diagnostics.test.ts
Result: pass
Evidence: 10 tests passed before the final expanded diagnostic cases; final npm run verify includes the updated 107-test inventory suite.
Scope: pinned upstream ODT import/export/reimport and privacy-safe diagnostics.

Command: npx tsx scripts/libreoffice-inventory/odt-import-diagnostics-cli.ts <authorized-local-odt-path> > .agentplane/tmp/certification-diagnostic.json
Result: pass
Evidence: import completed; XML 74 paragraphs/15 cells/19 links/8 bookmarks/9 soft breaks versus canonical 59 paragraphs/14 links and no table or markers; 490 warning occurrences in 184 groups. Numeric page and paragraph metrics are recorded in docs/program/certification-odt-diagnostic-baseline.md.
Scope: authorized private local acceptance file; source bytes and text remain outside Git and test scenarios.

Residual: phases 1-6 own all identified semantic and UI gaps; phase 0 intentionally only measured them.
