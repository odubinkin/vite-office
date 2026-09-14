---
id: "202609141201-7V5AK0"
title: "Implement Writer Workstream 1 mutation and undo path"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T12:01:36.073Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T12:35:29.202Z"
  updated_by: "TESTER"
  note: "Workstream 1 passed targeted mutation/save tests, the complete repository verification pipeline, clone audit, doctor, routing validation, and clean-state inspection."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T12:35:39.903Z"
  updated_by: "EVALUATOR"
  note: "Workstream 1 has one live Writer mutation path and adapter-confirmed save acknowledgement, with complete automated regression coverage."
  evaluated_sha: "88cfdc53054e081c431ab3070dca7203ccdf2fae"
  blueprint_digest: "3ba1fa7ca8d18abe96c990298bae5a756dc6c96ebeed5b3e6c4c31e6ee1d3292"
  evidence_refs:
    - ".agentplane/tasks/202609141201-7V5AK0/README.md"
    - ".agentplane/tasks/202609141201-7V5AK0/quality/20260914-123539903-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141201-7V5AK0/quality/20260914-123539903-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141201-7V5AK0/quality/20260914-123539903-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141201-7V5AK0/blueprint/resolved-snapshot.json"
    - "implementation commit 88cfdc53054e"
    - "npm run verify: pass; 233 Office tests and 84 inventory tests at 100% coverage; 9 E2E tests passed"
    - "production SwDoc clone audit: zero call sites"
  findings:
    - "No blocking findings: legacy clone facades are absent, save races preserve modified state, and failed or stale acknowledgements cannot move the save mark."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-14T12:01:48.265Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-14T12:35:29.202Z"
    author: "TESTER"
    state: "ok"
    note: "Workstream 1 passed targeted mutation/save tests, the complete repository verification pipeline, clone audit, doctor, routing validation, and clean-state inspection."
doc_version: 3
doc_updated_at: "2026-09-14T12:35:29.276Z"
doc_updated_by: "CODER"
description: "Retire clone-based Writer mutation facades and make SwDocShell acknowledge exact persisted generations after confirmed storage."
sections:
  Summary: "Implement Workstream 1 from docs/program/vite-office-upstream-parity-plan.md: establish one mutable Writer command path with action undo, and acknowledge primary saves on the live SwDoc only after confirmed persistence."
  Scope: "Remove exported clone-based mutation helpers and migrate their callers/tests to SwWrtShell, SwPaM, DocumentContentOperationsManager, or fixture-only utilities. Update writer-storage and SwDocShell save evidence/marks for concurrent mutations. Update directly affected runtime inventory, provenance, parity assertions, and stale prose. Preserve SwDoc.clone only for persistence, Worker transfer, and explicit test isolation. No Workstream 2 work and no storage-schema changes."
  Plan: "1. Inventory all runtime SwDoc.clone callers and map each mutation to existing Writer shell/core operations and pinned LibreOffice symbols. 2. Remove duplicate functional-clone facades; migrate runtime callers and tests to the mutable action/undo path, moving unavoidable builders under test utilities. 3. Return storage evidence from saveWriterDocument and make SwDocShell acknowledge the captured committed generation and matching undo position after success. 4. Add regressions for concurrent edit during save, independent primary/recovery generations, failed writes, identity preservation, and one-path undo. 5. Synchronize affected inventories and run targeted plus full verification."
  Verify Steps: "1. Run targeted Vitest for Writer core, shell/undo, storage, document shell, view session, and affected command tests. 2. Assert with rg that production command code no longer calls SwDoc.clone outside approved persistence/Worker boundaries. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Inspect git status --short --untracked-files=all for intentional task-only changes."
  Verification: |-
    - Command: `npm exec --workspace @vite-office/office -- vitest run src/sfx2/source/doc/docundomanager.test.ts src/sw/source/core/doc/writer.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/doc/writer-storage.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/uiview/view-session.test.tsx`
      Result: pass.
      Evidence: 8 files and 62 tests passed.
      Scope: Writer construction/model, storage, action undo, document shell, canonical write shell, and view-session save wiring.
    - Command: `rg -n "\.clone\(\)" apps/office/src --glob '!**/*.test.*' --glob '!**/test/**'` filtered for `SwDoc|writerDocument|GetDoc`.
      Result: pass.
      Evidence: no production `SwDoc` clone call sites; remaining clones are value objects (positions, hints, numbering formats/rules).
      Scope: all production Office sources.
    - Command: `npm run verify`.
      Result: pass.
      Evidence: formatting, lint, types, module boundaries, 233 Office tests at 100% coverage, 84 inventory tests at 100% coverage, 9 Playwright E2E tests, static build, docs/file-size/source-tree/provenance/parity gates all passed.
      Scope: complete repository verification pipeline.
    - Command: `ap doctor`.
      Result: pass.
      Evidence: doctor OK with no errors; one pre-existing warning references an unrelated completed task.
      Scope: agentplane workspace and workflow health.
    - Command: `node .agentplane/policy/check-routing.mjs`.
      Result: pass.
      Evidence: policy routing OK.
      Scope: repository policy routing.
    - Command: `git status --short --untracked-files=all`.
      Result: pass.
      Evidence: clean immediately after implementation commit `88cfdc53054e`.
      Scope: intentional task-only tracked and untracked state.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T12:35:29.202Z — VERIFY — ok

    By: TESTER

    Note: Workstream 1 passed targeted mutation/save tests, the complete repository verification pipeline, clone audit, doctor, routing validation, and clean-state inspection.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T12:35:19.327Z, excerpt_hash=sha256:f96a0b41e349e557833b6ad30d8df739df0251a9736519b619dc9b40252ef9c7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141201-7V5AK0/blueprint/resolved-snapshot.json
    - old_digest: 3ba1fa7ca8d18abe96c990298bae5a756dc6c96ebeed5b3e6c4c31e6ee1d3292
    - current_digest: 3ba1fa7ca8d18abe96c990298bae5a756dc6c96ebeed5b3e6c4c31e6ee1d3292
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141201-7V5AK0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141201-7V5AK0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation and task metadata commits. No data migration or persistent schema change is planned."
  Findings: |-
    Workstream 1 is implemented with no residual in-scope gap. Interactive mutations use the live `SwDoc` through `SwWrtShell` and action undo; clone-based command facades and the persistence acknowledgement clone are retired. Save completion acknowledges only adapter-confirmed evidence for the captured document generation and undo boundary, so concurrent mutation remains dirty and failures do not move the mark.

    The first full verification run exposed an obsolete source-tree requirement for retired `txtattr.ts` and `txtnum.ts`; the gate now requires `wrtsh.ts` and forbids those duplicate facades. The final full verification passed. `ap doctor` retains one unrelated pre-existing warning about an older DONE task commit reference; it does not affect this task.
