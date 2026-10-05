---
id: "202610051334-PY9DJV"
title: "Read plain clipboard text into selected table sections with native document undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "clipboard"
  - "code"
  - "table"
  - "upstream"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T14:04:58.318Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T14:15:19.977Z"
  updated_by: "CODER"
  note: "Verified semantic5d873b3ad547: six statics passed; ONE absent full build/profile with exact initial6app/2Chromium failures recorded and failed/new-only closure.12136distinct app/120Chromium,100% actual merged L/S/F/B;109inventory/5scripts; five restored source audits0violations;401old tests and248old semantic/provenance records unchanged,2new modules unverified. Same-agent exact-SHA EVALUATOR pass quality20261005-141454961. No passing replay; final ndtxt edit validated by changed-file statics and exact targeted cases, full build predates fix."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T14:14:54.961Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA evaluation of 5d873b3ad547cd4f95e064c24356df478c1b3a5d: approved plain selected-table native read and bounded empty split behavior verified; whole-module/native lifetime parity stays unverified."
  evaluated_sha: "5d873b3ad547cd4f95e064c24356df478c1b3a5d"
  blueprint_digest: "02c754547d5fc2e3b1d43d228b7da98fd123c5b0179c84dc7fa0e742f1367c52"
  evidence_refs:
    - ".agentplane/tasks/202610051334-PY9DJV/README.md"
    - ".agentplane/tasks/202610051334-PY9DJV/quality/20261005-141454961-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051334-PY9DJV/quality/20261005-141454961-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051334-PY9DJV/quality/20261005-141454961-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051334-PY9DJV/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051334-PY9DJV/evidence/exact-sha-evaluation.json"
    - ".agentplane/tasks/202610051334-PY9DJV/evidence/scope-audit.json"
    - ".agentplane/tasks/202610051334-PY9DJV/evidence/final-coverage.json"
  findings:
    - "All401prior test files and248prior semantic/provenance records preserved. ONE full absent profile; initial6app/2Chromium failures closed by exact failed/new cases only;12136distinct app/120Chromium,100% actual merged L/S/F/B. Five source audits pass0semantic violations. Final ndtxt correction checked by changed-file statics and targeted tests; no passing replay."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Preserve plain clipboard format and implement native per-cell ASCII import with SwUndoInsDoc history."
  -
    author: "CODER"
    body: "Start: Source-confirmed empty/end split inheritance correction within approved plain table reader scope."
events:
  -
    type: "status"
    at: "2026-10-05T13:35:59.273Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Preserve plain clipboard format and implement native per-cell ASCII import with SwUndoInsDoc history."
  -
    type: "status"
    at: "2026-10-05T14:05:33.081Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Source-confirmed empty/end split inheritance correction within approved plain table reader scope."
  -
    type: "verify"
    at: "2026-10-05T14:15:19.977Z"
    author: "CODER"
    state: "ok"
    note: "Verified semantic5d873b3ad547: six statics passed; ONE absent full build/profile with exact initial6app/2Chromium failures recorded and failed/new-only closure.12136distinct app/120Chromium,100% actual merged L/S/F/B;109inventory/5scripts; five restored source audits0violations;401old tests and248old semantic/provenance records unchanged,2new modules unverified. Same-agent exact-SHA EVALUATOR pass quality20261005-141454961. No passing replay; final ndtxt edit validated by changed-file statics and exact targeted cases, full build predates fix."
