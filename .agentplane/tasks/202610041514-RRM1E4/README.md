---
id: "202610041514-RRM1E4"
title: "Restore native paired paragraph-style reset history and redo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on:
  - "202610041429-MGCTBJ"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T15:28:04.995Z"
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
    body: "Start: restore native paired style/reset history and non-exact redo under the standing iterative goal, preserving registered deviations and vendor-absent single-pass checks."
  -
    author: "CODER"
    body: "Start: recover failed absent app gate with bounded native redo endpoint expectations and valid independent hint fixture; amended15paths authorized by standing goal, production unchanged."
events:
  -
    type: "status"
    at: "2026-10-04T15:15:28.004Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native paired style/reset history and non-exact redo under the standing iterative goal, preserving registered deviations and vendor-absent single-pass checks."
  -
    type: "status"
    at: "2026-10-04T15:28:05.441Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: recover failed absent app gate with bounded native redo endpoint expectations and valid independent hint fixture; amended15paths authorized by standing goal, production unchanged."
doc_version: 3
doc_updated_at: "2026-10-04T15:28:48.408Z"
doc_updated_by: "CODER"
description: "Iteration108: replace fused paragraph-style/reset history with native ordered SwUndoFormatColl plus SwUndoResetAttr in one Sfx list action. Separate initial exact full-node cleanup from default non-exact reset redo, including partial AUTOFMT/internet removal and expanded redo selection; native sorted style undo. Current registered single-PaM profile only. Preserve registered save/open/recovery deviations and all inventory status/default/exception fields. Strict15semanticpaths/five bounded prior test files;318prior files/313unchanged. All product tests once without upstream, failed-gate recovery only; no native execution/compilation/copies/AP helpers. Parent remains active."
sections:
  Summary: "Iteration108: replace fused paragraph-style/reset history with native ordered SwUndoFormatColl plus SwUndoResetAttr in one Sfx list action. Separate initial exact full-node cleanup from default non-exact reset redo, including partial AUTOFMT/internet removal and expanded redo selection; native sorted style undo. Current registered single-PaM profile only. Preserve registered save/open/recovery deviations and all inventory status/default/exception fields. Strict15semanticpaths/five bounded prior test files;318prior files/313unchanged. All product tests once without upstream, failed-gate recovery only; no native execution/compilation/copies/AP helpers. Parent remains active."
  Scope: |-
    Only these15semantic paths:
    - apps/office/src/sw/source/core/edit/edfcol.ts
    - apps/office/src/sw/source/core/undo/unfmco.ts
    - apps/office/src/sw/source/core/undo/unattr.ts
    - apps/office/src/sw/source/core/txtnode/txtedt.ts
    - apps/office/src/sw/source/uibase/app/docsh.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/core/edit/edfcol.test.ts
    - apps/office/src/sw/source/core/edit/edfcol-reset.test.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - apps/office/e2e/writer-style-reset.spec.ts
    - apps/office/src/sw/source/core/edit/edfcol-history.test.ts
    - apps/office/e2e/writer-style-redo.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/source/uibase/app/docst.test.ts

    Plus canonical task metadata and bounded parent progress. No network/global/outside-repo access, native execution, pinned source copies, AP source/helper/probe/raw diagnostics, policy/default/status/exception promotions.
  Plan: |-
    1. CODER: restore source-owned two-action paragraph style history, pure collection redo and separate reset owner. Execute initial exact cleanup directly inside existing shell/model notification transactions; retain one top-level list action, native reverse undo/forward redo and range cursor contracts.
    2. Add actual native node/range/ODT/history acceptance and desktop/mobile DOM/export scenarios; bound five prior test updates to native pair/payload/redo-hint/cursor expectations, all unrelated assertions retained and313prior files byte-identical.
    3. Static gates first; single vendor-absent app/inventory/script/Chromium sequence with finally restoration. Readonly source hashes and four source-only checks/parity/strictscope/AP forbidden scans after restoration. No passing suite repeats.
    4. Commit implementation, same-actor readonly exact-sha evaluator review, recorded committed verification and clean closure, parent remainsDOING.
  Verify Steps: |-
    1. Ordinary initial application changes all inclusive selected text nodes, preserves partial AUTOFMT/internet and removes only exact whole AUTOFMT; creates one SfxListUndoAction with native ordered SwUndoFormatColl and SwUndoResetAttr, independent item/hint ownership. Standalone collection redo leaves hints untouched; missing captured-name no-op does not suppress separate reset redo.
    2. Undo reverses native pair and restores exact original items/hints/list suppression and ordered original selection or collapsed caret; redo forwards pair and runs non-exact RstTextAttrs across expanded full-node range, clearing supported partial/whole autoformat and internet hints, setting point at end/mark at start and retaining unselected neighbors. Repeat, empty/end-zero, forward/reverse, actual owned node guards, list/payload and three-cycle history. Actual browser desktop/mobile UI, selection, focus, continued typing, native style status and real ODT export assertions.
    3. Format/lint/type/dependency/JSDoc/file-size/routing/doctor, absent static build once, app --coverage.reportOnFailure/inventory/scripts/fullChromium once without pinned upstream (failed-gate recovery only); app/inventory100 all four metrics. Finallyrestore; four source-only checks/parity228zero; strict15semanticpaths/fivebounded prior updates/318prior313unchanged/228oldrows six bounded description/evidence appends only; native hashes and ignored-inclusive APforbidden0. Exact evaluated_sha quality pass, committed verify and clean closure.
  Verification: "Pending approved implementation and one upstream-absent verification sequence. No product tests run yet."
  Rollback Plan: "Revert only this task semantic commit through a new executable task if a demonstrated regression requires rollback. Preserve source pin, registered deviations, current histories and immutable prior task records; no history rewrite."
  Findings: |-
    Readonly source comparison: edfcol native StartUndo groups SwDoc::SetTextFormatColl followed by RstTextAttrs(...exact=true) on full-node range. docfmt appends distinct SwUndoFormatColl and SwUndoResetAttr. unfmco DoSetFormatColl redoes only native collection/reset flags; unattr RES_CHRFMT redo calls RstTextAttrs(rPam) with doc.hxx default bExactRange=false. txtedt default nWhich0/pSet-null processing removes supported ranged AUTOFMT and internet hints over full paragraph, unlike initial exact cleanup. SwUndRng stores sorted endpoints and restores point=end/mark=start on a noncollapsed range. Current local fused action incorrectly reuses initial exact cleanup and original directed cursor on redo. This task resolves this existing behavior and architecture before a later separate modifier path; actual native toolbar does not supply KeyModifier, so no invented Ctrl toolbar operation.

    Pre-product static formatting gate exit1/outputsha199401e5da7cca140f2fcb0fbb9deb0934e321d7ad78ab69456307ded731593a: new browser test requires an additional formatter pass. Lint/type/dependency/JSDoc/file-size/routing pass. Bounded in-scope recovery; no product tests yet. No raw diagnostics/helpers saved in AP.

    First absent app gate1480passed/2failed; coverage100 all four metrics. One native-contradicted prior document-shell expectation still retains4/1 after redo instead of expanded5/0; one new fixture overlaps whole/middle same-type AUTOFMT contrary to the registered graph. Reapprove one additional prior test file for bounded redo endpoints only;15paths/five prior files/313others byte-identical. Fix new fixture with independent whole AUTO and internet types. Production unchanged after first product run; repeat failed app only, then first remaining inventory/scripts/Chromium. Failure record outputsha87d7e79e678c1dde2c1c723fb1c37c80b17ea2fc9379831dbaaf48bb1071689f; vendor restored.

    Artifact-persistence attempt exit5 reported dirty working tree while final static records were still being produced. Recomputed route; all writers now terminal/pass. No semantic commit or test repetition involved; retry persistence only after all record writers complete.
