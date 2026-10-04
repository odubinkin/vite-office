---
id: "202610040538-PWDK4Q"
title: "Preserve Writer ruler tab item identity"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T05:43:41.368Z"
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
    body: "Start:standing goal authorizes one tab item identity correction;source hashes/results only,owned fixtures and tests with no upstream invocation or helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T05:39:10.710Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:standing goal authorizes one tab item identity correction;source hashes/results only,owned fixtures and tests with no upstream invocation or helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T05:43:40.939Z"
doc_updated_by: "CODER"
description: "Iteration91:stop compact visible-tab ordinal from addressing hidden default tab in the raw SvxTabStopItem;retain model index in immutable browser projection and verify actual Writer/Undo/Chromium without upstream test dependencies."
sections:
  Summary: "Iteration91 preserves native tab item identity through the compact browser ruler projection."
  Scope: "apps/office/src/sw/browser/presentation/writer-view-projection.ts; apps/office/src/sw/browser/presentation/WriterRulers.tsx; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx; apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx; apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx; apps/office/e2e/writer-ruler-tab-identity.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json;core move operation refactor only,no command/resource/policy/save/open/recovery edits."
  Plan: |-
    Standing iterative parity goal authorizes one local correction:read-only pinned Ruler ImplHitTest/SvxRuler UpdateTabs and ApplyTabs confirm default tabs do not admit dragging but the selected tab retains its item index. Reproduce hidden default preceding explicit tab in actual Writer and Chromium. Add immutable browser ruler-tab records pairing position with raw item index;derive explicit CSS positions from those records and use raw item index for shell movement. Do not add parallel-array index hacks,position search,timers or core filtering;SwWrtShell raw index and SvxTabStop metadata/undo contracts stay unchanged. Ruler DTO absence means no explicit marker;old hand-authored ruler fixtures supply the new owned DTO and removed-handle fixture updates it,retaining all assertions. Verify crossing/reordering/collision,default+explicit metadata and hidden defaults,one accepted undo,cancellation/redo and later editing. Preserve old tests and manifest metadata;append evidence/responsibility only to two existing browser rows,220rows unchanged. Full verify/100%four coverage/0semantic;vendor-absent tests/restoration;exact8paths/sourcehash/ignored-inclusive artifact checks;same-actor exact semantic EVALUATOR;close leaf and record parent progress. No helpers/source/native artifacts,upstream test reads/compilation/execution,network/outside-repo or I/O/recovery deviations. Full native ruler/UI/parent remain unverified.

    Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.
  Verify Steps: "1.Read pinned editeng/source/items/paraitem.cxx Insert plus svtools/source/control/ruler.cxx ImplHitTest and svx/source/dialog/svxruler.cxx UpdateTabs/ApplyTabs read-only,hashes/conclusions only. 2.Add owned actual Writer/immutable projection/Undo regression and desktop/mobile Chromium new tab drag;record pre-fix failures;confirm raw item index despite preceding/interleaved defaults,unchanged other stops/all metadata/default distance,reordering/collision,Escape and accepted single undo/redo with new snapshot indices. Existing ruler/paragraph-ruler cases retained. 3.Exact9semantic paths;284prior test/spec files,282byte-identical;only3owned DTO additions in old WriterPageLayout fixtures and1removed-handle DTO update in WriterRulers-tracking,all assertions/other bytes preserved.220prior manifest rows/order/status/default/owner/exception fields unchanged,two append-only browser evidence/responsibility/justification updates;no new rows/status promotion;3pinned hashes unchanged. 4.npm run verify passes1129+new owned tests and109tool tests,61+2browser scenarios,2resource tests,type/lint/static gates;100%statements/branches/functions/lines app/inventory and0semantic violations. Static CLI audits separately read vendor;tests never read/compile/invoke upstream. 5.Rename vendor/libreoffice-reference inside vendor;npm run test;npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm run test:e2e pass;restore in finally. 6.git diff --check,routing,doctor0errors/knownwarnings,ignored-inclusive raw/decoded AP source/helper/Python/frame/diff/archive findings0. 7.Same-actor separate EVALUATOR exact semantic SHA pass,clean final tracked state,leafDONE,parentDOING;full native/goal remain unproven."
  Verification: "Pending declared implementation and checks."
  Rollback Plan: "Revert isolated semantic commit if needed,keep bounded results/hashes and restore temporarily renamed vendor in finally;no history rewrite."
  Findings: |-
    Previous goal turn is verified progress:iteration90 leafDONE semantic2a667d6fc8db with clean main/base11a7405467db. Current projection filters SvxTabAdjust.Default before assigning ruler ordinal;WriterRulers passes this compact ordinal to MoveRulerTabStop while the shell indexes complete item. Pinned Ruler skips default hit targets but preserves nAryPos;SvxRuler ApplyTabs uses that raw item index. Preceding default can therefore be moved instead of the explicit handle. Native full geometry/default glyph generation/type glyphs/RTL/snap/delete/capture/platform and parent goal remain open.

    Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.