doc_version: 3
doc_updated_at: "2026-10-05T14:15:20.061Z"
doc_updated_by: "CODER"
description: "Iteration151 under parent 202609240501-C9TN6M: preserve plain clipboard format, read actual selected-cell cursor rings through native ASCII insertion/split ownership and SwUndoInsDoc range history; remove TextRuns/compound shell-command insertion from this path, including multiline and inherited formatting. Keep structural/rich transfer and consciously registered I/O/recovery deviations outside scope."
sections:
  Summary: "Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure."
  Scope: |-
    apps/office/src/sw/source/filter/ascii/parasc.ts
    apps/office/src/sw/source/core/undo/untblk.ts
    apps/office/src/sw/source/filter/basflt/shellio.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts
    apps/office/src/sw/browser/editor/writer-clipboard-events.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts
    apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx
    apps/office/e2e/writer-native-table-plain-paste.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure. Source-confirmed within-scope correction after initial six failures: extend scope to existing ndtxt.ts and ndtxt-hints.ts (14 paths total). Native ndtxt.cxx SplitContentNode 637-661 calls CutText(prefix), retains equal-end expanding attributes in empty suffix, removes DontExpand empties and MoveTextAttr_To_AttrSet 833-870 transfers supported whole-paragraph AUTO items to direct attributes. Implement bounded end/empty split hint preservation and native supported AUTO-to-item transfer in existing helper, preserving non-end fragment semantics and whole-owner unverified status. Add genuinely new tests covering empty/end formatting, DontExpand and DontMove, non-end/unformatted branches. Correct only new Chromium fixture by restoring actual paragraph focus after toolbar Bold and asserting Keep/Second before paste. No old tests changed. Initial 6 app and2 Chromium failures recorded; repeat only exact failed and new cases, carry unchanged contiguous actual coverage counters, restore before source audits."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
    3. Source-independent native and browser tests prove plain format provenance dispatch before fragment conversion, actual selected-cell ring points, multiline/blank/trailing-newline behavior, preserved old cell paragraphs and neighbors, inherited character/list/paragraph attributes, native SetInsertRange/SwUndoNodes/SwHistory ownership, one reversible history unit with repeated Undo/Redo and disposal, native table display endpoints/rings/DOM paint and ODT serialization. Mounted and Chromium real paste events cover one-line and multiline text. All old tests remain byte-identical; any correction must be source-confirmed and recorded before edit.
    4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all248existing semantic states/defaults/classifications/exceptions and register two new native ASCII/history modules unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
  Verification: |-
    Pending declared checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T14:15:19.977Z — VERIFY — ok

    By: CODER

    Note: Verified semantic5d873b3ad547: six statics passed; ONE absent full build/profile with exact initial6app/2Chromium failures recorded and failed/new-only closure.12136distinct app/120Chromium,100% actual merged L/S/F/B;109inventory/5scripts; five restored source audits0violations;401old tests and248old semantic/provenance records unchanged,2new modules unverified. Same-agent exact-SHA EVALUATOR pass quality20261005-141454961. No passing replay; final ndtxt edit validated by changed-file statics and exact targeted cases, full build predates fix.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T14:13:41.645Z, excerpt_hash=sha256:202ef922703f492256a5e74a6ef30745e3cd093211382dd14301ea01659c1012

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051334-PY9DJV/blueprint/resolved-snapshot.json
    - old_digest: 02c754547d5fc2e3b1d43d228b7da98fd123c5b0179c84dc7fa0e742f1367c52
    - current_digest: 02c754547d5fc2e3b1d43d228b7da98fd123c5b0179c84dc7fa0e742f1367c52
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610051334-PY9DJV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610051334-PY9DJV -m 🧩 PY9DJV task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert scoped semantic commit without rewriting history. Preserve task/parent evidence."
  Findings: |-
    Pinned source read in place: LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. PasteFileContent passes actual GetCursor cell PaM ring into SwReader; ASCII ReadChars clones point, uses default EMPTYEXPAND, omits terminal newline, preserves blank paragraphs and wraps at MAX_ASCII_PARA250000. SwReader captures SwUndoInsDoc before each read and SetInsertRange afterward. Implementation now preserves browser plain/html format provenance; plain selected-table transfer delegates before native fragment conversion or shell paste/caret/list callbacks. Existing shellio loops actual ring points, native ASCII InsertString/SplitNode own mutations; SwUndoInserts/SwUndoInsDoc retain actual inserted paragraphs and boundary fragments with original SwHistory items/collection, grouped one history unit. Tracked native display positions preserve actual table selection. No new UI/context adapter, whole-document snapshot or runtime upstream dependency.

    Initial failure correction, recorded before edits and reapproved within14paths: six new selected-column cases lost bold after blank paragraphs. Native ndtxt.cxx SplitContentNode637-661 CutText retains equal-end attributes, removes DontExpand empties; MoveTextAttr_To_AttrSet833-870 moves supported AUTO items. Existing ndtxt/ndtxt-hints now preserve represented end/empty suffix hints and transfer movable AUTO items to direct attributes. Non-end splitting remains existing fragment path and unverified. New low-level tests cover empty/nonempty targets, DontMove, DontExpand, earlier extents, plain suffix and generic nonAUTO ownership. Test fixture corrections only in newly added tests: collapsed empty DontMove attributes inspected as actual native hint items, then inserted with native EMPTYEXPAND rather than asserting the existing incomplete collapsed-caret projection; adjacent identical AUTO fixture items were made distinct so its own normalization cannot merge away the closed-hint flag. New Chromium fixture returns focus to real second paragraph after Bold toolbar and proves neighbors populated before paste. All401 prior test files byte-identical.

    Command: six declared statics. Result: pass first attempt. Evidence: static-gates.json; final changed-file checks pass. Changed-file TypeScript initially rejected seven wrong new-test API uses (2445/2551/2339/2353), corrected to actual API without production API expansion. Scope:14paths.
    Command: ONE sequential full upstream-absent build/app/inventory/scripts/Chromium profile. Result: initial app6fail/12128pass and Chromium2fail/118pass; build,109inventory and5scripts passed. Exact failure names persisted before assertions in absent-profile.json. Only six failed app plus two genuinely new split cases attempted:7pass1fail. First inline Chromium closure syntax error executed zero tests (replacement-string dollar suffix), corrected to callback replacement; actual failed2Chromium passed once. New split failed alone once then passed alone after fixture correction. No passing test replay, no full profile repeat. Final aggregate12136 distinct app cases and120Chromium cases;23newapp/2newChromium. Maps ignored appcache only; bounded final-coverage.json records actual unchanged-contiguous location counter carry for two changed existing owners; final app and inventory L/S/F/B100%, no synthetic counters. Final build predates ndtxt correction; changed-file statics and exact failed/new-only tests exercise final correction. Scope-audit.json records hashes/counts and limits.
    Command: restore vendor, then five declared source audits. Result: pass, semanticViolationCount0. Evidence: restored-source-audits.json. Scope:250runtime modules, all248prior records and all prior provenance entries unchanged; two new mapped native modules remain wholly unverified. Ignored-inclusive AP scan4151files,0forbidden; no upstream copies/helpers/Python/probes/raw diagnostics.

    Residuals: append-only represented cell import only. Actual inserted native nodes/fragments are eagerly retained by SetInsertRange while still connected; native MoveToUndoNds/MoveFromUndoNds timing, full non-end/suffix/fly/redline/index/lifetime ownership remains unverified. Full SplitContent prefix attribute-to-item conversion, non-end CutText owner/identity, list restart/conditional styles, superscript reset and collapsed empty hint projection remain unverified. Native form-feed page-break is explicitly unsupported before mutation; native encoding/options/system line-ending defaults and internal structured clipboard identity are unverified. Rich/body/list transfer stays existing separate route; numbered-cell ODT import, merged/nested/protected/layout contracts remain unverified. Conscious save/open/recovery deviations preserved. Broad goal active; no whole-module parity promotion.

    - Observation: Six new multiline formatted-column failures traced to native empty/end split attributes; source-confirmed correction reapproved within14paths. Two new browser fixture failures fixed by actual paragraph focus after toolbar. New split fixture initially used unsupported API/caret projection/identical merged AUTO items; corrected actual native operations and distinct owned hints. First inline Chromium closure syntax error executed0cases; corrected callback replacement. Exact names/errors and actual counters retained; native undo storage timing/full ownership remain unverified.
      Impact: Plain table paste preserves existing cell content, blank/newline semantics, inherited items/list attributes, display selection and repeated Undo/Redo through native reader/history owners.
      Resolution: All failed/new cases closed without passing replay. Conscious deviations unchanged. Whole-module and broad parity unverified; no completion claim.
