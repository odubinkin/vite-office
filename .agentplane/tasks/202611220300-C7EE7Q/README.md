---
id: "202611220300-C7EE7Q"
title: "Preserve native Writer annotation ranges in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202611220247-KQ341H"
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:01:12.375Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T03:10:16.852Z"
  updated_by: "CODER"
  note: "56 related Writer tests and 13 shared ODF tests passed. Verified source single- and multi-paragraph annotation ranges, trailing field binding, Worker transfer and ODT reopening. Static/provenance/registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T03:10:28.069Z"
  updated_by: "EVALUATOR"
  note: "Native annotation range and field ownership verified through Writer ODT and Worker."
  evaluated_sha: "2afdb62fe60163295a159f2644620070be5dc2c1"
  blueprint_digest: "77a0ccf584b88a195c6c6e40a37b0fc01f4ed8fee73ba0d1e85ded1b707ff2d4"
  evidence_refs:
    - ".agentplane/tasks/202611220300-C7EE7Q/README.md"
    - ".agentplane/tasks/202611220300-C7EE7Q/quality/20261122-031028069-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220300-C7EE7Q/quality/20261122-031028069-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220300-C7EE7Q/quality/20261122-031028069-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220300-C7EE7Q/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-odt-annotation-ranges/verification.md"
  findings:
    - "Pinned single and multi-paragraph ranges and related native mark tests pass, along with static and source provenance checks."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T03:01:35.790Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-22T03:10:16.852Z"
    author: "CODER"
    state: "ok"
    note: "56 related Writer tests and 13 shared ODF tests passed. Verified source single- and multi-paragraph annotation ranges, trailing field binding, Worker transfer and ODT reopening. Static/provenance/registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-22T03:10:17.191Z"
doc_updated_by: "CODER"
description: "Port native annotation range endpoints, field reanchoring and range export through Writer ODT and Worker with pinned one- and multi-paragraph fixtures."
sections:
  Summary: "Preserve original Writer annotation ranges in ODT through native registered mark and field ownership."
  Scope: |-
    - Add the represented AnnotationMark family and connect it to the existing Writer annotation field and text node position owners.
    - Import annotation-end by its original name, move the field from the provisional start to the true end, and keep both anchored range positions. Export annotation start and end at native text boundaries without exposing the dummy character.
    - Retain range and field ownership through the Writer Worker graph. Port the applicable single- and multi-paragraph source fixtures.
    - Keep scope on existing Writer document sections and annotation types. Existing save/open and autosave behavior remains outside the task.
  Plan: "Trace the original annotation mark, field attachment and text portion export; port the represented range owners and Worker round trip; verify source one- and multi-paragraph fixtures and launch the tenth-task full checkpoint after closeout."
  Verify Steps: |-
    - Run targeted Writer annotation, text mark, Worker ODT transfer and underlying xmloff paragraph tests.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record deterministic verification and refresh the graph at closeout. This is the tenth AgentPlane task in the current cadence; trigger the separate full regression checkpoint after closing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T03:10:16.852Z — VERIFY — ok

    By: CODER

    Note: 56 related Writer tests and 13 shared ODF tests passed. Verified source single- and multi-paragraph annotation ranges, trailing field binding, Worker transfer and ODT reopening. Static/provenance/registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:01:35.790Z, excerpt_hash=sha256:574411fc4730cf37308881f623fb419cd795a6d57aed2697aadc80a830de17f0

    Details:

    # Writer ODT annotation ranges

    Implementation commit `2afdb62fe` connects native annotation range marks, attached field lookup, range reattachment and separate ODF start/end portions. The Writer Worker restores both registered positions against the existing trailing annotation field. It transfers live field ownership and avoids emitting a stale range whose field was removed.

    The original `fdo38244.odt` and `fdo60769.odt` fixture replays verify single- and multi-paragraph range boundaries, original field names and initials, trailing field ownership, Worker transfer and ODT save/reopen. A model edit witness covers registered offsets, an unmatched end and a deleted trailing field. WRITER-739 records the original preference for authored annotation names during collision handling.

    All 56 related Writer tests passed in eight files. All 13 related xmloff tests passed in four files. Office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks passed. AgentPlane doctor reported the existing managed hook shim warning.

    This is the tenth closed implementation task in the ODF checkpoint cadence. The complete regression runs as a separate task after closeout.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220300-C7EE7Q/blueprint/resolved-snapshot.json
    - old_digest: 77a0ccf584b88a195c6c6e40a37b0fc01f4ed8fee73ba0d1e85ded1b707ff2d4
    - current_digest: 77a0ccf584b88a195c6c6e40a37b0fc01f4ed8fee73ba0d1e85ded1b707ff2d4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220300-C7EE7Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220300-C7EE7Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's code and provenance commits and rerun the Writer annotation and mark tests."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve original Writer annotation ranges in ODT through native registered mark and field ownership.

## Scope

- Add the represented AnnotationMark family and connect it to the existing Writer annotation field and text node position owners.
- Import annotation-end by its original name, move the field from the provisional start to the true end, and keep both anchored range positions. Export annotation start and end at native text boundaries without exposing the dummy character.
- Retain range and field ownership through the Writer Worker graph. Port the applicable single- and multi-paragraph source fixtures.
- Keep scope on existing Writer document sections and annotation types. Existing save/open and autosave behavior remains outside the task.

## Plan

Trace the original annotation mark, field attachment and text portion export; port the represented range owners and Worker round trip; verify source one- and multi-paragraph fixtures and launch the tenth-task full checkpoint after closeout.

## Verify Steps

- Run targeted Writer annotation, text mark, Worker ODT transfer and underlying xmloff paragraph tests.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
- Record deterministic verification and refresh the graph at closeout. This is the tenth AgentPlane task in the current cadence; trigger the separate full regression checkpoint after closing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T03:10:16.852Z — VERIFY — ok

By: CODER

Note: 56 related Writer tests and 13 shared ODF tests passed. Verified source single- and multi-paragraph annotation ranges, trailing field binding, Worker transfer and ODT reopening. Static/provenance/registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:01:35.790Z, excerpt_hash=sha256:574411fc4730cf37308881f623fb419cd795a6d57aed2697aadc80a830de17f0

Details:

# Writer ODT annotation ranges

Implementation commit `2afdb62fe` connects native annotation range marks, attached field lookup, range reattachment and separate ODF start/end portions. The Writer Worker restores both registered positions against the existing trailing annotation field. It transfers live field ownership and avoids emitting a stale range whose field was removed.

The original `fdo38244.odt` and `fdo60769.odt` fixture replays verify single- and multi-paragraph range boundaries, original field names and initials, trailing field ownership, Worker transfer and ODT save/reopen. A model edit witness covers registered offsets, an unmatched end and a deleted trailing field. WRITER-739 records the original preference for authored annotation names during collision handling.

All 56 related Writer tests passed in eight files. All 13 related xmloff tests passed in four files. Office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks passed. AgentPlane doctor reported the existing managed hook shim warning.

This is the tenth closed implementation task in the ODF checkpoint cadence. The complete regression runs as a separate task after closeout.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220300-C7EE7Q/blueprint/resolved-snapshot.json
- old_digest: 77a0ccf584b88a195c6c6e40a37b0fc01f4ed8fee73ba0d1e85ded1b707ff2d4
- current_digest: 77a0ccf584b88a195c6c6e40a37b0fc01f4ed8fee73ba0d1e85ded1b707ff2d4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220300-C7EE7Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220300-C7EE7Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's code and provenance commits and rerun the Writer annotation and mark tests.

## Findings
