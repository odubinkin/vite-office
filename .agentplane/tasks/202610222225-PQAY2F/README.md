---
id: "202610222225-PQAY2F"
title: "Canonicalize Writer paper formats and page geometry UI"
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
doc_updated_at: "2026-10-22T23:18:57.800Z"
doc_updated_by: "CODER"
description: "Connect original PaperInfo and SvxPaperInfo size/fitting contracts to native standard paper catalog, page dialog geometry and locale defaults; remove synthetic paper-format storage and A4 width workaround while retaining history and ODT physical values."
sections:
  Summary: |-
    Canonicalize Writer paper formats and page geometry UI

    Connect original PaperInfo and SvxPaperInfo size/fitting contracts to native standard paper catalog, page dialog geometry and locale defaults; remove synthetic paper-format storage and A4 width workaround while retaining history and ODT physical values.
  Scope: "Only writer checkout/branch. Original SvxPaperInfo physical-unit size/sloppy fitting and paper catalogs/list selection, consumed CUI page-format geometry/range/margin/orientation handlers, Writer page dialog and physical page descriptor/layout/filter/snapshot consumers, native locale paper/measurement defaults through existing prepared host-locale boundary, actual Common.xcs default limits through configuration owners if needed. Up to30 implementation/resource/tooling paths plus their canonical records/generated views and up to20 affected existing/new test paths. No locale data/validation expansion, printer emulation, header/footer/border configuration UI expansion, native memory, network, branches/merges or intentional I/O/recovery policy changes."
  Plan: "Port consumed SvxPaperInfo enum-size and orientation-sensitive sloppy fit over actual PaperInfo/Tools Size/unit conversion, and exact Std/Draw paper list IDs/order/labels/fallback. Connect original CUI paper selection/manual-size/orientation and1mm body/margin arithmetic to the actual dialog metric controls. Use existing native measurement/paper locale queries without a new locale service; consume source default page limits without a fabricated config/printer provider. Remove synthetic WriterPaperFormat/string paperFormat and two-size table from model/codec/I/O; keep actual physical geometry/landscape and derived UI identity. Remove A4-only width flooring and test original integer-twip frame widths. Verify named/custom/all-standard paper paths, live controls/units/history/ODT and related geometry/rendering consumers; update source records and suspected issues conservatively, finish task and continue active goal."
  Verify Steps: "Read pinned PaperInfo/SvxPaperInfo, papersizelistbox/page.hrc, CUI page Reset/PaperSizeSelect/Modify/SwapOrientation/CalcMargin/Range handlers, Common.xcs limits and Writer docdesc/page frame geometry. Tests prove exact native list order/37standard entries and Draw list/fallback, paper values/physical unit rounding/sloppy first-match and orientation sensitivity, locale paper versus measurement independence, no synthetic format in model/graph/ODT, source selection/User/manual recognition/orientation/margin tie and1mm limits, current UI cancel/accept/units and actual history/ODT repeated roundtrip. Chromium1280/390 must exercise A3/Legal/envelope/User/manual/orientation, page preview/physical layout and exported ODT reopen. Run related paper/unit/locale/default/page/layout/history/codec/filter/browser tests and strict changed-responsibility coverage, typecheck/scoped lint/format/build/static/resources/boundaries/docs/size/tree/provenance/invariants/parity/doctor/routing/diff/status. No full suite: sixth task after ACR55N."
  Verification: |-
    Command: current related Vitest argv in output/playwright/writer-paper/coverage-command.json (run from apps/office), plus delta-command.json and node output/playwright/writer-paper/audit-incremental-coverage.mjs.
    Result: pass for all test cases and strict changed-responsibility audit. Evidence: current44 related files494 cases; final6 files133 cases. Raw partial profiles exit1 at unchanged global100 thresholds: current S88.21/B82.30/F90.21/L89.68, delta S75.98/B67.35/F79.89/L78.50. The audit requires exact baseline SHA, identical maps for profile merging and unchanged full source spans at git-diff-corresponding locations for historical carry; changed/new spans have only fresh counters. All10 executable changed application owners pass S891/B729/F184/L814=100, zero missing. Two native forwarding headers have no executable counters. No threshold, counter, ignore annotation or source default was weakened.
    Scope: original paper86 values/first-match fitting/physical rounding,37Std and35Draw list contracts, CUI Reset/manual/select/orientation/margin/range and FillItemSet acceptance, locale paper/measurement independence, physical core geometry/layout, actual UI/preview/history/graph/ODT/filter consumers.

    Command: npm run test:writer -- src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterPageLayout.test.tsx; npm run test:shared -- src/cui/source/tabpages/native-paper-page.test.ts; node_modules/.bin/vitest run scripts/native-paper-boundary.test.ts scripts/native-escapement-boundary.test.ts scripts/check-module-boundaries-text-effects.test.ts.
    Result: pass. Evidence:18 Writer acceptance/layout cases,9 CUI cases,21 tooling cases; final focused/related profiles include current source acceptance. Scope: actual dialog acceptance rather than preview, native margin casts, exact boundary admissions and retained neighbor rejection.

    Command: npm run build; node_modules/.bin/playwright test --config output/playwright/writer-paper/playwright.config.ts --project=writer --project=shared writer-native-paper.spec.ts writer-paper-formats.spec.ts writer-measurement-preferences.spec.ts shared/paper-geometry.spec.ts; node scripts/check-static-build.mjs.
    Result: pass. Evidence:9 Chromium scenarios at1280/390 and DOM-free Worker; source37 options, A3/Legal/DL Envelope/User/manual recognition, oriented physical dimensions, actual menus/metric controls/Undo/Redo/download/normal ODT reopen and persisted measurement preferences. Desktop/mobile screenshots inspected; dialogs fit both widths. Static relative assets/two JS bundles/no backend pass. Existing large-bundle build advisory remains. Scope: current browser UI/core/I/O connections; no compiled native UI/printer/config provider claim.

    Command: npm run typecheck; scoped node_modules/.bin/eslint --max-warnings0 over changed TS/TSX/MJS; scoped node_modules/.bin/prettier --check over intentional changed paths; npm run check:docs; npm run check:dependencies; npm run check:writer-resources; npm run inventory:invariants:write; npm run inventory:invariants; npm run inventory:parity; npm run check:source-provenance; npm run check:source-tree; npm run check:file-size; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass. Evidence: final-gates.json all15 exit0; source provenance1117 runtime modules, source-tree115 required/32 retired, four generated invariant views. Scope: current task source, exact field/unit/host-locale boundary edges and canonical paired runtime/provenance records without status promotion. Full suite intentionally not scheduled: sixth task since ACR55N; user requested full run once per10 tasks. Final tracked-state evidence is recorded after source/quality/closure commits. Goal remains active by latest user instruction.
  Rollback Plan: "Revert only this task source commits and preserve preceding Writer/table/character work and traceability. No reset/merge/external writes."
  Findings: |-
    Previous task RXH8BN completed as80efc0967b8c; this task is the sixth since full checkpointACR55N. Broad mutation and continuation approval persists; all prior stop requests are revoked. Work is confined to writer checkout/branch and pinned local sources9bc445578031fecf56086729d8e4940c77e14d65; no network/merge/push/new branch/worktree. Accidental harmless CLI role output was briefly redirected outside the checkout early in preflight, immediately deleted without reading external/global files; all subsequent artifacts are inside writer.

    Removed synthetic WriterPaperFormat/paperFormat/two-name paper table, redundant UI orientation helper, A4-only floor and misplaced10mm/backend90720 UI constraints. Actual PaperInfo/SvxPaperInfo now supply physical values; country paper and locale measurement are independent (Canada Letter with metric margins). Real Std37 and Draw35 catalogs/list semantics live at original owners. Consumed source CUI owns Reset/selection/manual/orientation/ranges/larger-side correction and source1mm MINBODY57. Installed Common.xcs supplies600cm paper and9999mm margin defaults through a browser resource adapter; no Components/provider/printer stand-in. Page core carries only eight physical/name fields; ODT/graph/layout preserve them.

    Source reinspection found native FillItemSet differs from preview: USER checks dimensions/paper/orientation; known paper checks only paper/orientation and emits canonical size; unchanged Reset snapshots preserve original physical items. Changed margins narrow uint16 independently. These are preserved, with native-owner and actual React acceptance tests. Suspected issues WRITER054/055/056 document source evidence, uncertainty and preservation, not confirmed compiled native application bugs.

    Resolved verification observations: removed string/table/helper APIs required physical-value test migration; A4 frame literals9637/14569 changed to source integer9638/14570. Independent new paper oracle originally assumed duplicate45 instead of first24 and a different sloppy tolerance; source inspection proved original first-match and strict44mm100 boundary, so independent expectations were corrected without product/threshold change. Static-only SvxPaperInfo has one justified architecture-preserving no-extraneous-class exception. New exact Paper/unit/prepared-host-field module edges have positive and neighboring-negative tests; no blanket module permission/cycle relaxation. Earlier partial coverage left branches uncovered; added source acceptance/cast/portrait-landscape and missing installed-schema scenarios, then strict exact-span audit passes100. Raw partial coverage threshold failures are retained and explained, not reported as ordinary Vitest exit0.

    Limits: body-only CUI profile excludes header/footer/borders/gutter/printer/full style/config overrides, font/device nonphysical conversion, repeated native Apply scheduling and extreme contradictory widget/printer states. Native LanguageTag/system paper/config services are unverified. All existing mapped/local-only classifications/statuses and deliberate browser recovery/autosave/open/save policies remain unchanged. Quality review and final clean status follow. Goal stays active.
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