id_source: "generated"
---
## Summary

Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure.

## Scope

apps/office/src/sw/source/filter/ascii/parasc.ts
apps/office/src/sw/source/core/undo/untblk.ts
apps/office/src/sw/source/filter/basflt/shellio.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts
apps/office/src/sw/browser/editor/writer-clipboard-events.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts
apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx
apps/office/e2e/writer-native-table-plain-paste.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure. Source-confirmed within-scope correction after initial six failures: extend scope to existing ndtxt.ts and ndtxt-hints.ts (14 paths total). Native ndtxt.cxx SplitContentNode 637-661 calls CutText(prefix), retains equal-end expanding attributes in empty suffix, removes DontExpand empties and MoveTextAttr_To_AttrSet 833-870 transfers supported whole-paragraph AUTO items to direct attributes. Implement bounded end/empty split hint preservation and native supported AUTO-to-item transfer in existing helper, preserving non-end fragment semantics and whole-owner unverified status. Add genuinely new tests covering empty/end formatting, DontExpand and DontMove, non-end/unformatted branches. Correct only new Chromium fixture by restoring actual paragraph focus after toolbar Bold and asserting Keep/Second before paste. No old tests changed. Initial 6 app and2 Chromium failures recorded; repeat only exact failed and new cases, carry unchanged contiguous actual coverage counters, restore before source audits.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
3. Source-independent native and browser tests prove plain format provenance dispatch before fragment conversion, actual selected-cell ring points, multiline/blank/trailing-newline behavior, preserved old cell paragraphs and neighbors, inherited character/list/paragraph attributes, native SetInsertRange/SwUndoNodes/SwHistory ownership, one reversible history unit with repeated Undo/Redo and disposal, native table display endpoints/rings/DOM paint and ODT serialization. Mounted and Chromium real paste events cover one-line and multiline text. All old tests remain byte-identical; any correction must be source-confirmed and recorded before edit.
4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all248existing semantic states/defaults/classifications/exceptions and register two new native ASCII/history modules unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.

