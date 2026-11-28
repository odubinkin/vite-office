---
id: "202611270734-J6QYEY"
title: "Connect Writer Navigator hyperlinks and comments to document fields"
result_summary: "Exposed native hyperlinks and comments with identity-based tracking and contextual actions."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Writer Navigator, hyperlink and annotation tests and Chromium Navigator flows. Port the applicable native hyperlink ordering and comment update cases. Run TypeScript, production build, scoped lint, source tree, resources, dependencies and scoped provenance."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:34:18.082Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:46:22.117Z"
  updated_by: "CODER"
  note: "Verified: 44 focused cases across Navigator, hyperlink and annotation modules, including the three latest replayed native field cases, plus 8 Chromium Navigator scenarios. TypeScript, Vite, ESLint, Prettier, dependency, source tree, Writer resources, policy routing and scoped provenance passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:46:23.797Z"
  updated_by: "EVALUATOR"
  note: "Navigator Hyperlinks and Comments use the original text attributes and annotation fields."
  evaluated_sha: "635de4df8312dc96e9d91a5d207dcbd1a2a412e1"
  blueprint_digest: "bdb3c9eda218954067067470337387ef61a62bf9bff75dc3fdf517f92139e7bc"
  evidence_refs:
    - ".agentplane/tasks/202611270734-J6QYEY/README.md"
    - ".agentplane/tasks/202611270734-J6QYEY/quality/20261127-074623797-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270734-J6QYEY/quality/20261127-074623797-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270734-J6QYEY/quality/20261127-074623797-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270734-J6QYEY/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-fields-verified-vitest.log"
    - "output/playwright/writer-navigator-fields-native-cases.log"
    - "output/playwright/writer-navigator-fields-chromium.log"
  findings:
    - "Pinned anchor ordering, duplicate link identity, collapsed comments refresh, context edit/delete, tracking flags and browser focus were checked against the represented shell."
commit:
  hash: "635de4df8312dc96e9d91a5d207dcbd1a2a412e1"
  message: "🧩 J6QYEY code: Connect Writer Navigator hyperlinks and comments"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: 44 focused cases, 8 Chromium Navigator flows, and production build."
events:
  -
    type: "status"
    at: "2026-11-27T07:34:49.211Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:46:22.117Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 44 focused cases across Navigator, hyperlink and annotation modules, including the three latest replayed native field cases, plus 8 Chromium Navigator scenarios. TypeScript, Vite, ESLint, Prettier, dependency, source tree, Writer resources, policy routing and scoped provenance passed."
  -
    type: "status"
    at: "2026-11-27T07:50:18.669Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 44 focused cases, 8 Chromium Navigator flows, and production build."
doc_version: 3
doc_updated_at: "2026-11-27T07:50:18.676Z"
doc_updated_by: "CODER"
description: "Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions."
sections:
  Summary: |-
    Connect Writer Navigator hyperlinks and comments to document fields

    Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.
  Scope: |-
    - In scope: Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.
    - Out of scope: unrelated refactors not required for "Connect Writer Navigator hyperlinks and comments to document fields".
  Plan: "Verify the pinned content discovery, order, cursor moves and context modes in source after Graphify navigation. Project real SwTextINetFormat and annotation format owners, including anchored link ordering, into the Navigator. Route Go to, current address-based tracking, native category switches and represented context edit/delete through existing Writer contracts. Port the source regression cases tdf134960 and tdf137274 within the represented profile. Validate related model, browser, resource and provenance checks and record closure."
  Verify Steps: "Run focused Navigator, hyperlink and annotation model/presentation tests, plus Chromium Navigator scenarios. Check native link order, collapsed comment category refresh, cursor tracking by identity, and contextual operations. Run TypeScript, production build, scoped ESLint and Prettier, source tree, Writer resources, module dependencies and scoped provenance."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:46:22.117Z — VERIFY — ok

    By: CODER

    Note: Verified: 44 focused cases across Navigator, hyperlink and annotation modules, including the three latest replayed native field cases, plus 8 Chromium Navigator scenarios. TypeScript, Vite, ESLint, Prettier, dependency, source tree, Writer resources, policy routing and scoped provenance passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:46:20.539Z, excerpt_hash=sha256:b45810cd5922091514a0aa9e8ca15ffaef4620b7876133da19767e502ecd5ecb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270734-J6QYEY/blueprint/resolved-snapshot.json
    - old_digest: bdb3c9eda218954067067470337387ef61a62bf9bff75dc3fdf517f92139e7bc
    - current_digest: bdb3c9eda218954067067470337387ef61a62bf9bff75dc3fdf517f92139e7bc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270734-J6QYEY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270734-J6QYEY
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
  Findings: "The native hyperlink ordering regression loads the exact tdf134960 ODT through normal Writer open and checks all 12 labels before and after a hard page break. The tdf137274 annotation sequence updates a collapsed category, connects anchored cursor travel and uses native annotation delete. A duplicate hyperlink label test checks address-based selection, disabled tracking retention, remove and undo. Chromium exercises real edit and delete dialogs and per-type checked state. The current node profile does not have a SwSectionNode for ToxContent, so the source-only exclusion has no represented operand. Scoped source provenance passed for the five modified records."
id_source: "generated"
---
## Summary

Connect Writer Navigator hyperlinks and comments to document fields

Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.

## Scope

- In scope: Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.
- Out of scope: unrelated refactors not required for "Connect Writer Navigator hyperlinks and comments to document fields".

## Plan

Verify the pinned content discovery, order, cursor moves and context modes in source after Graphify navigation. Project real SwTextINetFormat and annotation format owners, including anchored link ordering, into the Navigator. Route Go to, current address-based tracking, native category switches and represented context edit/delete through existing Writer contracts. Port the source regression cases tdf134960 and tdf137274 within the represented profile. Validate related model, browser, resource and provenance checks and record closure.

## Verify Steps

Run focused Navigator, hyperlink and annotation model/presentation tests, plus Chromium Navigator scenarios. Check native link order, collapsed comment category refresh, cursor tracking by identity, and contextual operations. Run TypeScript, production build, scoped ESLint and Prettier, source tree, Writer resources, module dependencies and scoped provenance.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:46:22.117Z — VERIFY — ok

By: CODER

Note: Verified: 44 focused cases across Navigator, hyperlink and annotation modules, including the three latest replayed native field cases, plus 8 Chromium Navigator scenarios. TypeScript, Vite, ESLint, Prettier, dependency, source tree, Writer resources, policy routing and scoped provenance passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:46:20.539Z, excerpt_hash=sha256:b45810cd5922091514a0aa9e8ca15ffaef4620b7876133da19767e502ecd5ecb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270734-J6QYEY/blueprint/resolved-snapshot.json
- old_digest: bdb3c9eda218954067067470337387ef61a62bf9bff75dc3fdf517f92139e7bc
- current_digest: bdb3c9eda218954067067470337387ef61a62bf9bff75dc3fdf517f92139e7bc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270734-J6QYEY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270734-J6QYEY
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

The native hyperlink ordering regression loads the exact tdf134960 ODT through normal Writer open and checks all 12 labels before and after a hard page break. The tdf137274 annotation sequence updates a collapsed category, connects anchored cursor travel and uses native annotation delete. A duplicate hyperlink label test checks address-based selection, disabled tracking retention, remove and undo. Chromium exercises real edit and delete dialogs and per-type checked state. The current node profile does not have a SwSectionNode for ToxContent, so the source-only exclusion has no represented operand. Scoped source provenance passed for the five modified records.
