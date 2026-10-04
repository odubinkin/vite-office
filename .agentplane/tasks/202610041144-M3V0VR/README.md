---
id: "202610041144-M3V0VR"
title: "Restore live document-owned Writer toolbar style selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610041031-BMWW5W"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T11:44:34.713Z"
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
    body: "Start: implement the next single native toolbar-style population and actual custom selection correction under the continuing approved goal; tests only absent, no passing gate duplication."
events:
  -
    type: "status"
    at: "2026-10-04T11:44:35.167Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the next single native toolbar-style population and actual custom selection correction under the continuing approved goal; tests only absent, no passing gate duplication."
doc_version: 3
doc_updated_at: "2026-10-04T11:44:35.167Z"
doc_updated_by: "CODER"
description: "Iteration103 replaces the static grouped pool selector with the supported native StyleToolBoxControl default/used/user-defined population and native name dispatch. Correct active custom display, live updates and disabled selection, preserving registered I/O/recovery deviations and recording remaining full style-management/UI gaps."
sections:
  Summary: "Restore actual document-owned custom styles in the existing Writer toolbar selector and the supported native flat default/used/user-defined population. The previous iteration verified named owners; its screenshots showed the toolbar's builtin fallback despite an active Owned child."
  Scope: |-
    Exactly9semantic paths:
    - apps/office/src/sw/source/core/doc/doc.ts
    - apps/office/src/svx/browser/tbxctrls/style-toolbox-control.ts
    - apps/office/src/sw/browser/presentation/writer-view-projection.ts
    - apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx
    - apps/office/src/svx/browser/tbxctrls/style-toolbox-control.test.ts
    - apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx
    - apps/office/e2e/writer-style-selector.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    Use read-only native source/hash inspection only. No sources, helpers, Python, binary probes, code diffs or raw diagnostics in AP. Tests never read/compile/invoke pinned upstream and run only absent. All307prior tests, mapping statuses/defaults/exceptions and registered I/O/recovery deviations preserved. No global/network/subagents. Complete native favourite/hidden/style-management commands, editable creation, preview/context menus and Clear/More actions remain unverified follow-ups rather than inert additions.
  Plan: |-
    1. Add the supported SwDoc.IsUsed paragraph collection query over actual regular node-array ownership and derived styles, including tables, excluding detached/foreign/undo-only nodes.
    2. Add a source-owned browser StyleToolBoxControl population adapter with native four true configuration defaults, native default-first order then used/favourite/user-defined vectors and exact name deduplication. Writer supplies ten native default IDs without mutating/materializing styles during projection, actual used and user-owned collections, current names and existing builtin label resource references. Favourite data is not yet implemented and remains empty/unverified.
    3. Replace static projection and artificial optgroup/depth menu construction. Resolve active stable ID against actual names; apply registered custom/builtin choice through existing StyleApply name arguments, preserve unchanged effective style/no-op/history and command disabled state. Existing generated menus and resource literals remain unchanged.
    4. Add independent literal population/settings/name/collision/immutability, actual paragraph/table/foreign ownership and real bindings/rename/invalidation/disabled/no-op/UndoRedo/document replacement tests; real ODT/browser1280/390 custom selection/other paragraph/history/editing/screenshots.
    5. Seven static gates, then app100%fourmetrics and inventory100%fourmetrics/scripts5/fullChromium once with vendor absent/finally restore. Only failed gates repeated; no present-directory or baseline tests and no passing full suite repeated. Restored source4audits/parity, exact9paths/all307prior tests unchanged/source hashes/AP forbidden0/routing/doctor/exact-SHA same-actor EVAL; finish leaf and record parent progress without claiming broad goal completion.
  Verify Steps: |-
    1. Native ten defaults match tbcontrl.cxx InitializeStyles; four booleans true from Common.xcs; flat default-first then used/favourite/user-defined order with exact name deduplication and readonly outputs. Writer used query includes actual regular node-array and derived/table owners, excludes detached/foreign nodes, custom unused declarations present; projection reads never materialize new collections or retain mutable sources.
    2. Real projection/bindings and toolbar show actual custom/native renamed names, dispatch actual native StyleApply name arguments, honour disabled state and preserve current ID/no-op/history/other paragraph. Used styles, names and document replacement update without stale global arrays; independent locales and XML punctuation/colon names retain actual identity. All307prior tests byte-identical.
    3. Real ODT1280/390 browser toolbar/side panel agree on custom styles; selecting another registered style, UndoRedo, cancel/raw paragraph history, untouched paragraph and continued typing work; inspect screenshots. Seven static gates pass. App/inventory100%fourmetrics; scripts5/fullChromium only absent with finally restore. No passing full suite repeated.
    4. Restored resources--check/source-tree/provenance/invariants/parity pass; exact9semantic paths, all307prior tests unchanged,223old rows/status/default/exception/order unchanged with bounded evidence and one helper row; read-only native hashes and whole ignored-inclusive AP forbidden0. Routing/doctor, reviewed semantic SHA matching report, clean tracked closure and parent progress. Full favourite/hidden/native style management and broad core/browser parity remain unverified.
  Verification: "Pending approved implementation and one absent-directory gate sequence. No tests executed."
  Rollback Plan: "Revert only this iteration's semantic commit through a new approved task; preserve native pins, registered exceptions and immutable DONE artifacts. Restore the temporarily renamed vendor directory in finally even after a failing gate."
  Findings: "Read-only native FillStyleBox adds ten Writer defaults then used/favourite/user-defined style names with exact-name deduplication; SelectStyle preserves actual style display text. The existing selector instead projects a global pool hierarchy and dispatches only fixed resource URLs, causing custom active values to show the first builtin option. Native Clear/More/editable-new-style/style previews/context menus are additional unimplemented responsibilities kept open under the continuing full goal."
