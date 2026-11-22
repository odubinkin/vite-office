---
id: "202611220216-0YJAN7"
title: "Preserve native Writer point annotations in ODT"
result_summary: "Writer ODT preserves point annotations, thread metadata, native EditEngine text and the original empty date behavior. Range owners remain separately scoped."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:17:29.964Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T02:38:32.731Z"
  updated_by: "CODER"
  note: "Verified Writer point annotations through pinned ODT fixtures, native EditEngine formatting and Writer Worker transfer. Related Writer selection covered 432 tests; two stale font assertions passed on corrected seven-test replay. Shared selection passed 48 tests. Static, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:38:49.904Z"
  updated_by: "EVALUATOR"
  note: "Native point annotation ownership, source fixture formatting and ODT/Worker metadata round trips verified."
  evaluated_sha: "2331391e58b8bfac3a4460cdfacc7ea7046d667e"
  blueprint_digest: "728e324ee8db0b5b004a04cba21ab64096582afd57aaea58aa5100bee906e8f3"
  evidence_refs:
    - ".agentplane/tasks/202611220216-0YJAN7/README.md"
    - ".agentplane/tasks/202611220216-0YJAN7/quality/20261122-023849904-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220216-0YJAN7/quality/20261122-023849904-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220216-0YJAN7/quality/20261122-023849904-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220216-0YJAN7/blueprint/resolved-snapshot.json"
    - "output/playwright/0YJAN7/verification.md"
  findings:
    - "Writer focus covered 432 tests with corrected font declaration replay; shared focus passed 48 tests. Range ownership remains a separate native task."
commit:
  hash: "2331391e58b8bfac3a4460cdfacc7ea7046d667e"
  message: "🧩 0YJAN7 code: update legacy font diagnostic assertions"
comments:
  -
    author: "CODER"
    body: "Start: connect existing native point annotation fields to shared XML metadata and document Worker transport with the represented EditEngine text values."
  -
    author: "CODER"
    body: "Verified: Pinned Writer ODT annotation formatting and status fixtures survive native point anchors, structured clone and save/reopen. Writer checks covered 432 related tests with corrected declaration replay. Shared tests and static checks passed."
events:
  -
    type: "status"
    at: "2026-11-22T02:17:38.574Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect existing native point annotation fields to shared XML metadata and document Worker transport with the represented EditEngine text values."
  -
    type: "verify"
    at: "2026-11-22T02:38:32.731Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer point annotations through pinned ODT fixtures, native EditEngine formatting and Writer Worker transfer. Related Writer selection covered 432 tests; two stale font assertions passed on corrected seven-test replay. Shared selection passed 48 tests. Static, provenance and registry checks passed."
  -
    type: "status"
    at: "2026-11-22T02:48:37.552Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Pinned Writer ODT annotation formatting and status fixtures survive native point anchors, structured clone and save/reopen. Writer checks covered 432 related tests with corrected declaration replay. Shared tests and static checks passed."
doc_version: 3
doc_updated_at: "2026-11-22T02:48:37.553Z"
doc_updated_by: "CODER"
description: "Connect Writer SwPostItField point hints to ODT annotation import/export and Worker snapshots with native annotation metadata and represented EditEngine formatting."
sections:
  Summary: "Preserve the existing native Writer point annotation fields in ODT and the Writer Worker graph."
  Scope: |-
    - Import and export annotation metadata, represented text paragraphs and character formatting through the actual SwPostItField, SwFormatField, SwTextField and EditEngine object.
    - Keep native dummy-character positioning and hint ownership through the Writer body and Worker transfer. Preserve writer comment status, thread names, plain fallback, and rich editor snapshots.
    - This task covers the existing point hint model. The separately owned cross-range annotation marks, additional text field families and UI remain outside the task.
  Plan: |-
    1. Inspect the pinned annotation import/export contexts and local point attribute, edit object and Worker owners.
    2. Connect the native field lifecycle to ODT import and export and the existing Worker graph with source metadata and formatting conversions.
    3. Port applicable source fixture assertions for metadata and native formatting and verify exact point positioning, ODT save/reopen and Worker restoration.
  Verify Steps: |-
    - Run related Writer point hint, search annotation, ODT styles, Worker and native fixture tests.
    - Run relevant shared EditEngine text object and xmloff tests for represented annotation paragraph formatting and date-time behavior.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record deterministic verification and refresh the graph when closing. This is the eighth task in the next ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T02:38:32.731Z — VERIFY — ok

    By: CODER

    Note: Verified Writer point annotations through pinned ODT fixtures, native EditEngine formatting and Writer Worker transfer. Related Writer selection covered 432 tests; two stale font assertions passed on corrected seven-test replay. Shared selection passed 48 tests. Static, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:17:38.574Z, excerpt_hash=sha256:17c623b21f5ef0e8c05fb17c107ba5c504209ecbbe93682581e118a243180d93

    Details:

    # Writer ODT point annotations

    Implementation commit `6ed51fb25564` connects the original annotation name, author, initials, date, thread parent and resolution values to Writer's existing field and text-attribute owners. The annotation runs use a separate native EditEngine text object. The XML text exporter consumes the Writer anchor's dummy character. Worker transport restores the original marker offset without inserting a second marker.

    The Writer ODT replays use the pinned `annotation-formatting.odt` and `resolved-comment.odt` packages. They port the original bold second run and resolved flag assertions, then exercise real Worker transfer and save/reopen. A third case checks two adjacent point fields after a surrogate pair, comment paragraph boundaries, distinct thread names and the original empty date behavior. Upstream issue WRITER-738 records that empty date behavior. Range marks and unrepresented annotation paragraph constructs are outside this point-field scope.

    Shared EditEngine, date converter, and xmloff text tests passed 48 tests across 16 files. The broad Writer run exposed two stale ODT declaration diagnostic expectations against the previous native font mapper. Commit `2331391e5` updates the expectations and all seven declaration tests pass on focused replay. The broader Writer results are recorded below.

    Office typecheck, changed-file ESLint and Prettier, module boundaries, source provenance, Writer registry invariants, policy routing and git diff checks passed. AgentPlane doctor passed and reported the existing managed hook shim warning.

    Writer selection covered 432 tests in 71 files. Its original run passed 430 tests and exposed only the two stale font expectations. The corrected declaration file passed all seven tests on replay. The three point-field tests also passed their independent run on the final annotation witnesses.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220216-0YJAN7/blueprint/resolved-snapshot.json
    - old_digest: 728e324ee8db0b5b004a04cba21ab64096582afd57aaea58aa5100bee906e8f3
    - current_digest: 728e324ee8db0b5b004a04cba21ab64096582afd57aaea58aa5100bee906e8f3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220216-0YJAN7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220216-0YJAN7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and provenance commits and rerun Writer point-hint and ODT Worker verification."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve the existing native Writer point annotation fields in ODT and the Writer Worker graph.

