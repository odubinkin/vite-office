---
id: "202610041144-M3V0VR"
title: "Restore live document-owned Writer toolbar style selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on:
  - "202610041031-BMWW5W"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T12:00:59.063Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T12:10:55.617Z"
  updated_by: "CODER"
  note: "Bounded live Writer style population/name dispatch complete; app1352/inventory109/scripts5/browser89 only absent,100percent coverage, no passing full suite repeated, exact11paths/306old tests unchanged/223old rows preserved, read-only four native hashes and AP forbidden0; full widget and parent parity remain open."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T12:11:53.821Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of semantic475c38604abb: approved bounded live Writer style population/name dispatch passes; full native widget and parent parity remain unverified."
  evaluated_sha: "475c38604abbdd400c9479bce0eace0ef23c544e"
  blueprint_digest: "3bf1054c43c7f083b0379248a7a587b82385540519e94ba6799ee9d51a62a49e"
  evidence_refs:
    - ".agentplane/tasks/202610041144-M3V0VR/README.md"
    - ".agentplane/tasks/202610041144-M3V0VR/quality/20261004-121153821-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041144-M3V0VR/quality/20261004-121153821-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041144-M3V0VR/quality/20261004-121153821-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041144-M3V0VR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041144-M3V0VR/final-integrity.json"
    - ".agentplane/tasks/202610041144-M3V0VR/scope-integrity.json"
    - ".agentplane/tasks/202610041144-M3V0VR/source-comparison.json"
    - ".agentplane/tasks/202610041144-M3V0VR/semantic-audit.json"
    - ".agentplane/tasks/202610041144-M3V0VR/artifact-audit.json"
    - ".agentplane/tasks/202610041144-M3V0VR/visual-evidence.json"
    - ".agentplane/tasks/202610041144-M3V0VR/vendor-absent-runtime.json"
    - ".agentplane/tasks/202610041144-M3V0VR/vendor-absent-inventory.json"
    - ".agentplane/tasks/202610041144-M3V0VR/vendor-absent-scripts.json"
    - ".agentplane/tasks/202610041144-M3V0VR/vendor-absent-browser.json"
    - ".agentplane/tasks/202610041144-M3V0VR/vendor-absent-browser-owned.json"
    - ".agentplane/tasks/202610041144-M3V0VR/routing.json"
    - ".agentplane/tasks/202610041144-M3V0VR/doctor.json"
  findings:
    - "Approved11semantic paths match committed hashes;306of307prior tests are byte-identical and one bounded selector admission change retains nine font literals.223old rows/order/status/default/exception fields are unchanged; three descriptions append and one browser helper is added."
    - "Actual regular/derived/table use, literal ten defaults and four true switches, exact-name deduplication, immutable population, actual custom/renamed names, localization, disabled state, no-op and real UndoRedo/document replacement have owned evidence."
    - "App1352/inventory109/scripts5 passed only with pinned directory absent; four coverage metrics are100percent. All87prior Chromium cases passed once; only the two failed new label cases were recovered. No passing full suite repeated. Final browser build typechecks final tree and no product code changed after app success."
    - "Four read-only native hashes, source audits/parity224modules0violations, routing/doctor and ignored-inclusive AP artifact scan pass; source copies/helpers/Python/native executions are absent. Both inspected product screenshots show actual Owned child; desktop Properties agrees."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the next single native toolbar-style population and actual custom selection correction under the continuing approved goal; tests only absent, no passing gate duplication."
events:
  -
    type: "status"
    at: "2026-10-04T11:44:35.167Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the next single native toolbar-style population and actual custom selection correction under the continuing approved goal; tests only absent, no passing gate duplication."
  -
    type: "verify"
    at: "2026-10-04T12:10:55.617Z"
    author: "CODER"
    state: "ok"
    note: "Bounded live Writer style population/name dispatch complete; app1352/inventory109/scripts5/browser89 only absent,100percent coverage, no passing full suite repeated, exact11paths/306old tests unchanged/223old rows preserved, read-only four native hashes and AP forbidden0; full widget and parent parity remain open."
