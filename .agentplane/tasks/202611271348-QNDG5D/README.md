---
id: "202611271348-QNDG5D"
title: "Connect native document metadata to the Writer and Calc ODF filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "filters"
  - "metadata"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T13:48:58.394Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T15:04:15.325Z"
  updated_by: "CODER"
  note: "Tests  87 passed (87). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T15:04:16.125Z"
  updated_by: "EVALUATOR"
  note: "The original TEST.odt and CUSTOM.odt metadata streams retained native document properties and custom namespaces in the Writer and Calc packages through the Worker and reopen."
  evaluated_sha: "186ffff989405a5aa07f5576ad135e35498eedfe"
  blueprint_digest: "e3d45d06844d0d4c16cc80ee34d984f11b5823ec58114bd3f0eb063852cf635f"
  evidence_refs:
    - ".agentplane/tasks/202611271348-QNDG5D/README.md"
    - ".agentplane/tasks/202611271348-QNDG5D/quality/20261127-150416125-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271348-QNDG5D/quality/20261127-150416125-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271348-QNDG5D/quality/20261127-150416125-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271348-QNDG5D/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/QNDG5D/verification.md"
    - "186ffff989405a5aa07f5576ad135e35498eedfe"
  findings:
    - "WRITER-767 and CALC-866 record duplicate scalar metadata retention in the source DOM. The existing inventory privacy checks passed. Writer disposes the candidate document if embedded font admission fails after metadata import."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Bind native metadata DOM ownership to the package and Worker paths in an isolated snapshot."
events:
  -
    type: "status"
    at: "2026-11-27T13:48:58.910Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Bind native metadata DOM ownership to the package and Worker paths in an isolated snapshot."
  -
    type: "verify"
    at: "2026-11-27T15:04:15.325Z"
    author: "CODER"
    state: "ok"
    note: "Tests  87 passed (87). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T15:04:15.409Z"
doc_updated_by: "CODER"
description: "Use the existing SfxDocumentMetaData DOM and property bag for meta.xml imports and exports. Preserve standardized, user-defined and custom namespace metadata through the real package and Worker paths while keeping browser title/save/open intent."
sections:
  Summary: |-
    Connect native document metadata to the Writer and Calc ODF filters

    Use the existing SfxDocumentMetaData DOM and property bag for meta.xml imports and exports. Preserve standardized, user-defined and custom namespace metadata through the real package and Worker paths while keeping browser title/save/open intent.
  Scope: |-
    - In scope: Use the existing SfxDocumentMetaData DOM and property bag for meta.xml imports and exports. Preserve standardized, user-defined and custom namespace metadata through the real package and Worker paths while keeping browser title/save/open intent.
    - Out of scope: unrelated refactors not required for "Connect native document metadata to the Writer and Calc ODF filters".
  Plan: "Use the pinned SvXMLMetaDocumentContext and SvXMLMetaExport DOM/property contracts with the existing SfxDocumentMetaData and SAX serializer. Populate each imported document metadata owner from the bounded meta stream, retain canonical metadata across browser graph/Worker boundaries, and serialize the original custom XML plus native property bag. Keep shell title and locale behavior, existing browser open/save/autosave semantics and package safety limits. Reuse native metadata QA witnesses TEST.odt and CUSTOM.odt and run targeted Writer, Calc and shared tests. Record only proven native oddities in the existing audit files."
  Verify Steps: |-
    PLANNER fallback scaffold for "Connect native document metadata to the Writer and Calc ODF filters". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Connect native document metadata to the Writer and Calc ODF filters". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T15:04:15.325Z — VERIFY — ok

    By: CODER

    Note: Tests  87 passed (87). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:48:58.910Z, excerpt_hash=sha256:8d60e4593c9288e8717a9cbcf0ed930a90342f159b1366a2e1a764f0a59f05e2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271348-QNDG5D/blueprint/resolved-snapshot.json
    - old_digest: e3d45d06844d0d4c16cc80ee34d984f11b5823ec58114bd3f0eb063852cf635f
    - current_digest: e3d45d06844d0d4c16cc80ee34d984f11b5823ec58114bd3f0eb063852cf635f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271348-QNDG5D

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271348-QNDG5D
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

Connect native document metadata to the Writer and Calc ODF filters

Use the existing SfxDocumentMetaData DOM and property bag for meta.xml imports and exports. Preserve standardized, user-defined and custom namespace metadata through the real package and Worker paths while keeping browser title/save/open intent.

## Scope

- In scope: Use the existing SfxDocumentMetaData DOM and property bag for meta.xml imports and exports. Preserve standardized, user-defined and custom namespace metadata through the real package and Worker paths while keeping browser title/save/open intent.
- Out of scope: unrelated refactors not required for "Connect native document metadata to the Writer and Calc ODF filters".

## Plan

Use the pinned SvXMLMetaDocumentContext and SvXMLMetaExport DOM/property contracts with the existing SfxDocumentMetaData and SAX serializer. Populate each imported document metadata owner from the bounded meta stream, retain canonical metadata across browser graph/Worker boundaries, and serialize the original custom XML plus native property bag. Keep shell title and locale behavior, existing browser open/save/autosave semantics and package safety limits. Reuse native metadata QA witnesses TEST.odt and CUSTOM.odt and run targeted Writer, Calc and shared tests. Record only proven native oddities in the existing audit files.

## Verify Steps

PLANNER fallback scaffold for "Connect native document metadata to the Writer and Calc ODF filters". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Connect native document metadata to the Writer and Calc ODF filters". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T15:04:15.325Z — VERIFY — ok

By: CODER

Note: Tests  87 passed (87). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:48:58.910Z, excerpt_hash=sha256:8d60e4593c9288e8717a9cbcf0ed930a90342f159b1366a2e1a764f0a59f05e2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271348-QNDG5D/blueprint/resolved-snapshot.json
- old_digest: e3d45d06844d0d4c16cc80ee34d984f11b5823ec58114bd3f0eb063852cf635f
- current_digest: e3d45d06844d0d4c16cc80ee34d984f11b5823ec58114bd3f0eb063852cf635f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271348-QNDG5D

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271348-QNDG5D
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
