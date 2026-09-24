---
id: "202609241135-S2WG4Q"
title: "F2 Route Writer formatting controls through Sfx slots"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241135-MCNVP4"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:45:59.992Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T13:12:31.218Z"
  updated_by: "CODER"
  note: "Pinned Writer formatting slots, bindings state, and one paragraph-dialog request owner verified; npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: route advanced Writer formatting through pinned Sfx commands and one dialog request owner."
events:
  -
    type: "status"
    at: "2026-09-24T12:46:07.522Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: route advanced Writer formatting through pinned Sfx commands and one dialog request owner."
  -
    type: "verify"
    at: "2026-09-24T13:12:31.218Z"
    author: "CODER"
    state: "ok"
    note: "Pinned Writer formatting slots, bindings state, and one paragraph-dialog request owner verified; npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
doc_version: 3
doc_updated_at: "2026-09-24T13:12:31.297Z"
doc_updated_by: "CODER"
description: "Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner."
sections:
  Summary: |-
    F2 Route Writer formatting controls through Sfx slots

    Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.
  Scope: |-
    - In scope: Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.
    - Out of scope: unrelated refactors not required for "F2 Route Writer formatting controls through Sfx slots".
  Plan: "Promote pinned toolbar commands into generated supported resource metadata; implement color, highlight, line spacing and paragraph-dialog slot descriptors in SwTextShell with live state. Route line-number changes through a Writer command. Move paragraph-dialog open/close identity to WriterDialogController and keep editable draft only in the presenter. Replace direct formatting callbacks in writer-view with BrowserCommandSource dispatch and generated labels/placement; update tests, exact inventories and full verification."
  Verify Steps: "1. Pinned Writer text toolbar resource provides Color, CharBackColor, LineSpacing and hidden ParagraphDialog identities and labels; supported controls dispatch corresponding Sfx slots with bindings-backed enabled and value state. Line-number control routes through a documented Writer command owner. 2. Paragraph dialog opens from one WriterDialogController request, accepts/cancels once, and the presenter does not directly mutate SwWrtShell for these slot-backed actions. Existing browser and command tests cover dispatch, state and dialog lifecycle. 3. Exact source provenance, runtime inventory and command evidence stay current; npm run verify and git diff --check pass."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T13:12:31.218Z — VERIFY — ok

    By: CODER

    Note: Pinned Writer formatting slots, bindings state, and one paragraph-dialog request owner verified; npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:46:07.522Z, excerpt_hash=sha256:5a6779e9f81c1dbe04f5521855cf72c606d04c3f2c60c794d54739c2da9ce888

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-S2WG4Q/blueprint/resolved-snapshot.json
    - old_digest: 8b07cd258827021409f03b6bebf30728add27201ee2cb7e7547ada69ed5a26fb
    - current_digest: 8b07cd258827021409f03b6bebf30728add27201ee2cb7e7547ada69ed5a26fb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-S2WG4Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-S2WG4Q
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
id_source: "generated"
---
## Summary

F2 Route Writer formatting controls through Sfx slots

Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.

## Scope

- In scope: Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.
- Out of scope: unrelated refactors not required for "F2 Route Writer formatting controls through Sfx slots".

## Plan

Promote pinned toolbar commands into generated supported resource metadata; implement color, highlight, line spacing and paragraph-dialog slot descriptors in SwTextShell with live state. Route line-number changes through a Writer command. Move paragraph-dialog open/close identity to WriterDialogController and keep editable draft only in the presenter. Replace direct formatting callbacks in writer-view with BrowserCommandSource dispatch and generated labels/placement; update tests, exact inventories and full verification.

## Verify Steps

1. Pinned Writer text toolbar resource provides Color, CharBackColor, LineSpacing and hidden ParagraphDialog identities and labels; supported controls dispatch corresponding Sfx slots with bindings-backed enabled and value state. Line-number control routes through a documented Writer command owner. 2. Paragraph dialog opens from one WriterDialogController request, accepts/cancels once, and the presenter does not directly mutate SwWrtShell for these slot-backed actions. Existing browser and command tests cover dispatch, state and dialog lifecycle. 3. Exact source provenance, runtime inventory and command evidence stay current; npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T13:12:31.218Z — VERIFY — ok

By: CODER

Note: Pinned Writer formatting slots, bindings state, and one paragraph-dialog request owner verified; npm run verify and git diff --check passed (484 office tests, 98 inventory tests, 14 E2E, 100% coverage).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:46:07.522Z, excerpt_hash=sha256:5a6779e9f81c1dbe04f5521855cf72c606d04c3f2c60c794d54739c2da9ce888

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-S2WG4Q/blueprint/resolved-snapshot.json
- old_digest: 8b07cd258827021409f03b6bebf30728add27201ee2cb7e7547ada69ed5a26fb
- current_digest: 8b07cd258827021409f03b6bebf30728add27201ee2cb7e7547ada69ed5a26fb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-S2WG4Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-S2WG4Q
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
