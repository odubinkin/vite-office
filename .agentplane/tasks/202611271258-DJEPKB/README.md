---
id: "202611271258-DJEPKB"
title: "Use native plain ODF package media-type admission in Writer and Calc"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "filters"
  - "odf"
  - "package"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify unmodified upstream ODT and ODS packages with native ordinary loading, supported optional or noncanonical mimetype entries, rejected manifest conflicts and repair-only fallback, document round trips and related package/Writer/Calc/Worker tests."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:59:48.948Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T14:46:17.809Z"
  updated_by: "CODER"
  note: "Tests  72 passed (72). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:46:18.346Z"
  updated_by: "EVALUATOR"
  note: "The original tdf106899.odt with a later mimetype entry and tdf103829_textTab.ods with a deflated mimetype opened. Ordinary loads used the original manifest type for optional or reordered MIME streams, and exported packages placed mimetype first and stored. Conflicts, malformed manifests, and repair-only fallbacks were rejected."
  evaluated_sha: "eee88f64aaafa4445449a10cde59080e616d88e6"
  blueprint_digest: "9e6eba285954a1b45b65304f3405e23617dcf119fb63fe6fdab4378ea991a3ce"
  evidence_refs:
    - ".agentplane/tasks/202611271258-DJEPKB/README.md"
    - ".agentplane/tasks/202611271258-DJEPKB/quality/20261127-144618346-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271258-DJEPKB/quality/20261127-144618346-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271258-DJEPKB/quality/20261127-144618346-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271258-DJEPKB/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/DJEPKB/verification.md"
    - "eee88f64aaafa4445449a10cde59080e616d88e6"
  findings:
    - "Normal package ZIP validation, manifest processing and filter progress were verified. The existing recovery and repair policies remain in effect."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: follow native ZipPackage metadata read and Sfx storage admission while preserving the existing non-recovery workflow."
events:
  -
    type: "status"
    at: "2026-11-27T12:59:49.969Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: follow native ZipPackage metadata read and Sfx storage admission while preserving the existing non-recovery workflow."
  -
    type: "verify"
    at: "2026-11-27T14:46:17.809Z"
    author: "CODER"
    state: "ok"
    note: "Tests  72 passed (72). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:46:17.882Z"
doc_updated_by: "CODER"
description: "Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes."
sections:
  Summary: |-
    Use native plain ODF package media-type admission in Writer and Calc

    Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.
  Scope: |-
    - In scope: Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.
    - Out of scope: unrelated refactors not required for "Use native plain ODF package media-type admission in Writer and Calc".
  Plan: "Move ordinary ODT and ODS read admission to the represented ZipPackage metadata plus the original Sfx repair-only fallback decision. Preserve progress and cancellation, normal stream consistency checks and the existing ZIP writer ordering. Use source-backed archive fixtures to verify accepted and rejected variants in the normal import and Worker paths. No change to repair or recovery behavior."
  Verify Steps: |-
    PLANNER fallback scaffold for "Use native plain ODF package media-type admission in Writer and Calc". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Use native plain ODF package media-type admission in Writer and Calc". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T14:46:17.809Z — VERIFY — ok

    By: CODER

    Note: Tests  72 passed (72). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:59:49.969Z, excerpt_hash=sha256:607b36ab2deadde327b4ab701235ecce47bc41615b1eb07994e0697c376b23b4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271258-DJEPKB/blueprint/resolved-snapshot.json
    - old_digest: 9e6eba285954a1b45b65304f3405e23617dcf119fb63fe6fdab4378ea991a3ce
    - current_digest: 9e6eba285954a1b45b65304f3405e23617dcf119fb63fe6fdab4378ea991a3ce
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271258-DJEPKB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271258-DJEPKB
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

Use native plain ODF package media-type admission in Writer and Calc

Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.

## Scope

- In scope: Route ODT and ODS file admission through pinned ZipPackage manifest/media-type rules. Accept standard typed content through the manifest when the optional mimetype stream is reordered, compressed or absent, preserving actual manifest conflicts and ordinary Sfx rejection of media-type fallback packages requiring repair. Keep normal ZIP validation, encryption scope, resource bounds, cancellation, and canonical uncompressed-first export. Verify pinned accepted documents, existing negative cases updated to native behavior, and public import and Worker routes.
- Out of scope: unrelated refactors not required for "Use native plain ODF package media-type admission in Writer and Calc".

## Plan

Move ordinary ODT and ODS read admission to the represented ZipPackage metadata plus the original Sfx repair-only fallback decision. Preserve progress and cancellation, normal stream consistency checks and the existing ZIP writer ordering. Use source-backed archive fixtures to verify accepted and rejected variants in the normal import and Worker paths. No change to repair or recovery behavior.

## Verify Steps

PLANNER fallback scaffold for "Use native plain ODF package media-type admission in Writer and Calc". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Use native plain ODF package media-type admission in Writer and Calc". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T14:46:17.809Z — VERIFY — ok

By: CODER

Note: Tests  72 passed (72). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:59:49.969Z, excerpt_hash=sha256:607b36ab2deadde327b4ab701235ecce47bc41615b1eb07994e0697c376b23b4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271258-DJEPKB/blueprint/resolved-snapshot.json
- old_digest: 9e6eba285954a1b45b65304f3405e23617dcf119fb63fe6fdab4378ea991a3ce
- current_digest: 9e6eba285954a1b45b65304f3405e23617dcf119fb63fe6fdab4378ea991a3ce
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271258-DJEPKB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271258-DJEPKB
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