Command: current related Vitest argv in output/playwright/writer-paper/coverage-command.json (run from apps/office), plus delta-command.json and node output/playwright/writer-paper/audit-incremental-coverage.mjs.
Result: pass for all test cases and strict changed-responsibility audit. Evidence: current44 related files494 cases; final6 files133 cases. Raw partial profiles exit1 at unchanged global100 thresholds: current S88.21/B82.30/F90.21/L89.68, delta S75.98/B67.35/F79.89/L78.50. The audit requires exact baseline SHA, identical maps for profile merging and unchanged full source spans at git-diff-corresponding locations for historical carry; changed/new spans have only fresh counters. All10 executable changed application owners pass S891/B729/F184/L814=100, zero missing. Two native forwarding headers have no executable counters. No threshold, counter, ignore annotation or source default was weakened.
Scope: original paper86 values/first-match fitting/physical rounding,37Std and35Draw list contracts, CUI Reset/manual/select/orientation/margin/range and FillItemSet acceptance, locale paper/measurement independence, physical core geometry/layout, actual UI/preview/history/graph/ODT/filter consumers.

Command: npm run test:writer -- src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterPageLayout.test.tsx; npm run test:shared -- src/cui/source/tabpages/native-paper-page.test.ts; node_modules/.bin/vitest run scripts/native-paper-boundary.test.ts scripts/native-escapement-boundary.test.ts scripts/check-module-boundaries-text-effects.test.ts.
Result: pass. Evidence:18 Writer acceptance/layout cases,9 CUI cases,21 tooling cases; final focused/related profiles include current source acceptance. Scope: actual dialog acceptance rather than preview, native margin casts, exact boundary admissions and retained neighbor rejection.