id_source: "generated"
---
## Summary

Iteration108: replace fused paragraph-style/reset history with native ordered SwUndoFormatColl plus SwUndoResetAttr in one Sfx list action. Separate initial exact full-node cleanup from default non-exact reset redo, including partial AUTOFMT/internet removal and expanded redo selection; native sorted style undo. Current registered single-PaM profile only. Preserve registered save/open/recovery deviations and all inventory status/default/exception fields. Strict15semanticpaths/five bounded prior test files;318prior files/313unchanged. All product tests once without upstream, failed-gate recovery only; no native execution/compilation/copies/AP helpers. Parent remains active.

## Scope

Only these15semantic paths:
- apps/office/src/sw/source/core/edit/edfcol.ts
- apps/office/src/sw/source/core/undo/unfmco.ts
- apps/office/src/sw/source/core/undo/unattr.ts
- apps/office/src/sw/source/core/txtnode/txtedt.ts
- apps/office/src/sw/source/uibase/app/docsh.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/core/edit/edfcol.test.ts
- apps/office/src/sw/source/core/edit/edfcol-reset.test.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts
- apps/office/e2e/writer-style-reset.spec.ts
- apps/office/src/sw/source/core/edit/edfcol-history.test.ts
- apps/office/e2e/writer-style-redo.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/source/uibase/app/docst.test.ts

Plus canonical task metadata and bounded parent progress. No network/global/outside-repo access, native execution, pinned source copies, AP source/helper/probe/raw diagnostics, policy/default/status/exception promotions.

