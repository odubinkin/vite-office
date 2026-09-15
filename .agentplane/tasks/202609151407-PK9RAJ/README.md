---
id: "202609151407-PK9RAJ"
title: "Implement Writer upstream parity Phase 4"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T14:07:52.588Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T15:19:19.962Z"
  updated_by: "CODER"
  note: "verified-202609151407-PK9RAJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T15:19:07.129Z"
  updated_by: "EVALUATOR"
  note: "Phase 4 implementation matches the approved Writer upstream-parity scope and passes the complete repository verification contract."
  evaluated_sha: "8909374eaaa5ac675bf6eccf059a612b4ec0167c"
  blueprint_digest: "a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb"
  evidence_refs:
    - ".agentplane/tasks/202609151407-PK9RAJ/README.md"
    - ".agentplane/tasks/202609151407-PK9RAJ/quality/20260915-151907129-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609151407-PK9RAJ/quality/20260915-151907129-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609151407-PK9RAJ/quality/20260915-151907129-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "No blocking quality findings: lifecycle ownership, upstream-aligned view/list/transferable structure, schema 6 persistence, and dispatch error boundaries are covered by focused, full unit, inventory, browser e2e, build, static, documentation, provenance, and parity checks."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T14:08:05.933Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-15T15:17:59.627Z"
    author: "CODER"
    state: "ok"
    note: "Phase 4 verified: 76 focused tests passed; full npm run verify passed with 312 unit tests and 88 inventory tests at 100% coverage, 10 browser e2e tests, build/static/docs/source-tree/provenance/invariant/parity checks; Agentplane doctor and policy routing passed."
  -
    type: "verify"
    at: "2026-09-15T15:18:49.853Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609151407-PK9RAJ"
  -
    type: "verify"
    at: "2026-09-15T15:19:19.962Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609151407-PK9RAJ"
doc_version: 3
doc_updated_at: "2026-09-15T15:19:20.038Z"
doc_updated_by: "CODER"
description: "Restore shell, medium, lifecycle, browser workflow, and undo ownership for the supported Writer slice using pinned LibreOffice 26.8.0.2 semantics; update tests and parity evidence; verify and push main."
sections:
  Summary: |-
    Implement Writer upstream parity Phase 4

    Restore shell, medium, lifecycle, browser workflow, and undo ownership for the supported Writer slice using pinned LibreOffice 26.8.0.2 semantics; update tests and parity evidence; verify and push main.
  Scope: |-
    - In scope: P4.1 object-identity SfxMedium and shell-owned lifecycle/save/recovery state; P4.2 SwDocShell, SwView, SwWrtShell and bounded context/list shell ownership; P4.3 decomposition of file, transfer, view-option and operation-state workflows; P4.4 undo grouping, comments, cursor/list/style/save-mark integration; necessary tests, provenance and parity inventories.
    - Authority: pinned vendor/libreoffice-reference tag libreoffice-26.8.0.2 at commit 9bc445578031fecf56086729d8e4940c77e14d65.
    - Browser adaptations remain narrow ports at browser/vcl boundaries.
    - No backward compatibility for superseded persisted document snapshots.
    - Out of scope: independent Phase 5 DOM projection and Phase 7 filter/storage redesign beyond dependencies strictly required by Phase 4.
  Plan: "Implement approved Phase 4 as one atomic CODER-owned deliverable with upstream-derived shell, medium, lifecycle, workflow, and undo ownership; verify focused behavior and the full repository; finish and push main."
  Verify Steps: |-
    1. `npm exec --workspace @vite-office/office -- vitest run src/sfx2/source/doc/docfile.test.ts src/sfx2/source/doc/objsh.test.ts src/svl/source/undo/undo.test.ts src/sw/source/core/doc/writer-storage.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/uiview/view.test.tsx src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/browser/workflows/writer-workflows.test.ts src/framework/source/services/autorecovery.test.ts` — expected: focused shell, lifecycle, workflow, recovery, and undo tests pass.
    2. `npm run typecheck` — expected: production and tooling TypeScript contracts compile.
    3. `npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity` — expected: ownership boundaries, upstream paths, evidence, and parity mappings pass.
    4. `npm run verify` — expected: complete repository validation, coverage, browser e2e, build, inventories, formatting, lint, and static checks pass.
    5. `ap doctor && node .agentplane/policy/check-routing.mjs` — expected: Agentplane health and policy routing pass.
    6. `git status --short --untracked-files=all` — expected: no unintended changes or unreviewed artifacts remain before finish/push.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T15:17:59.627Z — VERIFY — ok

    By: CODER

    Note: Phase 4 verified: 76 focused tests passed; full npm run verify passed with 312 unit tests and 88 inventory tests at 100% coverage, 10 browser e2e tests, build/static/docs/source-tree/provenance/invariant/parity checks; Agentplane doctor and policy routing passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T14:33:58.258Z, excerpt_hash=sha256:f045d4d5a3018a986e8fc6a07b3ced54736317d808992566669b59793d20b22e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json
    - old_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
    - current_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151407-PK9RAJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609151407-PK9RAJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T15:18:49.853Z — VERIFY — ok

    By: CODER

    Note: verified-202609151407-PK9RAJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T15:17:59.708Z, excerpt_hash=sha256:f045d4d5a3018a986e8fc6a07b3ced54736317d808992566669b59793d20b22e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json
    - old_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
    - current_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151407-PK9RAJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609151407-PK9RAJ --result verified-202609151407-PK9RAJ --commit 8909374eaaa5ac675bf6eccf059a612b4ec0167c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T15:19:19.962Z — VERIFY — ok

    By: CODER

    Note: verified-202609151407-PK9RAJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T15:18:49.935Z, excerpt_hash=sha256:f045d4d5a3018a986e8fc6a07b3ced54736317d808992566669b59793d20b22e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json
    - old_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
    - current_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151407-PK9RAJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609151407-PK9RAJ --result verified-202609151407-PK9RAJ --commit 8909374eaaa5ac675bf6eccf059a612b4ec0167c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the Phase 4 implementation and Agentplane lifecycle commits.
    - Do not restore compatibility shims for the superseded persistence model.
    - Re-run focused tests and npm run verify after rollback.
  Findings: |-
    - Observation: Writer Phase 4 shell, lifecycle, view, clipboard, list, persistence schema, and dispatch ownership changes pass the declared verification contract.
      Impact: The implementation is ready for a task-scoped commit and direct-workflow finish.
      Resolution: Recorded successful focused and full repository verification.
