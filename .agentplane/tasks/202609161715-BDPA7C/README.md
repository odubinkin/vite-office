---
id: "202609161715-BDPA7C"
title: "Restore Writer formatting toolbar and paragraph indent parity"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T17:19:47.450Z"
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
    body: "Start: implement upstream-contextual Writer indent commands, persistent toolbar controls, and ODT round-trip coverage."
events:
  -
    type: "status"
    at: "2026-09-16T17:19:52.840Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-contextual Writer indent commands, persistent toolbar controls, and ODT round-trip coverage."
doc_version: 3
doc_updated_at: "2026-09-16T17:19:52.840Z"
doc_updated_by: "CODER"
description: "Always render the Writer text and numbering controls, and make Increment/Decrement Level apply upstream-aligned paragraph indentation outside lists while retaining list-level behavior."
sections:
  Summary: "Restore the Writer formatting toolbar and upstream-compatible Increment/Decrement Indent behavior, including ODT persistence."
  Scope: "In scope: generated Writer command resources, formatting-toolbar presentation, context-sensitive indent dispatch, paragraph left-margin model and undo, browser rendering, ODT import/export, and targeted tests. Out of scope: unrelated paragraph spacing, right/first-line indents, and unsupported numbering controls."
  Plan: "Implement .uno:IncrementIndent and .uno:DecrementIndent from the pinned textobjectbar. Keep the complete text formatting controls visible regardless of list context. Follow sw/source/uibase/shells/textsh1.cxx: list paragraphs change numbering level, non-list paragraphs use MoveLeftMargin semantics. Persist the direct left margin through the ODT automatic-style pipeline and cover both import and export."
  Verify Steps: "1. Run focused Vitest suites for Writer formatting toolbar, command dispatch/model undo, and ODT XML round trips; expect generic indent controls to be present for list and non-list contexts, list levels to change only in lists, ordinary paragraph margins to change and undo, and ODT round trips to preserve the margin. 2. Run npm run check:writer-resources, npm run typecheck, and npm run lint; expect success. 3. Run agentplane doctor and node .agentplane/policy/check-routing.mjs; expect success. 4. Inspect git diff and git status --short --untracked-files=all; expect only task-scoped changes."
  Verification: "Pending approved implementation and execution of the listed checks."
  Rollback Plan: "Revert only the task-scoped commit to restore prior toolbar selection and paragraph serialization behavior."
  Findings: "Upstream evidence: sw/source/uibase/shells/textsh1.cxx dispatches SID_INC_INDENT and SID_DEC_INDENT to NumUpDown for list paragraphs and MoveLeftMargin otherwise. The existing local upstream-ODT fixture pattern is odt-hyperlink-roundtrip.test.ts; a matching margin fixture will be added only if a pinned upstream ODT with the required direct indent can be identified."
id_source: "generated"
---
## Summary

Restore the Writer formatting toolbar and upstream-compatible Increment/Decrement Indent behavior, including ODT persistence.

## Scope

In scope: generated Writer command resources, formatting-toolbar presentation, context-sensitive indent dispatch, paragraph left-margin model and undo, browser rendering, ODT import/export, and targeted tests. Out of scope: unrelated paragraph spacing, right/first-line indents, and unsupported numbering controls.

## Plan

Implement .uno:IncrementIndent and .uno:DecrementIndent from the pinned textobjectbar. Keep the complete text formatting controls visible regardless of list context. Follow sw/source/uibase/shells/textsh1.cxx: list paragraphs change numbering level, non-list paragraphs use MoveLeftMargin semantics. Persist the direct left margin through the ODT automatic-style pipeline and cover both import and export.

## Verify Steps

1. Run focused Vitest suites for Writer formatting toolbar, command dispatch/model undo, and ODT XML round trips; expect generic indent controls to be present for list and non-list contexts, list levels to change only in lists, ordinary paragraph margins to change and undo, and ODT round trips to preserve the margin. 2. Run npm run check:writer-resources, npm run typecheck, and npm run lint; expect success. 3. Run agentplane doctor and node .agentplane/policy/check-routing.mjs; expect success. 4. Inspect git diff and git status --short --untracked-files=all; expect only task-scoped changes.

## Verification

Pending approved implementation and execution of the listed checks.

## Rollback Plan

Revert only the task-scoped commit to restore prior toolbar selection and paragraph serialization behavior.

## Findings

Upstream evidence: sw/source/uibase/shells/textsh1.cxx dispatches SID_INC_INDENT and SID_DEC_INDENT to NumUpDown for list paragraphs and MoveLeftMargin otherwise. The existing local upstream-ODT fixture pattern is odt-hyperlink-roundtrip.test.ts; a matching margin fixture will be added only if a pinned upstream ODT with the required direct indent can be identified.
