---
id: "202611280829-F6M8VX"
title: "Connect Writer Navigator table actions and cursor eligibility"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run only affected Navigator, table cursor, dialog, and undo tests and relevant Chromium cases. Run scoped static checks and the production build."
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:29:40.188Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T09:00:51.375Z"
  updated_by: "CODER"
  note: "40 focused Writer tests passed with six optional probes skipped. Chromium table selection, properties, inline rename, deletion and Undo passed. TypeScript, Vite build, Writer resources, source tree, module boundaries, scoped lint, format and provenance passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T09:00:54.855Z"
  updated_by: "EVALUATOR"
  note: "Navigator table actions use the Writer table slots and retained native undo section."
  evaluated_sha: "4efd1c127c603ecbccbcd4ec5db49a7fb7359bac"
  blueprint_digest: "72b47fce43da506d2240db4491c10463d89f2ac19e6e99fbff88de5a91c696ca"
  evidence_refs:
    - ".agentplane/tasks/202611280829-F6M8VX/README.md"
    - ".agentplane/tasks/202611280829-F6M8VX/quality/20261128-090054855-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280829-F6M8VX/quality/20261128-090054855-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280829-F6M8VX/quality/20261128-090054855-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280829-F6M8VX/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-table-verified-vitest.log"
    - "output/playwright/writer-navigator-table-chromium.log"
  findings:
    - "Protected traversal, grouped deletion, original cell and bookmark restoration, and the complete browser flow passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-28T08:30:01.971Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-28T09:00:51.375Z"
    author: "CODER"
    state: "ok"
    note: "40 focused Writer tests passed with six optional probes skipped. Chromium table selection, properties, inline rename, deletion and Undo passed. TypeScript, Vite build, Writer resources, source tree, module boundaries, scoped lint, format and provenance passed."
doc_version: 3
doc_updated_at: "2026-11-28T09:00:51.616Z"
doc_updated_by: "CODER"
description: "Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core."
sections:
  Summary: |-
    Connect Writer Navigator table actions and cursor eligibility

    Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.
  Scope: |-
    - In scope: Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.
    - Out of scope: unrelated refactors not required for "Connect Writer Navigator table actions and cursor eligibility".
  Plan: "Trace the pinned table context menu, protected-cell traversal, selection, rename and deletion paths through both graphs and source. Reuse Writer table shell, properties dialog and node/history owners for Navigator table commands. Implement missing native deletion and protection contracts within the table model and preserve cursor state across undo and redo. Validate connected table actions and traversal with only affected tests and focused Chromium scenarios."
  Verify Steps: "Run the affected Navigator, table shell, table cursor, properties and history tests plus focused Chromium table actions. Run TypeScript, production build, resource, scoped dependency, format, lint and provenance checks. Use no full test run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T09:00:51.375Z — VERIFY — ok

    By: CODER

    Note: 40 focused Writer tests passed with six optional probes skipped. Chromium table selection, properties, inline rename, deletion and Undo passed. TypeScript, Vite build, Writer resources, source tree, module boundaries, scoped lint, format and provenance passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T09:00:46.415Z, excerpt_hash=sha256:c04f23968af0f68e03f8e7e0addf60233015dfe737e7f655ce7aa0392e16b45c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611280829-F6M8VX/blueprint/resolved-snapshot.json
    - old_digest: 72b47fce43da506d2240db4491c10463d89f2ac19e6e99fbff88de5a91c696ca
    - current_digest: 72b47fce43da506d2240db4491c10463d89f2ac19e6e99fbff88de5a91c696ca
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280829-F6M8VX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280829-F6M8VX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Command: `vitest run --config vitest.writer.config.ts --maxWorkers 1 --testTimeout 150000 src/sw/source/uibase/uiview/view-navigation.test.ts src/sw/source/uibase/wrtsh/native-table-name-history.test.ts src/sw/source/uibase/uiview/view.test.ts src/sw/browser/presentation/WriterNavigator.test.tsx`. Result: pass. Evidence: 40 passed, six optional search probes skipped. Scope: table navigation and protection, grouped deletion, original cell and bookmark restoration, shell slots and mounted Navigator.
    - Command: `playwright test --config output/playwright/writer-checkpoint-recheck.config.ts --project writer --workers 1 --timeout 120000 --output output/playwright/writer-navigator-table-browser writer-navigator.spec.ts -g 'selects, edits, renames and deletes a table'`. Result: pass. Evidence: one Chromium test passed. Scope: Navigator selection, properties, inline rename, deletion and Undo through normal Writer UI.
    - Commands: `tsc --noEmit --singleThreaded --incremental --tsBuildInfoFile ../../output/playwright/writer-tracking-check.tsbuildinfo` and `vite build`. Result: pass. Evidence: TypeScript exited without diagnostics and Vite built the production application. Scope: Writer integration.
    - Commands: scoped `eslint` and `prettier --check`, `npm run check:writer-resources`, `npm run check:source-tree`, `npm run check:dependencies`, `git diff --check`, and `node --import tsx --input-type=module` using the source provenance validator on the nine changed Writer registry modules. Result: pass. Evidence: 2 resource tests, 116 source-tree paths, 3146 dependency sources, and nine provenance modules passed.
    - Skipped: full test suite. Reason: the user required affected-module verification because the full run overloads the machine. Risk: unrelated regressions outside the checked scope are unmeasured. Approval: user goal instructions.
    - Scope limit: complete table deletion exercises normal table sections and native bookmark history. Tracked table deletion and specialized sections such as a sole table in a floating frame are outside the verified scenarios.
