---
id: "202610051149-WY14DH"
title: "Own selected table text deletion in native edit-shell ranges"
result_summary: "Delivered native selected-table text deletion and removed private wrtsh cross-paragraph selection deletion. Delete/Backspace/cut remove all selected cell content without joining cells, retain neighbor/table identities, restore native hints/list/paragraph items through repeated Undo/Redo and resume input/ODT serialization. Core CopyAttr zero-length attribute merge replaces erroneous raw duplicate-boundary concatenation. ONE full upstream-absent profile with only exact failed/new retries; no passing replay. All246prior semantic states/defaults/conscious I/O/recovery deviations retained; new eddel module remains unverified for broader profiles. Native ring insertion/replacement/paste and broader CutImpl/history/layout/merged/nested/protection/redlines remain separate; broad goal active."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "upstream-parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T12:31:56.803Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T12:52:19.497Z"
  updated_by: "CODER"
  note: "Verified bounded selected-cell deletion: native eddel ring/flat-section ownership, sequential SwUndoDelete history, table-mode caret exit/Undo restoration and continued input. Six statics, ONE upstream-absent full profile, exact failed/new closures, changed-file statics and five restored source audits pass;25new app and2new Chromium cases closed,394old test files byte-identical,246old semantic states/defaults/exceptions retained. Actual merged/aligned coverage100. Final empty-source CopyAttr fix verified by focused native/Chromium and changed-source checks after initial build, without successful replay. Exact-SHA EVALUATOR pass on ca83c26ff092, broad residuals recorded; no AP sources/helpers or network/outside access."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T12:51:42.680Z"
  updated_by: "EVALUATOR"
  note: "Exact ca83c26ff092 SHA passes bounded selected-cell deletion scope;25new app/2new Chromium cases closed,394prior tests byte-identical,100actual coverage; full/native broader parity remains unverified."
  evaluated_sha: "ca83c26ff092f7a8a84a1407b0f12bcef599c666"
  blueprint_digest: "1094067749a1ebe9b06fd1cf54074b79cc422e263629d65d5f5f8a387d3e0556"
  evidence_refs:
    - ".agentplane/tasks/202610051149-WY14DH/README.md"
    - ".agentplane/tasks/202610051149-WY14DH/quality/20261005-125142680-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051149-WY14DH/quality/20261005-125142680-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051149-WY14DH/quality/20261005-125142680-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051149-WY14DH/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051149-WY14DH/evidence/evaluated-sha-audit.json"
    - ".agentplane/tasks/202610051149-WY14DH/evidence/scope-audit.json"
    - ".agentplane/tasks/202610051149-WY14DH/evidence/final-coverage.json"
  findings:
    - "Same-agent explicit EVALUATOR phase, no independent reviewer claim. Native eddel rings/temporary flat-cell ranges and sequential node-index history remove the private wrtsh selection deletion owner. Empty-source CopyAttr merging fixed from native code. Failed/new-only closures and source audits satisfy approved contract; provenance prior order restored with values unchanged."
commit:
  hash: "44365340304096189a33370ecfdc3fc61de9ae3e"
  message: "🧩 WY14DH task: record selected-cell deletion verification"
comments:
  -
    author: "CODER"
    body: "Start: implement native ring/section selected table deletion in core eddel, preserve table structure/history and existing deviations, then one upstream-absent full profile and failed/new-only closure."
  -
    author: "CODER"
    body: "Verified: selected-cell deletion is owned by native core eddel rings and flat-section DeleteSel, with sequential native history, one Undo boundary, table-mode caret exit and restored selection through Undo; empty-source CopyAttr fixes continued formatted insertion.25new app and2new Chromium cases closed,394old test files unchanged,actual coverage100,source audits/quality pass."
events:
  -
    type: "status"
    at: "2026-10-05T11:50:26.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native ring/section selected table deletion in core eddel, preserve table structure/history and existing deviations, then one upstream-absent full profile and failed/new-only closure."
  -
    type: "verify"
    at: "2026-10-05T12:52:19.497Z"
    author: "CODER"
    state: "ok"
    note: "Verified bounded selected-cell deletion: native eddel ring/flat-section ownership, sequential SwUndoDelete history, table-mode caret exit/Undo restoration and continued input. Six statics, ONE upstream-absent full profile, exact failed/new closures, changed-file statics and five restored source audits pass;25new app and2new Chromium cases closed,394old test files byte-identical,246old semantic states/defaults/exceptions retained. Actual merged/aligned coverage100. Final empty-source CopyAttr fix verified by focused native/Chromium and changed-source checks after initial build, without successful replay. Exact-SHA EVALUATOR pass on ca83c26ff092, broad residuals recorded; no AP sources/helpers or network/outside access."
  -
    type: "status"
    at: "2026-10-05T12:53:36.023Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: selected-cell deletion is owned by native core eddel rings and flat-section DeleteSel, with sequential native history, one Undo boundary, table-mode caret exit and restored selection through Undo; empty-source CopyAttr fixes continued formatted insertion.25new app and2new Chromium cases closed,394old test files unchanged,actual coverage100,source audits/quality pass."
