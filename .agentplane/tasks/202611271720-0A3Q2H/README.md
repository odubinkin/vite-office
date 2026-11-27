---
id: "202611271720-0A3Q2H"
title: "Implement native Calc embedded fonts in ODS packages"
result_summary: "Preserves Calc ODS font resources and the original embedding property values through the Worker."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:20:48.281Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T17:32:07.533Z"
  updated_by: "CODER"
  note: "All 56 related Calc, Writer and package cases passed. The final two Calc font cases passed with original resource bytes and native defaults. Typecheck, lint, dependency boundaries, provenance and scoped inventories passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T17:32:08.047Z"
  updated_by: "EVALUATOR"
  note: "Calc preserves existing ODS font resources, original embedding settings and viewing permissions across its browser Worker."
  evaluated_sha: "c834010f16459446331b504d9fa796c767337fee"
  blueprint_digest: "2aac0c439f514f924f49b5a9f410912903db04325f598bde39ca57c8ed1bbcaa"
  evidence_refs:
    - ".agentplane/tasks/202611271720-0A3Q2H/README.md"
    - ".agentplane/tasks/202611271720-0A3Q2H/quality/20261127-173208047-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271720-0A3Q2H/quality/20261127-173208047-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271720-0A3Q2H/quality/20261127-173208047-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271720-0A3Q2H/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/font-verification.md"
  findings:
    - "The original shared fixture bytes round-trip exactly and existing Writer resource tests pass."
commit:
  hash: "c834010f16459446331b504d9fa796c767337fee"
  message: "🧩 0A3Q2H calc: preserve embedded ODS font resources"
comments:
  -
    author: "CODER"
    body: "Start: attach native Calc ODS font embedding and package resources."
  -
    author: "CODER"
    body: "Verified: 56 affected tests, byte-identical ODS font through final replay, and scoped static checks."
events:
  -
    type: "status"
    at: "2026-11-27T17:20:48.713Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: attach native Calc ODS font embedding and package resources."
  -
    type: "verify"
    at: "2026-11-27T17:32:07.533Z"
    author: "CODER"
    state: "ok"
    note: "All 56 related Calc, Writer and package cases passed. The final two Calc font cases passed with original resource bytes and native defaults. Typecheck, lint, dependency boundaries, provenance and scoped inventories passed."
  -
    type: "status"
    at: "2026-11-27T17:33:19.905Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 56 affected tests, byte-identical ODS font through final replay, and scoped static checks."
doc_version: 3
doc_updated_at: "2026-11-27T17:33:19.905Z"
doc_updated_by: "CODER"
description: "Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS."
sections:
  Summary: |-
    Implement native Calc embedded fonts in ODS packages

    Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.
  Scope: |-
    - In scope: Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.
    - Out of scope: unrelated refactors not required for "Implement native Calc embedded fonts in ODS packages".
  Plan: "Follow Calc document embedding defaults, ScXMLImport::NotifyContainsEmbeddedFont, ScXMLExport's font pool, and native configuration properties. Share the existing OpenType package validation with Writer, retain approved payload bytes and metadata across the Calc Worker, and write native font declarations, package parts and manifest entries. Verify native flags and ODS round trips using original pinned LibreOffice font data and run related Calc and Writer font tests. Keep the established browser font rights and package limits."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Calc embedded fonts in ODS packages". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Calc embedded fonts in ODS packages". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T17:32:07.533Z — VERIFY — ok

    By: CODER

    Note: All 56 related Calc, Writer and package cases passed. The final two Calc font cases passed with original resource bytes and native defaults. Typecheck, lint, dependency boundaries, provenance and scoped inventories passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:20:48.713Z, excerpt_hash=sha256:aff1845d7d2c52af1f527c51ada324ae4a5a06792ac905290eac29ee3d71b12e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271720-0A3Q2H/blueprint/resolved-snapshot.json
    - old_digest: 2aac0c439f514f924f49b5a9f410912903db04325f598bde39ca57c8ed1bbcaa
    - current_digest: 2aac0c439f514f924f49b5a9f410912903db04325f598bde39ca57c8ed1bbcaa
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271720-0A3Q2H

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271720-0A3Q2H
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

Implement native Calc embedded fonts in ODS packages

Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.

## Scope

- In scope: Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.
- Out of scope: unrelated refactors not required for "Implement native Calc embedded fonts in ODS packages".

## Plan

Follow Calc document embedding defaults, ScXMLImport::NotifyContainsEmbeddedFont, ScXMLExport's font pool, and native configuration properties. Share the existing OpenType package validation with Writer, retain approved payload bytes and metadata across the Calc Worker, and write native font declarations, package parts and manifest entries. Verify native flags and ODS round trips using original pinned LibreOffice font data and run related Calc and Writer font tests. Keep the established browser font rights and package limits.

## Verify Steps

PLANNER fallback scaffold for "Implement native Calc embedded fonts in ODS packages". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Calc embedded fonts in ODS packages". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T17:32:07.533Z — VERIFY — ok

By: CODER

Note: All 56 related Calc, Writer and package cases passed. The final two Calc font cases passed with original resource bytes and native defaults. Typecheck, lint, dependency boundaries, provenance and scoped inventories passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:20:48.713Z, excerpt_hash=sha256:aff1845d7d2c52af1f527c51ada324ae4a5a06792ac905290eac29ee3d71b12e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271720-0A3Q2H/blueprint/resolved-snapshot.json
- old_digest: 2aac0c439f514f924f49b5a9f410912903db04325f598bde39ca57c8ed1bbcaa
- current_digest: 2aac0c439f514f924f49b5a9f410912903db04325f598bde39ca57c8ed1bbcaa
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271720-0A3Q2H

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271720-0A3Q2H
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
