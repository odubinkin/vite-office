---
id: "202610062133-B4YMFA"
title: "Move native row split selection into document ownership"
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
  updated_at: "2026-10-06T21:33:47.786Z"
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
    body: "Start: iteration200 native row split document ownership and temporary dialog selection under standing iterative authorization; no upstream/raw sources in AP, one absent test profile."
events:
  -
    type: "status"
    at: "2026-10-06T21:33:53.633Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: iteration200 native row split document ownership and temporary dialog selection under standing iterative authorization; no upstream/raw sources in AP, one absent test profile."
doc_version: 3
doc_updated_at: "2026-10-06T21:33:53.633Z"
doc_updated_by: "CODER"
description: "Iteration200: replace shell whole-table row setter adapter with native SwDoc/ndtbl1 current-or-selected row mutation and source caller temporary whole-table selection using native cursor stack. Preserve original model/history/storage and deliberate exceptions."
sections:
  Summary: "Iteration200 ports native document-owned row split mutation and caller temporary whole-table selection. Standing iterative authorization; previous199 is verified progress. Full parent/goal active."
  Scope: "11approved semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/docnode/native-row-split-owner.test.ts, apps/office/src/sw/source/core/crsr/native-table-cursor-stack.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Six production paths,3new tests,2metadata. All531prior acceptance byte-identical;3new534total.277prior metadata full prefixes/statuses/defaults/classifications/contracts and registered save/open/recovery deviations retained. Parent520287characters SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact. No row-height/borders scope expansion, insertion unchanged."
  Plan: |-
    1.CODER native ndtbl1 shared original row collection follows actual SwCursor point or SwTableCursor selected boxes. Document setter owns admission, original attributes, SwUndoAttrTable and notification; shell brackets and forwards, no whole-table SetRowAttr boolean adapter for split.
    2.CODER add represented SwCursorShell Push/Pop DeleteCurrent/DeleteStack and ClearMark using actual registered native cursor stack, preserve original PaM identity and selected endpoints, release stack on Close. Table properties caller explicitly Push, select whole table only if unselected, apply split, ClearMark when temporary, finally Pop. Existing selected scope and final history/cursor/list/input retained; no DTO.
    3.CODER add3independent tests covering direct doc/current row, marked ordinary ranges ignore mark/ring by source default, selected row owners/duplicates, mixed/default/empty/foreign/detached/outside refusals, repeated same-value native history, notifications; native nested stack modes/clear/restoration/disposal and exception restoration; whole-versus-selected dialog/direct setter one grouped3UndoRedo/ODT/pending attributes/original graph/cursor/list/continued input. All531old tests byte-identical, no weakened assertions.
    4.CODER six static gates once; unchanged JSDoc and actual physical lines<1000 on9code/test paths. ONE upstream-absent build/app/inventory/scripts/Chromium profile vendor restored finally. Await source/scope/AP audits outside profiles. Actual100 coverage only genuine full-identical source/maps or complete contiguous identical source/full fn/branch/location counters, verified unchanged prior whole maps permitted. No historical passing/full replay; only originalfailed/genuinelynew closures. Raw only ignored app cache, AP prose/counts/hashes only.
    5.Same current-agent EVALUATOR exact implementationSHA explicitly not independent. Five source gates/scope/doctor/routing/diff/artifact0forbidden; final prose before canonical verify; finish actualSHA and entire parent append, clean tracked state. Full nested/merged/fly/columns/protection/row-content splitting/widget/SfxItemSet/full parity unverified, no blanket promotion. No network/global/outside/subagents. Stop material drift.
  Verify Steps: |-
    Six initial static gates format/lint/typecheck/dependencies/docs/file-size ONCE; unchanged JSDoc/physical lines<1000 on9code/test paths; only failed or genuinely changed closure.
    ONE full upstream-absent build/app/inventory/scripts/Chromium profile restored finally. All tests independent of upstream; no source/scope/AP audits live and all awaited before profiles. Actual100 app/inventory genuine counters under full identical maps/source or complete contiguous source/full function/branch/location proof; skips stay skips, no passing/full replay, only originalfailed/genuinelynew closures.
    3new acceptance contracts: source current-row direct setter versus marked range/ring, original selected rows, default/mixed/no item and detached/foreign/outside; doc history and notification owner with no shell ApplyAction; same-value source history; stack both modes/nesting/ClearMark/Close/disposal and exception restoration; whole versus selected Properties publication, original graph/list/pending/cursor, grouped3UndoRedo/ODT/continued input.531prior tests all byte-identical;3new534.
    Five source gates generation --check/source-tree/provenance/invariants/parity after restoration;11approvedpaths,277prior metadata full prefixes/contracts/defaults/status/classification/registered exceptions unchanged. Parent520287/SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact, pinned source hashes and original stash retained.
    Doctor/routing/diff PASS, current artifact+generatedquality0forbidden. ExactSHA same-agent EVALUATOR explicitly not independent. Final prose before canonverify, finish actualimplementationSHA, clean final tracked/untracked. Parent/goal active; full row-content splitting/nested/merged/protection/fly/columns/SfxItemSet/widgets/full parity unverified.
  Verification: "Pending execution and evidence; full goal active."
  Rollback Plan: "Revert eventual implementation only in a new approved task. Preserve original stashc85f4a0e453dfd06d6e199554784f2c286737472; no destructive reset or stash pop/drop. Vendor restored finally; raw only ignored app cache, no upstream/helpers/Python/raw evidence in AP."
  Findings: "Clean main9c742b2a26110e2c6c3370d7a1e2134c4e5f61d1, only active parent; previous199complete progress. Pinned ndtbl1.cxx SetRowSplit collects selected/current original boxes with default bAllCursor=false, publishes table attribute undo and row flags. Native fetab forwards document setter inside action; existing SetRowSplit uses whole=true SetRowAttr, real divergence. tabsh source Push and temporary select-all when unselected, ClearMark and Pop DeleteCurrent. crsrsh Push copies actual displayed point/mark; Pop modes restore/delete registered stack, ClearMark releases actual table ring. Existing getter/page contracts stay, new row setter selection owned by document. No source stored in AP, no network/outside/global access."