doc_version: 3
doc_updated_at: "2026-10-05T12:53:36.026Z"
doc_updated_by: "CODER"
description: "Move selection deletion from the single-cursor wrtsh editing helper into core eddel ownership; traverse native rings and partition ordinary flat-table cross-cell selections without joining boxes, preserve one history unit and native table-mode exit."
sections:
  Summary: "Own selected table text deletion in the native core edit-shell layer and remove single-cursor wrtsh selection deletion."
  Scope: |-
    apps/office/src/sw/source/core/edit/eddel.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/core/edit/eddel.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts
    apps/office/src/sw/browser/editor/native-table-delete.test.tsx
    apps/office/e2e/writer-native-table-delete.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/core/txtnode/ndtxt.ts
    apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
    apps/office/src/sw/source/core/txtnode/thints.ts
    apps/office/src/sw/inc/swtypes.ts
  Plan: "Iteration149 atomic CODER leaf under standing upstream UI/refactoring authorization. Add core/edit/eddel.ts owning selection-aware delete construction from pinned SwEditShell::Delete/DeleteSel: traverse actual SwPaM rings, use native temporary PaMs for same-flat-table cross-cell sections, never join different boxes; retain same-node and normalized ordinary cross-paragraph behavior using existing SwUndoDelete/SwHistory and Sfx list history. Remove private wrtsh DeleteCrossParagraphSelection and single-owner selection action construction; existing editing port only invokes core owner. Table-mode Delete/Backspace/selection-cut clears table selection, leaves native caret at surviving displayed cell, handles empty selected cells without content history. Complete full-cell multi-paragraph deletion, partial cross-cell ranges, rectangle holes/unselected neighbors, one Undo unit, native Undo/Redo cursor/painting/continued input and ODT serialization. No UI TextRuns edits/new display adapter. Scope: apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/core/edit/eddel.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts, apps/office/src/sw/browser/editor/native-table-delete.test.tsx, apps/office/e2e/writer-native-table-delete.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing246semantic states/defaults/classifications and conscious I/O/recovery deviations unchanged; register one additional eddel module as unverified native mechanism with bounded evidence, not whole-module promotion. Prior tests unchanged unless a concrete failed expectation contradicts pinned source and scope/plan is explicitly revised before correction. Text insertion/replacement/paste across rings, full native history recreated boundary identity, nested/merged/protected/redline/layout/select-all structural behavior remain separate. No AP sources/helpers/Python/native probes/raw diagnostics; no network/outside/subagents. Refinement before validation: existing SwHistory entries store native numeric node indices; multi-range history must be constructed sequentially after earlier DeleteAndJoin mutations, not eagerly before them. Use the existing initial-execute-versus-redo operation pattern (edfcol) and extend the existing wrtsh editing applyAction callback to forward actual undo context; no new UI/context getter adapter. Add wrtsh1.ts to scoped paths. Source-confirmed failure refinement under standing UI/refactoring authorization: initial app failures occur on continued input after formatted multi-paragraph deletion. Native CutImpl zero length calls CopyAttr, whose InsertItem(IS_COPY)->BuildPortions merges equal-boundary automatic styles; raw AppendTextNode hint concatenation incorrectly retains duplicates. Add these four existing owner paths: apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts, apps/office/src/sw/source/core/txtnode/thints.ts, apps/office/src/sw/inc/swtypes.ts. Implement bounded zero-length attribute copy in existing text-node/hint ownership, actual AUTO equal-boundary item merge and INET equal-empty overwrite; retain explicit guard for unimplemented nonempty IS_COPY, no UI workaround/full CutImpl promotion. Keep ndtxt within1000lines by splitting this hint responsibility into its existing ndtxt-hints module. Add new source-independent cases in the already-scoped native deletion test. Correct new Chromium structural count to include th and td (native header default preserved), and lexicographically order metadata. No old passing case replay; source maps for existing changed owners are relocated only through actual unchanged contiguous code locations, new code must have actual closure counters."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
    3. Native/core cases prove actual ring ownership, DeleteSel marked/nonempty ranges and table section partitions, full multi-paragraph selected boxes and partial cross-cell spans, untouched table/row/column/box identities and neighbors, empty selected cells, normalization/direction and one history unit with repeated Undo/Redo, hints/direct paragraph/list items, native caret/table-mode exit/reconstruction and continued insertion/ODT serialization. Mounted and Chromium actual Delete/Backspace routes prove DOM rendering/selection paint/history/continued input. Existing tests byte-identical unless separately source-confirmed correction approved and recorded.
    4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all246existing semantic states/defaults/classifications/exceptions and register new native eddel module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
    5. Failed/new-only closure after the initial profile: four exact new app failures, one exact inventory CLI failure and two exact new Chromium failures. Additional unexecuted zero-length copy/merge and rejected nonempty IS_COPY cases only. Preserve all old test files byte-identical; correct only new browser count to include native header th plus td. Changed-source statics for added four owner paths; final coverage combines real initial/closure counters with exact code-location alignment for changed existing sources. Initial full successful build/115passing Chromium precede this source fix; no successful replay. Final modified native owners are exercised by focused native/mounted/Chromium failed/new closure and type/changed-file checks; report this validation limit.
  Verification: |-
    Pending authorized implementation and deterministic validation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T12:52:19.497Z — VERIFY — ok

    By: CODER

    Note: Verified bounded selected-cell deletion: native eddel ring/flat-section ownership, sequential SwUndoDelete history, table-mode caret exit/Undo restoration and continued input. Six statics, ONE upstream-absent full profile, exact failed/new closures, changed-file statics and five restored source audits pass;25new app and2new Chromium cases closed,394old test files byte-identical,246old semantic states/defaults/exceptions retained. Actual merged/aligned coverage100. Final empty-source CopyAttr fix verified by focused native/Chromium and changed-source checks after initial build, without successful replay. Exact-SHA EVALUATOR pass on ca83c26ff092, broad residuals recorded; no AP sources/helpers or network/outside access.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T12:50:52.451Z, excerpt_hash=sha256:7d6c490ace30ebf4a55d0b11ed99cfe1b3283ff64348353247ae01140f291cc7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051149-WY14DH/blueprint/resolved-snapshot.json
    - old_digest: 1094067749a1ebe9b06fd1cf54074b79cc422e263629d65d5f5f8a387d3e0556
    - current_digest: 1094067749a1ebe9b06fd1cf54074b79cc422e263629d65d5f5f8a387d3e0556
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610051149-WY14DH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610051149-WY14DH -m 🧩 WY14DH task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task semantic commit using a new in-scope task; preserve history and registered conscious deviations."
  Findings: |-
    Read-only preflight: clean main at 3ba3b1f0c4b174354af74199e993a70a0e0d84cd; direct workflow, previous iteration148 verified progress, parent only active. Native eddel.cxx Delete loops GetRingContainer with grouped history; DeleteSel uses temporary section ranges and DeleteAndJoin without crossing boxes. Current wrtsh helper deletes only first ring cursor. Pinned references read in place only.

    - Observation: Initial statics: format/lint passed, typecheck failed due to new test importing nonexistent lrspitem; corrected to existing frmitems, failed typecheck and remaining first-time static gates passed. ONE upstream-absent profile: build pass; app12095pass4failed/12099 with coverage100; inventory108pass1failed/109; scripts5pass; Chromium115pass2failed/117, no flakes. Exact failed names persisted before assertions; vendor restored in finally.
      Impact: Formatted empty paragraphs retain duplicate zero-length AUTO hints from raw append; later insertion expands both and throws. New inventory module order invalid. New Chromium count incorrectly excludes native header th cells.
      Resolution: Refine same leaf scope before fixes against pinned CutImpl zero-length CopyAttr and BuildPortions equal-range item merge; preserve conscious defaults, all old tests and exact failed/new-only rerun rule.

    - Observation: Command: declared six static gates and ONE upstream-absent sequential build/app/inventory/scripts/Chromium profile. Result: closed with failed/new-only retries. Evidence: initial build pass; app12095pass4failed/12099, exact names persisted, coverage100; inventory108pass1failed/109; scripts5pass; Chromium115pass2failed/117, no flakes. Four app failures were continued insertion after selected formatted multi-paragraph deletion; source-confirmed zero-length CutImpl CopyAttr/BuildPortions merge fixed at existing native owners. Three native delete/backspace/selection cases and five new zero-copy/unchanged nonempty-join cases passed in9case closure, leaving only new ODT fixture error. New fixture lists=false incorrectly retained list IDs/levels without rule; moved these assignments into lists=true, preserving strict old exporter/importer guards. Only remaining ODT case reran and passed. Inventory single exact failure fixed by lexicographic new module order and passed once. New Chromium count corrected from td to th+td, retaining native header default. Initial inline failed-only Playwright invocation had a replacement-string dollar-tail syntax error and executed no tests; corrected with callback replacement, then only2initially failed new Chromium cases passed using actual dev server. No successful full/static/build/suite/case replay. Initial maps remain ignored appcache only. Changed-file static closure corrected two missing new guard callback JSDocs and missing required native InsertText offset; final format/lint/JSDoc/types/size pass. Scope audit initially assumed optional provenance preservedResponsibilities always exists; read-only audit fixed to respect schema optionality, no code/test changes. Scope:13approved files,394prior test files byte-identical;246existing semantic statuses/defaults/classifications/exceptions and prior source contracts/evidence retained; one new eddel module registered unverified,total247. Five restored source audits pass,semanticViolationCount0. Actual contiguous unchanged-location counter transfer plus real closure counters gives app100 lines12068/statements13210/functions3340/branches9898; inventory100. AP ignored-inclusive scan4127files0forbidden, vendor restored. Validation limit: final empty-source native owner fix follows successful full build and115old Chromium passes; no successful replay, final fix verified by actual failed/new app and2Chromium cases, changed-source statics and source audits. Full insertion/replacement/paste across rings, broader CutImpl/BuildPortions/native history recreated boundary lifetime, extended select-all/general nontext/merged/nested/protected/redline/layout gestures remain unverified. Broad goal active.
      Impact: One selected-cell delete/cut operation now traverses native ring and section owners with one reversible history boundary; old private wrtsh cross-paragraph selection deletion removed.
      Resolution: Proceed to exact-SHA evaluation and canonical close of this bounded leaf; preserve registered I/O/recovery deviations and broad residuals.

    - Observation: Exact-SHA review found unnecessary sorting of existing provenance entries. Runtime modules still retain required lexicographic order; provenance restored original prior-entry order with new module appended.
      Impact: Reduces unrelated metadata diff without changing any entry value, marker, source contract or evidence.
      Resolution: Asserted complete value equality before/after reorder. No source/test change and no passing-gate replay; repeat exact-SHA audit at final metadata commit.
