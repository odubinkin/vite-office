---
id: "202609240501-K41WJD"
title: "Restore Writer shell and UI command contracts"
result_summary: "Restored supported Writer shell formatting and ruler command ownership with source-aligned tab metadata and undo."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609240501-JB34TJ"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T07:17:30.432Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T07:47:09.516Z"
  updated_by: "CODER"
  note: "Full npm run verify passed: 464 office tests at 100% coverage, 96 inventory tests at 100% coverage, 14 Chromium E2E; formatting, lint, types, source provenance, inventory and static build pass. Focused shell tests cover mixed selection, invalid/no-op drafts, tab metadata, ruler deltas and undo/redo."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T07:47:19.471Z"
  updated_by: "EVALUATOR"
  note: "Writer shell now owns accepted paragraph and ruler transitions with preserved tab metadata and undo grouping; full verification passes."
  evaluated_sha: "1868190ae4cfbcca0ba7c7215735a7be7816d4a4"
  blueprint_digest: "75e172fad03634ca0ba69e041ef0441e83b59dba0497700bf2e8eef798efd863"
  evidence_refs:
    - ".agentplane/tasks/202609240501-K41WJD/README.md"
    - ".agentplane/tasks/202609240501-K41WJD/quality/20260924-074719471-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240501-K41WJD/quality/20260924-074719471-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240501-K41WJD/quality/20260924-074719471-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240501-K41WJD/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/uibase/wrtsh/wrtsh-paragraph-ruler.test.ts"
    - "/tmp/vite-office-stage4-verify.log"
  findings:
    - "React submits primitive drafts and pointer gestures; mixed paragraph metadata, invalid/no-op values, cancel, ruler undo/redo and command surfaces are covered."
commit:
  hash: "230f2cc923e7187bd42f23367ad8f57ef629d1c5"
  message: "🧩 K41WJD task: record shell and UI parity verification"
comments:
  -
    author: "CODER"
    body: "Start: move paragraph and ruler command policy into Writer shells with binding-backed state."
  -
    author: "CODER"
    body: "Verified: Writer shell owns paragraph dialog conversion and ruler mutations; full verify and evaluator pass."
events:
  -
    type: "status"
    at: "2026-09-24T07:17:43.165Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: move paragraph and ruler command policy into Writer shells with binding-backed state."
  -
    type: "verify"
    at: "2026-09-24T07:47:09.516Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed: 464 office tests at 100% coverage, 96 inventory tests at 100% coverage, 14 Chromium E2E; formatting, lint, types, source provenance, inventory and static build pass. Focused shell tests cover mixed selection, invalid/no-op drafts, tab metadata, ruler deltas and undo/redo."
  -
    type: "status"
    at: "2026-09-24T07:47:38.491Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Writer shell owns paragraph dialog conversion and ruler mutations; full verify and evaluator pass."
doc_version: 3
doc_updated_at: "2026-09-24T07:47:38.493Z"
doc_updated_by: "CODER"
description: "Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings"
sections:
  Summary: |-
    Restore Writer shell and UI command contracts

    Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings
  Scope: |-
    - In scope: Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings.
    - Out of scope: unrelated refactors not required for "Restore Writer shell and UI command contracts".
  Plan: |-
    1. Compare the supported paragraph dialog, line-spacing, tab-stop, ruler, and command-state branches with pinned SwTextShell, SwWrtShell, SwView, editeng items, and ruler sources. Keep browser gesture coordinates and drafts in React.
    2. Move tab-stop preservation, pooled item construction, value validation and multi-paragraph undoable dialog application into SwTextShell/SwWrtShell. React submits primitive draft values; cancelled or unchanged dialogs create no model action.
    3. Route ruler page-margin, paragraph-indent and tab-stop gestures as deltas or positions into shell methods; shell applies bounds and item transitions. Use existing SfxBindings state and generated command resources for supported menu/toolbar/shortcut actions.
    4. Add focused mixed-selection, unchanged, invalid, cancelled, pointer/keyboard and undo/redo tests for supported branches; update parity/provenance data only for verified ownership. Run npm run verify. Browser save UI/workflows and autosave stay unchanged.
  Verify Steps: |-
    1. No production React component creates pooled paragraph items or commits ruler model values. SwTextShell/SwWrtShell own conversion, validation, preservation of tab adjustment/leader fields, and one undo group for a multi-item or mixed selection edit. Source excerpts and focused assertions identify the pinned upstream responsibility.
    2. Paragraph dialog Cancel leaves state/history unchanged; OK with unchanged values is a no-op; invalid tab/spacing inputs do not mutate; edited tab stops retain existing alignment/leader when positions remain. Ruler pointer commits and dialog values go through shell APIs and undo/redo works.
    3. Existing menu, toolbar, accelerator and status surfaces resolve generated resources and live SfxBindings state for every supported command; focused keyboard and pointer tests confirm enabled/checked behavior. Browser save workflow and autosave have no changed paths.
    4. Run npm run verify, update existing inventory/provenance data with bounded evidence, and inspect the task-scoped diff and clean tracked state.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T07:47:09.516Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed: 464 office tests at 100% coverage, 96 inventory tests at 100% coverage, 14 Chromium E2E; formatting, lint, types, source provenance, inventory and static build pass. Focused shell tests cover mixed selection, invalid/no-op drafts, tab metadata, ruler deltas and undo/redo.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T07:17:43.165Z, excerpt_hash=sha256:9d5f52650434817f3e285e5cc6bf7b8e5914f14b6b29f5fd69b5476514956615

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-K41WJD/blueprint/resolved-snapshot.json
    - old_digest: 75e172fad03634ca0ba69e041ef0441e83b59dba0497700bf2e8eef798efd863
    - current_digest: 75e172fad03634ca0ba69e041ef0441e83b59dba0497700bf2e8eef798efd863
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-K41WJD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240501-K41WJD
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
  Findings: ""
