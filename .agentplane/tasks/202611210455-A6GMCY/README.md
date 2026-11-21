---
id: "202611210455-A6GMCY"
title: "Align Calc ODS rich cell text and fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:56:00.352Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T05:08:15.891Z"
  updated_by: "CODER"
  note: "Verified native Calc ODS rich cell fields, formatting and multiline results across package and Worker boundaries."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T05:08:16.502Z"
  updated_by: "EVALUATOR"
  note: "The connected Calc edit-field classes match the pinned ODF owners for field payloads and text boundaries."
  evaluated_sha: "7b6007ea42e5d434fbb24d4d6620599d0df9fcbb"
  blueprint_digest: "7cddaf7aa3859bd2f8af49dd26aeb7a418f3b01efd76f405d7fbf4dd0003e178"
  evidence_refs:
    - ".agentplane/tasks/202611210455-A6GMCY/README.md"
    - ".agentplane/tasks/202611210455-A6GMCY/quality/20261121-050816502-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210455-A6GMCY/quality/20261121-050816502-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210455-A6GMCY/quality/20261121-050816502-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210455-A6GMCY/blueprint/resolved-snapshot.json"
    - "output/playwright/A6GMCY/calc-verified.log"
    - "output/playwright/A6GMCY/editeng-final.log"
    - "docs/program/calc-upstream-suspected-issues.md"
  findings:
    - "Two pinned packages and independent source-shaped ODF cases verify hyperlink targets, escaped reference paths, edit fields, and formula paragraph boundaries. All 125 Calc and 46 shared cases passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: map supported Calc ODS text fields and boundaries to EditEngine and transfer."
events:
  -
    type: "status"
    at: "2026-11-21T04:56:16.170Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: map supported Calc ODS text fields and boundaries to EditEngine and transfer."
  -
    type: "verify"
    at: "2026-11-21T05:08:15.891Z"
    author: "CODER"
    state: "ok"
    note: "Verified native Calc ODS rich cell fields, formatting and multiline results across package and Worker boundaries."
doc_version: 3
doc_updated_at: "2026-11-21T05:08:15.942Z"
doc_updated_by: "CODER"
description: "Use native edit features for ODS URL, sheet, date and document title fields, and preserve XML text boundaries and styles across package and Worker transfer. Port the pinned Calc hyperlink-frame and rich text checks."
sections:
  Summary: "Align Calc ODS rich cell text with the represented Calc and EditEngine field owners."
  Scope: "Calc SAX text and field contexts, edit-field construction, field export, text boundaries and formula result paragraphs, Calc Worker transfer, related tests, source records and source findings. Preserve the existing file workflow and support the native URL, table, date and document title field classes."
  Plan: "Follow the pinned Calc paragraph, field and WriteEditCell owners. Preserve field features and styling within EditEngine, the native source token defaults and the existing Worker transfer format. Verify pinned and focused round trips."
  Verify Steps: "Run the Calc ODS filter, rich text and Worker tests, current field and EditEngine ownership tests, and the pinned hyperlink_frame.ods and external_hyperlink.ods regressions in the ODS path. Check Office typecheck, scoped lint/format, dependency guard, provenance, routing, doctor and git diff."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T05:08:15.891Z — VERIFY — ok

    By: CODER

    Note: Verified native Calc ODS rich cell fields, formatting and multiline results across package and Worker boundaries.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:56:16.170Z, excerpt_hash=sha256:317e4bb64450326177f4d5de12fb461796422d159c366a37e34fe06f34fd56c4

    Details:

    - Command: npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml/ods-worker src/sc/source/ui/docshell/docsh.csv-export.test.ts --maxWorkers 2 --testTimeout 120000. Result: 125 passed across 27 files. Covers the represented ODS filter, Worker, native fields, pinned hyperlink_frame.ods and external_hyperlink.ods, and CSV display. The full focused replay passed after updating the old ODS flattening assertion and using an existing formula operation for the multiline fixture.
    - Command: npm run test:shared -- src/editeng/source/items/native-field-values.test.ts src/editeng/source/editeng/native-edit-text-object.test.ts src/editeng/source/editeng/native-edit-document.test.ts src/editeng/source/editeng/native-engine-lifecycle.test.ts --maxWorkers 1 --testTimeout 120000. Result: 46 passed across four files. Covers native field values, feature ownership, edit objects and engine selection and lifecycle.
    - Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1. Result: passed. Scoped Prettier and ESLint, npm run check:dependencies, npm run check:source-provenance, node .agentplane/policy/check-routing.mjs, ap doctor and git diff --check passed. Doctor retained the existing hook-shim readiness warning.
    - Pinned hyperlink fixtures verify the target frame and percent-encoded reference through the ODS path. The encoded reference also passes through the Worker with a supplied original document URI. Byte-only import preserves a relative link when a URI is unavailable. The source date field behavior is recorded in CALC-787.
    - Evidence: output/playwright/A6GMCY/calc-verified.log, editeng-final.log and typecheck.log. The complete application suite was outside this checkpoint under the agreed run cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210455-A6GMCY/blueprint/resolved-snapshot.json
    - old_digest: 7cddaf7aa3859bd2f8af49dd26aeb7a418f3b01efd76f405d7fbf4dd0003e178
    - current_digest: 7cddaf7aa3859bd2f8af49dd26aeb7a418f3b01efd76f405d7fbf4dd0003e178
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210455-A6GMCY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210455-A6GMCY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task's code and test commits. Added Worker fields have a backward-compatible representation."
  Findings: "Record any source field behavior and limits here."
