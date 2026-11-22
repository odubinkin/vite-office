---
id: "202611220122-ZHRKTJ"
title: "Connect Writer named list-style editing"
result_summary: "verified-202611220122-ZHRKTJ"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
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
  state: "ok"
  updated_at: "2026-11-22T02:27:31.548Z"
  updated_by: "CODER"
  note: "verified-202611220122-ZHRKTJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:24:37.415Z"
  updated_by: "EVALUATOR"
  note: "The ordinary Writer Paragraph command reaches the named list-style template, whose edits preserve document ownership and undo. The graphic gallery and Customize exchange the native per-level bitmap values through rendering and ODT."
  evaluated_sha: "3ae88311e04a040df109e171e7d7cccb5f86a947"
  blueprint_digest: "f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403"
  evidence_refs:
    - ".agentplane/tasks/202611220122-ZHRKTJ/README.md"
    - ".agentplane/tasks/202611220122-ZHRKTJ/quality/20261122-022437415-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220122-ZHRKTJ/quality/20261122-022437415-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220122-ZHRKTJ/quality/20261122-022437415-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220122-ZHRKTJ/blueprint/resolved-snapshot.json"
    - "215 focused Writer checks, 12 shared checks, two production Chrome tests and a production build"
    - "Targeted named and automatic ODT image-marker round trips, Worker graph round trip, and typed UNO property sequence"
  findings:
    - "All scope-specific checks passed. Repository-wide JSDoc and size checks still report pre-existing findings outside the changed files."
