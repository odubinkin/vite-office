---
id: "202609150036-J7X0D8"
title: "Implement LibreOffice font selection and full Writer paragraph style pool"
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
  updated_at: "2026-09-15T00:36:54.152Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T01:27:48.985Z"
  updated_by: "CODER"
  note: "verified-202609150036-J7X0D8"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T01:27:44.290Z"
  updated_by: "EVALUATOR"
  note: "Implementation matches the approved LibreOffice-aligned scope and passes the complete repository verification contract."
  evaluated_sha: "cb729e62b3700e3e64329dbd6ce30065a81e0a4e"
  blueprint_digest: "95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67"
  evidence_refs:
    - ".agentplane/tasks/202609150036-J7X0D8/README.md"
    - ".agentplane/tasks/202609150036-J7X0D8/quality/20260915-012744290-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150036-J7X0D8/quality/20260915-012744290-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150036-J7X0D8/quality/20260915-012744290-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "All 126 built-in paragraph styles preserve pool ordering, parent/follow links, lazy materialization, persistence, ODT and UI behavior; font selection uses pooled script-aware items and browser device enumeration with safe fallback."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the complete pinned Writer paragraph-style pool and device-backed browser font selection across model, commands, persistence, ODT, UI, documentation, and tests."
events:
  -
    type: "status"
    at: "2026-09-15T00:36:59.272Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the complete pinned Writer paragraph-style pool and device-backed browser font selection across model, commands, persistence, ODT, UI, documentation, and tests."
  -
    type: "verify"
    at: "2026-09-15T01:27:19.686Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed: 279 application tests and 84 inventory tests at 100% coverage, 9 Playwright e2e tests, build/static smoke, lint, typecheck, dependency, JSDoc, file-size, source-tree, provenance, and parity checks. ap doctor passed with one unrelated historical warning; routing policy check passed."
  -
    type: "verify"
    at: "2026-09-15T01:27:30.908Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150036-J7X0D8"
  -
    type: "verify"
    at: "2026-09-15T01:27:48.985Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150036-J7X0D8"
doc_version: 3
doc_updated_at: "2026-09-15T01:27:49.036Z"
doc_updated_by: "CODER"
description: "Add device-backed font selection and all 126 pinned LibreOffice built-in Writer paragraph styles, preserving pool identities, groups, parent/follow hierarchy, persistence, ODT interoperability, UI application, and verification."
sections:
  Summary: "Implement upstream-aligned Writer font selection and the complete pinned LibreOffice built-in paragraph-style pool for the browser office application."
  Scope: "Replace the two-style bounded model with all 126 built-in paragraph styles from pinned poolfmt.hxx and SwStyleNameMapper data; preserve stable identities, category ordering, parent and follow links; add font-family pooled items and a browser FontList abstraction backed by Local Font Access when available; apply font selection through shell commands with pending/range semantics and Undo/Redo; update toolbar, rendering, snapshots, clipboard, ODT import/export, tests, documentation, and provenance. No network access, font-file bundling, custom-style editor, page layout engine, or non-paragraph style families."
  Plan: "1. Port the pinned Writer paragraph-style pool metadata and hierarchy into upstream-shaped modules. 2. Generalize SwDoc/SwTextFormatColl construction, snapshots, commands, and UI from two styles to the full catalog. 3. Add SvxFontItem/SvxFontListItem-like model and browser font enumeration with permission-safe fallback. 4. Apply font family to selections and pending input with history support. 5. Extend rendering, clipboard, persistence, and ODT round-trip. 6. Add focused unit/UI/e2e coverage and update program documentation/provenance. 7. Run the full repository verification contract and record evidence."
  Verify Steps: "1. Run focused Vitest suites covering the style catalog count/order, parent/follow graph, font items/list enumeration, shell application, Undo/Redo, snapshots, ODT round-trip, and toolbar behavior. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes."
  Verification: |-
    Pending implementation and execution of the declared Verify Steps.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T01:27:19.686Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed: 279 application tests and 84 inventory tests at 100% coverage, 9 Playwright e2e tests, build/static smoke, lint, typecheck, dependency, JSDoc, file-size, source-tree, provenance, and parity checks. ap doctor passed with one unrelated historical warning; routing policy check passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:36:59.272Z, excerpt_hash=sha256:2bcea06a939a577acfef973f56435ec75aad417de9b51046e62cf0b636e742c7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json
    - old_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
    - current_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150036-J7X0D8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150036-J7X0D8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T01:27:30.908Z — VERIFY — ok

    By: CODER

    Note: verified-202609150036-J7X0D8
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T01:27:19.741Z, excerpt_hash=sha256:2bcea06a939a577acfef973f56435ec75aad417de9b51046e62cf0b636e742c7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json
    - old_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
    - current_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150036-J7X0D8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150036-J7X0D8 --result verified-202609150036-J7X0D8 --commit cb729e62b3700e3e64329dbd6ce30065a81e0a4e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T01:27:48.985Z — VERIFY — ok

    By: CODER

    Note: verified-202609150036-J7X0D8
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T01:27:30.958Z, excerpt_hash=sha256:2bcea06a939a577acfef973f56435ec75aad417de9b51046e62cf0b636e742c7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json
    - old_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
    - current_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150036-J7X0D8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150036-J7X0D8 --result verified-202609150036-J7X0D8 --commit cb729e62b3700e3e64329dbd6ce30065a81e0a4e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and task close commit; the prior bounded two-style model and disabled font control remain the behavioral baseline. Persisted schema changes must be reverted together with their readers/writers to avoid mixed model shapes."
  Findings: |-
    No findings yet. Browser font enumeration will mirror LibreOffice device enumeration through Local Font Access where supported; browsers that deny or lack the API receive a deterministic safe fallback without external font downloads.

    - Observation: Implemented device-backed font selection and the complete 126-style Writer paragraph pool with lazy materialization, parent/follow hierarchy, history, snapshots, clipboard, ODT, and UI integration.
      Impact: Writer exposes installed browser fonts where Local Font Access is available and preserves LibreOffice built-in paragraph-style hierarchy without eager snapshot overhead.
      Resolution: Verified commit cb729e62b370 with the complete repository verification contract.
