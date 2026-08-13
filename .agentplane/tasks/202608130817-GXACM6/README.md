---
id: "202608130817-GXACM6"
title: "Implement Writer direct character formatting"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T08:18:11.825Z"
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
    body: "Start: implement bounded Writer direct Bold, Italic, and Underline formatting with upstream evidence and browser-safe text runs."
events:
  -
    type: "status"
    at: "2026-08-13T08:17:40.208Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement bounded Writer direct Bold, Italic, and Underline formatting with upstream evidence and browser-safe text runs."
doc_version: 3
doc_updated_at: "2026-08-13T08:18:11.207Z"
doc_updated_by: "CODER"
description: "Implement LO-WRITER-0109: direct Bold, Italic, and single Underline formatting for a collapsed Writer caret and one selected range within a paragraph. Add a serializable immutable text-run model at the pinned txtnode ownership boundary, Writer txtattr command handling, formatting-toolbar and Format → Text placement, semantic rich-copy output, tests, documentation, and exact parity evidence. Preserve existing plain paragraph behavior and make all unsupported formatting/selection/interchange behavior explicit."
sections:
  Summary: |-
    Implement Writer direct character formatting

    Implement LO-WRITER-0109: direct Bold, Italic, and single Underline formatting for a collapsed Writer caret and one selected range within a paragraph. Add a serializable immutable text-run model at the pinned txtnode ownership boundary, Writer txtattr command handling, formatting-toolbar and Format → Text placement, semantic rich-copy output, tests, documentation, and exact parity evidence. Preserve existing plain paragraph behavior and make all unsupported formatting/selection/interchange behavior explicit.
  Scope: |-
    - In scope: Implement LO-WRITER-0109: direct Bold, Italic, and single Underline formatting for a collapsed Writer caret and one selected range within a paragraph. Add a serializable immutable text-run model at the pinned txtnode ownership boundary, Writer txtattr command handling, formatting-toolbar and Format → Text placement, semantic rich-copy output, tests, documentation, and exact parity evidence. Preserve existing plain paragraph behavior and make all unsupported formatting/selection/interchange behavior explicit.
    - Out of scope: unrelated refactors not required for "Implement Writer direct character formatting".
  Plan: "1. Add sw/source/core/txtnode/ndtxt.ts and focused tests: normalized immutable direct-character attribute runs for bold, italic, and underline; range toggles, collapsed pending attributes, text insertion, paragraph split, and merge retain formatting. 2. Extend the Writer paragraph model/storage/document transitions so its canonical text is deterministically derived from runs while preserving current plain-text API compatibility. 3. Add sw/source/uibase/shells/txtattr.ts command transition and wire the Writer view/editor selection bridge, history, and active command state for a collapsed caret or a same-paragraph range. 4. Render semantic formatted runs in edtwin paragraph hosts; activate existing text-object toolbar controls, add the pinned Format Text submenu, and support Ctrl/Meta B/I/U. 5. Extend bounded clipboard HTML to serialize semantic strong/em/single-underline runs, retaining plain text unchanged. 6. Add unit/component/E2E coverage, parity record LO-WRITER-0109, command/clipboard/character-formatting docs, source-tree/provenance updates, and explicit non-goals. 7. Run fast tests and targeted Chromium E2E plus static quality gates; full general suite is deferred unless this completes the tenth task after the last full cadence."
  Verify Steps: "1. Run npm run test:coverage and npm run test:inventory:coverage; expected: all fast suites pass with 100% coverage and the parity manifest resolves every local marker. 2. Run a targeted Chromium Writer-character-formatting E2E flow; expected: toolbar/menu/shortcut commands format a same-paragraph selection and collapsed subsequent input, Undo/Redo restores it, and Copy exposes semantic HTML without leaking metadata. 3. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, npm run check:file-size, npm run test:static, and git diff --check; expected: all pass. 4. Inspect parity and documentation evidence; expected: LO-WRITER-0109 retains upstream txtattr/ndtxt/UI/test/help references and clearly excludes cross-paragraph ranges, non-basic attributes, Paste, and ODT/DOCX interchange."
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

Implement Writer direct character formatting

Implement LO-WRITER-0109: direct Bold, Italic, and single Underline formatting for a collapsed Writer caret and one selected range within a paragraph. Add a serializable immutable text-run model at the pinned txtnode ownership boundary, Writer txtattr command handling, formatting-toolbar and Format → Text placement, semantic rich-copy output, tests, documentation, and exact parity evidence. Preserve existing plain paragraph behavior and make all unsupported formatting/selection/interchange behavior explicit.

## Scope

- In scope: Implement LO-WRITER-0109: direct Bold, Italic, and single Underline formatting for a collapsed Writer caret and one selected range within a paragraph. Add a serializable immutable text-run model at the pinned txtnode ownership boundary, Writer txtattr command handling, formatting-toolbar and Format → Text placement, semantic rich-copy output, tests, documentation, and exact parity evidence. Preserve existing plain paragraph behavior and make all unsupported formatting/selection/interchange behavior explicit.
- Out of scope: unrelated refactors not required for "Implement Writer direct character formatting".

## Plan

1. Add sw/source/core/txtnode/ndtxt.ts and focused tests: normalized immutable direct-character attribute runs for bold, italic, and underline; range toggles, collapsed pending attributes, text insertion, paragraph split, and merge retain formatting. 2. Extend the Writer paragraph model/storage/document transitions so its canonical text is deterministically derived from runs while preserving current plain-text API compatibility. 3. Add sw/source/uibase/shells/txtattr.ts command transition and wire the Writer view/editor selection bridge, history, and active command state for a collapsed caret or a same-paragraph range. 4. Render semantic formatted runs in edtwin paragraph hosts; activate existing text-object toolbar controls, add the pinned Format Text submenu, and support Ctrl/Meta B/I/U. 5. Extend bounded clipboard HTML to serialize semantic strong/em/single-underline runs, retaining plain text unchanged. 6. Add unit/component/E2E coverage, parity record LO-WRITER-0109, command/clipboard/character-formatting docs, source-tree/provenance updates, and explicit non-goals. 7. Run fast tests and targeted Chromium E2E plus static quality gates; full general suite is deferred unless this completes the tenth task after the last full cadence.

## Verify Steps

1. Run npm run test:coverage and npm run test:inventory:coverage; expected: all fast suites pass with 100% coverage and the parity manifest resolves every local marker. 2. Run a targeted Chromium Writer-character-formatting E2E flow; expected: toolbar/menu/shortcut commands format a same-paragraph selection and collapsed subsequent input, Undo/Redo restores it, and Copy exposes semantic HTML without leaking metadata. 3. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, npm run check:file-size, npm run test:static, and git diff --check; expected: all pass. 4. Inspect parity and documentation evidence; expected: LO-WRITER-0109 retains upstream txtattr/ndtxt/UI/test/help references and clearly excludes cross-paragraph ranges, non-basic attributes, Paste, and ODT/DOCX interchange.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
