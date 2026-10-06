---
id: "202610060033-QK6R6Y"
title: "Restore native numbering indent mechanics behind label ruler gestures"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T00:33:48.369Z"
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
    body: "Start: source-owned numbering indent and first-item mechanics under standing approved convergence goal; bounded native history, no UI workaround."
events:
  -
    type: "status"
    at: "2026-10-06T00:33:49.582Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: source-owned numbering indent and first-item mechanics under standing approved convergence goal; bounded native history, no UI workaround."
doc_version: 3
doc_updated_at: "2026-10-06T00:52:48.497Z"
doc_updated_by: "CODER"
description: "Iteration171: source-owned numbering indent and first-item policy with existing native rule/history owners, prerequisite to direct label-ruler UI integration; conscious IO deviations preserved."
sections:
  Summary: "Restore native numbering geometry and first-item ownership as the core prerequisite for document-label ruler gestures."
  Scope: |-
    apps/office/src/sw/source/core/doc/number.ts
    apps/office/src/sw/source/core/edit/ednumber.ts
    apps/office/src/sw/source/core/undo/unnum.ts
    apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/core/doc/native-numbering-indent.test.ts
    apps/office/src/sw/source/core/edit/native-numbering-indent.test.ts
  Plan: "Iteration171 under standing approved native UI/core convergence goal, one atomic CODER leaf direct main. Restore source-owned numbering indent mechanics required by native label ruler gestures, not a text-caret or React formatting substitute. Port SwNumRule::ChangeIndent, SetIndentOfFirstListLevelAndChangeOthers and SetIndent exactly for represented numeric/font geometry. Preserve native SetIndent copy-without-Set behavior: it invalidates but does not commit level fields. ChangeIndent processes all10effective formats; legacy clamps negative before native signed narrowing; alignment shifts active LISTTAB and indent while preserving inactive groups. Port native SwNumberTreeNode::IsFirst self/child policy, including phantom ancestry/leading real-descendant rejection and orphan true, to select first-item branch from actual current cursor independently of explicit target position. Restore SwEditShell::SetIndent with actual target rule/copy, current-cursor first/multiselection gate, native DontSetItem document rule update and explicit empty/no-rule handling. Restore SwUndoInsNum rule-format constructor family within existing history owner, preserving all old paragraph-item behavior; replay existing document DontSetItem primitive, retain native rule identity/allclients/listIDs/paragraph attrs/cursor and actual history. No new adapter/model/DTO/TextRuns manager or UI workaround. Four existing core production files,2metadata,2new real-value/tree/shell/history/ODT/Worker tests8paths. All441 prior tests byte-identical; all258runtime states/defaults/classes/IOexceptions/old evidence preserved. This is required native core foundation; actual document-label StartDocDrag/ruler binding/UI remains next explicit obligation, no silent implemented UI promotion. Six statics then ONE full upstream-absent profile build/app/inventory/scripts/existing149Chromium; afterward only original failed/new cases/failed gates/changed-file checks, no passing replay or rebuild without production change. Actual100%L/S/F/B maps/rawresults/local initial source only ignored appcache; AP only bounded English prose/counts/hashes/outcomes, never upstream sources/helpers/Python/probes/rawdiagnostics. Five restored source audits/scope/sourceidentity/prior-test/metadata/AP/doctor/routing/diff checks, same-agent exact-SHA EVALUATOR, canonical meaningful verify/finish and whole parent Findings append. No network/outside/global/subagents; conscious save/open/recovery deviations preserved. Full native framework/layout/merged/redline/char-format/SetNumRule history/ruler/label/core/UI/list/table remains unverified goalACTIVE."
  Verify Steps: |-
    1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Failed gates only recovered; after initial profile changed-file checks only.
    2. ONE full upstream-absent build via npm run test:static; app npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; inventory npm run test:inventory:coverage -- --coverage.reportOnFailure; scripts npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; Chromium npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo rename vendor/.offline-SUFFIX and finally restore. Tests never read/invoke/compile upstream. Persist exact failures/errors/counts/hashes before assertions. Afterward only original failed/genuinely new cases; skipped=skipped, no full/passing replay. Rebuild only after actual production changes. Actual100%L/S/F/B by exact actual source/map identity or unchanged contiguous source-location transfer plus actual changed counters; raw maps/results/source snapshots only ignored appcache.
    3. New source-owned tests verify all10modern and legacy formats, positive/negative/clamped/zero/native narrowed values, active LISTTAB versus SPACE/NOTHING, first-level difference, copy ownership/client/font/glyph/ListFormat/inactivegeometry and exact native non-writing SetIndent invalidation. Actual tree self/child first policy including phantom-only and real-descendant branches. Actual editing shell target-position versus cursor first gate, multiselection/no-rule/nontext/negative-level behavior; native DontSetItem leaves list IDs/counted/start/attrs untouched. Existing rule-format history constructor captures independent old/new rules, actual UndoRedo preserves cursor/native rule/list/client ownership and old paragraph-item path. Genuine ODT/Worker copy checks preserve changed represented geometry.
    4. Preserve441 prior tests byte-identical and258semantic state/default/class/IOexception/evidence prefixes; exact8semantic paths and native source hashes. No full UI/label/ruler/framework promotion. AP ignored-inclusive source/helper hygiene, doctor/routing/diffcheck.
    5. Vendor restored before five source-dependent audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Same-agent EVALUATOR exact semantic SHA, canonical verify/meaningful finish and whole parent Findings append. Broad parity remains unverified ACTIVE.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf's intentional semantic commit; retain task traceability and conscious save/open/recovery deviations."
  Findings: |-
    Iteration171 verified bounded native core correction at base 788ab057438b8808d3e1db6629a31af7294f0804. Restored SwNumRule ChangeIndent, SetIndentOfFirstListLevelAndChangeOthers and SetIndent with native signed widths, active-mode fields, all10 effective levels and legacy clamp. Pinned level SetIndent mutates only a local copy without Set; this behavior deliberately retained, not guessed into a new rule write. Restored actual SwNumberTreeNode IsFirst self/child policy, phantom ancestry and leading-phantom real-descendant rule. SwEditShell SetIndent uses explicit target rule but actual current-cursor first/multiselection policy; existing document DontSetItem updates formats without paragraph/list-ID reconstruction. Existing SwUndoInsNum owns independently copied old/new rules and represented UndoRedo, preserving old paragraph-item history. No extra adapter/model/DTO/TextRuns manager or UI workaround. Actual document-label StartDocDrag/ruler/UI integration remains next obligation. Existing DontSetItem history replay is bounded represented-value support, not full ChgNumRuleFormats/char-format/history equivalence.
    8 semantic paths,4 existing production owners,2 metadata,2 new tests12 cases. All441 prior tests byte-identical,258 runtime records/states/defaults/classifications/IO exceptions and old evidence prefixes retained. New tests exercise native modes/active LISTTAB/inactive raw fields/copy/font/client/glyph/narrowing/zero/clamp/first-tree policy, actual cursor versus explicit target, multiselection/no-rule/nontext/negative-level branches, real history ownership, ODT/Worker values. No new full-module promotion.
    Six statics passed after only failed gates: lint unified-signatures native overload handled with targeted comment, typecheck native test fixture API corrections, docs two callback descriptions. ONE full upstream-absent profile: build pass12615 app pass2 new fixture failures of12617,109 inventory5 scripts149 Chromium pass0flaky. Initial failed cases used mode-dependent getters for inactive raw fields and inserted an empty phantom before AddChild that natively prunes it; corrected tests to raw GetPositionProperties and create phantom after real AddChild. Only those2 original failed cases repeated absent:2pass4skipped, no passing replay. No production change or rebuild after initial profile. Actual final100%L/S/F/B app13007/14261/3439/10582;inventory1464/1523/384/1080. Only actual SwNumberTree counters merged after exact source and statement/function/branch-map identity; all other initial coverage retained. Provisional initial99.99% statement/branch closed by real later-child branch executed in the original failed fixture. No invented counts/location transfer.
    Five restored source audits passed; semantic violations0. Scope audit confirms exact8 paths, prior test and metadata identity; ignored-inclusive AP4481files0 forbidden,doctor0errors2 known warnings,routing/diff passed. AP only bounded English prose/counts/hashes/outcomes, no sources/helpers/Python/probes/rawdiagnostics; raw maps/results/local initial sources only ignored appcache. Bounded read-only no-match/missing-path failures recomputed route before further mutation. Same current agent EVALUATOR exact semantic SHA, no independent review claim. No network/outside/global/subagents. Full native label/ruler/UI/framework/merged/redline/char-format/history/core/UI/list/table parity unverified; conscious save/open/recovery deviations unchanged,parent DOING,goal ACTIVE.
