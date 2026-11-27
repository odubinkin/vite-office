---
id: "202611271020-2CQ5A9"
title: "Preserve native Writer text sections through ODT and Worker transport"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T10:20:46.330Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T11:33:41.032Z"
  updated_by: "CODER"
  note: "Tests  92 passed (92). Office typecheck, lint, formatting, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T11:33:41.487Z"
  updated_by: "EVALUATOR"
  note: "Pinned protection keys; nested body and repeated table sections, linked descriptors, crossing bookmarks and original section properties."
  evaluated_sha: "0e0f5fdec50e98cb00763296a5b8e3486ccbd585"
  blueprint_digest: "223e121ceed9b48b7a7a46814f65373ceab3ecc9821089b5ce75465819cc499a"
  evidence_refs:
    - ".agentplane/tasks/202611271020-2CQ5A9/README.md"
    - ".agentplane/tasks/202611271020-2CQ5A9/quality/20261127-113341487-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271020-2CQ5A9/quality/20261127-113341487-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271020-2CQ5A9/quality/20261127-113341487-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271020-2CQ5A9/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/2CQ5A9/verification.md"
    - "0e0f5fdec50e98cb00763296a5b8e3486ccbd585"
  findings:
    - "Section nodes retain named ownership and text flow across document and Worker boundaries. Physical section layout, unrepresented format properties, and link refresh are outside the tested slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T10:20:53.473Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T11:33:41.032Z"
    author: "CODER"
    state: "ok"
    note: "Tests  92 passed (92). Office typecheck, lint, formatting, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T11:33:41.086Z"
doc_updated_by: "CODER"
description: "Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode."
sections:
  Summary: |-
    Preserve native Writer text sections through ODT and Worker transport

    Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.
  Scope: |-
    - In scope: Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.
    - Out of scope: unrelated refactors not required for "Preserve native Writer text sections through ODT and Worker transport".
  Plan: "1. Map SwSectionData, SwSectionFormat, SwSectionNode and SwXTextSection to the implemented Writer node and UNO slice. 2. Port the shared ODF section contexts and Writer adapters for body and cells, preserving native property defaults and nesting. 3. Transport actual section nodes in the Writer graph with legacy decoding, and verify the pinned protection-key scenario and existing affected suites."
  Verify Steps: |-
    1. Load the pinned Writer protection-key fixture and run its native key assertions across export and reimport.
    2. Exercise ordered nested body and cell section ownership through ODT and Worker graph transport.
    3. Run affected Writer node, text-filter and Worker tests plus Office typecheck, format, dependency, provenance and Writer inventory checks. Record the exact supported behavior and results.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T11:33:41.032Z — VERIFY — ok

    By: CODER

    Note: Tests  92 passed (92). Office typecheck, lint, formatting, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T10:20:53.473Z, excerpt_hash=sha256:88cc547758f19de7cafaf1b3a685ea86733a5a87ae5930edfe205e6d808925b7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271020-2CQ5A9/blueprint/resolved-snapshot.json
    - old_digest: 223e121ceed9b48b7a7a46814f65373ceab3ecc9821089b5ce75465819cc499a
    - current_digest: 223e121ceed9b48b7a7a46814f65373ceab3ecc9821089b5ce75465819cc499a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271020-2CQ5A9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271020-2CQ5A9
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

Preserve native Writer text sections through ODT and Worker transport

Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.

## Scope

- In scope: Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.
- Out of scope: unrelated refactors not required for "Preserve native Writer text sections through ODT and Worker transport".

## Plan

1. Map SwSectionData, SwSectionFormat, SwSectionNode and SwXTextSection to the implemented Writer node and UNO slice. 2. Port the shared ODF section contexts and Writer adapters for body and cells, preserving native property defaults and nesting. 3. Transport actual section nodes in the Writer graph with legacy decoding, and verify the pinned protection-key scenario and existing affected suites.

## Verify Steps

1. Load the pinned Writer protection-key fixture and run its native key assertions across export and reimport.
2. Exercise ordered nested body and cell section ownership through ODT and Worker graph transport.
3. Run affected Writer node, text-filter and Worker tests plus Office typecheck, format, dependency, provenance and Writer inventory checks. Record the exact supported behavior and results.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T11:33:41.032Z — VERIFY — ok

By: CODER

Note: Tests  92 passed (92). Office typecheck, lint, formatting, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T10:20:53.473Z, excerpt_hash=sha256:88cc547758f19de7cafaf1b3a685ea86733a5a87ae5930edfe205e6d808925b7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271020-2CQ5A9/blueprint/resolved-snapshot.json
- old_digest: 223e121ceed9b48b7a7a46814f65373ceab3ecc9821089b5ce75465819cc499a
- current_digest: 223e121ceed9b48b7a7a46814f65373ceab3ecc9821089b5ce75465819cc499a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271020-2CQ5A9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271020-2CQ5A9
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