## Verification

Pending declared checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T14:15:19.977Z — VERIFY — ok

By: CODER

Note: Verified semantic5d873b3ad547: six statics passed; ONE absent full build/profile with exact initial6app/2Chromium failures recorded and failed/new-only closure.12136distinct app/120Chromium,100% actual merged L/S/F/B;109inventory/5scripts; five restored source audits0violations;401old tests and248old semantic/provenance records unchanged,2new modules unverified. Same-agent exact-SHA EVALUATOR pass quality20261005-141454961. No passing replay; final ndtxt edit validated by changed-file statics and exact targeted cases, full build predates fix.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T14:13:41.645Z, excerpt_hash=sha256:202ef922703f492256a5e74a6ef30745e3cd093211382dd14301ea01659c1012

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051334-PY9DJV/blueprint/resolved-snapshot.json
- old_digest: 02c754547d5fc2e3b1d43d228b7da98fd123c5b0179c84dc7fa0e742f1367c52
- current_digest: 02c754547d5fc2e3b1d43d228b7da98fd123c5b0179c84dc7fa0e742f1367c52
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610051334-PY9DJV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610051334-PY9DJV -m 🧩 PY9DJV task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert scoped semantic commit without rewriting history. Preserve task/parent evidence.

## Findings

Pinned source read in place: LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. PasteFileContent passes actual GetCursor cell PaM ring into SwReader; ASCII ReadChars clones point, uses default EMPTYEXPAND, omits terminal newline, preserves blank paragraphs and wraps at MAX_ASCII_PARA250000. SwReader captures SwUndoInsDoc before each read and SetInsertRange afterward. Implementation now preserves browser plain/html format provenance; plain selected-table transfer delegates before native fragment conversion or shell paste/caret/list callbacks. Existing shellio loops actual ring points, native ASCII InsertString/SplitNode own mutations; SwUndoInserts/SwUndoInsDoc retain actual inserted paragraphs and boundary fragments with original SwHistory items/collection, grouped one history unit. Tracked native display positions preserve actual table selection. No new UI/context adapter, whole-document snapshot or runtime upstream dependency.

