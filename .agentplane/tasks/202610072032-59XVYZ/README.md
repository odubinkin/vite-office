---
id: "202610072032-59XVYZ"
title: "Bind native edit-window and editing-shell owners to SwView"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T20:43:26.053Z"
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
    body: "Start: bind the actual SwView owner at native edit-window and editing-shell boundaries; migrate only audited constructor/import fixture inputs and preserve all operation assertions."
events:
  -
    type: "status"
    at: "2026-10-07T20:33:41.322Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind the actual SwView owner at native edit-window and editing-shell boundaries; migrate only audited constructor/import fixture inputs and preserve all operation assertions."
doc_version: 3
doc_updated_at: "2026-10-07T20:49:12.522Z"
doc_updated_by: "CODER"
description: "Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.3production+41fixture+1fresh+2metadata=47semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions."
sections:
  Summary: "Replace direct SwWrtShell injection at the native edit-window boundary with the source SwView relationship. This is one ownership refactor, a prerequisite for moving represented ruler geometry to native ruler owners."
  Scope: "Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround."
  Plan: "Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround."
  Verify Steps: |-
    1. Inspect pinned SwEditWin ctor/GetView (edtwin.cxx/edtwin.hxx) and SwWrtShell m_rView/GetView (wrtsh.hxx/wrtsh1.cxx); confirm real production SwView owns both children and each keeps the exact originating view even when another view is current on the same document shell. Native operations, original cursor/list/table/history and document replacement/layout still live through that view; detached core shells have no fabricated view.
    2. Initial six static gates once; later only failed/changed-input scoped closure. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore vendor. Later only original failures/genuinely new cases; zero passing replay/skips promotion. Tests never invoke pinned upstream. Preserve all4 app/inventory100 via complete identical source/map/declaration/body/enclosing branch/location proofs, no exclusions/clamps/individual count sanitization.
    3. Five restored source/resource/provenance/invariant/parity gates; actual source anchors/hashes;608prior files with567byte-identical and41 exact deterministic constructor/import/formatter-only native view fixture migrations, all test names/expectation calls/authored inputs/assertions/cleanup preserved;1new609current; all302metadata contracts/prefixes/classes/status/defaults retained; exact48semantic paths, physical lines<1000,JSDoc, AP source/Python/raw ban, doctor/routing/diff.
    4. Final Findings/Verification before canonical verify; actual implementation SHA reconstruction and same-current-agent EVALUATOR explicitly not independent, checkpoint before finish actual SHA. Parent full639405character prefixSHA0f3fe922f95fb21c501b3cdb4f67ee310459a5b3049445591a0649461c659834 and deferred stash preserved, Git clean. Exhaustive goal ACTIVE; full native ruler/slot geometry ownership remains incomplete. Verify shared layout is seeded once in the source cursor-shell owner and the subclass duplicate is removed; existing optional explicit-layout constructor contract and all old fixture expectations preserved.
  Verification: "Pending actual implementation, one upstream-absent full runtime and exact source-bound verification. No broad core/UI parity claim."
  Rollback Plan: "Revert the task's intentional three production files, constructor/import-only fixture migrations, fresh ownership test and metadata note together. Preserve parent historical evidence and unrelated commits/stash; do not use destructive history operations."
  Findings: "Deferred on the explicit user priority for bullet overlap. Original ownership implementation (47 tracked paths and one fresh test) is preserved byte-for-byte in ignored local cache apps/office/node_modules/.cache/parity-coverage/59XVYZ-deferred; patch SHA256 5844aef23d272577d1331863eebc8601969237f317f7843fc1b61dab131400fc, base 705781f0a1b47dddcafde0ae497e1e8065f922df. Source working tree restored only for this approved scope, fresh file preserved in the same cache. No implementation discarded or committed, no runtime tests executed. Initial static format/lint/dependencies/docs passed; type failed from fresh InitNew fixture signature and file-size failed at wrtsh1.ts1006 lines. Approved correction remains pending: actual InitNew return and shared base cursor layout ownership. Resume after the separate priority bullet task, reconcile metadata append notes with its final base, and retain the one-full-upstream-absent-run contract."
id_source: "generated"
---
## Summary

Replace direct SwWrtShell injection at the native edit-window boundary with the source SwView relationship. This is one ownership refactor, a prerequisite for moving represented ruler geometry to native ruler owners.

## Scope

Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround.

## Plan