extensions:
  implementation_commit:
    hash: "ca83c26ff092f7a8a84a1407b0f12bcef599c666"
    message: "🧩 WY14DH code: retain existing provenance order"
id_source: "generated"
---
## Summary

Own selected table text deletion in the native core edit-shell layer and remove single-cursor wrtsh selection deletion.

## Scope

apps/office/src/sw/source/core/edit/eddel.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/core/edit/eddel.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts
apps/office/src/sw/browser/editor/native-table-delete.test.tsx
apps/office/e2e/writer-native-table-delete.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/core/txtnode/ndtxt.ts
apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
apps/office/src/sw/source/core/txtnode/thints.ts
apps/office/src/sw/inc/swtypes.ts

## Plan

Iteration149 atomic CODER leaf under standing upstream UI/refactoring authorization. Add core/edit/eddel.ts owning selection-aware delete construction from pinned SwEditShell::Delete/DeleteSel: traverse actual SwPaM rings, use native temporary PaMs for same-flat-table cross-cell sections, never join different boxes; retain same-node and normalized ordinary cross-paragraph behavior using existing SwUndoDelete/SwHistory and Sfx list history. Remove private wrtsh DeleteCrossParagraphSelection and single-owner selection action construction; existing editing port only invokes core owner. Table-mode Delete/Backspace/selection-cut clears table selection, leaves native caret at surviving displayed cell, handles empty selected cells without content history. Complete full-cell multi-paragraph deletion, partial cross-cell ranges, rectangle holes/unselected neighbors, one Undo unit, native Undo/Redo cursor/painting/continued input and ODT serialization. No UI TextRuns edits/new display adapter. Scope: apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/core/edit/eddel.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts, apps/office/src/sw/browser/editor/native-table-delete.test.tsx, apps/office/e2e/writer-native-table-delete.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing246semantic states/defaults/classifications and conscious I/O/recovery deviations unchanged; register one additional eddel module as unverified native mechanism with bounded evidence, not whole-module promotion. Prior tests unchanged unless a concrete failed expectation contradicts pinned source and scope/plan is explicitly revised before correction. Text insertion/replacement/paste across rings, full native history recreated boundary identity, nested/merged/protected/redline/layout/select-all structural behavior remain separate. No AP sources/helpers/Python/native probes/raw diagnostics; no network/outside/subagents. Refinement before validation: existing SwHistory entries store native numeric node indices; multi-range history must be constructed sequentially after earlier DeleteAndJoin mutations, not eagerly before them. Use the existing initial-execute-versus-redo operation pattern (edfcol) and extend the existing wrtsh editing applyAction callback to forward actual undo context; no new UI/context getter adapter. Add wrtsh1.ts to scoped paths. Source-confirmed failure refinement under standing UI/refactoring authorization: initial app failures occur on continued input after formatted multi-paragraph deletion. Native CutImpl zero length calls CopyAttr, whose InsertItem(IS_COPY)->BuildPortions merges equal-boundary automatic styles; raw AppendTextNode hint concatenation incorrectly retains duplicates. Add these four existing owner paths: apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts, apps/office/src/sw/source/core/txtnode/thints.ts, apps/office/src/sw/inc/swtypes.ts. Implement bounded zero-length attribute copy in existing text-node/hint ownership, actual AUTO equal-boundary item merge and INET equal-empty overwrite; retain explicit guard for unimplemented nonempty IS_COPY, no UI workaround/full CutImpl promotion. Keep ndtxt within1000lines by splitting this hint responsibility into its existing ndtxt-hints module. Add new source-independent cases in the already-scoped native deletion test. Correct new Chromium structural count to include th and td (native header default preserved), and lexicographically order metadata. No old passing case replay; source maps for existing changed owners are relocated only through actual unchanged contiguous code locations, new code must have actual closure counters.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
3. Native/core cases prove actual ring ownership, DeleteSel marked/nonempty ranges and table section partitions, full multi-paragraph selected boxes and partial cross-cell spans, untouched table/row/column/box identities and neighbors, empty selected cells, normalization/direction and one history unit with repeated Undo/Redo, hints/direct paragraph/list items, native caret/table-mode exit/reconstruction and continued insertion/ODT serialization. Mounted and Chromium actual Delete/Backspace routes prove DOM rendering/selection paint/history/continued input. Existing tests byte-identical unless separately source-confirmed correction approved and recorded.
4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all246existing semantic states/defaults/classifications/exceptions and register new native eddel module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
5. Failed/new-only closure after the initial profile: four exact new app failures, one exact inventory CLI failure and two exact new Chromium failures. Additional unexecuted zero-length copy/merge and rejected nonempty IS_COPY cases only. Preserve all old test files byte-identical; correct only new browser count to include native header th plus td. Changed-source statics for added four owner paths; final coverage combines real initial/closure counters with exact code-location alignment for changed existing sources. Initial full successful build/115passing Chromium precede this source fix; no successful replay. Final modified native owners are exercised by focused native/mounted/Chromium failed/new closure and type/changed-file checks; report this validation limit.