id_source: "generated"
---
## Summary

Implement Writer upstream parity Phase 4

Restore shell, medium, lifecycle, browser workflow, and undo ownership for the supported Writer slice using pinned LibreOffice 26.8.0.2 semantics; update tests and parity evidence; verify and push main.

## Scope

- In scope: P4.1 object-identity SfxMedium and shell-owned lifecycle/save/recovery state; P4.2 SwDocShell, SwView, SwWrtShell and bounded context/list shell ownership; P4.3 decomposition of file, transfer, view-option and operation-state workflows; P4.4 undo grouping, comments, cursor/list/style/save-mark integration; necessary tests, provenance and parity inventories.
- Authority: pinned vendor/libreoffice-reference tag libreoffice-26.8.0.2 at commit 9bc445578031fecf56086729d8e4940c77e14d65.
- Browser adaptations remain narrow ports at browser/vcl boundaries.
- No backward compatibility for superseded persisted document snapshots.
- Out of scope: independent Phase 5 DOM projection and Phase 7 filter/storage redesign beyond dependencies strictly required by Phase 4.

## Plan

Implement approved Phase 4 as one atomic CODER-owned deliverable with upstream-derived shell, medium, lifecycle, workflow, and undo ownership; verify focused behavior and the full repository; finish and push main.

## Verify Steps

1. `npm exec --workspace @vite-office/office -- vitest run src/sfx2/source/doc/docfile.test.ts src/sfx2/source/doc/objsh.test.ts src/svl/source/undo/undo.test.ts src/sw/source/core/doc/writer-storage.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/uiview/view.test.tsx src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/browser/workflows/writer-workflows.test.ts src/framework/source/services/autorecovery.test.ts` — expected: focused shell, lifecycle, workflow, recovery, and undo tests pass.
2. `npm run typecheck` — expected: production and tooling TypeScript contracts compile.
3. `npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity` — expected: ownership boundaries, upstream paths, evidence, and parity mappings pass.
4. `npm run verify` — expected: complete repository validation, coverage, browser e2e, build, inventories, formatting, lint, and static checks pass.
5. `ap doctor && node .agentplane/policy/check-routing.mjs` — expected: Agentplane health and policy routing pass.
6. `git status --short --untracked-files=all` — expected: no unintended changes or unreviewed artifacts remain before finish/push.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T15:17:59.627Z — VERIFY — ok

By: CODER

Note: Phase 4 verified: 76 focused tests passed; full npm run verify passed with 312 unit tests and 88 inventory tests at 100% coverage, 10 browser e2e tests, build/static/docs/source-tree/provenance/invariant/parity checks; Agentplane doctor and policy routing passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T14:33:58.258Z, excerpt_hash=sha256:f045d4d5a3018a986e8fc6a07b3ced54736317d808992566669b59793d20b22e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json
- old_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
- current_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151407-PK9RAJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609151407-PK9RAJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T15:18:49.853Z — VERIFY — ok

By: CODER

Note: verified-202609151407-PK9RAJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T15:17:59.708Z, excerpt_hash=sha256:f045d4d5a3018a986e8fc6a07b3ced54736317d808992566669b59793d20b22e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json
- old_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
- current_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151407-PK9RAJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609151407-PK9RAJ --result verified-202609151407-PK9RAJ --commit 8909374eaaa5ac675bf6eccf059a612b4ec0167c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T15:19:19.962Z — VERIFY — ok

By: CODER

Note: verified-202609151407-PK9RAJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T15:18:49.935Z, excerpt_hash=sha256:f045d4d5a3018a986e8fc6a07b3ced54736317d808992566669b59793d20b22e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151407-PK9RAJ/blueprint/resolved-snapshot.json
- old_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
- current_digest: a2fda36bd4479a998deadcd1b205e1980eb4ed2bbf5058c2617eff20269772eb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151407-PK9RAJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609151407-PK9RAJ --result verified-202609151407-PK9RAJ --commit 8909374eaaa5ac675bf6eccf059a612b4ec0167c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the Phase 4 implementation and Agentplane lifecycle commits.
- Do not restore compatibility shims for the superseded persistence model.
- Re-run focused tests and npm run verify after rollback.

## Findings

- Observation: Writer Phase 4 shell, lifecycle, view, clipboard, list, persistence schema, and dispatch ownership changes pass the declared verification contract.
  Impact: The implementation is ready for a task-scoped commit and direct-workflow finish.
  Resolution: Recorded successful focused and full repository verification.