Command: npm run build; node_modules/.bin/playwright test --config output/playwright/writer-paper/playwright.config.ts --project=writer --project=shared writer-native-paper.spec.ts writer-paper-formats.spec.ts writer-measurement-preferences.spec.ts shared/paper-geometry.spec.ts; node scripts/check-static-build.mjs.
Result: pass. Evidence:9 Chromium scenarios at1280/390 and DOM-free Worker; source37 options, A3/Legal/DL Envelope/User/manual recognition, oriented physical dimensions, actual menus/metric controls/Undo/Redo/download/normal ODT reopen and persisted measurement preferences. Desktop/mobile screenshots inspected; dialogs fit both widths. Static relative assets/two JS bundles/no backend pass. Existing large-bundle build advisory remains. Scope: current browser UI/core/I/O connections; no compiled native UI/printer/config provider claim.

Command: npm run typecheck; scoped node_modules/.bin/eslint --max-warnings0 over changed TS/TSX/MJS; scoped node_modules/.bin/prettier --check over intentional changed paths; npm run check:docs; npm run check:dependencies; npm run check:writer-resources; npm run inventory:invariants:write; npm run inventory:invariants; npm run inventory:parity; npm run check:source-provenance; npm run check:source-tree; npm run check:file-size; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass. Evidence: final-gates.json all15 exit0; source provenance1117 runtime modules, source-tree115 required/32 retired, four generated invariant views. Scope: current task source, exact field/unit/host-locale boundary edges and canonical paired runtime/provenance records without status promotion. Full suite intentionally not scheduled: sixth task since ACR55N; user requested full run once per10 tasks. Final tracked-state evidence is recorded after source/quality/closure commits. Goal remains active by latest user instruction.