id_source: "generated"
---
## Summary

Iteration200 ports native document-owned row split mutation and caller temporary whole-table selection. Standing iterative authorization; previous199 is verified progress. Full parent/goal active.

## Scope

11approved semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/docnode/native-row-split-owner.test.ts, apps/office/src/sw/source/core/crsr/native-table-cursor-stack.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Six production paths,3new tests,2metadata. All531prior acceptance byte-identical;3new534total.277prior metadata full prefixes/statuses/defaults/classifications/contracts and registered save/open/recovery deviations retained. Parent520287characters SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact. No row-height/borders scope expansion, insertion unchanged.

## Plan

1.CODER native ndtbl1 shared original row collection follows actual SwCursor point or SwTableCursor selected boxes. Document setter owns admission, original attributes, SwUndoAttrTable and notification; shell brackets and forwards, no whole-table SetRowAttr boolean adapter for split.
2.CODER add represented SwCursorShell Push/Pop DeleteCurrent/DeleteStack and ClearMark using actual registered native cursor stack, preserve original PaM identity and selected endpoints, release stack on Close. Table properties caller explicitly Push, select whole table only if unselected, apply split, ClearMark when temporary, finally Pop. Existing selected scope and final history/cursor/list/input retained; no DTO.
3.CODER add3independent tests covering direct doc/current row, marked ordinary ranges ignore mark/ring by source default, selected row owners/duplicates, mixed/default/empty/foreign/detached/outside refusals, repeated same-value native history, notifications; native nested stack modes/clear/restoration/disposal and exception restoration; whole-versus-selected dialog/direct setter one grouped3UndoRedo/ODT/pending attributes/original graph/cursor/list/continued input. All531old tests byte-identical, no weakened assertions.
4.CODER six static gates once; unchanged JSDoc and actual physical lines<1000 on9code/test paths. ONE upstream-absent build/app/inventory/scripts/Chromium profile vendor restored finally. Await source/scope/AP audits outside profiles. Actual100 coverage only genuine full-identical source/maps or complete contiguous identical source/full fn/branch/location counters, verified unchanged prior whole maps permitted. No historical passing/full replay; only originalfailed/genuinelynew closures. Raw only ignored app cache, AP prose/counts/hashes only.
5.Same current-agent EVALUATOR exact implementationSHA explicitly not independent. Five source gates/scope/doctor/routing/diff/artifact0forbidden; final prose before canonical verify; finish actualSHA and entire parent append, clean tracked state. Full nested/merged/fly/columns/protection/row-content splitting/widget/SfxItemSet/full parity unverified, no blanket promotion. No network/global/outside/subagents. Stop material drift.

## Verify Steps

Six initial static gates format/lint/typecheck/dependencies/docs/file-size ONCE; unchanged JSDoc/physical lines<1000 on9code/test paths; only failed or genuinely changed closure.
ONE full upstream-absent build/app/inventory/scripts/Chromium profile restored finally. All tests independent of upstream; no source/scope/AP audits live and all awaited before profiles. Actual100 app/inventory genuine counters under full identical maps/source or complete contiguous source/full function/branch/location proof; skips stay skips, no passing/full replay, only originalfailed/genuinelynew closures.
3new acceptance contracts: source current-row direct setter versus marked range/ring, original selected rows, default/mixed/no item and detached/foreign/outside; doc history and notification owner with no shell ApplyAction; same-value source history; stack both modes/nesting/ClearMark/Close/disposal and exception restoration; whole versus selected Properties publication, original graph/list/pending/cursor, grouped3UndoRedo/ODT/continued input.531prior tests all byte-identical;3new534.
Five source gates generation --check/source-tree/provenance/invariants/parity after restoration;11approvedpaths,277prior metadata full prefixes/contracts/defaults/status/classification/registered exceptions unchanged. Parent520287/SHAa55973af71c703df8784f9b79d96626a36ee825ef2f8b589519b63f081deeea2 intact, pinned source hashes and original stash retained.
Doctor/routing/diff PASS, current artifact+generatedquality0forbidden. ExactSHA same-agent EVALUATOR explicitly not independent. Final prose before canonverify, finish actualimplementationSHA, clean final tracked/untracked. Parent/goal active; full row-content splitting/nested/merged/protection/fly/columns/SfxItemSet/widgets/full parity unverified.

## Verification

Pending execution and evidence; full goal active.

## Rollback Plan

Revert eventual implementation only in a new approved task. Preserve original stashc85f4a0e453dfd06d6e199554784f2c286737472; no destructive reset or stash pop/drop. Vendor restored finally; raw only ignored app cache, no upstream/helpers/Python/raw evidence in AP.

## Findings

Clean main9c742b2a26110e2c6c3370d7a1e2134c4e5f61d1, only active parent; previous199complete progress. Pinned ndtbl1.cxx SetRowSplit collects selected/current original boxes with default bAllCursor=false, publishes table attribute undo and row flags. Native fetab forwards document setter inside action; existing SetRowSplit uses whole=true SetRowAttr, real divergence. tabsh source Push and temporary select-all when unselected, ClearMark and Pop DeleteCurrent. crsrsh Push copies actual displayed point/mark; Pop modes restore/delete registered stack, ClearMark releases actual table ring. Existing getter/page contracts stay, new row setter selection owned by document. No source stored in AP, no network/outside/global access.