id_source: "generated"
---
## Summary

Connect Writer Navigator table actions and cursor eligibility

Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.

## Scope

- In scope: Connect native Navigator table selection, table properties, rename and deletion to the existing Writer table model and undo owners. Follow native table context admission and directional traversal to accessible cells, including nested tables supported by the core.
- Out of scope: unrelated refactors not required for "Connect Writer Navigator table actions and cursor eligibility".

## Plan

Trace the pinned table context menu, protected-cell traversal, selection, rename and deletion paths through both graphs and source. Reuse Writer table shell, properties dialog and node/history owners for Navigator table commands. Implement missing native deletion and protection contracts within the table model and preserve cursor state across undo and redo. Validate connected table actions and traversal with only affected tests and focused Chromium scenarios.

## Verify Steps

Run the affected Navigator, table shell, table cursor, properties and history tests plus focused Chromium table actions. Run TypeScript, production build, resource, scoped dependency, format, lint and provenance checks. Use no full test run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T09:00:51.375Z — VERIFY — ok

By: CODER

Note: 40 focused Writer tests passed with six optional probes skipped. Chromium table selection, properties, inline rename, deletion and Undo passed. TypeScript, Vite build, Writer resources, source tree, module boundaries, scoped lint, format and provenance passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T09:00:46.415Z, excerpt_hash=sha256:c04f23968af0f68e03f8e7e0addf60233015dfe737e7f655ce7aa0392e16b45c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611280829-F6M8VX/blueprint/resolved-snapshot.json
- old_digest: 72b47fce43da506d2240db4491c10463d89f2ac19e6e99fbff88de5a91c696ca
- current_digest: 72b47fce43da506d2240db4491c10463d89f2ac19e6e99fbff88de5a91c696ca
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280829-F6M8VX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280829-F6M8VX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Command: `vitest run --config vitest.writer.config.ts --maxWorkers 1 --testTimeout 150000 src/sw/source/uibase/uiview/view-navigation.test.ts src/sw/source/uibase/wrtsh/native-table-name-history.test.ts src/sw/source/uibase/uiview/view.test.ts src/sw/browser/presentation/WriterNavigator.test.tsx`. Result: pass. Evidence: 40 passed, six optional search probes skipped. Scope: table navigation and protection, grouped deletion, original cell and bookmark restoration, shell slots and mounted Navigator.
- Command: `playwright test --config output/playwright/writer-checkpoint-recheck.config.ts --project writer --workers 1 --timeout 120000 --output output/playwright/writer-navigator-table-browser writer-navigator.spec.ts -g 'selects, edits, renames and deletes a table'`. Result: pass. Evidence: one Chromium test passed. Scope: Navigator selection, properties, inline rename, deletion and Undo through normal Writer UI.
- Commands: `tsc --noEmit --singleThreaded --incremental --tsBuildInfoFile ../../output/playwright/writer-tracking-check.tsbuildinfo` and `vite build`. Result: pass. Evidence: TypeScript exited without diagnostics and Vite built the production application. Scope: Writer integration.
- Commands: scoped `eslint` and `prettier --check`, `npm run check:writer-resources`, `npm run check:source-tree`, `npm run check:dependencies`, `git diff --check`, and `node --import tsx --input-type=module` using the source provenance validator on the nine changed Writer registry modules. Result: pass. Evidence: 2 resource tests, 116 source-tree paths, 3146 dependency sources, and nine provenance modules passed.
- Skipped: full test suite. Reason: the user required affected-module verification because the full run overloads the machine. Risk: unrelated regressions outside the checked scope are unmeasured. Approval: user goal instructions.
- Scope limit: complete table deletion exercises normal table sections and native bookmark history. Tracked table deletion and specialized sections such as a sole table in a floating frame are outside the verified scenarios.
