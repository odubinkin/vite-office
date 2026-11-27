---
id: "202611271348-QNDG5D"
title: "Connect native document metadata to the Writer and Calc ODF filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-11-27T13:48:58.910Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