id_source: "generated"
---
## Summary

Restore native numbering geometry and first-item ownership as the core prerequisite for document-label ruler gestures.

## Scope

apps/office/src/sw/source/core/doc/number.ts
apps/office/src/sw/source/core/edit/ednumber.ts
apps/office/src/sw/source/core/undo/unnum.ts
apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/core/doc/native-numbering-indent.test.ts
apps/office/src/sw/source/core/edit/native-numbering-indent.test.ts

## Plan

Iteration171 under standing approved native UI/core convergence goal, one atomic CODER leaf direct main. Restore source-owned numbering indent mechanics required by native label ruler gestures, not a text-caret or React formatting substitute. Port SwNumRule::ChangeIndent, SetIndentOfFirstListLevelAndChangeOthers and SetIndent exactly for represented numeric/font geometry. Preserve native SetIndent copy-without-Set behavior: it invalidates but does not commit level fields. ChangeIndent processes all10effective formats; legacy clamps negative before native signed narrowing; alignment shifts active LISTTAB and indent while preserving inactive groups. Port native SwNumberTreeNode::IsFirst self/child policy, including phantom ancestry/leading real-descendant rejection and orphan true, to select first-item branch from actual current cursor independently of explicit target position. Restore SwEditShell::SetIndent with actual target rule/copy, current-cursor first/multiselection gate, native DontSetItem document rule update and explicit empty/no-rule handling. Restore SwUndoInsNum rule-format constructor family within existing history owner, preserving all old paragraph-item behavior; replay existing document DontSetItem primitive, retain native rule identity/allclients/listIDs/paragraph attrs/cursor and actual history. No new adapter/model/DTO/TextRuns manager or UI workaround. Four existing core production files,2metadata,2new real-value/tree/shell/history/ODT/Worker tests8paths. All441 prior tests byte-identical; all258runtime states/defaults/classes/IOexceptions/old evidence preserved. This is required native core foundation; actual document-label StartDocDrag/ruler binding/UI remains next explicit obligation, no silent implemented UI promotion. Six statics then ONE full upstream-absent profile build/app/inventory/scripts/existing149Chromium; afterward only original failed/new cases/failed gates/changed-file checks, no passing replay or rebuild without production change. Actual100%L/S/F/B maps/rawresults/local initial source only ignored appcache; AP only bounded English prose/counts/hashes/outcomes, never upstream sources/helpers/Python/probes/rawdiagnostics. Five restored source audits/scope/sourceidentity/prior-test/metadata/AP/doctor/routing/diff checks, same-agent exact-SHA EVALUATOR, canonical meaningful verify/finish and whole parent Findings append. No network/outside/global/subagents; conscious save/open/recovery deviations preserved. Full native framework/layout/merged/redline/char-format/SetNumRule history/ruler/label/core/UI/list/table remains unverified goalACTIVE.