id_source: "generated"
---
## Summary

Implement upstream-aligned Writer font selection and the complete pinned LibreOffice built-in paragraph-style pool for the browser office application.

## Scope

Replace the two-style bounded model with all 126 built-in paragraph styles from pinned poolfmt.hxx and SwStyleNameMapper data; preserve stable identities, category ordering, parent and follow links; add font-family pooled items and a browser FontList abstraction backed by Local Font Access when available; apply font selection through shell commands with pending/range semantics and Undo/Redo; update toolbar, rendering, snapshots, clipboard, ODT import/export, tests, documentation, and provenance. No network access, font-file bundling, custom-style editor, page layout engine, or non-paragraph style families.

## Plan

1. Port the pinned Writer paragraph-style pool metadata and hierarchy into upstream-shaped modules. 2. Generalize SwDoc/SwTextFormatColl construction, snapshots, commands, and UI from two styles to the full catalog. 3. Add SvxFontItem/SvxFontListItem-like model and browser font enumeration with permission-safe fallback. 4. Apply font family to selections and pending input with history support. 5. Extend rendering, clipboard, persistence, and ODT round-trip. 6. Add focused unit/UI/e2e coverage and update program documentation/provenance. 7. Run the full repository verification contract and record evidence.

## Verify Steps

1. Run focused Vitest suites covering the style catalog count/order, parent/follow graph, font items/list enumeration, shell application, Undo/Redo, snapshots, ODT round-trip, and toolbar behavior. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes.

## Verification

Pending implementation and execution of the declared Verify Steps.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T01:27:19.686Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed: 279 application tests and 84 inventory tests at 100% coverage, 9 Playwright e2e tests, build/static smoke, lint, typecheck, dependency, JSDoc, file-size, source-tree, provenance, and parity checks. ap doctor passed with one unrelated historical warning; routing policy check passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:36:59.272Z, excerpt_hash=sha256:2bcea06a939a577acfef973f56435ec75aad417de9b51046e62cf0b636e742c7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json
- old_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
- current_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150036-J7X0D8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150036-J7X0D8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T01:27:30.908Z — VERIFY — ok

By: CODER

Note: verified-202609150036-J7X0D8
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T01:27:19.741Z, excerpt_hash=sha256:2bcea06a939a577acfef973f56435ec75aad417de9b51046e62cf0b636e742c7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json
- old_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
- current_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150036-J7X0D8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150036-J7X0D8 --result verified-202609150036-J7X0D8 --commit cb729e62b3700e3e64329dbd6ce30065a81e0a4e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T01:27:48.985Z — VERIFY — ok

By: CODER

Note: verified-202609150036-J7X0D8
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T01:27:30.958Z, excerpt_hash=sha256:2bcea06a939a577acfef973f56435ec75aad417de9b51046e62cf0b636e742c7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150036-J7X0D8/blueprint/resolved-snapshot.json
- old_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
- current_digest: 95c308e9b7c18a68a9b2ea93257cd73e4e23668e8fcf58887b04c123a2604f67
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150036-J7X0D8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150036-J7X0D8 --result verified-202609150036-J7X0D8 --commit cb729e62b3700e3e64329dbd6ce30065a81e0a4e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and task close commit; the prior bounded two-style model and disabled font control remain the behavioral baseline. Persisted schema changes must be reverted together with their readers/writers to avoid mixed model shapes.

## Findings

No findings yet. Browser font enumeration will mirror LibreOffice device enumeration through Local Font Access where supported; browsers that deny or lack the API receive a deterministic safe fallback without external font downloads.

- Observation: Implemented device-backed font selection and the complete 126-style Writer paragraph pool with lazy materialization, parent/follow hierarchy, history, snapshots, clipboard, ODT, and UI integration.
  Impact: Writer exposes installed browser fonts where Local Font Access is available and preserves LibreOffice built-in paragraph-style hierarchy without eager snapshot overhead.
  Resolution: Verified commit cb729e62b370 with the complete repository verification contract.
