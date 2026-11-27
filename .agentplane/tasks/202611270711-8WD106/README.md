---
id: "202611270711-8WD106"
title: "Expose Writer Navigator cursor tracking preferences"
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
  - "Run focused Writer Navigator model, UI and configuration tests plus Chromium context menu scenarios; run scoped lint, formatting, resource, dependency, source tree and provenance checks, TypeScript and production build."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:11:32.415Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:19:00.242Z"
  updated_by: "CODER"
  note: "Verified: 37 focused Navigator, configuration and shared popup tests and all six Chromium Navigator scenarios. TypeScript, production build, scoped lint and formatting, dependency and source tree checks, Writer resources, policy routing and scoped provenance passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:19:03.265Z"
  updated_by: "EVALUATOR"
  note: "Native Writer Navigator tracking settings are reachable from their contextual rows and persist across reload."
  evaluated_sha: "abf62188a7937c0422869da40f69648371f478ec"
  blueprint_digest: "a0328bb77f3c212ea9890615aae9b863fc1be46dcaa0be85a8f93c569edead59"
  evidence_refs:
    - ".agentplane/tasks/202611270711-8WD106/README.md"
    - ".agentplane/tasks/202611270711-8WD106/quality/20261127-071903265-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270711-8WD106/quality/20261127-071903265-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270711-8WD106/quality/20261127-071903265-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270711-8WD106/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-preferences-vitest.log"
    - "output/playwright/writer-navigator-preferences-chromium.log"
  findings:
    - "Selected outline mode, checked table and bookmark settings, keyboard submenu, focus restoration, collapsed sibling branches and priority fallback are covered. Unrelated registry baseline drift is recorded in Findings."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T07:11:39.615Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:19:00.242Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 37 focused Navigator, configuration and shared popup tests and all six Chromium Navigator scenarios. TypeScript, production build, scoped lint and formatting, dependency and source tree checks, Writer resources, policy routing and scoped provenance passed."
doc_version: 3
doc_updated_at: "2026-11-27T07:19:00.571Z"
doc_updated_by: "CODER"
description: "Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration."
sections:
  Summary: |-
    Expose Writer Navigator cursor tracking preferences

    Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.
  Scope: |-
    - In scope: Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.
    - Out of scope: unrelated refactors not required for "Expose Writer Navigator cursor tracking preferences".
  Plan: "Confirm the pinned Writer Navigator schema, popup resource and tracking order using both graphs and source. Add a source-owned SwNavigationConfig with the three represented tracking properties and a browser storage boundary. Connect a row-specific popup via the shared keyboard and pointer menu, keeping native identifiers and check/radio state. Apply focused outline expansion and off/table/bookmark behavior in the current cursor tracking pipeline. Cover settings round-trip and popup interaction, run targeted verification, record evidence and refresh the graph on close."
  Verify Steps: "Run focused Writer Navigator, configuration and shared popup unit tests. Run the Navigator Chromium spec to verify menu admission, radio and checkbox changes, focus, and behavior after reload. Run TypeScript, production build, scoped lint and formatting, dependency, source tree, Writer resource and scoped provenance checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:19:00.242Z — VERIFY — ok

    By: CODER

    Note: Verified: 37 focused Navigator, configuration and shared popup tests and all six Chromium Navigator scenarios. TypeScript, production build, scoped lint and formatting, dependency and source tree checks, Writer resources, policy routing and scoped provenance passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:18:54.834Z, excerpt_hash=sha256:5acb89af59599a96b6c046cf567fb732ced87ce61e20656de30289fd2c9ac972

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270711-8WD106/blueprint/resolved-snapshot.json
    - old_digest: a0328bb77f3c212ea9890615aae9b863fc1be46dcaa0be85a8f93c569edead59
    - current_digest: a0328bb77f3c212ea9890615aae9b863fc1be46dcaa0be85a8f93c569edead59
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270711-8WD106

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270711-8WD106
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
  Findings: "Pinned tree loads settings from the SwModule Navigator configuration and caches them in each content tree. Outline Focus collapses the other top-level heading branches only on a changed tracked heading; Off allows the bookmark fallback. Table and Bookmark Tracking checkboxes are shown only for their matching content rows. Browser storage preserves unrelated Navigator properties and persists the represented settings outside ODT. No dedicated upstream test for these settings was found; local focused behavior, configuration, and Chromium reload tests cover the slice. Source provenance passed for the six changed records using the same validator. Repository-wide check:source-provenance and inventory:invariants both hit the existing ODT property round-trip marker drift on the integrated branch."
id_source: "generated"
---
## Summary

Expose Writer Navigator cursor tracking preferences

Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.

## Scope

- In scope: Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.
- Out of scope: unrelated refactors not required for "Expose Writer Navigator cursor tracking preferences".

## Plan

Confirm the pinned Writer Navigator schema, popup resource and tracking order using both graphs and source. Add a source-owned SwNavigationConfig with the three represented tracking properties and a browser storage boundary. Connect a row-specific popup via the shared keyboard and pointer menu, keeping native identifiers and check/radio state. Apply focused outline expansion and off/table/bookmark behavior in the current cursor tracking pipeline. Cover settings round-trip and popup interaction, run targeted verification, record evidence and refresh the graph on close.

## Verify Steps

Run focused Writer Navigator, configuration and shared popup unit tests. Run the Navigator Chromium spec to verify menu admission, radio and checkbox changes, focus, and behavior after reload. Run TypeScript, production build, scoped lint and formatting, dependency, source tree, Writer resource and scoped provenance checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:19:00.242Z — VERIFY — ok

By: CODER

Note: Verified: 37 focused Navigator, configuration and shared popup tests and all six Chromium Navigator scenarios. TypeScript, production build, scoped lint and formatting, dependency and source tree checks, Writer resources, policy routing and scoped provenance passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:18:54.834Z, excerpt_hash=sha256:5acb89af59599a96b6c046cf567fb732ced87ce61e20656de30289fd2c9ac972

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270711-8WD106/blueprint/resolved-snapshot.json
- old_digest: a0328bb77f3c212ea9890615aae9b863fc1be46dcaa0be85a8f93c569edead59
- current_digest: a0328bb77f3c212ea9890615aae9b863fc1be46dcaa0be85a8f93c569edead59
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270711-8WD106

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270711-8WD106
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

Pinned tree loads settings from the SwModule Navigator configuration and caches them in each content tree. Outline Focus collapses the other top-level heading branches only on a changed tracked heading; Off allows the bookmark fallback. Table and Bookmark Tracking checkboxes are shown only for their matching content rows. Browser storage preserves unrelated Navigator properties and persists the represented settings outside ODT. No dedicated upstream test for these settings was found; local focused behavior, configuration, and Chromium reload tests cover the slice. Source provenance passed for the six changed records using the same validator. Repository-wide check:source-provenance and inventory:invariants both hit the existing ODT property round-trip marker drift on the integrated branch.