Initial failure correction, recorded before edits and reapproved within14paths: six new selected-column cases lost bold after blank paragraphs. Native ndtxt.cxx SplitContentNode637-661 CutText retains equal-end attributes, removes DontExpand empties; MoveTextAttr_To_AttrSet833-870 moves supported AUTO items. Existing ndtxt/ndtxt-hints now preserve represented end/empty suffix hints and transfer movable AUTO items to direct attributes. Non-end splitting remains existing fragment path and unverified. New low-level tests cover empty/nonempty targets, DontMove, DontExpand, earlier extents, plain suffix and generic nonAUTO ownership. Test fixture corrections only in newly added tests: collapsed empty DontMove attributes inspected as actual native hint items, then inserted with native EMPTYEXPAND rather than asserting the existing incomplete collapsed-caret projection; adjacent identical AUTO fixture items were made distinct so its own normalization cannot merge away the closed-hint flag. New Chromium fixture returns focus to real second paragraph after Bold toolbar and proves neighbors populated before paste. All401 prior test files byte-identical.

Command: six declared statics. Result: pass first attempt. Evidence: static-gates.json; final changed-file checks pass. Changed-file TypeScript initially rejected seven wrong new-test API uses (2445/2551/2339/2353), corrected to actual API without production API expansion. Scope:14paths.
Command: ONE sequential full upstream-absent build/app/inventory/scripts/Chromium profile. Result: initial app6fail/12128pass and Chromium2fail/118pass; build,109inventory and5scripts passed. Exact failure names persisted before assertions in absent-profile.json. Only six failed app plus two genuinely new split cases attempted:7pass1fail. First inline Chromium closure syntax error executed zero tests (replacement-string dollar suffix), corrected to callback replacement; actual failed2Chromium passed once. New split failed alone once then passed alone after fixture correction. No passing test replay, no full profile repeat. Final aggregate12136 distinct app cases and120Chromium cases;23newapp/2newChromium. Maps ignored appcache only; bounded final-coverage.json records actual unchanged-contiguous location counter carry for two changed existing owners; final app and inventory L/S/F/B100%, no synthetic counters. Final build predates ndtxt correction; changed-file statics and exact failed/new-only tests exercise final correction. Scope-audit.json records hashes/counts and limits.
Command: restore vendor, then five declared source audits. Result: pass, semanticViolationCount0. Evidence: restored-source-audits.json. Scope:250runtime modules, all248prior records and all prior provenance entries unchanged; two new mapped native modules remain wholly unverified. Ignored-inclusive AP scan4151files,0forbidden; no upstream copies/helpers/Python/probes/raw diagnostics.

Residuals: append-only represented cell import only. Actual inserted native nodes/fragments are eagerly retained by SetInsertRange while still connected; native MoveToUndoNds/MoveFromUndoNds timing, full non-end/suffix/fly/redline/index/lifetime ownership remains unverified. Full SplitContent prefix attribute-to-item conversion, non-end CutText owner/identity, list restart/conditional styles, superscript reset and collapsed empty hint projection remain unverified. Native form-feed page-break is explicitly unsupported before mutation; native encoding/options/system line-ending defaults and internal structured clipboard identity are unverified. Rich/body/list transfer stays existing separate route; numbered-cell ODT import, merged/nested/protected/layout contracts remain unverified. Conscious save/open/recovery deviations preserved. Broad goal active; no whole-module parity promotion.

- Observation: Six new multiline formatted-column failures traced to native empty/end split attributes; source-confirmed correction reapproved within14paths. Two new browser fixture failures fixed by actual paragraph focus after toolbar. New split fixture initially used unsupported API/caret projection/identical merged AUTO items; corrected actual native operations and distinct owned hints. First inline Chromium closure syntax error executed0cases; corrected callback replacement. Exact names/errors and actual counters retained; native undo storage timing/full ownership remain unverified.
  Impact: Plain table paste preserves existing cell content, blank/newline semantics, inherited items/list attributes, display selection and repeated Undo/Redo through native reader/history owners.
  Resolution: All failed/new cases closed without passing replay. Conscious deviations unchanged. Whole-module and broad parity unverified; no completion claim.
