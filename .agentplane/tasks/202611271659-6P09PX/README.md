---
id: "202611271659-6P09PX"
title: "Implement native Writer redline formatting in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "odf"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:00:14.424Z"
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
    body: "Start: port original previous-format data ownership and ODT style pass."
events:
  -
    type: "status"
    at: "2026-11-27T17:00:14.876Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original previous-format data ownership and ODT style pass."
doc_version: 3
doc_updated_at: "2026-11-27T17:00:14.876Z"
doc_updated_by: "CODER"
description: "Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures."
sections:
  Summary: |-
    Implement native Writer redline formatting in ODT

    Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.
  Scope: |-
    - In scope: Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.
    - Out of scope: unrelated refactors not required for "Implement native Writer redline formatting in ODT".
  Plan: "Use native SwRedlineExtraData_FormatColl holding an owned automatic SfxItemSet. Resolve old named and automatic style definitions through the existing xmloff and Writer style pools; transport actual item and named-format ownership across the Worker. Collect old formatting in the same text automatic-style pass and write the exported reference. Port testFormatCharStyleChangeOdtImport and testFormatCharstyleDirectOdtImport using their original fixtures and replay related Writer style/ODT checks. Keep visible-change layout and browser save policy outside this task."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer redline formatting in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer redline formatting in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Implement native Writer redline formatting in ODT

Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.

## Scope

- In scope: Replace lexical prior-style references with the original Writer redline extra data and character automatic-style storage. Preserve named and direct previous formats in ODT import, export and Worker transfer. Port the original XML-filter named and direct formatting fixtures.
- Out of scope: unrelated refactors not required for "Implement native Writer redline formatting in ODT".

## Plan

Use native SwRedlineExtraData_FormatColl holding an owned automatic SfxItemSet. Resolve old named and automatic style definitions through the existing xmloff and Writer style pools; transport actual item and named-format ownership across the Worker. Collect old formatting in the same text automatic-style pass and write the exported reference. Port testFormatCharStyleChangeOdtImport and testFormatCharstyleDirectOdtImport using their original fixtures and replay related Writer style/ODT checks. Keep visible-change layout and browser save policy outside this task.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer redline formatting in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer redline formatting in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