Repair one native ownership contract: SwEditWin holds required SwView reference and resolves SwWrtShell through it; SwView passes itself to its persistent edit window and editing shell, whose GetView returns its borrowed source owner (no fake/default view and detached core shells reject GetView). Preserve all operation logic, layout/cursor/list/table/history/defaults and intentional IO exceptions. Migrate exactly41 existing fixture inputs to actual SwView(DocShell).GetWrtShell and SwEditWin(shell.GetView), imports/formatter only; preserve every original test name, expectation, authored input, assertion and cleanup. Add meaningful native ownership/lifetime/document replacement/cross-view/failure-contract tests.4production+41fixture+1fresh+2metadata=48semantic files; no new upstream/Python/raw AP artifacts. One full upstream-absent runtime, later only actual failures/new cases and failed/changed static inputs, zero passing replay; all4 source-bound coverage100. Real SvxRuler/column item/slot pipeline remains subsequent work and is not represented by a fake renamed wrapper. Exact SHA review, canonical verify/checkpoint, finish actual implementation SHA; full parent historical prefix and stash retained. Standing user goal authorizes this safe local refactor; no network/outside-repo/destructive actions. Remove duplicate subclass layout factory/accessor by installing the optional shared native root in the existing SwCursorShell constructor; standalone GetLayout uses its existing lazy native root. This is part of the same native view/layout ownership contract, not a new operation or a line-budget workaround.

## Verify Steps

1. Inspect pinned SwEditWin ctor/GetView (edtwin.cxx/edtwin.hxx) and SwWrtShell m_rView/GetView (wrtsh.hxx/wrtsh1.cxx); confirm real production SwView owns both children and each keeps the exact originating view even when another view is current on the same document shell. Native operations, original cursor/list/table/history and document replacement/layout still live through that view; detached core shells have no fabricated view.
2. Initial six static gates once; later only failed/changed-input scoped closure. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore vendor. Later only original failures/genuinely new cases; zero passing replay/skips promotion. Tests never invoke pinned upstream. Preserve all4 app/inventory100 via complete identical source/map/declaration/body/enclosing branch/location proofs, no exclusions/clamps/individual count sanitization.
3. Five restored source/resource/provenance/invariant/parity gates; actual source anchors/hashes;608prior files with567byte-identical and41 exact deterministic constructor/import/formatter-only native view fixture migrations, all test names/expectation calls/authored inputs/assertions/cleanup preserved;1new609current; all302metadata contracts/prefixes/classes/status/defaults retained; exact48semantic paths, physical lines<1000,JSDoc, AP source/Python/raw ban, doctor/routing/diff.
4. Final Findings/Verification before canonical verify; actual implementation SHA reconstruction and same-current-agent EVALUATOR explicitly not independent, checkpoint before finish actual SHA. Parent full639405character prefixSHA0f3fe922f95fb21c501b3cdb4f67ee310459a5b3049445591a0649461c659834 and deferred stash preserved, Git clean. Exhaustive goal ACTIVE; full native ruler/slot geometry ownership remains incomplete. Verify shared layout is seeded once in the source cursor-shell owner and the subclass duplicate is removed; existing optional explicit-layout constructor contract and all old fixture expectations preserved.

## Verification

Pending actual implementation, one upstream-absent full runtime and exact source-bound verification. No broad core/UI parity claim.

## Rollback Plan

Revert the task's intentional three production files, constructor/import-only fixture migrations, fresh ownership test and metadata note together. Preserve parent historical evidence and unrelated commits/stash; do not use destructive history operations.

## Findings

Deferred on the explicit user priority for bullet overlap. Original ownership implementation (47 tracked paths and one fresh test) is preserved byte-for-byte in ignored local cache apps/office/node_modules/.cache/parity-coverage/59XVYZ-deferred; patch SHA256 5844aef23d272577d1331863eebc8601969237f317f7843fc1b61dab131400fc, base 705781f0a1b47dddcafde0ae497e1e8065f922df. Source working tree restored only for this approved scope, fresh file preserved in the same cache. No implementation discarded or committed, no runtime tests executed. Initial static format/lint/dependencies/docs passed; type failed from fresh InitNew fixture signature and file-size failed at wrtsh1.ts1006 lines. Approved correction remains pending: actual InitNew return and shared base cursor layout ownership. Resume after the separate priority bullet task, reconcile metadata append notes with its final base, and retain the one-full-upstream-absent-run contract.
