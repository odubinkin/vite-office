---
id: "202609220707-76AZJP"
title: "Converge Sfx command architecture for P1"
result_summary: "Converged Sfx command architecture for P1.1-P1.3"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
  - "writer"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run check:writer-resources && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity"
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:53.625Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T07:46:00.188Z"
  updated_by: "CODER"
  note: "verified-202609220707-76AZJP"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T07:45:28.541Z"
  updated_by: "EVALUATOR"
  note: "Sfx dispatcher now follows upstream shell/interface/slot/request boundaries with browser async observation separated."
  evaluated_sha: "7fdb35bd313e35d466c79bd53a80f506822abd1b"
  blueprint_digest: "30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c"
  evidence_refs:
    - ".agentplane/tasks/202609220707-76AZJP/README.md"
    - ".agentplane/tasks/202609220707-76AZJP/quality/20260922-074528541-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220707-76AZJP/quality/20260922-074528541-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220707-76AZJP/quality/20260922-074528541-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json"
    - "apps/office/src/sfx2/source/control/dispatch.test.ts"
  findings:
    - "All declared verification checks passed; source inventory and command architecture documentation were updated."
commit:
  hash: "7fdb35bd313e35d466c79bd53a80f506822abd1b"
  message: "🚧 76AZJP task: implement P1 Sfx command architecture"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202609220707-76AZJP. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    author: "CODER"
    body: "Verified: Sfx command architecture converged on upstream shell, interface, slot, and request boundaries."
events:
  -
    type: "status"
    at: "2026-09-22T07:10:02.744Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-22T07:45:21.420Z"
    author: "CODER"
    state: "ok"
    note: "Focused Sfx/Writer tests, 100% coverage, writer resource generation, dependency/provenance/parity/source-tree, formatting, lint, typecheck, file-size, docs, and diff checks all pass."
  -
    type: "verify"
    at: "2026-09-22T07:45:40.440Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220707-76AZJP"
  -
    type: "verify"
    at: "2026-09-22T07:46:00.188Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220707-76AZJP"
  -
    type: "status"
    at: "2026-09-22T07:46:00.338Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609220707-76AZJP. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "status"
    at: "2026-09-22T07:47:00.555Z"
    author: "CODER"
    from: "DONE"
    to: "DONE"
    note: "Verified: Sfx command architecture converged on upstream shell, interface, slot, and request boundaries."
doc_version: 3
doc_updated_at: "2026-09-22T07:47:00.557Z"
doc_updated_by: "CODER"
description: "Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue."
sections:
  Summary: |-
    Converge Sfx command architecture for P1

    Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.
  Scope: |-
    - In scope: Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.
    - Out of scope: unrelated refactors not required for "Converge Sfx command architecture for P1".
  Plan: |-
    1. Compare the supported local command surface with pinned SfxSlot, SfxInterface, SfxShell, SfxDispatcher, SfxRequest, SfxBindings, SDI, HRC, and XCU owners.
    2. Add bounded upstream-shaped slot/interface modules and generate Writer metadata from pinned resources.
    3. Move request conversion, binding state, accelerators, and browser async observation to their owning modules; reduce dispatch.ts to stack, lookup, and execution.
    4. Move Execute/GetState behavior into concrete Writer shells and delete writercommands.ts plus duplicate list-shell metadata assembly.
    5. Update affected inventory/provenance/docs and verify shell shadowing, request items, command state, browser extension IDs, and source boundaries.
  Verify Steps: |-
    1. Run focused Sfx/Writer command tests. Expected: generated slot/interface metadata, shell shadowing, request-item execution, binding invalidation, shortcuts, and async browser observation pass.
    2. Run npm run test:coverage. Expected: all application tests pass with required coverage.
    3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no synthetic upstream slot, browser/core dependency, stale source owner, or parity evidence failure.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and repository hygiene checks pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T07:45:21.420Z — VERIFY — ok

    By: CODER

    Note: Focused Sfx/Writer tests, 100% coverage, writer resource generation, dependency/provenance/parity/source-tree, formatting, lint, typecheck, file-size, docs, and diff checks all pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:10:02.744Z, excerpt_hash=sha256:3f200219af0b18670a3d1bd97dc6d835923c09b71380e1cd51afded146d2ddba

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json
    - old_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
    - current_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220707-76AZJP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609220707-76AZJP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T07:45:40.440Z — VERIFY — ok

    By: CODER

    Note: verified-202609220707-76AZJP
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:45:21.500Z, excerpt_hash=sha256:3f200219af0b18670a3d1bd97dc6d835923c09b71380e1cd51afded146d2ddba

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json
    - old_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
    - current_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220707-76AZJP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220707-76AZJP --result verified-202609220707-76AZJP --commit 7fdb35bd313e35d466c79bd53a80f506822abd1b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T07:46:00.188Z — VERIFY — ok

    By: CODER

    Note: verified-202609220707-76AZJP
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:45:40.514Z, excerpt_hash=sha256:3f200219af0b18670a3d1bd97dc6d835923c09b71380e1cd51afded146d2ddba

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json
    - old_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
    - current_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220707-76AZJP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220707-76AZJP --result verified-202609220707-76AZJP --commit 3c2aef4bccc9bc89c485ce3bdf9cdffc368169c2
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
  Findings: ""