extensions:
  implementation_commit:
    hash: "1868190ae4cfbcca0ba7c7215735a7be7816d4a4"
    message: "🧩 K41WJD code: restore Writer shell formatting and ruler ownership"
id_source: "generated"
---
## Summary

Restore Writer shell and UI command contracts

Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings

## Scope

- In scope: Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings.
- Out of scope: unrelated refactors not required for "Restore Writer shell and UI command contracts".

## Plan

1. Compare the supported paragraph dialog, line-spacing, tab-stop, ruler, and command-state branches with pinned SwTextShell, SwWrtShell, SwView, editeng items, and ruler sources. Keep browser gesture coordinates and drafts in React.
2. Move tab-stop preservation, pooled item construction, value validation and multi-paragraph undoable dialog application into SwTextShell/SwWrtShell. React submits primitive draft values; cancelled or unchanged dialogs create no model action.
3. Route ruler page-margin, paragraph-indent and tab-stop gestures as deltas or positions into shell methods; shell applies bounds and item transitions. Use existing SfxBindings state and generated command resources for supported menu/toolbar/shortcut actions.
4. Add focused mixed-selection, unchanged, invalid, cancelled, pointer/keyboard and undo/redo tests for supported branches; update parity/provenance data only for verified ownership. Run npm run verify. Browser save UI/workflows and autosave stay unchanged.

## Verify Steps

1. No production React component creates pooled paragraph items or commits ruler model values. SwTextShell/SwWrtShell own conversion, validation, preservation of tab adjustment/leader fields, and one undo group for a multi-item or mixed selection edit. Source excerpts and focused assertions identify the pinned upstream responsibility.
2. Paragraph dialog Cancel leaves state/history unchanged; OK with unchanged values is a no-op; invalid tab/spacing inputs do not mutate; edited tab stops retain existing alignment/leader when positions remain. Ruler pointer commits and dialog values go through shell APIs and undo/redo works.
3. Existing menu, toolbar, accelerator and status surfaces resolve generated resources and live SfxBindings state for every supported command; focused keyboard and pointer tests confirm enabled/checked behavior. Browser save workflow and autosave have no changed paths.
4. Run npm run verify, update existing inventory/provenance data with bounded evidence, and inspect the task-scoped diff and clean tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T07:47:09.516Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed: 464 office tests at 100% coverage, 96 inventory tests at 100% coverage, 14 Chromium E2E; formatting, lint, types, source provenance, inventory and static build pass. Focused shell tests cover mixed selection, invalid/no-op drafts, tab metadata, ruler deltas and undo/redo.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T07:17:43.165Z, excerpt_hash=sha256:9d5f52650434817f3e285e5cc6bf7b8e5914f14b6b29f5fd69b5476514956615

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-K41WJD/blueprint/resolved-snapshot.json
- old_digest: 75e172fad03634ca0ba69e041ef0441e83b59dba0497700bf2e8eef798efd863
- current_digest: 75e172fad03634ca0ba69e041ef0441e83b59dba0497700bf2e8eef798efd863
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-K41WJD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240501-K41WJD
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
