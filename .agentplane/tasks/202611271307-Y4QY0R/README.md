---
id: "202611271307-Y4QY0R"
title: "Preserve Writer table, illustration and object index sections through ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-11-27T13:07:52.158Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