id_source: "generated"
---
## Summary

Implement Workstream 1 from docs/program/vite-office-upstream-parity-plan.md: establish one mutable Writer command path with action undo, and acknowledge primary saves on the live SwDoc only after confirmed persistence.

## Scope

Remove exported clone-based mutation helpers and migrate their callers/tests to SwWrtShell, SwPaM, DocumentContentOperationsManager, or fixture-only utilities. Update writer-storage and SwDocShell save evidence/marks for concurrent mutations. Update directly affected runtime inventory, provenance, parity assertions, and stale prose. Preserve SwDoc.clone only for persistence, Worker transfer, and explicit test isolation. No Workstream 2 work and no storage-schema changes.

## Plan

1. Inventory all runtime SwDoc.clone callers and map each mutation to existing Writer shell/core operations and pinned LibreOffice symbols. 2. Remove duplicate functional-clone facades; migrate runtime callers and tests to the mutable action/undo path, moving unavoidable builders under test utilities. 3. Return storage evidence from saveWriterDocument and make SwDocShell acknowledge the captured committed generation and matching undo position after success. 4. Add regressions for concurrent edit during save, independent primary/recovery generations, failed writes, identity preservation, and one-path undo. 5. Synchronize affected inventories and run targeted plus full verification.

## Verify Steps

1. Run targeted Vitest for Writer core, shell/undo, storage, document shell, view session, and affected command tests. 2. Assert with rg that production command code no longer calls SwDoc.clone outside approved persistence/Worker boundaries. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Inspect git status --short --untracked-files=all for intentional task-only changes.

## Verification

- Command: `npm exec --workspace @vite-office/office -- vitest run src/sfx2/source/doc/docundomanager.test.ts src/sw/source/core/doc/writer.test.ts src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/doc/writer-storage.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/uiview/view-session.test.tsx`
  Result: pass.
  Evidence: 8 files and 62 tests passed.
  Scope: Writer construction/model, storage, action undo, document shell, canonical write shell, and view-session save wiring.
- Command: `rg -n "\.clone\(\)" apps/office/src --glob '!**/*.test.*' --glob '!**/test/**'` filtered for `SwDoc|writerDocument|GetDoc`.
  Result: pass.
  Evidence: no production `SwDoc` clone call sites; remaining clones are value objects (positions, hints, numbering formats/rules).
  Scope: all production Office sources.
- Command: `npm run verify`.
  Result: pass.
  Evidence: formatting, lint, types, module boundaries, 233 Office tests at 100% coverage, 84 inventory tests at 100% coverage, 9 Playwright E2E tests, static build, docs/file-size/source-tree/provenance/parity gates all passed.
  Scope: complete repository verification pipeline.
- Command: `ap doctor`.
  Result: pass.
  Evidence: doctor OK with no errors; one pre-existing warning references an unrelated completed task.
  Scope: agentplane workspace and workflow health.
- Command: `node .agentplane/policy/check-routing.mjs`.
  Result: pass.
  Evidence: policy routing OK.
  Scope: repository policy routing.
- Command: `git status --short --untracked-files=all`.
  Result: pass.
  Evidence: clean immediately after implementation commit `88cfdc53054e`.
  Scope: intentional task-only tracked and untracked state.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T12:35:29.202Z — VERIFY — ok

By: TESTER

Note: Workstream 1 passed targeted mutation/save tests, the complete repository verification pipeline, clone audit, doctor, routing validation, and clean-state inspection.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T12:35:19.327Z, excerpt_hash=sha256:f96a0b41e349e557833b6ad30d8df739df0251a9736519b619dc9b40252ef9c7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141201-7V5AK0/blueprint/resolved-snapshot.json
- old_digest: 3ba1fa7ca8d18abe96c990298bae5a756dc6c96ebeed5b3e6c4c31e6ee1d3292
- current_digest: 3ba1fa7ca8d18abe96c990298bae5a756dc6c96ebeed5b3e6c4c31e6ee1d3292
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141201-7V5AK0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141201-7V5AK0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation and task metadata commits. No data migration or persistent schema change is planned.

## Findings

Workstream 1 is implemented with no residual in-scope gap. Interactive mutations use the live `SwDoc` through `SwWrtShell` and action undo; clone-based command facades and the persistence acknowledgement clone are retired. Save completion acknowledges only adapter-confirmed evidence for the captured document generation and undo boundary, so concurrent mutation remains dirty and failures do not move the mark.

The first full verification run exposed an obsolete source-tree requirement for retired `txtattr.ts` and `txtnum.ts`; the gate now requires `wrtsh.ts` and forbids those duplicate facades. The final full verification passed. `ap doctor` retains one unrelated pre-existing warning about an older DONE task commit reference; it does not affect this task.
