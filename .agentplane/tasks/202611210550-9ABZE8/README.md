---
id: "202611210550-9ABZE8"
title: "Port Writer ODT page background bitmap and color ownership"
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
verify:
  - "Run scoped Writer ODT background, page layout, graphic package, Worker and shared fill-item tests along with office typecheck, scoped lint and formatting, module boundaries, provenance, routing, doctor and git checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:50:26.466Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T06:04:56.162Z"
  updated_by: "CODER"
  note: "Verified Writer ODT named and legacy page bitmaps and solid page/story backgrounds against the pinned LibreOffice fixture."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T06:04:56.788Z"
  updated_by: "EVALUATOR"
  note: "Verified original Writer page-background assertions and retained bitmap resources through ODT and Worker."
  evaluated_sha: "812018a71b3e72c3026e2145ffa1b6593adcf083"
  blueprint_digest: "1c8c71763c3c0b7ca60af6b43128526a30dcf4f5cf4ae52f428afc7a701930b5"
  evidence_refs:
    - ".agentplane/tasks/202611210550-9ABZE8/README.md"
    - ".agentplane/tasks/202611210550-9ABZE8/quality/20261121-060456788-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210550-9ABZE8/quality/20261121-060456788-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210550-9ABZE8/quality/20261121-060456788-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210550-9ABZE8/blueprint/resolved-snapshot.json"
    - "output/playwright/9ABZE8/writer.log"
    - "output/playwright/9ABZE8/shared.log"
    - "output/playwright/9ABZE8/final-types.log"
    - "output/playwright/9ABZE8/final-provenance.log"
  findings:
    - "Canonical page and story items, typed page style queries, and the existing graphic package helper retain embedded fills from modern and legacy XML. Original bytes survive and the package stores shared images once."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port native bitmap ownership and Writer ODF page and story background mappings from the pinned source."
events:
  -
    type: "status"
    at: "2026-11-21T05:50:26.822Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native bitmap ownership and Writer ODF page and story background mappings from the pinned source."
  -
    type: "verify"
    at: "2026-11-21T06:04:56.162Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer ODT named and legacy page bitmaps and solid page/story backgrounds against the pinned LibreOffice fixture."
doc_version: 3
doc_updated_at: "2026-11-21T06:04:56.215Z"
doc_updated_by: "CODER"
description: "Port named and legacy page fill image import, native DrawingLayer fill items and Worker transfer, page style properties, package export, and the original PageBackground.odt assertions."
sections:
  Summary: "Restore Writer ODF page background bitmap and color round trips from the pinned LibreOffice page style and fill owners."
  Scope: "Shared xmloff image style and page backgrounds, DrawingLayer bitmap item and relevant mode WhichIds, Writer page styles and story frame backgrounds, ODF package streams, Worker transfer, pinned and independent tests, source registry and suspected issue notes. Use the existing embedded graphic package profile and preserve project file and recovery policies."
  Plan: "Port native bitmap item and mode, named ODF image styles and legacy fallback for page and story fills, package and Worker round trips, then verify pinned source assertions and scope checks."
  Verify Steps: "Run targeted Writer page layout, story, ODT graphic and Worker tests plus shared fill item and graphic helper tests. Run office typecheck, scoped ESLint and Prettier, module boundaries, provenance, routing, doctor and git diff checks."
  Verification: |-
    Pending implementation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T06:04:56.162Z — VERIFY — ok

    By: CODER

    Note: Verified Writer ODT named and legacy page bitmaps and solid page/story backgrounds against the pinned LibreOffice fixture.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T05:50:26.822Z, excerpt_hash=sha256:0a47b1eab5fc2643e54c2314cc260b0c3e3db531a4a5e4224d6966c3ee4bc4c4

    Details:

    Implementation 812018a71b3e. Scoped Writer Vitest passed 50 tests across 9 files for page backgrounds, page layouts and stories, property APIs, ODT round trip and Worker. The pinned PageBackground.odt port checks original UNO style/name/mode and original bytes through Worker and export/reopen. Independent XML checks named image retention, legacy repeat precedence, image opacity and header fills. Scoped shared fill, property and graphic helper suites passed 43 tests across 5 files. Office tsc --noEmit --singleThreaded --checkers 1, scoped ESLint and Prettier, check:dependencies, check:source-provenance, inventory:parity:shared, routing, doctor and git diff --check passed. Doctor noted the existing hook shim warning. Full run remains on its ten-task cadence. This task covers embedded PNG/JPEG and the represented fill and repeat properties; arbitrary reference positions, other image formats, inline or linked images, and full drawing services remain outside this evidence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210550-9ABZE8/blueprint/resolved-snapshot.json
    - old_digest: 1c8c71763c3c0b7ca60af6b43128526a30dcf4f5cf4ae52f428afc7a701930b5
    - current_digest: 1c8c71763c3c0b7ca60af6b43128526a30dcf4f5cf4ae52f428afc7a701930b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210550-9ABZE8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210550-9ABZE8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Restore Writer ODF page background bitmap and color round trips from the pinned LibreOffice page style and fill owners.

## Scope

Shared xmloff image style and page backgrounds, DrawingLayer bitmap item and relevant mode WhichIds, Writer page styles and story frame backgrounds, ODF package streams, Worker transfer, pinned and independent tests, source registry and suspected issue notes. Use the existing embedded graphic package profile and preserve project file and recovery policies.

## Plan

Port native bitmap item and mode, named ODF image styles and legacy fallback for page and story fills, package and Worker round trips, then verify pinned source assertions and scope checks.

## Verify Steps

Run targeted Writer page layout, story, ODT graphic and Worker tests plus shared fill item and graphic helper tests. Run office typecheck, scoped ESLint and Prettier, module boundaries, provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T06:04:56.162Z — VERIFY — ok

By: CODER

Note: Verified Writer ODT named and legacy page bitmaps and solid page/story backgrounds against the pinned LibreOffice fixture.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T05:50:26.822Z, excerpt_hash=sha256:0a47b1eab5fc2643e54c2314cc260b0c3e3db531a4a5e4224d6966c3ee4bc4c4

Details:

Implementation 812018a71b3e. Scoped Writer Vitest passed 50 tests across 9 files for page backgrounds, page layouts and stories, property APIs, ODT round trip and Worker. The pinned PageBackground.odt port checks original UNO style/name/mode and original bytes through Worker and export/reopen. Independent XML checks named image retention, legacy repeat precedence, image opacity and header fills. Scoped shared fill, property and graphic helper suites passed 43 tests across 5 files. Office tsc --noEmit --singleThreaded --checkers 1, scoped ESLint and Prettier, check:dependencies, check:source-provenance, inventory:parity:shared, routing, doctor and git diff --check passed. Doctor noted the existing hook shim warning. Full run remains on its ten-task cadence. This task covers embedded PNG/JPEG and the represented fill and repeat properties; arbitrary reference positions, other image formats, inline or linked images, and full drawing services remain outside this evidence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210550-9ABZE8/blueprint/resolved-snapshot.json
- old_digest: 1c8c71763c3c0b7ca60af6b43128526a30dcf4f5cf4ae52f428afc7a701930b5
- current_digest: 1c8c71763c3c0b7ca60af6b43128526a30dcf4f5cf4ae52f428afc7a701930b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210550-9ABZE8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210550-9ABZE8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit.

## Findings

None at intake.