## Verification

Pending authorized implementation and deterministic validation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T12:52:19.497Z — VERIFY — ok

By: CODER

Note: Verified bounded selected-cell deletion: native eddel ring/flat-section ownership, sequential SwUndoDelete history, table-mode caret exit/Undo restoration and continued input. Six statics, ONE upstream-absent full profile, exact failed/new closures, changed-file statics and five restored source audits pass;25new app and2new Chromium cases closed,394old test files byte-identical,246old semantic states/defaults/exceptions retained. Actual merged/aligned coverage100. Final empty-source CopyAttr fix verified by focused native/Chromium and changed-source checks after initial build, without successful replay. Exact-SHA EVALUATOR pass on ca83c26ff092, broad residuals recorded; no AP sources/helpers or network/outside access.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T12:50:52.451Z, excerpt_hash=sha256:7d6c490ace30ebf4a55d0b11ed99cfe1b3283ff64348353247ae01140f291cc7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051149-WY14DH/blueprint/resolved-snapshot.json
- old_digest: 1094067749a1ebe9b06fd1cf54074b79cc422e263629d65d5f5f8a387d3e0556
- current_digest: 1094067749a1ebe9b06fd1cf54074b79cc422e263629d65d5f5f8a387d3e0556
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610051149-WY14DH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610051149-WY14DH -m 🧩 WY14DH task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task semantic commit using a new in-scope task; preserve history and registered conscious deviations.

