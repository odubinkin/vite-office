---
id: "202609141518-C5V3TD"
title: "Implement Workstream 5 browser editing isolation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T15:19:03.616Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T16:11:34.931Z"
  updated_by: "TESTER"
  note: "Workstream 5 acceptance verified: the full repository verification suite passed, including 100% unit and inventory coverage, nine Chromium E2E flows, build, provenance, source-tree, and parity gates."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T16:11:48.600Z"
  updated_by: "EVALUATOR"
  note: "Workstream 5 implementation satisfies the approved browser-editing isolation, single-host editing, and explicit Writer-operation scope."
  evaluated_sha: "e754ceabe6e90da8695040211dee1adf1e0a9ba8"
  blueprint_digest: "f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e"
  evidence_refs:
    - ".agentplane/tasks/202609141518-C5V3TD/README.md"
    - ".agentplane/tasks/202609141518-C5V3TD/quality/20260914-161148600-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141518-C5V3TD/quality/20260914-161148600-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141518-C5V3TD/quality/20260914-161148600-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141518-C5V3TD/blueprint/resolved-snapshot.json"
    - "implementation commit e754ceabe6e9"
    - "npm run verify: exit 0; 259 office tests and 84 inventory tests at 100% coverage; 9 Chromium E2E tests"
    - "source provenance check: 100 runtime modules; parity inventory: 34 implemented records and 0 exceptions"
  findings:
    - "React now projects document state while browser-specific selection, intent, IME, clipboard, and geometry behavior resides in isolated adapters."
    - "Cross-paragraph deletion, replacement, split, paste, and Select All retain SwWrtShell and SwPaM authority with Writer undo list actions."
    - "Guarded DOM reconciliation is observable and restricted to unsupported native input; ordinary beforeinput operations use explicit shell commands."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement Workstream 5 browser editing isolation, single logical editing host, explicit Writer edit intents, and acceptance coverage against the pinned upstream baseline."
events:
  -
    type: "status"
    at: "2026-09-14T15:19:09.021Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement Workstream 5 browser editing isolation, single logical editing host, explicit Writer edit intents, and acceptance coverage against the pinned upstream baseline."
  -
    type: "verify"
    at: "2026-09-14T16:11:34.931Z"
    author: "TESTER"
    state: "ok"
    note: "Workstream 5 acceptance verified: the full repository verification suite passed, including 100% unit and inventory coverage, nine Chromium E2E flows, build, provenance, source-tree, and parity gates."
