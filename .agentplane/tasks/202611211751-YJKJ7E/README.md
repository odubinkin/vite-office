---
id: "202611211751-YJKJ7E"
title: "Align Writer ODT line numbering import and export"
result_summary: "Aligned Writer ODT line-numbering import and export with LibreOffice for the represented settings."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:52:07.988Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:08:08.875Z"
  updated_by: "CODER"
  note: "Verified source Writer line-numbering settings through native properties, ODT packages and Worker transport."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:08:12.246Z"
  updated_by: "EVALUATOR"
  note: "Writer ODT line numbering uses the native numbering and style data, admitted through Writer document properties."
  evaluated_sha: "f9930972faee503f0e955f0bba4fea03c3ca8ba8"
  blueprint_digest: "6f71b6c7db528e5202c2cb03ca1e4d836d4d871682834b9c3d43f3e7b4e3c0cd"
  evidence_refs:
    - ".agentplane/tasks/202611211751-YJKJ7E/README.md"
    - ".agentplane/tasks/202611211751-YJKJ7E/quality/20261121-180812246-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211751-YJKJ7E/quality/20261121-180812246-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211751-YJKJ7E/quality/20261121-180812246-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211751-YJKJ7E/blueprint/resolved-snapshot.json"
    - "output/playwright/YJKJ7E/final.log"
    - "output/playwright/YJKJ7E/related.log"
    - "output/playwright/YJKJ7E/shared.log"
    - "output/playwright/YJKJ7E/types-final.log"
    - "output/playwright/YJKJ7E/provenance.log"
  findings:
    - "The pinned paragraph fixture, explicit and omitted offsets, synchronized format and Worker style reconstruction pass."
commit:
  hash: "f9930972faee503f0e955f0bba4fea03c3ca8ba8"
  message: "🧩 YJKJ7E code: preserve Writer ODT line numbering settings"
comments:
  -
    author: "CODER"
    body: "Start: implement native ODT line-number style, numbering format, and property conversion."
  -
    author: "CODER"
    body: "Verified: Writer line-number ODT styles, native numbering and distance, Worker style ownership and pinned paragraph participation."
events:
  -
    type: "status"
    at: "2026-11-21T17:52:28.894Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native ODT line-number style, numbering format, and property conversion."
  -
    type: "verify"
    at: "2026-11-21T18:08:08.875Z"
    author: "CODER"
    state: "ok"
    note: "Verified source Writer line-numbering settings through native properties, ODT packages and Worker transport."
  -
    type: "status"
    at: "2026-11-21T18:11:41.371Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Writer line-number ODT styles, native numbering and distance, Worker style ownership and pinned paragraph participation."
doc_version: 3
doc_updated_at: "2026-11-21T18:11:41.374Z"
doc_updated_by: "CODER"
description: "Port native line-number format and character-style ownership, ODF conversion and defaults, UNO distance sentinel and interval behavior, and Worker transport. Verify scoped ODT and native numbering tests and pinned LibreOffice fixtures."
sections:
  Summary: "Align Writer ODT line-numbering settings with the pinned LibreOffice filter and model."
  Scope: "Shared XML line-number configuration and separator, Writer line-number information and UNO conversion, character style resolution, Worker state, ODT format names, offset and omission rules. Preserve current editor and storage interfaces."
  Plan: "Use the original numbering format converter and actual character style owner. Stage global line-number settings until common styles are ready. Preserve the upstream sentinel, interval admission and duplicate behavior. Verify the same native model values after package export and Worker transfer."
  Verify Steps: "Run targeted Writer ODT line numbering, native line numbering, style, and Worker tests. Use at least one pinned ODT fixture for original line-number settings or paragraph participation. Assert numbering type and character style through ODT and Worker, and original configuration fallback behavior. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor, and whitespace checks."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:08:08.875Z — VERIFY — ok

    By: CODER

    Note: Verified source Writer line-numbering settings through native properties, ODT packages and Worker transport.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:52:28.894Z, excerpt_hash=sha256:db53e859682e24264317a11a324a7b78d5f1586b6acd5e0fb951177b7732ffba

    Details:

    Implementation f9930972faee. Scoped Writer core and ODT line-number suites pass 13 cases in 2 files, including the pinned tdf148834_lineNumbering.odt participation assertions, style pool identity, ODT explicit and implicit offset behavior, and a Worker round trip for non-decimal format and character style. Related Writer style, paragraph property, Worker, RTF, dialog and layout suites pass 39 cases in 8 files. Shared ODF converter and interval suites pass 5 cases in 2 files. Final Office typecheck, scoped lint and formatting, boundaries, provenance, routing and whitespace checks pass. AgentPlane doctor reports the pre-existing hook shim warning. The pinned source sentinel and separator interval behavior are documented as WRITER-728 and WRITER-729. Browser glyph painting is outside this ODT settings task. This is task six of ten since the full-test cadence reset.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211751-YJKJ7E/blueprint/resolved-snapshot.json
    - old_digest: 6f71b6c7db528e5202c2cb03ca1e4d836d4d871682834b9c3d43f3e7b4e3c0cd
    - current_digest: 6f71b6c7db528e5202c2cb03ca1e4d836d4d871682834b9c3d43f3e7b4e3c0cd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211751-YJKJ7E

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211751-YJKJ7E
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

Align Writer ODT line-numbering settings with the pinned LibreOffice filter and model.

## Scope

Shared XML line-number configuration and separator, Writer line-number information and UNO conversion, character style resolution, Worker state, ODT format names, offset and omission rules. Preserve current editor and storage interfaces.

## Plan

Use the original numbering format converter and actual character style owner. Stage global line-number settings until common styles are ready. Preserve the upstream sentinel, interval admission and duplicate behavior. Verify the same native model values after package export and Worker transfer.

## Verify Steps

Run targeted Writer ODT line numbering, native line numbering, style, and Worker tests. Use at least one pinned ODT fixture for original line-number settings or paragraph participation. Assert numbering type and character style through ODT and Worker, and original configuration fallback behavior. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor, and whitespace checks.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:08:08.875Z — VERIFY — ok

By: CODER

Note: Verified source Writer line-numbering settings through native properties, ODT packages and Worker transport.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:52:28.894Z, excerpt_hash=sha256:db53e859682e24264317a11a324a7b78d5f1586b6acd5e0fb951177b7732ffba

Details:

Implementation f9930972faee. Scoped Writer core and ODT line-number suites pass 13 cases in 2 files, including the pinned tdf148834_lineNumbering.odt participation assertions, style pool identity, ODT explicit and implicit offset behavior, and a Worker round trip for non-decimal format and character style. Related Writer style, paragraph property, Worker, RTF, dialog and layout suites pass 39 cases in 8 files. Shared ODF converter and interval suites pass 5 cases in 2 files. Final Office typecheck, scoped lint and formatting, boundaries, provenance, routing and whitespace checks pass. AgentPlane doctor reports the pre-existing hook shim warning. The pinned source sentinel and separator interval behavior are documented as WRITER-728 and WRITER-729. Browser glyph painting is outside this ODT settings task. This is task six of ten since the full-test cadence reset.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211751-YJKJ7E/blueprint/resolved-snapshot.json
- old_digest: 6f71b6c7db528e5202c2cb03ca1e4d836d4d871682834b9c3d43f3e7b4e3c0cd
- current_digest: 6f71b6c7db528e5202c2cb03ca1e4d836d4d871682834b9c3d43f3e7b4e3c0cd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211751-YJKJ7E

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211751-YJKJ7E
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