## Scope

- Import and export annotation metadata, represented text paragraphs and character formatting through the actual SwPostItField, SwFormatField, SwTextField and EditEngine object.
- Keep native dummy-character positioning and hint ownership through the Writer body and Worker transfer. Preserve writer comment status, thread names, plain fallback, and rich editor snapshots.
- This task covers the existing point hint model. The separately owned cross-range annotation marks, additional text field families and UI remain outside the task.

## Plan

1. Inspect the pinned annotation import/export contexts and local point attribute, edit object and Worker owners.
2. Connect the native field lifecycle to ODT import and export and the existing Worker graph with source metadata and formatting conversions.
3. Port applicable source fixture assertions for metadata and native formatting and verify exact point positioning, ODT save/reopen and Worker restoration.

## Verify Steps

- Run related Writer point hint, search annotation, ODT styles, Worker and native fixture tests.
- Run relevant shared EditEngine text object and xmloff tests for represented annotation paragraph formatting and date-time behavior.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
- Record deterministic verification and refresh the graph when closing. This is the eighth task in the next ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T02:38:32.731Z — VERIFY — ok

By: CODER

Note: Verified Writer point annotations through pinned ODT fixtures, native EditEngine formatting and Writer Worker transfer. Related Writer selection covered 432 tests; two stale font assertions passed on corrected seven-test replay. Shared selection passed 48 tests. Static, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:17:38.574Z, excerpt_hash=sha256:17c623b21f5ef0e8c05fb17c107ba5c504209ecbbe93682581e118a243180d93

Details:

# Writer ODT point annotations

Implementation commit `6ed51fb25564` connects the original annotation name, author, initials, date, thread parent and resolution values to Writer's existing field and text-attribute owners. The annotation runs use a separate native EditEngine text object. The XML text exporter consumes the Writer anchor's dummy character. Worker transport restores the original marker offset without inserting a second marker.

The Writer ODT replays use the pinned `annotation-formatting.odt` and `resolved-comment.odt` packages. They port the original bold second run and resolved flag assertions, then exercise real Worker transfer and save/reopen. A third case checks two adjacent point fields after a surrogate pair, comment paragraph boundaries, distinct thread names and the original empty date behavior. Upstream issue WRITER-738 records that empty date behavior. Range marks and unrepresented annotation paragraph constructs are outside this point-field scope.

Shared EditEngine, date converter, and xmloff text tests passed 48 tests across 16 files. The broad Writer run exposed two stale ODT declaration diagnostic expectations against the previous native font mapper. Commit `2331391e5` updates the expectations and all seven declaration tests pass on focused replay. The broader Writer results are recorded below.

Office typecheck, changed-file ESLint and Prettier, module boundaries, source provenance, Writer registry invariants, policy routing and git diff checks passed. AgentPlane doctor passed and reported the existing managed hook shim warning.

Writer selection covered 432 tests in 71 files. Its original run passed 430 tests and exposed only the two stale font expectations. The corrected declaration file passed all seven tests on replay. The three point-field tests also passed their independent run on the final annotation witnesses.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220216-0YJAN7/blueprint/resolved-snapshot.json
- old_digest: 728e324ee8db0b5b004a04cba21ab64096582afd57aaea58aa5100bee906e8f3
- current_digest: 728e324ee8db0b5b004a04cba21ab64096582afd57aaea58aa5100bee906e8f3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220216-0YJAN7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220216-0YJAN7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and provenance commits and rerun Writer point-hint and ODT Worker verification.

## Findings