doc_version: 3
doc_updated_at: "2026-10-04T12:12:17.092Z"
doc_updated_by: "CODER"
description: "Iteration103 replaces the static grouped pool selector with the supported native StyleToolBoxControl default/used/user-defined population and native name dispatch. Correct active custom display, live updates and disabled selection, preserving registered I/O/recovery deviations and recording remaining full style-management/UI gaps."
sections:
  Summary: "Restore actual document-owned custom styles in the existing Writer toolbar selector and the supported native flat default/used/user-defined population. The previous iteration verified named owners; its screenshots showed the toolbar's builtin fallback despite an active Owned child."
  Scope: |-
    Exactly11semantic paths:
    - apps/office/src/sw/source/core/doc/doc.ts
    - apps/office/src/svx/browser/tbxctrls/style-toolbox-control.ts
    - apps/office/src/sw/browser/presentation/writer-view-projection.ts
    - apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx
    - apps/office/src/svx/browser/tbxctrls/style-toolbox-control.test.ts
    - apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx
    - apps/office/e2e/writer-style-selector.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - scripts/check-module-boundaries.mjs
    - apps/office/src/framework/browser/app/desktop.test.tsx
    Use read-only native source/hash inspection only. No sources, helpers, Python, binary probes, code diffs or raw diagnostics in AP. Tests never read/compile/invoke pinned upstream and run only absent. All306other prior tests, with one bounded old selector test update preserving all nine font literals and reaching non-default styles through the unchanged Styles menu, mapping statuses/defaults/exceptions and registered I/O/recovery deviations preserved. No global/network/subagents. Complete native favourite/hidden/style-management commands, editable creation, preview/context menus and Clear/More actions remain unverified follow-ups rather than inert additions.
  Plan: |-
    1. Add the supported SwDoc.IsUsed paragraph collection query over actual regular node-array ownership and derived styles, including tables, excluding detached/foreign/undo-only nodes.
    2. Add a source-owned browser StyleToolBoxControl population adapter with native four true configuration defaults, native default-first order then used/favourite/user-defined vectors and exact name deduplication. Writer supplies ten native default IDs without mutating/materializing styles during projection, actual used and user-owned collections, current names and existing builtin label resource references. Favourite data is not yet implemented and remains empty/unverified.
    3. Replace static projection and artificial optgroup/depth menu construction. Resolve active stable ID against actual names; apply registered custom/builtin choice through existing StyleApply name arguments, preserve unchanged effective style/no-op/history and command disabled state. Existing generated menus and resource literals remain unchanged.
    4. Add independent literal population/settings/name/collision/immutability, actual paragraph/table/foreign ownership and real bindings/rename/invalidation/disabled/no-op/UndoRedo/document replacement tests; real ODT/browser1280/390 custom selection/other paragraph/history/editing/screenshots.
    5. Seven static gates, then app100%fourmetrics and inventory100%fourmetrics/scripts5/fullChromium once with vendor absent/finally restore. Only failed gates repeated; no present-directory or baseline tests and no passing full suite repeated. Restored source4audits/parity, exact11paths/all306other prior tests unchanged/source hashes/AP forbidden0/routing/doctor/exact-SHA same-actor EVAL; finish leaf and record parent progress without claiming broad goal completion. Register the newly instantiated svx owner and only sw -> svx in the existing boundary allowlist; no generic allowlist relaxation.
  Verify Steps: |-
    1. Native ten defaults match tbcontrl.cxx InitializeStyles; four booleans true from Common.xcs; flat default-first then used/favourite/user-defined order with exact name deduplication and readonly outputs. Writer used query includes actual regular node-array and derived/table owners, excludes detached/foreign nodes, custom unused declarations present; projection reads never materialize new collections or retain mutable sources.
    2. Real projection/bindings and toolbar show actual custom/native renamed names, dispatch actual native StyleApply name arguments, honour disabled state and preserve current ID/no-op/history/other paragraph. Used styles, names and document replacement update without stale global arrays; independent locales and XML punctuation/colon names retain actual identity. All306other prior tests byte-identical; the one desktop selector test checks ten initial styles and retains all nine font literals with supported menu admission for non-default styles.
    3. Real ODT1280/390 browser toolbar/side panel agree on custom styles; selecting another registered style, UndoRedo, cancel/raw paragraph history, untouched paragraph and continued typing work; inspect screenshots. Seven static gates pass. App/inventory100%fourmetrics; scripts5/fullChromium only absent with finally restore. No passing full suite repeated.
    4. Restored resources--check/source-tree/provenance/invariants/parity pass; exact11semantic paths, all306other prior tests unchanged,223old rows/status/default/exception/order unchanged with bounded evidence and one helper row; read-only native hashes and whole ignored-inclusive AP forbidden0. Routing/doctor, reviewed semantic SHA matching report, clean tracked closure and parent progress. Full favourite/hidden/native style management and broad core/browser parity remain unverified. Boundary registration changes are limited to svx recognition, an empty svx outgoing set and the native sw -> svx edge.
  Verification: "Seven declared static gates passed. Final rebuilt browser bundle also passed the static-output guard. Product tests were executed only while the pinned upstream directory was absent and each finally block restored it. App1352/231files and inventory109/36files have100percent lines/statements/functions/branches; scripts5/2files. Full Chromium ran once:87prior cases passed and only the two new cases failed on the owned literal Text body label; those two alone recovered2/2. No passing full suite repeated. Initial lint/config registration failures, one old26-style selector expectation, one default-name branch and two test-only build typing errors were corrected. Final browser build typechecks the final source tree; product code did not change after the passing app suite. Resources-check/source-tree/provenance/invariants/parity224modules/0violations, exact11paths/306of307prior tests byte-identical, bounded remaining selector update retaining nine font literals,223old mapping rows/order/status/default/exception retained, four source hashes and ignored-inclusive AP audit3391files/forbidden0/prose-only historical references5 passed. Desktop and mobile screenshots show Owned child in the toolbar, and the desktop Properties panel agrees. Routing and doctor passed. Same-actor read-only quality review passed for exact semantic475c38604abbdd400c9479bce0eace0ef23c544e; report .agentplane/tasks/202610041144-M3V0VR/quality/20261004-121153821-recovery-context/quality-report.json. Full widget and parent parity remain open; no native execution or passing-suite repeats."
  Rollback Plan: "Revert only this iteration's semantic commit through a new approved task; preserve native pins, registered exceptions and immutable DONE artifacts. Restore the temporarily renamed vendor directory in finally even after a failing gate."
  Findings: |-
    Read-only native FillStyleBox adds ten Writer defaults then used/favourite/user-defined style names with exact-name deduplication; SelectStyle preserves actual style display text. The existing selector instead projects a global pool hierarchy and dispatches only fixed resource URLs, causing custom active values to show the first builtin option. Native Clear/More/editable-new-style/style previews/context menus are additional unimplemented responsibilities kept open under the continuing full goal.

    Iteration103 restores the Writer toolbar style population inspected in SvxStyleToolBoxControl InitializeStyles/FillStyleBox: ten flat native defaults precede actual used and user-defined collections, with exact-name deduplication and four true Common configuration defaults. The generic detached population adapter accepts favourite vectors, while actual favourite storage remains unimplemented. SwDoc.IsUsed supplies bounded regular paragraph-node identity and derived-owner usage, including table nodes and excluding detached/foreign/undo-only nodes. Projection reads never materialize unused defaults and retain only immutable primitive identities/names; actual custom and renamed names dispatch through existing StyleApply and update on model/bindings invalidation, document replacement and Undo/Redo. Unchanged builtins retain existing localized resources. Independent owned population/actual-frame tests and desktop/mobile ODT browser history evidence cover the bounded correction; all306 other prior tests stay byte-identical; one existing selector test expects ten initial styles and admits non-default choices through the unchanged Styles menu while retaining all nine font-size literals. Complete native broadcaster/EE/comment usage, favourite/hidden storage, editable creation, previews/context menus, Clear/More actions, keyboard/focus style control and full native/widget/parent parity remain unverified. No status/default/exception promotion; registered save/open/recovery deviations unchanged.

    The generic controller remains a browser boundary with no whole-native responsibility promotion. The new svx owner is registered only with an empty outgoing module set and Writer admission; existing guard behavior is unchanged. The old desktop selector test admits four initially absent builtin styles through the unchanged Styles menu before selecting their now-used entry; the original nine font-size literals remain intact. New owned names preserve colon, XML punctuation and Unicode. Screenshot evidence is kept only in repository test-results, with two bounded hash/path records in task evidence. Full native StyleBox focus release, keyboard/editable creation, clear/more actions, favourites and hidden styles, broadcaster/EE/comment dependencies and broader style/pool/default contracts stay open.
