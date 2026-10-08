---
id: "202610080502-BKYEAC"
title: "Handle browser document name collisions and content-based autosave titles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T05:02:50.055Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T05:09:44.310Z"
  updated_by: "CODER"
  note: "Focused Writer persistence/UI tests, format, lint, type checks, dependency boundaries, JSDoc, file-size, production static build, routing, and doctor all passed; 34 focused tests are green."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Writer browser import collision choices, two-word automatic titles, focused regression coverage, and intentional upstream-divergence documentation."
events:
  -
    type: "status"
    at: "2026-10-08T05:02:55.258Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer browser import collision choices, two-word automatic titles, focused regression coverage, and intentional upstream-divergence documentation."
  -
    type: "verify"
    at: "2026-10-08T05:09:44.310Z"
    author: "CODER"
    state: "ok"
    note: "Focused Writer persistence/UI tests, format, lint, type checks, dependency boundaries, JSDoc, file-size, production static build, routing, and doctor all passed; 34 focused tests are green."
doc_version: 3
doc_updated_at: "2026-10-08T05:09:44.362Z"
doc_updated_by: "CODER"
description: "Prompt on imported filename collisions, derive first-save titles from the first two words, allocate indexed names, cover behavior with tests, and document the intentional upstream divergence."
sections:
  Summary: "Implement collision-safe browser file import and two-word automatic naming for new Writer documents, with explicit product documentation of the divergence from pinned LibreOffice behavior."
  Scope: "Modify the browser Writer storage/workflow/dialog boundaries and focused tests. Imported ODT/TXT filename collisions must offer overwrite or a prefilled unique indexed name. Untitled documents become persistence-eligible only after two normalized words and receive a unique title derived from those words. Update canonical browser persistence documentation."
  Plan: "1. Add reusable title normalization and collision allocation at the browser persistence boundary. 2. Gate first autosave of untitled documents on two words and adopt the unique derived title. 3. Add an import-collision confirmation UI supporting overwrite and save-new flows for ODT and TXT. 4. Add workflow, store, and dialog tests. 5. Document the intentional upstream divergence. 6. Run targeted tests plus repository verification gates and record evidence."
  Verify Steps: "1. Run focused Vitest coverage for writer-odt-io, writer-odt-store, WriterFileDialog, and desktop integration; all pass and assert two-word thresholds, derived titles, indexed collisions, overwrite, and save-new import behavior. 2. Run the repository formatting, lint, type, dependency, JSDoc, file-size, and static-build checks exposed by package scripts for the touched application. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor successfully. 4. Review git diff and git status so only task-scoped implementation, tests, documentation, and Agentplane task artifacts remain."
  Verification: |-
    Command: npm exec vitest -- run src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/storage/writer-odt-store.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx src/framework/browser/app/desktop.test.tsx (from apps/office). Result: pass. Evidence: 4 files and 34 tests passed. Scope: automatic title threshold/indexing plus import overwrite/save-new UI and desktop integration. Command: npm run format:check && npm run lint && npm run typecheck && npm run check:dependencies && npm run check:docs && npm run check:file-size. Result: pass. Evidence: formatting, ESLint, TypeScript, 302-source module boundaries, 972-source JSDoc, and file-size scan passed. Scope: changed source/tests/docs. Command: npm run test:static. Result: pass. Evidence: Vite production build and static build smoke passed. Scope: deployable browser bundle. Command: node .agentplane/policy/check-routing.mjs && ap doctor. Result: pass. Evidence: routing OK; doctor OK with unrelated pre-existing warnings. Scope: repository workflow health.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T05:09:44.310Z — VERIFY — ok

    By: CODER

    Note: Focused Writer persistence/UI tests, format, lint, type checks, dependency boundaries, JSDoc, file-size, production static build, routing, and doctor all passed; 34 focused tests are green.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T05:09:43.922Z, excerpt_hash=sha256:dc9fa04aded8224596cb25d7938e5ec0e5bd5a6dc1662ac8fad579e30e3ec4f0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080502-BKYEAC/blueprint/resolved-snapshot.json
    - old_digest: 6cf793054d0ce84d3a665f15ada642ac190200ae72ead5812e1dde43e8ab59ea
    - current_digest: 6cf793054d0ce84d3a665f15ada642ac190200ae72ead5812e1dde43e8ab59ea
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610080502-BKYEAC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610080502-BKYEAC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and the deterministic Agentplane close commit; IndexedDB schema remains unchanged, so existing browser documents require no data migration or rollback."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Implement collision-safe browser file import and two-word automatic naming for new Writer documents, with explicit product documentation of the divergence from pinned LibreOffice behavior.

## Scope

Modify the browser Writer storage/workflow/dialog boundaries and focused tests. Imported ODT/TXT filename collisions must offer overwrite or a prefilled unique indexed name. Untitled documents become persistence-eligible only after two normalized words and receive a unique title derived from those words. Update canonical browser persistence documentation.

## Plan

1. Add reusable title normalization and collision allocation at the browser persistence boundary. 2. Gate first autosave of untitled documents on two words and adopt the unique derived title. 3. Add an import-collision confirmation UI supporting overwrite and save-new flows for ODT and TXT. 4. Add workflow, store, and dialog tests. 5. Document the intentional upstream divergence. 6. Run targeted tests plus repository verification gates and record evidence.

## Verify Steps

1. Run focused Vitest coverage for writer-odt-io, writer-odt-store, WriterFileDialog, and desktop integration; all pass and assert two-word thresholds, derived titles, indexed collisions, overwrite, and save-new import behavior. 2. Run the repository formatting, lint, type, dependency, JSDoc, file-size, and static-build checks exposed by package scripts for the touched application. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor successfully. 4. Review git diff and git status so only task-scoped implementation, tests, documentation, and Agentplane task artifacts remain.

## Verification

Command: npm exec vitest -- run src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/storage/writer-odt-store.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx src/framework/browser/app/desktop.test.tsx (from apps/office). Result: pass. Evidence: 4 files and 34 tests passed. Scope: automatic title threshold/indexing plus import overwrite/save-new UI and desktop integration. Command: npm run format:check && npm run lint && npm run typecheck && npm run check:dependencies && npm run check:docs && npm run check:file-size. Result: pass. Evidence: formatting, ESLint, TypeScript, 302-source module boundaries, 972-source JSDoc, and file-size scan passed. Scope: changed source/tests/docs. Command: npm run test:static. Result: pass. Evidence: Vite production build and static build smoke passed. Scope: deployable browser bundle. Command: node .agentplane/policy/check-routing.mjs && ap doctor. Result: pass. Evidence: routing OK; doctor OK with unrelated pre-existing warnings. Scope: repository workflow health.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T05:09:44.310Z — VERIFY — ok

By: CODER

Note: Focused Writer persistence/UI tests, format, lint, type checks, dependency boundaries, JSDoc, file-size, production static build, routing, and doctor all passed; 34 focused tests are green.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T05:09:43.922Z, excerpt_hash=sha256:dc9fa04aded8224596cb25d7938e5ec0e5bd5a6dc1662ac8fad579e30e3ec4f0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080502-BKYEAC/blueprint/resolved-snapshot.json
- old_digest: 6cf793054d0ce84d3a665f15ada642ac190200ae72ead5812e1dde43e8ab59ea
- current_digest: 6cf793054d0ce84d3a665f15ada642ac190200ae72ead5812e1dde43e8ab59ea
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610080502-BKYEAC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610080502-BKYEAC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and the deterministic Agentplane close commit; IndexedDB schema remains unchanged, so existing browser documents require no data migration or rollback.

## Findings

No findings yet.
