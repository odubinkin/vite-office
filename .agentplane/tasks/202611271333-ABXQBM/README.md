---
id: "202611271333-ABXQBM"
title: "Align Writer ODT annotation text and metadata with native import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "annotations"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T13:33:18.002Z"
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
    body: "Start: Compare the native annotation shape-text and metadata contracts in an isolated snapshot."
events:
  -
    type: "status"
    at: "2026-11-27T13:33:18.537Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Compare the native annotation shape-text and metadata contracts in an isolated snapshot."
doc_version: 3
doc_updated_at: "2026-11-27T13:33:18.537Z"
doc_updated_by: "CODER"
description: "Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields."
sections:
  Summary: |-
    Align Writer ODT annotation text and metadata with native import

    Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.
  Scope: |-
    - In scope: Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.
    - Out of scope: unrelated refactors not required for "Align Writer ODT annotation text and metadata with native import".
  Plan: "Trace XMLAnnotationImportContext, XMLTextImportHelper shape dispatch, the annotation Outliner property set and XMLTextFieldExport in pinned LibreOffice. Route the complete represented annotation child text through the native shared contexts with isolated list state. Preserve EditEngine text and metadata through Worker and ODT, align empty author/date export with the normal default, and record any native list or field behavior that looks incorrect. Port focused assertions from annotation-formatting.odt and resolved-comment.odt and check existing annotation, marker, paragraph-list and Worker tests. Run scoped lint, format, type, dependency and provenance checks. Preserve browser document lifecycle."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT annotation text and metadata with native import". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT annotation text and metadata with native import". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Writer ODT annotation text and metadata with native import

Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.

## Scope

- In scope: Use the shared text field/shape dispatch and isolated list context for annotation EditEngine text, align native content fallback and metadata XML, and port the original annotation formatting and resolution tests for the represented fields.
- Out of scope: unrelated refactors not required for "Align Writer ODT annotation text and metadata with native import".

## Plan

Trace XMLAnnotationImportContext, XMLTextImportHelper shape dispatch, the annotation Outliner property set and XMLTextFieldExport in pinned LibreOffice. Route the complete represented annotation child text through the native shared contexts with isolated list state. Preserve EditEngine text and metadata through Worker and ODT, align empty author/date export with the normal default, and record any native list or field behavior that looks incorrect. Port focused assertions from annotation-formatting.odt and resolved-comment.odt and check existing annotation, marker, paragraph-list and Worker tests. Run scoped lint, format, type, dependency and provenance checks. Preserve browser document lifecycle.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT annotation text and metadata with native import". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT annotation text and metadata with native import". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