id_source: "generated"
---
## Summary

Restore actual document-owned custom styles in the existing Writer toolbar selector and the supported native flat default/used/user-defined population. The previous iteration verified named owners; its screenshots showed the toolbar's builtin fallback despite an active Owned child.

## Scope

Exactly11semantic paths:
- apps/office/src/sw/source/core/doc/doc.ts
- apps/office/src/svx/browser/tbxctrls/style-toolbox-control.ts
- apps/office/src/sw/browser/presentation/writer-view-projection.ts
- apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx
- apps/office/src/svx/browser/tbxctrls/style-toolbox-control.test.ts
- apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx
- apps/office/e2e/writer-style-selector.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- scripts/check-module-boundaries.mjs
- apps/office/src/framework/browser/app/desktop.test.tsx
Use read-only native source/hash inspection only. No sources, helpers, Python, binary probes, code diffs or raw diagnostics in AP. Tests never read/compile/invoke pinned upstream and run only absent. All306other prior tests, with one bounded old selector test update preserving all nine font literals and reaching non-default styles through the unchanged Styles menu, mapping statuses/defaults/exceptions and registered I/O/recovery deviations preserved. No global/network/subagents. Complete native favourite/hidden/style-management commands, editable creation, preview/context menus and Clear/More actions remain unverified follow-ups rather than inert additions.

