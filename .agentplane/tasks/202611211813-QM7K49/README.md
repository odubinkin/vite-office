---
id: "202611211813-QM7K49"
title: "Preserve Writer ODT paragraph line-number restarts"
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
  updated_at: "2026-11-21T18:14:00.908Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:23:17.128Z"
  updated_by: "CODER"
  note: "Verified native paragraph line numbering across Writer ODT, layout, legacy and current Worker records and original UNO members."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:23:19.045Z"
  updated_by: "EVALUATOR"
  note: "Writer preserves paragraph line-number participation and start through the original native item and ODT properties."
  evaluated_sha: "5e3d760dee19c9f314f982a3ee09420fdd9af2ed"
  blueprint_digest: "c957649d7d4b8b12944254ece30e39f596f3e3823295399e1ac554063e64c273"
  evidence_refs:
    - ".agentplane/tasks/202611211813-QM7K49/README.md"
    - ".agentplane/tasks/202611211813-QM7K49/quality/20261121-182319045-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211813-QM7K49/quality/20261121-182319045-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211813-QM7K49/quality/20261121-182319045-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211813-QM7K49/blueprint/resolved-snapshot.json"
    - "output/playwright/QM7K49/writer.log"
    - "output/playwright/QM7K49/property-final.log"
    - "output/playwright/QM7K49/shared.log"
    - "output/playwright/QM7K49/types-final.log"
    - "output/playwright/QM7K49/provenance.log"
  findings:
    - "Pinned style, automatic style keys, native UNO narrowing, Worker records, paragraph edits and frame continuation were verified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port SwFormatLineNumber and its ODT, Writer layout and transfer boundaries."
events:
  -
    type: "status"
    at: "2026-11-21T18:14:05.559Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port SwFormatLineNumber and its ODT, Writer layout and transfer boundaries."
  -
    type: "verify"
    at: "2026-11-21T18:23:17.128Z"
    author: "CODER"
    state: "ok"
    note: "Verified native paragraph line numbering across Writer ODT, layout, legacy and current Worker records and original UNO members."
doc_version: 3
doc_updated_at: "2026-11-21T18:23:17.211Z"
doc_updated_by: "CODER"
description: "Port SwFormatLineNumber, UNO members, ODF paragraph count and restart values, existing model consumers and Worker snapshot compatibility. Verify layout restarts and scoped paragraph-format tests."
sections:
  Summary: "Preserve native Writer paragraph line-number participation and restarts through ODT."
  Scope: "Writer SwFormatLineNumber, pool and paragraph UNO/default properties, ODF style mapping and automatic style identity, Worker snapshot compatibility, paragraph editing, existing format consumers and layout sequencing. Includes pinned ODT input with a paragraph restart and native 24-bit conversion."
  Plan: "Replace the boolean placeholder with the original item and member contracts. Preserve old boolean transfer records. Route both properties through ODF, carry restart state into the current frame sequence and preserve it when changing existing paragraph settings. Port applicable assertions from the original fixtures."
  Verify Steps: "Run scoped Writer ODT, paragraph item and UNO, layout, existing RTF and paragraph-dialog consumers, and Worker tests. Verify original ODT restart input, inherited and direct values, a legacy boolean snapshot and restart precedence across frames. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and whitespace checks."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:23:17.128Z — VERIFY — ok

    By: CODER

    Note: Verified native paragraph line numbering across Writer ODT, layout, legacy and current Worker records and original UNO members.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:14:05.559Z, excerpt_hash=sha256:406b37bd2f0296bdf60269a8e97a3945d590bc3aada97a7a98253a430c1d1f32

    Details:

    Implementation 5e3d760dee19. Scoped Writer suites passed 122 scenarios in 15 files during the first grouped pass. The sole failure expected strict rejection of a malformed participation boolean. The updated property acceptance checks the native behavior of retaining default participation and applying the valid start member. Its follow-up passed all 12 tests in that file, covering the previous failure. All 123 distinct Writer scenarios and 12 shared XML scenarios in four files passed across these runs. The tdf134548 archive was repacked with mimetype first for the browser reader, retaining original entry contents; tests also cover named style inheritance, separate direct restarts, 24-bit narrowing, legacy boolean transfer, and counted master versus follow-frame behavior. Final Office typecheck, scoped lint and formatting, provenance, module boundaries, routing and git diff checks passed. Doctor retains the existing hook shim warning. Task seven of ten since the full-test cadence reset.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211813-QM7K49/blueprint/resolved-snapshot.json
    - old_digest: c957649d7d4b8b12944254ece30e39f596f3e3823295399e1ac554063e64c273
    - current_digest: c957649d7d4b8b12944254ece30e39f596f3e3823295399e1ac554063e64c273
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211813-QM7K49

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211813-QM7K49
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Preserve native Writer paragraph line-number participation and restarts through ODT.

## Scope

Writer SwFormatLineNumber, pool and paragraph UNO/default properties, ODF style mapping and automatic style identity, Worker snapshot compatibility, paragraph editing, existing format consumers and layout sequencing. Includes pinned ODT input with a paragraph restart and native 24-bit conversion.

## Plan

Replace the boolean placeholder with the original item and member contracts. Preserve old boolean transfer records. Route both properties through ODF, carry restart state into the current frame sequence and preserve it when changing existing paragraph settings. Port applicable assertions from the original fixtures.

## Verify Steps

Run scoped Writer ODT, paragraph item and UNO, layout, existing RTF and paragraph-dialog consumers, and Worker tests. Verify original ODT restart input, inherited and direct values, a legacy boolean snapshot and restart precedence across frames. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, routing, doctor and whitespace checks.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:23:17.128Z — VERIFY — ok

By: CODER

Note: Verified native paragraph line numbering across Writer ODT, layout, legacy and current Worker records and original UNO members.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:14:05.559Z, excerpt_hash=sha256:406b37bd2f0296bdf60269a8e97a3945d590bc3aada97a7a98253a430c1d1f32

Details:

Implementation 5e3d760dee19. Scoped Writer suites passed 122 scenarios in 15 files during the first grouped pass. The sole failure expected strict rejection of a malformed participation boolean. The updated property acceptance checks the native behavior of retaining default participation and applying the valid start member. Its follow-up passed all 12 tests in that file, covering the previous failure. All 123 distinct Writer scenarios and 12 shared XML scenarios in four files passed across these runs. The tdf134548 archive was repacked with mimetype first for the browser reader, retaining original entry contents; tests also cover named style inheritance, separate direct restarts, 24-bit narrowing, legacy boolean transfer, and counted master versus follow-frame behavior. Final Office typecheck, scoped lint and formatting, provenance, module boundaries, routing and git diff checks passed. Doctor retains the existing hook shim warning. Task seven of ten since the full-test cadence reset.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211813-QM7K49/blueprint/resolved-snapshot.json
- old_digest: c957649d7d4b8b12944254ece30e39f596f3e3823295399e1ac554063e64c273
- current_digest: c957649d7d4b8b12944254ece30e39f596f3e3823295399e1ac554063e64c273
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211813-QM7K49

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211813-QM7K49
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
