---
id: "202611281102-KF8XS0"
title: "Align Writer ODT hidden paragraph fields and conditional visibility"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T11:02:37.474Z"
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
    body: "Start: model the native hidden-paragraph field and its condition and layout behavior."
events:
  -
    type: "status"
    at: "2026-11-28T11:02:37.832Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: model the native hidden-paragraph field and its condition and layout behavior."
doc_version: 3
doc_updated_at: "2026-11-28T11:02:37.832Z"
doc_updated_by: "CODER"
description: "Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests."
sections:
  Summary: |-
    Align Writer ODT hidden paragraph fields and conditional visibility

    Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.
  Scope: |-
    - In scope: Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.
    - Out of scope: unrelated refactors not required for "Align Writer ODT hidden paragraph fields and conditional visibility".
  Plan: "Port SwHiddenParaField and its native UNO properties, ODT namespaces/defaults/export, model hints and Worker persistence. Reuse the document expression pass and native string comparison/coercion in SwCalc. Derive paragraph visibility through native hints and represented frame/presentation projections, including the first visible body paragraph contract. Replay the pinned hidden paragraph in a text fly for ODT, Worker and the represented layout/presentation. Verify affected existing suites and static checks only."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT hidden paragraph fields and conditional visibility". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT hidden paragraph fields and conditional visibility". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Writer ODT hidden paragraph fields and conditional visibility

Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.

## Scope

- In scope: Implement the native HiddenParagraph field, ODT and Worker persistence, SwCalc string comparison in document order, and represented layout visibility for body and nested stories. Replay the pinned fly-hidden-paragraph fixture and focused existing tests.
- Out of scope: unrelated refactors not required for "Align Writer ODT hidden paragraph fields and conditional visibility".

## Plan

Port SwHiddenParaField and its native UNO properties, ODT namespaces/defaults/export, model hints and Worker persistence. Reuse the document expression pass and native string comparison/coercion in SwCalc. Derive paragraph visibility through native hints and represented frame/presentation projections, including the first visible body paragraph contract. Replay the pinned hidden paragraph in a text fly for ODT, Worker and the represented layout/presentation. Verify affected existing suites and static checks only.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT hidden paragraph fields and conditional visibility". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT hidden paragraph fields and conditional visibility". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
