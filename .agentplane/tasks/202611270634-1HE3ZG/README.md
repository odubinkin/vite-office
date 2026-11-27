---
id: "202611270634-1HE3ZG"
title: "Synchronize Writer Navigator with the document cursor"
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
  updated_at: "2026-11-27T06:34:17.197Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:09:57.101Z"
  updated_by: "CODER"
  note: "Verified: 60 targeted cursor shell, slot and Navigator unit tests and 5 Chromium Navigator scenarios, including tdf114724 selection in heading root mode and grouped history. TypeScript, production build, scoped lint, Prettier, dependency, source tree, Writer resources, scoped provenance and policy routing checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:09:57.541Z"
  updated_by: "EVALUATOR"
  note: "Writer Navigator synchronizes with the document cursor using the pinned tracking order."
  evaluated_sha: "f9f30269735a3f18193f44bef8982c20af2953b3"
  blueprint_digest: "5e1f057a43dc08c10beeb27bbf19926b14994248b48777bc57b65abe60996549"
  evidence_refs:
    - ".agentplane/tasks/202611270634-1HE3ZG/README.md"
    - ".agentplane/tasks/202611270634-1HE3ZG/quality/20261127-070957541-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270634-1HE3ZG/quality/20261127-070957541-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270634-1HE3ZG/quality/20261127-070957541-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270634-1HE3ZG/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-tracking-vitest-verified.log"
    - "output/playwright/writer-navigator-tracking-chromium.log"
  findings:
    - "Focused tests cover heading root selection on cursor movement, bookmark and table priority, and grouped command history. Provenance drift in an unrelated ODT witness is recorded in Findings."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T06:34:50.267Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:09:57.101Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 60 targeted cursor shell, slot and Navigator unit tests and 5 Chromium Navigator scenarios, including tdf114724 selection in heading root mode and grouped history. TypeScript, production build, scoped lint, Prettier, dependency, source tree, Writer resources, scoped provenance and policy routing checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T07:09:57.152Z"
doc_updated_by: "CODER"
description: "Connect default native outline, table and bookmark tracking to the modeless Navigator while retaining explicit tree selection and scope."
sections:
  Summary: |-
    Synchronize Writer Navigator with the document cursor

    Connect default native outline, table and bookmark tracking to the modeless Navigator while retaining explicit tree selection and scope.
  Scope: "Default Writer Navigator tracking for the represented outline, table and bookmark owners, current-document focus, root and outline depth filters, and corresponding native UI regression fixtures."
  Plan: "Resolve the native outline cursor query, reuse Writer table and mark identity in the original priority, and reflect cursor changes without changing an active tree selection. Port the pinned heading and bookmark tracking tests."
  Verify Steps: "Run focused Writer cursor shell, Navigator and slot tests; TypeScript and production build; Chromium Navigator flows; scoped lint, formatting, dependency, source tree and provenance checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:09:57.101Z — VERIFY — ok

    By: CODER

    Note: Verified: 60 targeted cursor shell, slot and Navigator unit tests and 5 Chromium Navigator scenarios, including tdf114724 selection in heading root mode and grouped history. TypeScript, production build, scoped lint, Prettier, dependency, source tree, Writer resources, scoped provenance and policy routing checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:09:56.589Z, excerpt_hash=sha256:18a5d218cf0c48c587d70553dc9a4eb95974e823ec42a7eb1fbfc9c588828014

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270634-1HE3ZG/blueprint/resolved-snapshot.json
    - old_digest: 5e1f057a43dc08c10beeb27bbf19926b14994248b48777bc57b65abe60996549
    - current_digest: 5e1f057a43dc08c10beeb27bbf19926b14994248b48777bc57b65abe60996549
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270634-1HE3ZG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270634-1HE3ZG
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
  Findings: "Pinned Writer tracks tables, outline headings, and bookmarks in that order when the active tree root permits it. The browser sends named row selection from the cursor only while the editing host owns focus and preserves the outcome of Navigator group commands. The previously documented bookmark toolbar scan behavior remains preserved. Focused provenance passed for all changed records. The repository-wide verifier still reports the pre-existing ODT property round-trip witness drift from integration."
id_source: "generated"
---
## Summary

Synchronize Writer Navigator with the document cursor

Connect default native outline, table and bookmark tracking to the modeless Navigator while retaining explicit tree selection and scope.

## Scope

Default Writer Navigator tracking for the represented outline, table and bookmark owners, current-document focus, root and outline depth filters, and corresponding native UI regression fixtures.

## Plan

Resolve the native outline cursor query, reuse Writer table and mark identity in the original priority, and reflect cursor changes without changing an active tree selection. Port the pinned heading and bookmark tracking tests.

## Verify Steps

Run focused Writer cursor shell, Navigator and slot tests; TypeScript and production build; Chromium Navigator flows; scoped lint, formatting, dependency, source tree and provenance checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:09:57.101Z — VERIFY — ok

By: CODER

Note: Verified: 60 targeted cursor shell, slot and Navigator unit tests and 5 Chromium Navigator scenarios, including tdf114724 selection in heading root mode and grouped history. TypeScript, production build, scoped lint, Prettier, dependency, source tree, Writer resources, scoped provenance and policy routing checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:09:56.589Z, excerpt_hash=sha256:18a5d218cf0c48c587d70553dc9a4eb95974e823ec42a7eb1fbfc9c588828014

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270634-1HE3ZG/blueprint/resolved-snapshot.json
- old_digest: 5e1f057a43dc08c10beeb27bbf19926b14994248b48777bc57b65abe60996549
- current_digest: 5e1f057a43dc08c10beeb27bbf19926b14994248b48777bc57b65abe60996549
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270634-1HE3ZG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270634-1HE3ZG
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

Pinned Writer tracks tables, outline headings, and bookmarks in that order when the active tree root permits it. The browser sends named row selection from the cursor only while the editing host owns focus and preserves the outcome of Navigator group commands. The previously documented bookmark toolbar scan behavior remains preserved. Focused provenance passed for all changed records. The repository-wide verifier still reports the pre-existing ODT property round-trip witness drift from integration.