doc_version: 3
doc_updated_at: "2026-09-14T16:11:35.065Z"
doc_updated_by: "CODER"
description: "Implement P5.1-P5.3 from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice baseline: isolate browser editing adapters from React, establish one logical document editing host with canonical Writer selection, and make explicit Writer operations the normal input path with an observable guarded reconciliation fallback."
sections:
  Summary: "Implement Workstream 5 (P5.1-P5.3) from the upstream parity plan: isolate browser editing behavior from React, replace paragraph editing islands with one logical document host, and route normal browser input through explicit Writer operations."
  Scope: "In scope: apps/office/src/sw/browser/editor/**; Writer document-view projection under apps/office/src/sw/source/uibase/docvw/**; narrowly required Writer shell/command changes; focused unit, integration, and Playwright tests; provenance/runtime inventory updates required by created or moved modules. Preserve current formatting, list, clipboard, undo, and ODT behavior. Use vendor/libreoffice-reference at the pinned baseline for applicable edit-window, selection, extended-text-input, and Writer shell semantics. No backward compatibility layer is required if persisted document state changes. Out of scope: new Writer features, XML architecture, session lifecycle, and unrelated UI refactors."
  Plan: "1. Inspect pinned LibreOffice edit-window, shell, selection, and extended-text-input code and record the bounded browser-applicable invariants. 2. Extract model-neutral browser selection, edit-intent, composition, clipboard-event, and geometry adapters from React rendering. 3. Convert the document projection to one root editing host while retaining paragraph projection nodes and canonical SwPaM authority. 4. Normalize typing, deletion, paragraph breaks, paste, and composition into explicit Writer operations; retain a diagnostic guarded fallback for unknown browser mutations. 5. Add or update unit/integration/E2E tests for cross-paragraph selection/editing, IME boundaries, formatting preservation, fallback observability, and safe rejection. 6. Update provenance/inventory records where module ownership changes, then run the declared verification suite."
  Verify Steps: "1. Run targeted Vitest suites for apps/office/src/sw/browser/editor and apps/office/src/sw/source/uibase/docvw. 2. Run targeted Playwright Writer selection, clipboard, cut/paste, character-formatting, and paragraph-editing coverage. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts before completion. Acceptance: React projection contains no document mutation algorithms; browser globals are isolated or injected; normalized intents reach Writer operations; IME commits once; one logical host supports cross-paragraph selection, Select All, copy, deletion, split/merge; ordinary edits and paste do not replace whole paragraphs; direct hints survive; fallback is observable; unknown input fails safely."
  Verification: |-
    npm run verify passed: formatting, ESLint, TypeScript, module boundaries for 100 runtime sources, 51 Vitest files and 259 tests at 100% coverage, 32 inventory files and 84 tests at 100% coverage, 9 Chromium E2E tests, production and static builds, JSDoc, file-size, source-tree, provenance for 100 runtime modules, and parity inventory with 34 implemented records and 0 exceptions. ap doctor passed with one pre-existing warning about historical task 202608130934-F1JT8K. Policy routing and git diff checks passed. Implementation commit: e754ceabe6e9.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T16:11:34.931Z — VERIFY — ok

    By: TESTER

    Note: Workstream 5 acceptance verified: the full repository verification suite passed, including 100% unit and inventory coverage, nine Chromium E2E flows, build, provenance, source-tree, and parity gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:11:22.725Z, excerpt_hash=sha256:c3c839f01998ad75cefe7382d41755704a9498fe1e93b3d71cdd2a02c4fc4156

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141518-C5V3TD/blueprint/resolved-snapshot.json
    - old_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
    - current_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141518-C5V3TD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141518-C5V3TD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and deterministic task-close commit. No storage compatibility migration will be added; if persisted schema changes, rollback restores the prior schema and behavior as a unit."
  Findings: |-
    Browser editing is isolated into selection, intent, composition, clipboard, and geometry adapters. The projection exposes one root editing host and paragraph nodes are projections only. Normal beforeinput operations mutate through SwWrtShell and SwPaM, including cross-paragraph delete, split, paste, and one-shot IME commit. Unsupported native mutations use an observable guarded reconciliation fallback. Delete grouping and selection contracts follow upstream wrtsh/delete.cxx and wrtsh/select.cxx responsibilities; the local selection filename divergence is recorded because select.ts is a guarded retired path. No persisted document schema changed, so no compatibility mechanism was introduced.

    - Observation: One logical Writer editing host now owns browser input, selection, clipboard, pointer geometry, and IME boundaries while model mutation remains in SwWrtShell.
      Impact: Cross-paragraph selection and editing use canonical SwPaM operations; normal edits preserve model formatting and unknown input is constrained to an observable guarded fallback.
      Resolution: Accepted implementation commit e754ceabe6e9 after npm run verify, ap doctor, policy routing, and clean diff checks.
id_source: "generated"
---
## Summary

Implement Workstream 5 (P5.1-P5.3) from the upstream parity plan: isolate browser editing behavior from React, replace paragraph editing islands with one logical document host, and route normal browser input through explicit Writer operations.

## Scope