id_source: "generated"
---
## Summary

Restore actual document-owned custom styles in the existing Writer toolbar selector and the supported native flat default/used/user-defined population. The previous iteration verified named owners; its screenshots showed the toolbar's builtin fallback despite an active Owned child.

## Scope

Exactly9semantic paths:
- apps/office/src/sw/source/core/doc/doc.ts
- apps/office/src/svx/browser/tbxctrls/style-toolbox-control.ts
- apps/office/src/sw/browser/presentation/writer-view-projection.ts
- apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx
- apps/office/src/svx/browser/tbxctrls/style-toolbox-control.test.ts
- apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx
- apps/office/e2e/writer-style-selector.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
Use read-only native source/hash inspection only. No sources, helpers, Python, binary probes, code diffs or raw diagnostics in AP. Tests never read/compile/invoke pinned upstream and run only absent. All307prior tests, mapping statuses/defaults/exceptions and registered I/O/recovery deviations preserved. No global/network/subagents. Complete native favourite/hidden/style-management commands, editable creation, preview/context menus and Clear/More actions remain unverified follow-ups rather than inert additions.

## Plan

1. Add the supported SwDoc.IsUsed paragraph collection query over actual regular node-array ownership and derived styles, including tables, excluding detached/foreign/undo-only nodes.
2. Add a source-owned browser StyleToolBoxControl population adapter with native four true configuration defaults, native default-first order then used/favourite/user-defined vectors and exact name deduplication. Writer supplies ten native default IDs without mutating/materializing styles during projection, actual used and user-owned collections, current names and existing builtin label resource references. Favourite data is not yet implemented and remains empty/unverified.
3. Replace static projection and artificial optgroup/depth menu construction. Resolve active stable ID against actual names; apply registered custom/builtin choice through existing StyleApply name arguments, preserve unchanged effective style/no-op/history and command disabled state. Existing generated menus and resource literals remain unchanged.
4. Add independent literal population/settings/name/collision/immutability, actual paragraph/table/foreign ownership and real bindings/rename/invalidation/disabled/no-op/UndoRedo/document replacement tests; real ODT/browser1280/390 custom selection/other paragraph/history/editing/screenshots.
5. Seven static gates, then app100%fourmetrics and inventory100%fourmetrics/scripts5/fullChromium once with vendor absent/finally restore. Only failed gates repeated; no present-directory or baseline tests and no passing full suite repeated. Restored source4audits/parity, exact9paths/all307prior tests unchanged/source hashes/AP forbidden0/routing/doctor/exact-SHA same-actor EVAL; finish leaf and record parent progress without claiming broad goal completion.

## Verify Steps

1. Native ten defaults match tbcontrl.cxx InitializeStyles; four booleans true from Common.xcs; flat default-first then used/favourite/user-defined order with exact name deduplication and readonly outputs. Writer used query includes actual regular node-array and derived/table owners, excludes detached/foreign nodes, custom unused declarations present; projection reads never materialize new collections or retain mutable sources.
2. Real projection/bindings and toolbar show actual custom/native renamed names, dispatch actual native StyleApply name arguments, honour disabled state and preserve current ID/no-op/history/other paragraph. Used styles, names and document replacement update without stale global arrays; independent locales and XML punctuation/colon names retain actual identity. All307prior tests byte-identical.
3. Real ODT1280/390 browser toolbar/side panel agree on custom styles; selecting another registered style, UndoRedo, cancel/raw paragraph history, untouched paragraph and continued typing work; inspect screenshots. Seven static gates pass. App/inventory100%fourmetrics; scripts5/fullChromium only absent with finally restore. No passing full suite repeated.
4. Restored resources--check/source-tree/provenance/invariants/parity pass; exact9semantic paths, all307prior tests unchanged,223old rows/status/default/exception/order unchanged with bounded evidence and one helper row; read-only native hashes and whole ignored-inclusive AP forbidden0. Routing/doctor, reviewed semantic SHA matching report, clean tracked closure and parent progress. Full favourite/hidden/native style management and broad core/browser parity remain unverified.

## Verification

Pending approved implementation and one absent-directory gate sequence. No tests executed.

## Rollback Plan

Revert only this iteration's semantic commit through a new approved task; preserve native pins, registered exceptions and immutable DONE artifacts. Restore the temporarily renamed vendor directory in finally even after a failing gate.

## Findings

Read-only native FillStyleBox adds ten Writer defaults then used/favourite/user-defined style names with exact-name deduplication; SelectStyle preserves actual style display text. The existing selector instead projects a global pool hierarchy and dispatches only fixed resource URLs, causing custom active values to show the first builtin option. Native Clear/More/editable-new-style/style previews/context menus are additional unimplemented responsibilities kept open under the continuing full goal.