## Verify Steps

1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Failed gates only recovered; after initial profile changed-file checks only.
2. ONE full upstream-absent build via npm run test:static; app npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; inventory npm run test:inventory:coverage -- --coverage.reportOnFailure; scripts npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; Chromium npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo rename vendor/.offline-SUFFIX and finally restore. Tests never read/invoke/compile upstream. Persist exact failures/errors/counts/hashes before assertions. Afterward only original failed/genuinely new cases; skipped=skipped, no full/passing replay. Rebuild only after actual production changes. Actual100%L/S/F/B by exact actual source/map identity or unchanged contiguous source-location transfer plus actual changed counters; raw maps/results/source snapshots only ignored appcache.
3. New source-owned tests verify all10modern and legacy formats, positive/negative/clamped/zero/native narrowed values, active LISTTAB versus SPACE/NOTHING, first-level difference, copy ownership/client/font/glyph/ListFormat/inactivegeometry and exact native non-writing SetIndent invalidation. Actual tree self/child first policy including phantom-only and real-descendant branches. Actual editing shell target-position versus cursor first gate, multiselection/no-rule/nontext/negative-level behavior; native DontSetItem leaves list IDs/counted/start/attrs untouched. Existing rule-format history constructor captures independent old/new rules, actual UndoRedo preserves cursor/native rule/list/client ownership and old paragraph-item path. Genuine ODT/Worker copy checks preserve changed represented geometry.
4. Preserve441 prior tests byte-identical and258semantic state/default/class/IOexception/evidence prefixes; exact8semantic paths and native source hashes. No full UI/label/ruler/framework promotion. AP ignored-inclusive source/helper hygiene, doctor/routing/diffcheck.
5. Vendor restored before five source-dependent audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Same-agent EVALUATOR exact semantic SHA, canonical verify/meaningful finish and whole parent Findings append. Broad parity remains unverified ACTIVE.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf's intentional semantic commit; retain task traceability and conscious save/open/recovery deviations.