## Plan

1. Add the supported SwDoc.IsUsed paragraph collection query over actual regular node-array ownership and derived styles, including tables, excluding detached/foreign/undo-only nodes.
2. Add a source-owned browser StyleToolBoxControl population adapter with native four true configuration defaults, native default-first order then used/favourite/user-defined vectors and exact name deduplication. Writer supplies ten native default IDs without mutating/materializing styles during projection, actual used and user-owned collections, current names and existing builtin label resource references. Favourite data is not yet implemented and remains empty/unverified.
3. Replace static projection and artificial optgroup/depth menu construction. Resolve active stable ID against actual names; apply registered custom/builtin choice through existing StyleApply name arguments, preserve unchanged effective style/no-op/history and command disabled state. Existing generated menus and resource literals remain unchanged.
4. Add independent literal population/settings/name/collision/immutability, actual paragraph/table/foreign ownership and real bindings/rename/invalidation/disabled/no-op/UndoRedo/document replacement tests; real ODT/browser1280/390 custom selection/other paragraph/history/editing/screenshots.
5. Seven static gates, then app100%fourmetrics and inventory100%fourmetrics/scripts5/fullChromium once with vendor absent/finally restore. Only failed gates repeated; no present-directory or baseline tests and no passing full suite repeated. Restored source4audits/parity, exact11paths/all306other prior tests unchanged/source hashes/AP forbidden0/routing/doctor/exact-SHA same-actor EVAL; finish leaf and record parent progress without claiming broad goal completion. Register the newly instantiated svx owner and only sw -> svx in the existing boundary allowlist; no generic allowlist relaxation.

## Verify Steps

1. Native ten defaults match tbcontrl.cxx InitializeStyles; four booleans true from Common.xcs; flat default-first then used/favourite/user-defined order with exact name deduplication and readonly outputs. Writer used query includes actual regular node-array and derived/table owners, excludes detached/foreign nodes, custom unused declarations present; projection reads never materialize new collections or retain mutable sources.
2. Real projection/bindings and toolbar show actual custom/native renamed names, dispatch actual native StyleApply name arguments, honour disabled state and preserve current ID/no-op/history/other paragraph. Used styles, names and document replacement update without stale global arrays; independent locales and XML punctuation/colon names retain actual identity. All306other prior tests byte-identical; the one desktop selector test checks ten initial styles and retains all nine font literals with supported menu admission for non-default styles.
3. Real ODT1280/390 browser toolbar/side panel agree on custom styles; selecting another registered style, UndoRedo, cancel/raw paragraph history, untouched paragraph and continued typing work; inspect screenshots. Seven static gates pass. App/inventory100%fourmetrics; scripts5/fullChromium only absent with finally restore. No passing full suite repeated.
4. Restored resources--check/source-tree/provenance/invariants/parity pass; exact11semantic paths, all306other prior tests unchanged,223old rows/status/default/exception/order unchanged with bounded evidence and one helper row; read-only native hashes and whole ignored-inclusive AP forbidden0. Routing/doctor, reviewed semantic SHA matching report, clean tracked closure and parent progress. Full favourite/hidden/native style management and broad core/browser parity remain unverified. Boundary registration changes are limited to svx recognition, an empty svx outgoing set and the native sw -> svx edge.

