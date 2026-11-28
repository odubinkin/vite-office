---
id: "202611280937-ZDM2NK"
title: "Align Writer ODT caption sequence fields and references"
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
  updated_at: "2026-11-28T09:37:23.116Z"
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
    body: "Start: Port sequence declarations, caption numbering and native sequence references through Writer ODT and Worker."
events:
  -
    type: "status"
    at: "2026-11-28T09:37:23.959Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port sequence declarations, caption numbering and native sequence references through Writer ODT and Worker."
doc_version: 3
doc_updated_at: "2026-11-28T09:37:23.959Z"
doc_updated_by: "CODER"
description: "Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests."
sections:
  Summary: |-
    Align Writer ODT caption sequence fields and references

    Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.
  Scope: |-
    - In scope: Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.
    - Out of scope: unrelated refactors not required for "Align Writer ODT caption sequence fields and references".
  Plan: "Trace SwSetExpFieldType and SwSetExpField sequence numbering, native sequence reference allocation and lookup, the XML value, declaration and reference import, and the ODF exporter. Reuse the document outline and numbering owners for chapter-qualified values. Implement the sequence field master, native identities and caption sequence references on the normal ODT and Worker paths. Preserve authored formulas and the corresponding represented Writer expression behavior. Replay the installed pinned caption fixture and run affected tests only."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT caption sequence fields and references". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT caption sequence fields and references". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Writer ODT caption sequence fields and references

Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.

## Scope

- In scope: Port Writer's native sequence field masters, numbering, stable reference identifiers and ODF sequence declaration, field, and reference contexts. Preserve source expressions and formatting through Worker and ODT. Replay pinned caption document data and run affected tests.
- Out of scope: unrelated refactors not required for "Align Writer ODT caption sequence fields and references".

## Plan

Trace SwSetExpFieldType and SwSetExpField sequence numbering, native sequence reference allocation and lookup, the XML value, declaration and reference import, and the ODF exporter. Reuse the document outline and numbering owners for chapter-qualified values. Implement the sequence field master, native identities and caption sequence references on the normal ODT and Worker paths. Preserve authored formulas and the corresponding represented Writer expression behavior. Replay the installed pinned caption fixture and run affected tests only.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT caption sequence fields and references". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT caption sequence fields and references". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