id_source: "generated"
---
## Summary

Iteration91 preserves native tab item identity through the compact browser ruler projection.

## Scope

apps/office/src/sw/browser/presentation/writer-view-projection.ts; apps/office/src/sw/browser/presentation/WriterRulers.tsx; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx; apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx; apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx; apps/office/e2e/writer-ruler-tab-identity.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json;core move operation refactor only,no command/resource/policy/save/open/recovery edits.

## Plan

Standing iterative parity goal authorizes one local correction:read-only pinned Ruler ImplHitTest/SvxRuler UpdateTabs and ApplyTabs confirm default tabs do not admit dragging but the selected tab retains its item index. Reproduce hidden default preceding explicit tab in actual Writer and Chromium. Add immutable browser ruler-tab records pairing position with raw item index;derive explicit CSS positions from those records and use raw item index for shell movement. Do not add parallel-array index hacks,position search,timers or core filtering;SwWrtShell raw index and SvxTabStop metadata/undo contracts stay unchanged. Ruler DTO absence means no explicit marker;old hand-authored ruler fixtures supply the new owned DTO and removed-handle fixture updates it,retaining all assertions. Verify crossing/reordering/collision,default+explicit metadata and hidden defaults,one accepted undo,cancellation/redo and later editing. Preserve old tests and manifest metadata;append evidence/responsibility only to two existing browser rows,220rows unchanged. Full verify/100%four coverage/0semantic;vendor-absent tests/restoration;exact8paths/sourcehash/ignored-inclusive artifact checks;same-actor exact semantic EVALUATOR;close leaf and record parent progress. No helpers/source/native artifacts,upstream test reads/compilation/execution,network/outside-repo or I/O/recovery deviations. Full native ruler/UI/parent remain unverified.

Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.

## Verify Steps

1.Read pinned editeng/source/items/paraitem.cxx Insert plus svtools/source/control/ruler.cxx ImplHitTest and svx/source/dialog/svxruler.cxx UpdateTabs/ApplyTabs read-only,hashes/conclusions only. 2.Add owned actual Writer/immutable projection/Undo regression and desktop/mobile Chromium new tab drag;record pre-fix failures;confirm raw item index despite preceding/interleaved defaults,unchanged other stops/all metadata/default distance,reordering/collision,Escape and accepted single undo/redo with new snapshot indices. Existing ruler/paragraph-ruler cases retained. 3.Exact9semantic paths;284prior test/spec files,282byte-identical;only3owned DTO additions in old WriterPageLayout fixtures and1removed-handle DTO update in WriterRulers-tracking,all assertions/other bytes preserved.220prior manifest rows/order/status/default/owner/exception fields unchanged,two append-only browser evidence/responsibility/justification updates;no new rows/status promotion;3pinned hashes unchanged. 4.npm run verify passes1129+new owned tests and109tool tests,61+2browser scenarios,2resource tests,type/lint/static gates;100%statements/branches/functions/lines app/inventory and0semantic violations. Static CLI audits separately read vendor;tests never read/compile/invoke upstream. 5.Rename vendor/libreoffice-reference inside vendor;npm run test;npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm run test:e2e pass;restore in finally. 6.git diff --check,routing,doctor0errors/knownwarnings,ignored-inclusive raw/decoded AP source/helper/Python/frame/diff/archive findings0. 7.Same-actor separate EVALUATOR exact semantic SHA pass,clean final tracked state,leafDONE,parentDOING;full native/goal remain unproven.

## Verification

Pending declared implementation and checks.

## Rollback Plan

Revert isolated semantic commit if needed,keep bounded results/hashes and restore temporarily renamed vendor in finally;no history rewrite.

## Findings

Previous goal turn is verified progress:iteration90 leafDONE semantic2a667d6fc8db with clean main/base11a7405467db. Current projection filters SvxTabAdjust.Default before assigning ruler ordinal;WriterRulers passes this compact ordinal to MoveRulerTabStop while the shell indexes complete item. Pinned Ruler skips default hit targets but preserves nAryPos;SvxRuler ApplyTabs uses that raw item index. Preceding default can therefore be moved instead of the explicit handle. Native full geometry/default glyph generation/type glyphs/RTL/snap/delete/capture/platform and parent goal remain open.

Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.