## Findings

Iteration171 verified bounded native core correction at base 788ab057438b8808d3e1db6629a31af7294f0804. Restored SwNumRule ChangeIndent, SetIndentOfFirstListLevelAndChangeOthers and SetIndent with native signed widths, active-mode fields, all10 effective levels and legacy clamp. Pinned level SetIndent mutates only a local copy without Set; this behavior deliberately retained, not guessed into a new rule write. Restored actual SwNumberTreeNode IsFirst self/child policy, phantom ancestry and leading-phantom real-descendant rule. SwEditShell SetIndent uses explicit target rule but actual current-cursor first/multiselection policy; existing document DontSetItem updates formats without paragraph/list-ID reconstruction. Existing SwUndoInsNum owns independently copied old/new rules and represented UndoRedo, preserving old paragraph-item history. No extra adapter/model/DTO/TextRuns manager or UI workaround. Actual document-label StartDocDrag/ruler/UI integration remains next obligation. Existing DontSetItem history replay is bounded represented-value support, not full ChgNumRuleFormats/char-format/history equivalence.
8 semantic paths,4 existing production owners,2 metadata,2 new tests12 cases. All441 prior tests byte-identical,258 runtime records/states/defaults/classifications/IO exceptions and old evidence prefixes retained. New tests exercise native modes/active LISTTAB/inactive raw fields/copy/font/client/glyph/narrowing/zero/clamp/first-tree policy, actual cursor versus explicit target, multiselection/no-rule/nontext/negative-level branches, real history ownership, ODT/Worker values. No new full-module promotion.
Six statics passed after only failed gates: lint unified-signatures native overload handled with targeted comment, typecheck native test fixture API corrections, docs two callback descriptions. ONE full upstream-absent profile: build pass12615 app pass2 new fixture failures of12617,109 inventory5 scripts149 Chromium pass0flaky. Initial failed cases used mode-dependent getters for inactive raw fields and inserted an empty phantom before AddChild that natively prunes it; corrected tests to raw GetPositionProperties and create phantom after real AddChild. Only those2 original failed cases repeated absent:2pass4skipped, no passing replay. No production change or rebuild after initial profile. Actual final100%L/S/F/B app13007/14261/3439/10582;inventory1464/1523/384/1080. Only actual SwNumberTree counters merged after exact source and statement/function/branch-map identity; all other initial coverage retained. Provisional initial99.99% statement/branch closed by real later-child branch executed in the original failed fixture. No invented counts/location transfer.
Five restored source audits passed; semantic violations0. Scope audit confirms exact8 paths, prior test and metadata identity; ignored-inclusive AP4481files0 forbidden,doctor0errors2 known warnings,routing/diff passed. AP only bounded English prose/counts/hashes/outcomes, no sources/helpers/Python/probes/rawdiagnostics; raw maps/results/local initial sources only ignored appcache. Bounded read-only no-match/missing-path failures recomputed route before further mutation. Same current agent EVALUATOR exact semantic SHA, no independent review claim. No network/outside/global/subagents. Full native label/ruler/UI/framework/merged/redline/char-format/history/core/UI/list/table parity unverified; conscious save/open/recovery deviations unchanged,parent DOING,goal ACTIVE.