## Plan

1. CODER: restore source-owned two-action paragraph style history, pure collection redo and separate reset owner. Execute initial exact cleanup directly inside existing shell/model notification transactions; retain one top-level list action, native reverse undo/forward redo and range cursor contracts.
2. Add actual native node/range/ODT/history acceptance and desktop/mobile DOM/export scenarios; bound five prior test updates to native pair/payload/redo-hint/cursor expectations, all unrelated assertions retained and313prior files byte-identical.
3. Static gates first; single vendor-absent app/inventory/script/Chromium sequence with finally restoration. Readonly source hashes and four source-only checks/parity/strictscope/AP forbidden scans after restoration. No passing suite repeats.
4. Commit implementation, same-actor readonly exact-sha evaluator review, recorded committed verification and clean closure, parent remainsDOING.

## Verify Steps

1. Ordinary initial application changes all inclusive selected text nodes, preserves partial AUTOFMT/internet and removes only exact whole AUTOFMT; creates one SfxListUndoAction with native ordered SwUndoFormatColl and SwUndoResetAttr, independent item/hint ownership. Standalone collection redo leaves hints untouched; missing captured-name no-op does not suppress separate reset redo.
2. Undo reverses native pair and restores exact original items/hints/list suppression and ordered original selection or collapsed caret; redo forwards pair and runs non-exact RstTextAttrs across expanded full-node range, clearing supported partial/whole autoformat and internet hints, setting point at end/mark at start and retaining unselected neighbors. Repeat, empty/end-zero, forward/reverse, actual owned node guards, list/payload and three-cycle history. Actual browser desktop/mobile UI, selection, focus, continued typing, native style status and real ODT export assertions.
3. Format/lint/type/dependency/JSDoc/file-size/routing/doctor, absent static build once, app --coverage.reportOnFailure/inventory/scripts/fullChromium once without pinned upstream (failed-gate recovery only); app/inventory100 all four metrics. Finallyrestore; four source-only checks/parity228zero; strict15semanticpaths/fivebounded prior updates/318prior313unchanged/228oldrows six bounded description/evidence appends only; native hashes and ignored-inclusive APforbidden0. Exact evaluated_sha quality pass, committed verify and clean closure.

## Verification

Pending approved implementation and one upstream-absent verification sequence. No product tests run yet.

## Rollback Plan

Revert only this task semantic commit through a new executable task if a demonstrated regression requires rollback. Preserve source pin, registered deviations, current histories and immutable prior task records; no history rewrite.

## Findings

Readonly source comparison: edfcol native StartUndo groups SwDoc::SetTextFormatColl followed by RstTextAttrs(...exact=true) on full-node range. docfmt appends distinct SwUndoFormatColl and SwUndoResetAttr. unfmco DoSetFormatColl redoes only native collection/reset flags; unattr RES_CHRFMT redo calls RstTextAttrs(rPam) with doc.hxx default bExactRange=false. txtedt default nWhich0/pSet-null processing removes supported ranged AUTOFMT and internet hints over full paragraph, unlike initial exact cleanup. SwUndRng stores sorted endpoints and restores point=end/mark=start on a noncollapsed range. Current local fused action incorrectly reuses initial exact cleanup and original directed cursor on redo. This task resolves this existing behavior and architecture before a later separate modifier path; actual native toolbar does not supply KeyModifier, so no invented Ctrl toolbar operation.

Pre-product static formatting gate exit1/outputsha199401e5da7cca140f2fcb0fbb9deb0934e321d7ad78ab69456307ded731593a: new browser test requires an additional formatter pass. Lint/type/dependency/JSDoc/file-size/routing pass. Bounded in-scope recovery; no product tests yet. No raw diagnostics/helpers saved in AP.

First absent app gate1480passed/2failed; coverage100 all four metrics. One native-contradicted prior document-shell expectation still retains4/1 after redo instead of expanded5/0; one new fixture overlaps whole/middle same-type AUTOFMT contrary to the registered graph. Reapprove one additional prior test file for bounded redo endpoints only;15paths/five prior files/313others byte-identical. Fix new fixture with independent whole AUTO and internet types. Production unchanged after first product run; repeat failed app only, then first remaining inventory/scripts/Chromium. Failure record outputsha87d7e79e678c1dde2c1c723fb1c37c80b17ea2fc9379831dbaaf48bb1071689f; vendor restored.

Artifact-persistence attempt exit5 reported dirty working tree while final static records were still being produced. Recomputed route; all writers now terminal/pass. No semantic commit or test repetition involved; retry persistence only after all record writers complete.
