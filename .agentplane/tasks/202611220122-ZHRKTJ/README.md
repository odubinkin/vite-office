---
id: "202611220122-ZHRKTJ"
title: "Connect Writer named list-style editing"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Run Chromium on the ordinary Paragraph command and nested list-style dialog. Ensure cancel, shared style updates, undo/redo, and returning to the parent are covered."
  - "Run check:docs, check:file-size, AgentPlane doctor and routing, and check staged diff and final checkout status. Full suite follows the ten-closed-task cadence."
  - "Run production build, Writer resources, module boundaries, source tree, source provenance, Writer parity inventory, and scoped lint and formatting."
  - "Run targeted Writer Vitest tests of named numbering rule updates, list histories, the regular Paragraph and nested list-style dialogs, and ODF numbering serialization."
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:22:18.204Z"
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
    body: "Start: implement the approved Writer numbering style dialog and shared document rule contract."
events:
  -
    type: "status"
    at: "2026-11-22T01:22:18.559Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer numbering style dialog and shared document rule contract."
doc_version: 3
doc_updated_at: "2026-11-22T01:22:18.559Z"
doc_updated_by: "CODER"
description: "Wire the Outline and List Edit Style button to the upstream numbering-style template dialog. Implement the document-owned rule format update and undo contract, connect the template pages to existing numbering mechanisms, and verify shared style changes, cancel, undo and ODT round trip in Writer."
sections:
  Summary: |-
    Connect Writer named list-style editing

    Wire the Outline and List Edit Style button to the upstream numbering-style template dialog. Implement the document-owned rule format update and undo contract, connect the template pages to existing numbering mechanisms, and verify shared style changes, cancel, undo and ODT round trip in Writer.
  Scope: |-
    - In scope: Wire the Outline and List Edit Style button to the upstream numbering-style template dialog. Implement the document-owned rule format update and undo contract, connect the template pages to existing numbering mechanisms, and verify shared style changes, cancel, undo and ODT round trip in Writer.
    - Out of scope: unrelated refactors not required for "Connect Writer named list-style editing".
  Plan: "Implement the named numbering style path from SwParagraphNumTabPage and SwTemplateDlg. Preserve document-owned rule identity and list membership through the native ChgNumRuleFormats diff and SwUndoInsNum history. Use the actual numbering formats and the app's native browser controls for the style template pages. Match the upstream editor admission, order and nested lifetime; verify shared changes, cancellation, cursor and undo, and ODT. Work in the Writer checkout using pinned local sources. Preserve existing file, recovery and autosave behavior. Run focused checks only at this cadence."
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Run `Run targeted Writer Vitest tests of named numbering rule updates, list histories, the regular Paragraph and nested list-style dialogs, and ODF numbering serialization.`. Expected: it succeeds and confirms the requested outcome for this task.
    2. Run `Run production build, Writer resources, module boundaries, source tree, source provenance, Writer parity inventory, and scoped lint and formatting.`. Expected: it succeeds and confirms the requested outcome for this task.
    3. Run `Run Chromium on the ordinary Paragraph command and nested list-style dialog. Ensure cancel, shared style updates, undo/redo, and returning to the parent are covered.`. Expected: it succeeds and confirms the requested outcome for this task.
    4. Run `Run check:docs, check:file-size, AgentPlane doctor and routing, and check staged diff and final checkout status. Full suite follows the ten-closed-task cadence.`. Expected: it succeeds and confirms the requested outcome for this task.
    5. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    6. Compare the final result against the task summary and touched scope. Expected: remaining follow-up is either resolved or explicit in ## Findings.
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

Connect Writer named list-style editing

Wire the Outline and List Edit Style button to the upstream numbering-style template dialog. Implement the document-owned rule format update and undo contract, connect the template pages to existing numbering mechanisms, and verify shared style changes, cancel, undo and ODT round trip in Writer.

## Scope

- In scope: Wire the Outline and List Edit Style button to the upstream numbering-style template dialog. Implement the document-owned rule format update and undo contract, connect the template pages to existing numbering mechanisms, and verify shared style changes, cancel, undo and ODT round trip in Writer.
- Out of scope: unrelated refactors not required for "Connect Writer named list-style editing".

## Plan

Implement the named numbering style path from SwParagraphNumTabPage and SwTemplateDlg. Preserve document-owned rule identity and list membership through the native ChgNumRuleFormats diff and SwUndoInsNum history. Use the actual numbering formats and the app's native browser controls for the style template pages. Match the upstream editor admission, order and nested lifetime; verify shared changes, cancellation, cursor and undo, and ODT. Work in the Writer checkout using pinned local sources. Preserve existing file, recovery and autosave behavior. Run focused checks only at this cadence.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Run `Run targeted Writer Vitest tests of named numbering rule updates, list histories, the regular Paragraph and nested list-style dialogs, and ODF numbering serialization.`. Expected: it succeeds and confirms the requested outcome for this task.
2. Run `Run production build, Writer resources, module boundaries, source tree, source provenance, Writer parity inventory, and scoped lint and formatting.`. Expected: it succeeds and confirms the requested outcome for this task.
3. Run `Run Chromium on the ordinary Paragraph command and nested list-style dialog. Ensure cancel, shared style updates, undo/redo, and returning to the parent are covered.`. Expected: it succeeds and confirms the requested outcome for this task.
4. Run `Run check:docs, check:file-size, AgentPlane doctor and routing, and check staged diff and final checkout status. Full suite follows the ten-closed-task cadence.`. Expected: it succeeds and confirms the requested outcome for this task.
5. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
6. Compare the final result against the task summary and touched scope. Expected: remaining follow-up is either resolved or explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