## Verification

Seven declared static gates passed. Final rebuilt browser bundle also passed the static-output guard. Product tests were executed only while the pinned upstream directory was absent and each finally block restored it. App1352/231files and inventory109/36files have100percent lines/statements/functions/branches; scripts5/2files. Full Chromium ran once:87prior cases passed and only the two new cases failed on the owned literal Text body label; those two alone recovered2/2. No passing full suite repeated. Initial lint/config registration failures, one old26-style selector expectation, one default-name branch and two test-only build typing errors were corrected. Final browser build typechecks the final source tree; product code did not change after the passing app suite. Resources-check/source-tree/provenance/invariants/parity224modules/0violations, exact11paths/306of307prior tests byte-identical, bounded remaining selector update retaining nine font literals,223old mapping rows/order/status/default/exception retained, four source hashes and ignored-inclusive AP audit3391files/forbidden0/prose-only historical references5 passed. Desktop and mobile screenshots show Owned child in the toolbar, and the desktop Properties panel agrees. Routing and doctor passed. Same-actor read-only quality review passed for exact semantic475c38604abbdd400c9479bce0eace0ef23c544e; report .agentplane/tasks/202610041144-M3V0VR/quality/20261004-121153821-recovery-context/quality-report.json. Full widget and parent parity remain open; no native execution or passing-suite repeats.

## Rollback Plan

Revert only this iteration's semantic commit through a new approved task; preserve native pins, registered exceptions and immutable DONE artifacts. Restore the temporarily renamed vendor directory in finally even after a failing gate.

## Findings

Read-only native FillStyleBox adds ten Writer defaults then used/favourite/user-defined style names with exact-name deduplication; SelectStyle preserves actual style display text. The existing selector instead projects a global pool hierarchy and dispatches only fixed resource URLs, causing custom active values to show the first builtin option. Native Clear/More/editable-new-style/style previews/context menus are additional unimplemented responsibilities kept open under the continuing full goal.

Iteration103 restores the Writer toolbar style population inspected in SvxStyleToolBoxControl InitializeStyles/FillStyleBox: ten flat native defaults precede actual used and user-defined collections, with exact-name deduplication and four true Common configuration defaults. The generic detached population adapter accepts favourite vectors, while actual favourite storage remains unimplemented. SwDoc.IsUsed supplies bounded regular paragraph-node identity and derived-owner usage, including table nodes and excluding detached/foreign/undo-only nodes. Projection reads never materialize unused defaults and retain only immutable primitive identities/names; actual custom and renamed names dispatch through existing StyleApply and update on model/bindings invalidation, document replacement and Undo/Redo. Unchanged builtins retain existing localized resources. Independent owned population/actual-frame tests and desktop/mobile ODT browser history evidence cover the bounded correction; all306 other prior tests stay byte-identical; one existing selector test expects ten initial styles and admits non-default choices through the unchanged Styles menu while retaining all nine font-size literals. Complete native broadcaster/EE/comment usage, favourite/hidden storage, editable creation, previews/context menus, Clear/More actions, keyboard/focus style control and full native/widget/parent parity remain unverified. No status/default/exception promotion; registered save/open/recovery deviations unchanged.

The generic controller remains a browser boundary with no whole-native responsibility promotion. The new svx owner is registered only with an empty outgoing module set and Writer admission; existing guard behavior is unchanged. The old desktop selector test admits four initially absent builtin styles through the unchanged Styles menu before selecting their now-used entry; the original nine font-size literals remain intact. New owned names preserve colon, XML punctuation and Unicode. Screenshot evidence is kept only in repository test-results, with two bounded hash/path records in task evidence. Full native StyleBox focus release, keyboard/editable creation, clear/more actions, favourites and hidden styles, broadcaster/EE/comment dependencies and broader style/pool/default contracts stay open.