## Findings

Read-only preflight: clean main at 3ba3b1f0c4b174354af74199e993a70a0e0d84cd; direct workflow, previous iteration148 verified progress, parent only active. Native eddel.cxx Delete loops GetRingContainer with grouped history; DeleteSel uses temporary section ranges and DeleteAndJoin without crossing boxes. Current wrtsh helper deletes only first ring cursor. Pinned references read in place only.

- Observation: Initial statics: format/lint passed, typecheck failed due to new test importing nonexistent lrspitem; corrected to existing frmitems, failed typecheck and remaining first-time static gates passed. ONE upstream-absent profile: build pass; app12095pass4failed/12099 with coverage100; inventory108pass1failed/109; scripts5pass; Chromium115pass2failed/117, no flakes. Exact failed names persisted before assertions; vendor restored in finally.
  Impact: Formatted empty paragraphs retain duplicate zero-length AUTO hints from raw append; later insertion expands both and throws. New inventory module order invalid. New Chromium count incorrectly excludes native header th cells.
  Resolution: Refine same leaf scope before fixes against pinned CutImpl zero-length CopyAttr and BuildPortions equal-range item merge; preserve conscious defaults, all old tests and exact failed/new-only rerun rule.

- Observation: Command: declared six static gates and ONE upstream-absent sequential build/app/inventory/scripts/Chromium profile. Result: closed with failed/new-only retries. Evidence: initial build pass; app12095pass4failed/12099, exact names persisted, coverage100; inventory108pass1failed/109; scripts5pass; Chromium115pass2failed/117, no flakes. Four app failures were continued insertion after selected formatted multi-paragraph deletion; source-confirmed zero-length CutImpl CopyAttr/BuildPortions merge fixed at existing native owners. Three native delete/backspace/selection cases and five new zero-copy/unchanged nonempty-join cases passed in9case closure, leaving only new ODT fixture error. New fixture lists=false incorrectly retained list IDs/levels without rule; moved these assignments into lists=true, preserving strict old exporter/importer guards. Only remaining ODT case reran and passed. Inventory single exact failure fixed by lexicographic new module order and passed once. New Chromium count corrected from td to th+td, retaining native header default. Initial inline failed-only Playwright invocation had a replacement-string dollar-tail syntax error and executed no tests; corrected with callback replacement, then only2initially failed new Chromium cases passed using actual dev server. No successful full/static/build/suite/case replay. Initial maps remain ignored appcache only. Changed-file static closure corrected two missing new guard callback JSDocs and missing required native InsertText offset; final format/lint/JSDoc/types/size pass. Scope audit initially assumed optional provenance preservedResponsibilities always exists; read-only audit fixed to respect schema optionality, no code/test changes. Scope:13approved files,394prior test files byte-identical;246existing semantic statuses/defaults/classifications/exceptions and prior source contracts/evidence retained; one new eddel module registered unverified,total247. Five restored source audits pass,semanticViolationCount0. Actual contiguous unchanged-location counter transfer plus real closure counters gives app100 lines12068/statements13210/functions3340/branches9898; inventory100. AP ignored-inclusive scan4127files0forbidden, vendor restored. Validation limit: final empty-source native owner fix follows successful full build and115old Chromium passes; no successful replay, final fix verified by actual failed/new app and2Chromium cases, changed-source statics and source audits. Full insertion/replacement/paste across rings, broader CutImpl/BuildPortions/native history recreated boundary lifetime, extended select-all/general nontext/merged/nested/protected/redline/layout gestures remain unverified. Broad goal active.
  Impact: One selected-cell delete/cut operation now traverses native ring and section owners with one reversible history boundary; old private wrtsh cross-paragraph selection deletion removed.
  Resolution: Proceed to exact-SHA evaluation and canonical close of this bounded leaf; preserve registered I/O/recovery deviations and broad residuals.

- Observation: Exact-SHA review found unnecessary sorting of existing provenance entries. Runtime modules still retain required lexicographic order; provenance restored original prior-entry order with new module appended.
  Impact: Reduces unrelated metadata diff without changing any entry value, marker, source contract or evidence.
  Resolution: Asserted complete value equality before/after reorder. No source/test change and no passing-gate replay; repeat exact-SHA audit at final metadata commit.
