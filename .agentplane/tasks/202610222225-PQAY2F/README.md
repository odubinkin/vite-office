---
id: "202610222225-PQAY2F"
title: "Canonicalize Writer paper formats and page geometry UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T22:26:27.249Z"
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
    body: "Start: canonicalize original physical paper bridge, source catalog/page handlers and Writer page geometry, UI, history and ODT in writer using approved local sources and related checks."
events:
  -
    type: "status"
    at: "2026-10-22T22:26:35.191Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: canonicalize original physical paper bridge, source catalog/page handlers and Writer page geometry, UI, history and ODT in writer using approved local sources and related checks."
doc_version: 3
doc_updated_at: "2026-10-22T22:26:35.191Z"
doc_updated_by: "CODER"
description: "Connect original PaperInfo and SvxPaperInfo size/fitting contracts to native standard paper catalog, page dialog geometry and locale defaults; remove synthetic paper-format storage and A4 width workaround while retaining history and ODT physical values."
sections:
  Summary: |-
    Canonicalize Writer paper formats and page geometry UI

    Connect original PaperInfo and SvxPaperInfo size/fitting contracts to native standard paper catalog, page dialog geometry and locale defaults; remove synthetic paper-format storage and A4 width workaround while retaining history and ODT physical values.
  Scope: "Only writer checkout/branch. Original SvxPaperInfo physical-unit size/sloppy fitting and paper catalogs/list selection, consumed CUI page-format geometry/range/margin/orientation handlers, Writer page dialog and physical page descriptor/layout/filter/snapshot consumers, native locale paper/measurement defaults through existing prepared host-locale boundary, actual Common.xcs default limits through configuration owners if needed. Up to30 implementation/resource/tooling paths plus their canonical records/generated views and up to20 affected existing/new test paths. No locale data/validation expansion, printer emulation, header/footer/border configuration UI expansion, native memory, network, branches/merges or intentional I/O/recovery policy changes."
  Plan: "Port consumed SvxPaperInfo enum-size and orientation-sensitive sloppy fit over actual PaperInfo/Tools Size/unit conversion, and exact Std/Draw paper list IDs/order/labels/fallback. Connect original CUI paper selection/manual-size/orientation and1mm body/margin arithmetic to the actual dialog metric controls. Use existing native measurement/paper locale queries without a new locale service; consume source default page limits without a fabricated config/printer provider. Remove synthetic WriterPaperFormat/string paperFormat and two-size table from model/codec/I/O; keep actual physical geometry/landscape and derived UI identity. Remove A4-only width flooring and test original integer-twip frame widths. Verify named/custom/all-standard paper paths, live controls/units/history/ODT and related geometry/rendering consumers; update source records and suspected issues conservatively, finish task and continue active goal."
  Verify Steps: "Read pinned PaperInfo/SvxPaperInfo, papersizelistbox/page.hrc, CUI page Reset/PaperSizeSelect/Modify/SwapOrientation/CalcMargin/Range handlers, Common.xcs limits and Writer docdesc/page frame geometry. Tests prove exact native list order/37standard entries and Draw list/fallback, paper values/physical unit rounding/sloppy first-match and orientation sensitivity, locale paper versus measurement independence, no synthetic format in model/graph/ODT, source selection/User/manual recognition/orientation/margin tie and1mm limits, current UI cancel/accept/units and actual history/ODT repeated roundtrip. Chromium1280/390 must exercise A3/Legal/envelope/User/manual/orientation, page preview/physical layout and exported ODT reopen. Run related paper/unit/locale/default/page/layout/history/codec/filter/browser tests and strict changed-responsibility coverage, typecheck/scoped lint/format/build/static/resources/boundaries/docs/size/tree/provenance/invariants/parity/doctor/routing/diff/status. No full suite: sixth task after ACR55N."
  Verification: "Pending implementation and declared local checks; no full native page/printer/configuration service parity claimed."
  Rollback Plan: "Revert only this task source commits and preserve preceding Writer/table/character work and traceability. No reset/merge/external writes."
  Findings: "Previous goal turn is progress: RXH8BN sourceb00edb419944, closure80efc0967b8c,91 related4836 and79 focused cases plus77 tooling/11 Chromium scenarios and exact-span audit100; writer clean. Current read-only audit finds actual native PaperInfo already implemented, page UI restricted to2formats, synthetic string identity in model/filter, hardcoded A4 one-twip width override and10mm minimum body versus source1mm. Source catalog37Std entries; full platform/config/printer services remain unverified. User broad mutation/continuation approval persists and stop requests are revoked. Accidental harmless CLI role output was briefly redirected to a temporary file outside the checkout and immediately deleted without reading external/global files; subsequent artifacts are inside writer. Only pinned local sources, no network. Keep goal active."
