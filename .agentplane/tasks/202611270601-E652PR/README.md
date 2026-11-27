---
id: "202611270601-E652PR"
title: "Connect Writer Navigator outline multi-selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:01:19.554Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T06:06:40.580Z"
  updated_by: "CODER"
  note: "Verified: 62 focused Writer tests, two resource cases and three Chromium scenarios prove root selection, native grouped action order, one undo and stable selection."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T06:06:41.076Z"
  updated_by: "EVALUATOR"
  note: "Heading-root multi-selection controls native grouped Navigator actions."
  evaluated_sha: "d2f0cdd21dcd42bade27ea95c68efbae9d13fe4b"
  blueprint_digest: "c0c3a8d330c716a9572a064778ca664be05e756e07f7def89307cc3b47fdcd0b"
  evidence_refs:
    - ".agentplane/tasks/202611270601-E652PR/README.md"
    - ".agentplane/tasks/202611270601-E652PR/quality/20261127-060641076-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270601-E652PR/quality/20261127-060641076-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270601-E652PR/quality/20261127-060641076-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270601-E652PR/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-multi-vitest.log"
    - "output/playwright/writer-navigator-multi-chromium.log"
  findings:
    - "Browser selection and original command order are validated independent of document history and root-mode focus."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T06:01:46.579Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T06:06:40.580Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 62 focused Writer tests, two resource cases and three Chromium scenarios prove root selection, native grouped action order, one undo and stable selection."
doc_version: 3
doc_updated_at: "2026-11-27T06:06:40.635Z"
doc_updated_by: "CODER"
description: "Port heading-root multiple selection and grouped chapter commands, including selected ancestors and one undo, and reconcile the generated Navigator toolbar order witness."
sections:
  Summary: |-
    Connect Writer Navigator outline multi-selection

    Port heading-root multiple selection and grouped chapter commands, including selected ancestors and one undo, and reconcile the generated Navigator toolbar order witness.
  Scope: "Writer Navigator heading-root selection, grouped chapter and level actions, their browser and core fixtures, and the native toolbar resource witness."
  Plan: "Respect the pinned outline root selection mode, resolve stable heading identities in tree order, use one undo group for heading commands, and verify selection and history through the real browser."
  Verify Steps: "Run focused Navigator and toolbar resource tests, application typecheck and build, scoped lint and format, source boundaries and provenance, and Chromium Navigator tests."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T06:06:40.580Z — VERIFY — ok

    By: CODER

    Note: Verified: 62 focused Writer tests, two resource cases and three Chromium scenarios prove root selection, native grouped action order, one undo and stable selection.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:06:40.077Z, excerpt_hash=sha256:cff4c1f1f6d88ed202fd3d616c5d94d8cf6020fa6e2e8b3576f114977e12163f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270601-E652PR/blueprint/resolved-snapshot.json
    - old_digest: c0c3a8d330c716a9572a064778ca664be05e756e07f7def89307cc3b47fdcd0b
    - current_digest: c0c3a8d330c716a9572a064778ca664be05e756e07f7def89307cc3b47fdcd0b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270601-E652PR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270601-E652PR
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
  Findings: "The application typecheck and Vite build, scoped lint and format, source boundaries, source tree, resource check, policy routing and doctor passed. Global source provenance reports a pre-existing obsolete ODT property fixture marker in the integration baseline; both changed Navigator provenance entries passed the same validator in isolation. Repository-wide JSDoc has existing findings; there were none for the changed files."
id_source: "generated"
---
## Summary

Connect Writer Navigator outline multi-selection

Port heading-root multiple selection and grouped chapter commands, including selected ancestors and one undo, and reconcile the generated Navigator toolbar order witness.

## Scope

Writer Navigator heading-root selection, grouped chapter and level actions, their browser and core fixtures, and the native toolbar resource witness.

## Plan

Respect the pinned outline root selection mode, resolve stable heading identities in tree order, use one undo group for heading commands, and verify selection and history through the real browser.

## Verify Steps

Run focused Navigator and toolbar resource tests, application typecheck and build, scoped lint and format, source boundaries and provenance, and Chromium Navigator tests.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T06:06:40.580Z — VERIFY — ok

By: CODER

Note: Verified: 62 focused Writer tests, two resource cases and three Chromium scenarios prove root selection, native grouped action order, one undo and stable selection.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:06:40.077Z, excerpt_hash=sha256:cff4c1f1f6d88ed202fd3d616c5d94d8cf6020fa6e2e8b3576f114977e12163f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270601-E652PR/blueprint/resolved-snapshot.json
- old_digest: c0c3a8d330c716a9572a064778ca664be05e756e07f7def89307cc3b47fdcd0b
- current_digest: c0c3a8d330c716a9572a064778ca664be05e756e07f7def89307cc3b47fdcd0b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270601-E652PR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270601-E652PR
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

The application typecheck and Vite build, scoped lint and format, source boundaries, source tree, resource check, policy routing and doctor passed. Global source provenance reports a pre-existing obsolete ODT property fixture marker in the integration baseline; both changed Navigator provenance entries passed the same validator in isolation. Repository-wide JSDoc has existing findings; there were none for the changed files.
