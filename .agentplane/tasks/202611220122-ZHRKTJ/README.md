---
id: "202611220122-ZHRKTJ"
title: "Connect Writer named list-style editing"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
  -
    author: "CODER"
    body: |-
      Verified intermediate named list-style core checkpoint.

      - Writer updates the live numbering rule via the pinned ChgNumRuleFormats diff without replacing list identities. Undo and Redo replay the format change and retain the current selection. History evicts its owned format snapshots and releases their character-style registrations.
      - SwNumRule exchanges independent SvxNumRule values, including effective and direct levels and the per-level character style. The Pseudo style owner reads and applies SID_ATTR_NUMBERING_RULE, including the explicit default reset.
      - WRITER-740 records the original eight-bit upper-level mask. The source-shaped numbering helpers moved together into docnum.ts. The main document file dropped below the repository size limit.
      - Targeted Writer run passed 133 cases across eight suites covering rule editing, history, cursor retention, separate lists, ODF reopen, template item exchange and reset. Scoped lint and formatting, module boundaries, source tree and provenance, Writer resources, parity inventory, doctor and routing passed. Global JSDoc and file-size checks retain pre-existing findings outside changed paths.
      - The document style command, nested template presentation and Chromium acceptance remain pending within ZHRKTJ. This checkpoint does not advance the ten-task cadence.
  -
    author: "CODER"
    body: |-
      Intermediate Writer list-style presentation checkpoint.

      The ordinary Paragraph command now opens the selected named list-style template from Outline & List. The child uses the HTML modal lifecycle, restores focus to Edit Style, and has separate Apply, OK, Reset and Cancel actions. The native rule exchange preserves the underlying paragraph draft. General, Unordered, Ordered, Outline, Position and Customize expose the represented numbering controls, with English locale presets and Roman and Latin rendering.

      Targeted Vitest passed 158 Writer cases across 11 files and seven shared numbering cases. Writer resources, source tree and provenance, Writer parity inventory, module boundaries, scoped lint and Prettier, AgentPlane doctor and routing, and diff checks passed. Global JSDoc and file-size checks still report pre-existing findings outside the changed paths.

      Open scope includes graphic numbering storage, layout and ODF, the Image gallery, complete multi-level mixed settings and General management for user-defined names. No task closure and no advance in the ten-closed-task full-test cadence.

      The final production build and Chrome spec `writer-list-style-dialog.spec.ts` passed, including Escape, focus return, two separate lists sharing the rule, and Undo/Redo. The first browser run exposed a test locator ambiguity between Ordered and Unordered, corrected by using the exact native tab label. The final browser run uses the native dialog implementation.

events:
  -
    type: "status"
    at: "2026-11-22T01:22:18.559Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer numbering style dialog and shared document rule contract."
  -
    type: "comment"
    at: "2026-11-22T01:29:49.324Z"
    author: "CODER"
    body: |-
      Verified intermediate named list-style core checkpoint.

      - Writer updates the live numbering rule via the pinned ChgNumRuleFormats diff without replacing list identities. Undo and Redo replay the format change and retain the current selection. History evicts its owned format snapshots and releases their character-style registrations.
      - SwNumRule exchanges independent SvxNumRule values, including effective and direct levels and the per-level character style. The Pseudo style owner reads and applies SID_ATTR_NUMBERING_RULE, including the explicit default reset.
      - WRITER-740 records the original eight-bit upper-level mask. The source-shaped numbering helpers moved together into docnum.ts. The main document file dropped below the repository size limit.
      - Targeted Writer run passed 133 cases across eight suites covering rule editing, history, cursor retention, separate lists, ODF reopen, template item exchange and reset. Scoped lint and formatting, module boundaries, source tree and provenance, Writer resources, parity inventory, doctor and routing passed. Global JSDoc and file-size checks retain pre-existing findings outside changed paths.
      - The document style command, nested template presentation and Chromium acceptance remain pending within ZHRKTJ. This checkpoint does not advance the ten-task cadence.
  -
    type: "comment"
    at: "2026-11-22T01:46:03.564Z"
    author: "CODER"
    body: |-
      Intermediate Writer list-style presentation checkpoint.

      The ordinary Paragraph command now opens the selected named list-style template from Outline & List. The child uses the HTML modal lifecycle, restores focus to Edit Style, and has separate Apply, OK, Reset and Cancel actions. The native rule exchange preserves the underlying paragraph draft. General, Unordered, Ordered, Outline, Position and Customize expose the represented numbering controls, with English locale presets and Roman and Latin rendering.

      Targeted Vitest passed 158 Writer cases across 11 files and seven shared numbering cases. Writer resources, source tree and provenance, Writer parity inventory, module boundaries, scoped lint and Prettier, AgentPlane doctor and routing, and diff checks passed. Global JSDoc and file-size checks still report pre-existing findings outside the changed paths.

      Open scope includes graphic numbering storage, layout and ODF, the Image gallery, complete multi-level mixed settings and General management for user-defined names. No task closure and no advance in the ten-closed-task full-test cadence.

      The final production build and Chrome spec `writer-list-style-dialog.spec.ts` passed, including Escape, focus return, two separate lists sharing the rule, and Undo/Redo. The first browser run exposed a test locator ambiguity between Ordered and Unordered, corrected by using the exact native tab label. The final browser run uses the native dialog implementation.

doc_version: 3
doc_updated_at: "2026-11-22T01:46:03.564Z"
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
    - Use `npm run test:writer -- <related suites>` for the changed rule, history, template, Paragraph command, and ODF numbering modules. Verify shared lists, inherited fields, identity, cancel, Undo/Redo, and save/reopen.
    - Run `npm run build:single-threaded --workspace @vite-office/office`, `npm run check:writer-resources`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, and `npm run inventory:parity:writer`. Run scoped ESLint and Prettier.
    - Run the focused Chromium Writer spec against the production build. Open Paragraph from the ordinary command, return from the nested style dialog, and verify cancel, shared changes, and Undo/Redo.
    - Run `npm run check:docs`, `npm run check:file-size`, `ap doctor`, `node .agentplane/policy/check-routing.mjs`, `git diff --check`, and `git status --short --untracked-files=all`. The complete test suite follows the ten-closed-task cadence.
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

- Use `npm run test:writer -- <related suites>` for the changed rule, history, template, Paragraph command, and ODF numbering modules. Verify shared lists, inherited fields, identity, cancel, Undo/Redo, and save/reopen.
- Run `npm run build:single-threaded --workspace @vite-office/office`, `npm run check:writer-resources`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, and `npm run inventory:parity:writer`. Run scoped ESLint and Prettier.
- Run the focused Chromium Writer spec against the production build. Open Paragraph from the ordinary command, return from the nested style dialog, and verify cancel, shared changes, and Undo/Redo.
- Run `npm run check:docs`, `npm run check:file-size`, `ap doctor`, `node .agentplane/policy/check-routing.mjs`, `git diff --check`, and `git status --short --untracked-files=all`. The complete test suite follows the ten-closed-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
