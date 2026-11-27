---
id: "202611271756-GSDVGC"
title: "Reconcile Calc ODS embedded font verification with the pinned importer"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  updated_at: "2026-11-27T17:56:32.166Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: reconcile the reproduced font-declaration assertion with the implemented native owner."
events:
  -
    type: "status"
    at: "2026-11-27T17:56:32.662Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reconcile the reproduced font-declaration assertion with the implemented native owner."
doc_version: 3
doc_updated_at: "2026-11-27T17:56:32.662Z"
doc_updated_by: "CODER"
description: "Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases."
sections:
  Summary: |-
    Reconcile Calc ODS embedded font verification with the pinned importer

    Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.
  Scope: |-
    - In scope: Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.
    - Out of scope: unrelated refactors not required for "Reconcile Calc ODS embedded font verification with the pinned importer".
  Plan: "Replace the stale assertion in the existing native-font importer test with the actual document-owned declaration and unopened-resource defaults. Keep its unrelated invalid-style and fallback checks. Verify the pinned failure and rerun existing native Calc font and shared Writer ODF resource cases without broadening test coverage or changing production code."
  Verify Steps: |-
    PLANNER fallback scaffold for "Reconcile Calc ODS embedded font verification with the pinned importer". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Reconcile Calc ODS embedded font verification with the pinned importer". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Reconcile Calc ODS embedded font verification with the pinned importer

Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.

## Scope

- In scope: Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.
- Out of scope: unrelated refactors not required for "Reconcile Calc ODS embedded font verification with the pinned importer".

## Plan

Replace the stale assertion in the existing native-font importer test with the actual document-owned declaration and unopened-resource defaults. Keep its unrelated invalid-style and fallback checks. Verify the pinned failure and rerun existing native Calc font and shared Writer ODF resource cases without broadening test coverage or changing production code.

## Verify Steps

PLANNER fallback scaffold for "Reconcile Calc ODS embedded font verification with the pinned importer". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Reconcile Calc ODS embedded font verification with the pinned importer". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