id_source: "generated"
---
## Summary

Converge Sfx command architecture for P1

Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.

## Scope

- In scope: Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.
- Out of scope: unrelated refactors not required for "Converge Sfx command architecture for P1".

## Plan

1. Compare the supported local command surface with pinned SfxSlot, SfxInterface, SfxShell, SfxDispatcher, SfxRequest, SfxBindings, SDI, HRC, and XCU owners.
2. Add bounded upstream-shaped slot/interface modules and generate Writer metadata from pinned resources.
3. Move request conversion, binding state, accelerators, and browser async observation to their owning modules; reduce dispatch.ts to stack, lookup, and execution.
4. Move Execute/GetState behavior into concrete Writer shells and delete writercommands.ts plus duplicate list-shell metadata assembly.
5. Update affected inventory/provenance/docs and verify shell shadowing, request items, command state, browser extension IDs, and source boundaries.

## Verify Steps

1. Run focused Sfx/Writer command tests. Expected: generated slot/interface metadata, shell shadowing, request-item execution, binding invalidation, shortcuts, and async browser observation pass.
2. Run npm run test:coverage. Expected: all application tests pass with required coverage.
3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no synthetic upstream slot, browser/core dependency, stale source owner, or parity evidence failure.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and repository hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T07:45:21.420Z — VERIFY — ok

By: CODER

Note: Focused Sfx/Writer tests, 100% coverage, writer resource generation, dependency/provenance/parity/source-tree, formatting, lint, typecheck, file-size, docs, and diff checks all pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:10:02.744Z, excerpt_hash=sha256:3f200219af0b18670a3d1bd97dc6d835923c09b71380e1cd51afded146d2ddba

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json
- old_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
- current_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220707-76AZJP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609220707-76AZJP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T07:45:40.440Z — VERIFY — ok

By: CODER

Note: verified-202609220707-76AZJP
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:45:21.500Z, excerpt_hash=sha256:3f200219af0b18670a3d1bd97dc6d835923c09b71380e1cd51afded146d2ddba

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json
- old_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
- current_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220707-76AZJP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220707-76AZJP --result verified-202609220707-76AZJP --commit 7fdb35bd313e35d466c79bd53a80f506822abd1b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T07:46:00.188Z — VERIFY — ok

By: CODER

Note: verified-202609220707-76AZJP
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:45:40.514Z, excerpt_hash=sha256:3f200219af0b18670a3d1bd97dc6d835923c09b71380e1cd51afded146d2ddba

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-76AZJP/blueprint/resolved-snapshot.json
- old_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
- current_digest: 30b3f7c2f5cb31af50166065479dbff711583464c599207419973f485181ef5c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220707-76AZJP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220707-76AZJP --result verified-202609220707-76AZJP --commit 3c2aef4bccc9bc89c485ce3bdf9cdffc368169c2
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