In scope: apps/office/src/sw/browser/editor/**; Writer document-view projection under apps/office/src/sw/source/uibase/docvw/**; narrowly required Writer shell/command changes; focused unit, integration, and Playwright tests; provenance/runtime inventory updates required by created or moved modules. Preserve current formatting, list, clipboard, undo, and ODT behavior. Use vendor/libreoffice-reference at the pinned baseline for applicable edit-window, selection, extended-text-input, and Writer shell semantics. No backward compatibility layer is required if persisted document state changes. Out of scope: new Writer features, XML architecture, session lifecycle, and unrelated UI refactors.

## Plan

1. Inspect pinned LibreOffice edit-window, shell, selection, and extended-text-input code and record the bounded browser-applicable invariants. 2. Extract model-neutral browser selection, edit-intent, composition, clipboard-event, and geometry adapters from React rendering. 3. Convert the document projection to one root editing host while retaining paragraph projection nodes and canonical SwPaM authority. 4. Normalize typing, deletion, paragraph breaks, paste, and composition into explicit Writer operations; retain a diagnostic guarded fallback for unknown browser mutations. 5. Add or update unit/integration/E2E tests for cross-paragraph selection/editing, IME boundaries, formatting preservation, fallback observability, and safe rejection. 6. Update provenance/inventory records where module ownership changes, then run the declared verification suite.

## Verify Steps

1. Run targeted Vitest suites for apps/office/src/sw/browser/editor and apps/office/src/sw/source/uibase/docvw. 2. Run targeted Playwright Writer selection, clipboard, cut/paste, character-formatting, and paragraph-editing coverage. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts before completion. Acceptance: React projection contains no document mutation algorithms; browser globals are isolated or injected; normalized intents reach Writer operations; IME commits once; one logical host supports cross-paragraph selection, Select All, copy, deletion, split/merge; ordinary edits and paste do not replace whole paragraphs; direct hints survive; fallback is observable; unknown input fails safely.

## Verification

npm run verify passed: formatting, ESLint, TypeScript, module boundaries for 100 runtime sources, 51 Vitest files and 259 tests at 100% coverage, 32 inventory files and 84 tests at 100% coverage, 9 Chromium E2E tests, production and static builds, JSDoc, file-size, source-tree, provenance for 100 runtime modules, and parity inventory with 34 implemented records and 0 exceptions. ap doctor passed with one pre-existing warning about historical task 202608130934-F1JT8K. Policy routing and git diff checks passed. Implementation commit: e754ceabe6e9.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T16:11:34.931Z — VERIFY — ok

By: TESTER

Note: Workstream 5 acceptance verified: the full repository verification suite passed, including 100% unit and inventory coverage, nine Chromium E2E flows, build, provenance, source-tree, and parity gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T16:11:22.725Z, excerpt_hash=sha256:c3c839f01998ad75cefe7382d41755704a9498fe1e93b3d71cdd2a02c4fc4156

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141518-C5V3TD/blueprint/resolved-snapshot.json
- old_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
- current_digest: f93e97a3c3c5055f88efe979a29d04d2b71f98393010ea2a3dea06a4ec45632e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141518-C5V3TD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141518-C5V3TD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and deterministic task-close commit. No storage compatibility migration will be added; if persisted schema changes, rollback restores the prior schema and behavior as a unit.

## Findings

Browser editing is isolated into selection, intent, composition, clipboard, and geometry adapters. The projection exposes one root editing host and paragraph nodes are projections only. Normal beforeinput operations mutate through SwWrtShell and SwPaM, including cross-paragraph delete, split, paste, and one-shot IME commit. Unsupported native mutations use an observable guarded reconciliation fallback. Delete grouping and selection contracts follow upstream wrtsh/delete.cxx and wrtsh/select.cxx responsibilities; the local selection filename divergence is recorded because select.ts is a guarded retired path. No persisted document schema changed, so no compatibility mechanism was introduced.

- Observation: One logical Writer editing host now owns browser input, selection, clipboard, pointer geometry, and IME boundaries while model mutation remains in SwWrtShell.
  Impact: Cross-paragraph selection and editing use canonical SwPaM operations; normal edits preserve model formatting and unknown input is constrained to an observable guarded fallback.
  Resolution: Accepted implementation commit e754ceabe6e9 after npm run verify, ap doctor, policy routing, and clean diff checks.