id_source: "generated"
---
## Summary

Align Calc ODS rich cell text with the represented Calc and EditEngine field owners.

## Scope

Calc SAX text and field contexts, edit-field construction, field export, text boundaries and formula result paragraphs, Calc Worker transfer, related tests, source records and source findings. Preserve the existing file workflow and support the native URL, table, date and document title field classes.

## Plan

Follow the pinned Calc paragraph, field and WriteEditCell owners. Preserve field features and styling within EditEngine, the native source token defaults and the existing Worker transfer format. Verify pinned and focused round trips.

## Verify Steps

Run the Calc ODS filter, rich text and Worker tests, current field and EditEngine ownership tests, and the pinned hyperlink_frame.ods and external_hyperlink.ods regressions in the ODS path. Check Office typecheck, scoped lint/format, dependency guard, provenance, routing, doctor and git diff.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T05:08:15.891Z — VERIFY — ok

By: CODER

Note: Verified native Calc ODS rich cell fields, formatting and multiline results across package and Worker boundaries.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:56:16.170Z, excerpt_hash=sha256:317e4bb64450326177f4d5de12fb461796422d159c366a37e34fe06f34fd56c4

Details:

- Command: npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml/ods-worker src/sc/source/ui/docshell/docsh.csv-export.test.ts --maxWorkers 2 --testTimeout 120000. Result: 125 passed across 27 files. Covers the represented ODS filter, Worker, native fields, pinned hyperlink_frame.ods and external_hyperlink.ods, and CSV display. The full focused replay passed after updating the old ODS flattening assertion and using an existing formula operation for the multiline fixture.
- Command: npm run test:shared -- src/editeng/source/items/native-field-values.test.ts src/editeng/source/editeng/native-edit-text-object.test.ts src/editeng/source/editeng/native-edit-document.test.ts src/editeng/source/editeng/native-engine-lifecycle.test.ts --maxWorkers 1 --testTimeout 120000. Result: 46 passed across four files. Covers native field values, feature ownership, edit objects and engine selection and lifecycle.
- Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1. Result: passed. Scoped Prettier and ESLint, npm run check:dependencies, npm run check:source-provenance, node .agentplane/policy/check-routing.mjs, ap doctor and git diff --check passed. Doctor retained the existing hook-shim readiness warning.
- Pinned hyperlink fixtures verify the target frame and percent-encoded reference through the ODS path. The encoded reference also passes through the Worker with a supplied original document URI. Byte-only import preserves a relative link when a URI is unavailable. The source date field behavior is recorded in CALC-787.
- Evidence: output/playwright/A6GMCY/calc-verified.log, editeng-final.log and typecheck.log. The complete application suite was outside this checkpoint under the agreed run cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611210455-A6GMCY/blueprint/resolved-snapshot.json
- old_digest: 7cddaf7aa3859bd2f8af49dd26aeb7a418f3b01efd76f405d7fbf4dd0003e178
- current_digest: 7cddaf7aa3859bd2f8af49dd26aeb7a418f3b01efd76f405d7fbf4dd0003e178
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210455-A6GMCY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210455-A6GMCY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task's code and test commits. Added Worker fields have a backward-compatible representation.

## Findings

Record any source field behavior and limits here.