id_source: "generated"
---
## Summary

Canonicalize Writer paper formats and page geometry UI

Connect original PaperInfo and SvxPaperInfo size/fitting contracts to native standard paper catalog, page dialog geometry and locale defaults; remove synthetic paper-format storage and A4 width workaround while retaining history and ODT physical values.

## Scope

Only writer checkout/branch. Original SvxPaperInfo physical-unit size/sloppy fitting and paper catalogs/list selection, consumed CUI page-format geometry/range/margin/orientation handlers, Writer page dialog and physical page descriptor/layout/filter/snapshot consumers, native locale paper/measurement defaults through existing prepared host-locale boundary, actual Common.xcs default limits through configuration owners if needed. Up to30 implementation/resource/tooling paths plus their canonical records/generated views and up to20 affected existing/new test paths. No locale data/validation expansion, printer emulation, header/footer/border configuration UI expansion, native memory, network, branches/merges or intentional I/O/recovery policy changes.

## Plan

Port consumed SvxPaperInfo enum-size and orientation-sensitive sloppy fit over actual PaperInfo/Tools Size/unit conversion, and exact Std/Draw paper list IDs/order/labels/fallback. Connect original CUI paper selection/manual-size/orientation and1mm body/margin arithmetic to the actual dialog metric controls. Use existing native measurement/paper locale queries without a new locale service; consume source default page limits without a fabricated config/printer provider. Remove synthetic WriterPaperFormat/string paperFormat and two-size table from model/codec/I/O; keep actual physical geometry/landscape and derived UI identity. Remove A4-only width flooring and test original integer-twip frame widths. Verify named/custom/all-standard paper paths, live controls/units/history/ODT and related geometry/rendering consumers; update source records and suspected issues conservatively, finish task and continue active goal.

## Verify Steps

Read pinned PaperInfo/SvxPaperInfo, papersizelistbox/page.hrc, CUI page Reset/PaperSizeSelect/Modify/SwapOrientation/CalcMargin/Range handlers, Common.xcs limits and Writer docdesc/page frame geometry. Tests prove exact native list order/37standard entries and Draw list/fallback, paper values/physical unit rounding/sloppy first-match and orientation sensitivity, locale paper versus measurement independence, no synthetic format in model/graph/ODT, source selection/User/manual recognition/orientation/margin tie and1mm limits, current UI cancel/accept/units and actual history/ODT repeated roundtrip. Chromium1280/390 must exercise A3/Legal/envelope/User/manual/orientation, page preview/physical layout and exported ODT reopen. Run related paper/unit/locale/default/page/layout/history/codec/filter/browser tests and strict changed-responsibility coverage, typecheck/scoped lint/format/build/static/resources/boundaries/docs/size/tree/provenance/invariants/parity/doctor/routing/diff/status. No full suite: sixth task after ACR55N.

## Verification

Pending implementation and declared local checks; no full native page/printer/configuration service parity claimed.

## Rollback Plan

Revert only this task source commits and preserve preceding Writer/table/character work and traceability. No reset/merge/external writes.

## Findings

Previous goal turn is progress: RXH8BN sourceb00edb419944, closure80efc0967b8c,91 related4836 and79 focused cases plus77 tooling/11 Chromium scenarios and exact-span audit100; writer clean. Current read-only audit finds actual native PaperInfo already implemented, page UI restricted to2formats, synthetic string identity in model/filter, hardcoded A4 one-twip width override and10mm minimum body versus source1mm. Source catalog37Std entries; full platform/config/printer services remain unverified. User broad mutation/continuation approval persists and stop requests are revoked. Accidental harmless CLI role output was briefly redirected to a temporary file outside the checkout and immediately deleted without reading external/global files; subsequent artifacts are inside writer. Only pinned local sources, no network. Keep goal active.