commit:
  hash: "034e32774d6af402bab61c0a2a27475e28a70624"
  message: "🧩 ZHRKTJ task: Record verified list style implementation"
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
  -
    author: "CODER"
    body: |-
      Verified intermediate list-style General and mixed-level checkpoint.

      - The native RenameNumRule path updates the rule index, the default and explicit lists, and direct and inherited paragraph references. SwUndoNumruleRename replays the old and new names. A name and formatting change accepted together form one history action.
      - General validates blank and occupied names before leaving the page and updates the parent chooser without committing its paragraph draft. Loading an ODT common style now materializes the native pool entry when it has a built-in numbering name; the General field consequently distinguishes built-in and user styles after reopening.
      - Position and Customize display mixed values for the selected levels and do not overwrite untouched properties. Legal numbering reflects mixed selections. WRITER-741 records the source's first-to-last equality for start, prefix and suffix.
      - Final Writer tests: 229 passed across 13 suites. Production build and both Chrome nested-dialog tests passed. Scoped lint and formatting, Writer resources, source tree, boundaries, provenance, Writer parity inventory, doctor, routing, and diff checks passed. Global JSDoc and file-size still report existing unrelated findings.
      - Native Image list styles and remaining template control parity are pending, including legacy Relative positioning and additional graphic and numbering options. This is a checkpoint without a task closure or cadence increment.
  -
    author: "CODER"
    body: "Verified: verified-202611220122-ZHRKTJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
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
  -
    type: "comment"
    at: "2026-11-22T01:56:50.084Z"
    author: "CODER"
    body: |-
      Verified intermediate list-style General and mixed-level checkpoint.

      - The native RenameNumRule path updates the rule index, the default and explicit lists, and direct and inherited paragraph references. SwUndoNumruleRename replays the old and new names. A name and formatting change accepted together form one history action.
      - General validates blank and occupied names before leaving the page and updates the parent chooser without committing its paragraph draft. Loading an ODT common style now materializes the native pool entry when it has a built-in numbering name; the General field consequently distinguishes built-in and user styles after reopening.
      - Position and Customize display mixed values for the selected levels and do not overwrite untouched properties. Legal numbering reflects mixed selections. WRITER-741 records the source's first-to-last equality for start, prefix and suffix.
      - Final Writer tests: 229 passed across 13 suites. Production build and both Chrome nested-dialog tests passed. Scoped lint and formatting, Writer resources, source tree, boundaries, provenance, Writer parity inventory, doctor, routing, and diff checks passed. Global JSDoc and file-size still report existing unrelated findings.
      - Native Image list styles and remaining template control parity are pending, including legacy Relative positioning and additional graphic and numbering options. This is a checkpoint without a task closure or cadence increment.
  -
    type: "verify"
    at: "2026-11-22T02:24:22.843Z"
    author: "CODER"
    state: "ok"
    note: "Verified named list-style editing and embedded graphic markers. 215 focused Writer and 12 shared checks passed; production Chrome passed both cases. The task findings record existing repository-wide JSDoc and size failures outside the changed source."
  -
    type: "verify"
    at: "2026-11-22T02:27:31.548Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611220122-ZHRKTJ"
  -
    type: "status"
    at: "2026-11-22T02:27:31.678Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202611220122-ZHRKTJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-22T02:27:31.678Z"
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
    ### 2026-11-22T02:24:22.843Z — VERIFY — ok

    By: CODER

    Note: Verified named list-style editing and embedded graphic markers. 215 focused Writer and 12 shared checks passed; production Chrome passed both cases. The task findings record existing repository-wide JSDoc and size failures outside the changed source.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:23:12.027Z, excerpt_hash=sha256:457b6bd39529f2a836d3fb884eeeebe540da4f8ebafb0437567565f24de7b586

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220122-ZHRKTJ/blueprint/resolved-snapshot.json
    - old_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
    - current_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220122-ZHRKTJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220122-ZHRKTJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-22T02:27:31.548Z — VERIFY — ok

    By: CODER

    Note: verified-202611220122-ZHRKTJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:24:23.166Z, excerpt_hash=sha256:457b6bd39529f2a836d3fb884eeeebe540da4f8ebafb0437567565f24de7b586

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220122-ZHRKTJ/blueprint/resolved-snapshot.json
    - old_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
    - current_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220122-ZHRKTJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611220122-ZHRKTJ --result verified-202611220122-ZHRKTJ --commit 034e32774d6af402bab61c0a2a27475e28a70624
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - `npm run test:writer -- native-numbering-indent unosett native-list-rule-range native-list-continuation native-numbering-font docstyle-preview odt-roundtrip odt-list-declaration-defaults native-none-numbering native-bullet-scalar WriterNativeTabulatorDialog WriterEditableParagraph native-list-marker-width native-marked-list-paint` — pass, 215 checks in 19 files. Includes image brush identity, style history, Worker records, UNO property types, and named and automatic image-level ODT styles. The ODT test now distinguishes absolute left/right from logical start/end and retains the implemented Left fallback.
    - `npm run test:shared -- numitem xmlnume` — pass, 12 checks in two files. Covers shared numbering-format ownership and ODF level serialization.
    - `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-list-style-dialog.spec.ts --config=output/playwright/writer-position-chrome.config.ts --project=writer --workers=1` — pass. Chrome exercised nested focus, cancellation, shared style rename and formatting, gallery importing and resizing, bitmap geometry and redraw, and Undo/Redo.
    - `npm run check:writer-resources`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity:writer`, scoped ESLint and Prettier, `ap doctor`, `node .agentplane/policy/check-routing.mjs`, and `git diff --check` — pass. Doctor reports the existing non-blocking managed shim warning.
    - `npm run check:docs` — fail on existing Calc JSDoc reports. No changed runtime file is reported.
    - `npm run check:file-size` — fail on existing `calc-document-codec.ts` and `swatrset.ts` counts. The changed Writer projection is below the limit.
    - The browser gallery reuses the pinned order and matching 16-pixel PNG assets. The user gallery persists in browser storage and the image element maps native placement to browser line-box geometry. ODT can preserve embedded graphics supported by the existing PNG/JPEG package path. Numbering imports pass the native typed `Graphic` property with `XGraphic`; the separate desktop `XBitmap`/DIB service and linked bullets fall outside this embedded-graphic slice.
    - The complete suite is scheduled after the tenth closed task since the reset.
extensions:
  implementation_commit:
    hash: "3ae88311e04a040df109e171e7d7cccb5f86a947"
    message: "🧩 ZHRKTJ code: Connect Writer graphic list markers"
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
### 2026-11-22T02:24:22.843Z — VERIFY — ok

By: CODER

Note: Verified named list-style editing and embedded graphic markers. 215 focused Writer and 12 shared checks passed; production Chrome passed both cases. The task findings record existing repository-wide JSDoc and size failures outside the changed source.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:23:12.027Z, excerpt_hash=sha256:457b6bd39529f2a836d3fb884eeeebe540da4f8ebafb0437567565f24de7b586

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220122-ZHRKTJ/blueprint/resolved-snapshot.json
- old_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
- current_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220122-ZHRKTJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220122-ZHRKTJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-22T02:27:31.548Z — VERIFY — ok

By: CODER

Note: verified-202611220122-ZHRKTJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:24:23.166Z, excerpt_hash=sha256:457b6bd39529f2a836d3fb884eeeebe540da4f8ebafb0437567565f24de7b586

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220122-ZHRKTJ/blueprint/resolved-snapshot.json
- old_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
- current_digest: f8605842b45943983c5279d02f65aabb3141fb139ea6ee53369ec7a5fb96d403
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220122-ZHRKTJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611220122-ZHRKTJ --result verified-202611220122-ZHRKTJ --commit 034e32774d6af402bab61c0a2a27475e28a70624
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- `npm run test:writer -- native-numbering-indent unosett native-list-rule-range native-list-continuation native-numbering-font docstyle-preview odt-roundtrip odt-list-declaration-defaults native-none-numbering native-bullet-scalar WriterNativeTabulatorDialog WriterEditableParagraph native-list-marker-width native-marked-list-paint` — pass, 215 checks in 19 files. Includes image brush identity, style history, Worker records, UNO property types, and named and automatic image-level ODT styles. The ODT test now distinguishes absolute left/right from logical start/end and retains the implemented Left fallback.
- `npm run test:shared -- numitem xmlnume` — pass, 12 checks in two files. Covers shared numbering-format ownership and ODF level serialization.
- `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-list-style-dialog.spec.ts --config=output/playwright/writer-position-chrome.config.ts --project=writer --workers=1` — pass. Chrome exercised nested focus, cancellation, shared style rename and formatting, gallery importing and resizing, bitmap geometry and redraw, and Undo/Redo.
- `npm run check:writer-resources`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity:writer`, scoped ESLint and Prettier, `ap doctor`, `node .agentplane/policy/check-routing.mjs`, and `git diff --check` — pass. Doctor reports the existing non-blocking managed shim warning.
- `npm run check:docs` — fail on existing Calc JSDoc reports. No changed runtime file is reported.
- `npm run check:file-size` — fail on existing `calc-document-codec.ts` and `swatrset.ts` counts. The changed Writer projection is below the limit.
- The browser gallery reuses the pinned order and matching 16-pixel PNG assets. The user gallery persists in browser storage and the image element maps native placement to browser line-box geometry. ODT can preserve embedded graphics supported by the existing PNG/JPEG package path. Numbering imports pass the native typed `Graphic` property with `XGraphic`; the separate desktop `XBitmap`/DIB service and linked bullets fall outside this embedded-graphic slice.
- The complete suite is scheduled after the tenth closed task since the reset.
