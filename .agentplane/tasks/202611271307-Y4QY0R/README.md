---
id: "202611271307-Y4QY0R"
title: "Preserve Writer table, illustration and object index sections through ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "index"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify the native caption flags, source paragraph style, object options, original single-level pattern and kept body through ODT and the Worker. Use pinned Writer documents and run associated index, section, formula-independent Writer I/O and focused static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T13:07:50.944Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T14:48:21.808Z"
  updated_by: "CODER"
  note: "Tests  22 passed (22). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:48:22.355Z"
  updated_by: "EVALUATOR"
  note: "The pinned tdf99689_tables.odt, tdf99689_figures.odt and TESTXMLID.odt retained native caption source options, object filters and stored index sections through the Worker and ODT reopen."
  evaluated_sha: "f99f2152067c999a0a9b04bcd5c0676aa7f0347c"
  blueprint_digest: "e0843716b1e07180456bed42bf59b22102f8b0e3b69445a4b08edaabf56ba6f9"
  evidence_refs:
    - ".agentplane/tasks/202611271307-Y4QY0R/README.md"
    - ".agentplane/tasks/202611271307-Y4QY0R/quality/20261127-144822355-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271307-Y4QY0R/quality/20261127-144822355-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271307-Y4QY0R/quality/20261127-144822355-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271307-Y4QY0R/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/Y4QY0R/verification.md"
    - "f99f2152067c999a0a9b04bcd5c0676aa7f0347c"
  findings:
    - "WRITER-765 records the native single-level template reader behavior. Runtime index regeneration is outside this slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port native TOX caption and object section properties using the current source context and stored index body."
events:
  -
    type: "status"
    at: "2026-11-27T13:07:52.158Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native TOX caption and object section properties using the current source context and stored index body."
  -
    type: "verify"
    at: "2026-11-27T14:48:21.808Z"
    author: "CODER"
    state: "ok"
    note: "Tests  22 passed (22). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:48:21.884Z"
doc_updated_by: "CODER"
description: "Extend the native Writer index descriptor stack to table, illustration and object indexes with their original source options, caption field formats, style sources, single-level forms, and cached content. Preserve those values across ODT and Worker transfer. Scope validation to pinned LibreOffice fixtures and related Writer tests. Keep dynamic object discovery, index generation and bibliography outside the persistence slice."
sections:
  Summary: |-
    Preserve Writer table, illustration and object index sections through ODT

    Extend the native Writer index descriptor stack to table, illustration and object indexes with their original source options, caption field formats, style sources, single-level forms, and cached content. Preserve those values across ODT and Worker transfer. Scope validation to pinned LibreOffice fixtures and related Writer tests. Keep dynamic object discovery, index generation and bibliography outside the persistence slice.
  Scope: |-
    - In scope: Extend the native Writer index descriptor stack to table, illustration and object indexes with their original source options, caption field formats, style sources, single-level forms, and cached content. Preserve those values across ODT and Worker transfer. Scope validation to pinned LibreOffice fixtures and related Writer tests. Keep dynamic object discovery, index generation and bibliography outside the persistence slice.
    - Out of scope: unrelated refactors not required for "Preserve Writer table, illustration and object index sections through ODT".
  Plan: "Reuse the native TOX type and connected section owner for the original table, illustration and object descriptors. Port the actual source rules, named caption category and formatting, style creators, OLE flags, one-level templates and cached body. Add compatible transport fields to the existing Worker codec. Verify original ODT files and focused native Writer filter tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve Writer table, illustration and object index sections through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve Writer table, illustration and object index sections through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T14:48:21.808Z — VERIFY — ok

    By: CODER

    Note: Tests  22 passed (22). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:07:52.158Z, excerpt_hash=sha256:f664b4a6901da45624f2381eb4b948b349288a6b399a77068af3268b9c832ad4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271307-Y4QY0R/blueprint/resolved-snapshot.json
    - old_digest: e0843716b1e07180456bed42bf59b22102f8b0e3b69445a4b08edaabf56ba6f9
    - current_digest: e0843716b1e07180456bed42bf59b22102f8b0e3b69445a4b08edaabf56ba6f9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271307-Y4QY0R

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271307-Y4QY0R
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

Preserve Writer table, illustration and object index sections through ODT

Extend the native Writer index descriptor stack to table, illustration and object indexes with their original source options, caption field formats, style sources, single-level forms, and cached content. Preserve those values across ODT and Worker transfer. Scope validation to pinned LibreOffice fixtures and related Writer tests. Keep dynamic object discovery, index generation and bibliography outside the persistence slice.

## Scope

- In scope: Extend the native Writer index descriptor stack to table, illustration and object indexes with their original source options, caption field formats, style sources, single-level forms, and cached content. Preserve those values across ODT and Worker transfer. Scope validation to pinned LibreOffice fixtures and related Writer tests. Keep dynamic object discovery, index generation and bibliography outside the persistence slice.
- Out of scope: unrelated refactors not required for "Preserve Writer table, illustration and object index sections through ODT".

## Plan

Reuse the native TOX type and connected section owner for the original table, illustration and object descriptors. Port the actual source rules, named caption category and formatting, style creators, OLE flags, one-level templates and cached body. Add compatible transport fields to the existing Worker codec. Verify original ODT files and focused native Writer filter tests.

## Verify Steps

PLANNER fallback scaffold for "Preserve Writer table, illustration and object index sections through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve Writer table, illustration and object index sections through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T14:48:21.808Z — VERIFY — ok

By: CODER

Note: Tests  22 passed (22). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:07:52.158Z, excerpt_hash=sha256:f664b4a6901da45624f2381eb4b948b349288a6b399a77068af3268b9c832ad4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271307-Y4QY0R/blueprint/resolved-snapshot.json
- old_digest: e0843716b1e07180456bed42bf59b22102f8b0e3b69445a4b08edaabf56ba6f9
- current_digest: e0843716b1e07180456bed42bf59b22102f8b0e3b69445a4b08edaabf56ba6f9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271307-Y4QY0R

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271307-Y4QY0R
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