## Rollback Plan

Revert only this task source commits and preserve preceding Writer/table/character work and traceability. No reset/merge/external writes.

## Findings

Previous task RXH8BN completed as80efc0967b8c; this task is the sixth since full checkpointACR55N. Broad mutation and continuation approval persists; all prior stop requests are revoked. Work is confined to writer checkout/branch and pinned local sources9bc445578031fecf56086729d8e4940c77e14d65; no network/merge/push/new branch/worktree. Accidental harmless CLI role output was briefly redirected outside the checkout early in preflight, immediately deleted without reading external/global files; all subsequent artifacts are inside writer.

Removed synthetic WriterPaperFormat/paperFormat/two-name paper table, redundant UI orientation helper, A4-only floor and misplaced10mm/backend90720 UI constraints. Actual PaperInfo/SvxPaperInfo now supply physical values; country paper and locale measurement are independent (Canada Letter with metric margins). Real Std37 and Draw35 catalogs/list semantics live at original owners. Consumed source CUI owns Reset/selection/manual/orientation/ranges/larger-side correction and source1mm MINBODY57. Installed Common.xcs supplies600cm paper and9999mm margin defaults through a browser resource adapter; no Components/provider/printer stand-in. Page core carries only eight physical/name fields; ODT/graph/layout preserve them.

Source reinspection found native FillItemSet differs from preview: USER checks dimensions/paper/orientation; known paper checks only paper/orientation and emits canonical size; unchanged Reset snapshots preserve original physical items. Changed margins narrow uint16 independently. These are preserved, with native-owner and actual React acceptance tests. Suspected issues WRITER054/055/056 document source evidence, uncertainty and preservation, not confirmed compiled native application bugs.

Resolved verification observations: removed string/table/helper APIs required physical-value test migration; A4 frame literals9637/14569 changed to source integer9638/14570. Independent new paper oracle originally assumed duplicate45 instead of first24 and a different sloppy tolerance; source inspection proved original first-match and strict44mm100 boundary, so independent expectations were corrected without product/threshold change. Static-only SvxPaperInfo has one justified architecture-preserving no-extraneous-class exception. New exact Paper/unit/prepared-host-field module edges have positive and neighboring-negative tests; no blanket module permission/cycle relaxation. Earlier partial coverage left branches uncovered; added source acceptance/cast/portrait-landscape and missing installed-schema scenarios, then strict exact-span audit passes100. Raw partial coverage threshold failures are retained and explained, not reported as ordinary Vitest exit0.

Limits: body-only CUI profile excludes header/footer/borders/gutter/printer/full style/config overrides, font/device nonphysical conversion, repeated native Apply scheduling and extreme contradictory widget/printer states. Native LanguageTag/system paper/config services are unverified. All existing mapped/local-only classifications/statuses and deliberate browser recovery/autosave/open/save policies remain unchanged. Quality review and final clean status follow. Goal stays active.
