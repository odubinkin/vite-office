---
id: "202610131634-4VSZVA"
title: "Borrow original native table frames for border painting"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-13T16:37:25.214Z"
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
    body: "Start: source SwTabFramePainter const SwTabFrame/mrTabFrame and actual linked lowers replace duplicate model-driven frame graph. Renderer borrows existing owner, exact3old API fixtures retain literals/lifetime, whole2modules100four and cadence8/10."
events:
  -
    type: "status"
    at: "2026-10-13T16:37:26.957Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: source SwTabFramePainter const SwTabFrame/mrTabFrame and actual linked lowers replace duplicate model-driven frame graph. Renderer borrows existing owner, exact3old API fixtures retain literals/lifetime, whole2modules100four and cadence8/10."
doc_version: 3
doc_updated_at: "2026-10-13T16:37:26.957Z"
doc_updated_by: "CODER"
description: "Align SwTabFramePainter constructor with pinned const SwTabFrame reference and actual linked row/cell ownership; remove duplicate temporary row/cell graph during existing React table paint. Original constructor API caller fixtures, native/mounted/Chromium evidence and whole2modules100four; preserve border outputs/defaults/history/registered deviations. Correction8/10."
sections:
  Summary: "Use the original native table layout hierarchy for existing collapsing-border paint."
  Scope: "Production2: sw/source/core/layout/paintfrm.ts and sw/browser/editor/WriterEditableTable.tsx. Append their4canonical runtime/provenance records. Fresh3: sw/source/core/layout/native-painter-frame-borrow.test.ts, sw/browser/editor/native-painter-frame-borrow.test.tsx, e2e/writer-native-painter-frame-borrow.spec.ts. API caller migration only in native-collapsing-border-painter.test.ts, native-table-coverage-closure.test.ts and native-cell-format-client.test.tsx: construct/own/destroy actual SwTabFrames and pass them instead of SwTable. Required SwTabFrame/afterEach/type imports and frame-lifetime fixtures are allowed; every original numeric/enum/coordinate/color/arbitration/output assertion unchanged, except native caller-frame listener baseline now includes the caller-owned graph and resets after its release. All other old files/cases/import/helper/data bytes retained. No compatibility overload/wrapper/new runtime module, interval/arbitration/default/source geometry/IO/recovery changes. Task/parent evidence."
  Plan: "Native const-frame constructor contract: retain original mrTabFrame reference and traverse its actual linked row/cell lowers, borrowing current native frame formats. Preserve existing represented flat model-index grid coordinates, Style copy/mirror/line arbitration and independent paint snapshots. WriterEditableTable passes its already-owned nativeTable; existing try/finally releases it after paint/render success or failure. Painter does not create/dispose/register table/row/cell frames, no new lifecycle cache/state registry/adaptor. Migrate all existing constructor callers to actual owned frames; tests release those owners and preserve literal outputs. Standing user goal/native-JS principle authorizes safe local scope/internal approval; no separate task for refs/dependencies."
  Verify Steps: "Genuine red with original SwDoc/SwTable/SwTabFrame/SwRowFrame/SwCellFrame and real native item formats. Painter accepts actual original table frame, borrows existing linked cells/registration/format identity, creates or destroys no frame clients on construction/PaintLines/Insert failure; actual detached or partial lower chains determine painted cells rather than rebuilding model rows. Caller controls hierarchy release. Preserve literal four-edge/two-by-two coordinates/outer flags, line colors/widths/mirroring/ties/splitting and snapshot copy independence. Mounted actual WriterEditableTable painter sees one already-owned hierarchy (no duplicate row/cell clients) and finally releases it after ordinary render or missing projection/paint failures; source native attribute/history path and repeated tables/headlines/fixed rows remain. Real Chromium1280/390 native table borders/collapsing-vs-separate/history/edit/column-row drag regressions. Whole2original production modules actual current-source Istanbul100allfour/positive original IDs/locations/counters, no provider/exclusion/normalization/threshold changes. Fresh/related/tooling/TS7/scoped format/full lint/docs/size/deps/build/static producers4LO/mdds/ICU/boost references physically hidden and exact lstat finally restore; no source/test/ref mutation during live producers. Final9restored-only metadata source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff;4canonical old prefixes/scalars/status/default/classes preserved. Exact caller-only migration3oldfiles, original literal acceptance assertions preserved, all other oldtests byte-identical. Exact semanticSHA same-agent non-independent EVALUATOR review, clean direct close. No upstream/helpers/rawmaps/Python source copies in Agentplane/network/publication. Cadence8/10, full once10 then pause after next full+repairs."
  Verification: "Pending genuine red, native borrowed-frame identity, mounted rendering and current-source checks."
  Rollback Plan: "Revert only scoped semantic commit if required; preserve user history. Native caller owns/destroys original frame in finally, painter borrows only. Exact4ignored reference links restored finally through lstat, no target/source copies/network/global files/publication/history rewrite."
  Findings: "Previous goal turn made verified progress: J4GV99 DONE at f663330d, reviewed semantic04fc280a; authoritative clean writer state. Pin9bc445578031fecf56086729d8e4940c77e14d65 source SwTabFramePainter(const SwTabFrame&) initializes mrTabFrame and HandleFrame walks existing actual layout lowers, excluding nested tabframes. Current port instead takes SwTable and allocates/destructs SwRowFrame/SwCellFrame for each paint despite renderer already owning a complete SwTabFrame. This duplicate client graph is an unnecessary legacy mechanism, not an intentional upstream deviation. Remove it with source-shaped ownership/API. Real physical frame geometry/paint area/root/page/master/follow/rowspan/nested/RTL/vertical/Word ends/junctions/primitives/full layout and complete core/UI parity remain unverified; represented flat grid adaptation is retained, no broad promotion. Protected browser Space and registered save/open/recovery/settings exceptions unchanged. No suspicious core upstream logic identified in this ownership path."
id_source: "generated"
---
## Summary

Use the original native table layout hierarchy for existing collapsing-border paint.

## Scope

Production2: sw/source/core/layout/paintfrm.ts and sw/browser/editor/WriterEditableTable.tsx. Append their4canonical runtime/provenance records. Fresh3: sw/source/core/layout/native-painter-frame-borrow.test.ts, sw/browser/editor/native-painter-frame-borrow.test.tsx, e2e/writer-native-painter-frame-borrow.spec.ts. API caller migration only in native-collapsing-border-painter.test.ts, native-table-coverage-closure.test.ts and native-cell-format-client.test.tsx: construct/own/destroy actual SwTabFrames and pass them instead of SwTable. Required SwTabFrame/afterEach/type imports and frame-lifetime fixtures are allowed; every original numeric/enum/coordinate/color/arbitration/output assertion unchanged, except native caller-frame listener baseline now includes the caller-owned graph and resets after its release. All other old files/cases/import/helper/data bytes retained. No compatibility overload/wrapper/new runtime module, interval/arbitration/default/source geometry/IO/recovery changes. Task/parent evidence.

## Plan

Native const-frame constructor contract: retain original mrTabFrame reference and traverse its actual linked row/cell lowers, borrowing current native frame formats. Preserve existing represented flat model-index grid coordinates, Style copy/mirror/line arbitration and independent paint snapshots. WriterEditableTable passes its already-owned nativeTable; existing try/finally releases it after paint/render success or failure. Painter does not create/dispose/register table/row/cell frames, no new lifecycle cache/state registry/adaptor. Migrate all existing constructor callers to actual owned frames; tests release those owners and preserve literal outputs. Standing user goal/native-JS principle authorizes safe local scope/internal approval; no separate task for refs/dependencies.

## Verify Steps

Genuine red with original SwDoc/SwTable/SwTabFrame/SwRowFrame/SwCellFrame and real native item formats. Painter accepts actual original table frame, borrows existing linked cells/registration/format identity, creates or destroys no frame clients on construction/PaintLines/Insert failure; actual detached or partial lower chains determine painted cells rather than rebuilding model rows. Caller controls hierarchy release. Preserve literal four-edge/two-by-two coordinates/outer flags, line colors/widths/mirroring/ties/splitting and snapshot copy independence. Mounted actual WriterEditableTable painter sees one already-owned hierarchy (no duplicate row/cell clients) and finally releases it after ordinary render or missing projection/paint failures; source native attribute/history path and repeated tables/headlines/fixed rows remain. Real Chromium1280/390 native table borders/collapsing-vs-separate/history/edit/column-row drag regressions. Whole2original production modules actual current-source Istanbul100allfour/positive original IDs/locations/counters, no provider/exclusion/normalization/threshold changes. Fresh/related/tooling/TS7/scoped format/full lint/docs/size/deps/build/static producers4LO/mdds/ICU/boost references physically hidden and exact lstat finally restore; no source/test/ref mutation during live producers. Final9restored-only metadata source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff;4canonical old prefixes/scalars/status/default/classes preserved. Exact caller-only migration3oldfiles, original literal acceptance assertions preserved, all other oldtests byte-identical. Exact semanticSHA same-agent non-independent EVALUATOR review, clean direct close. No upstream/helpers/rawmaps/Python source copies in Agentplane/network/publication. Cadence8/10, full once10 then pause after next full+repairs.

## Verification

Pending genuine red, native borrowed-frame identity, mounted rendering and current-source checks.

## Rollback Plan

Revert only scoped semantic commit if required; preserve user history. Native caller owns/destroys original frame in finally, painter borrows only. Exact4ignored reference links restored finally through lstat, no target/source copies/network/global files/publication/history rewrite.

## Findings

Previous goal turn made verified progress: J4GV99 DONE at f663330d, reviewed semantic04fc280a; authoritative clean writer state. Pin9bc445578031fecf56086729d8e4940c77e14d65 source SwTabFramePainter(const SwTabFrame&) initializes mrTabFrame and HandleFrame walks existing actual layout lowers, excluding nested tabframes. Current port instead takes SwTable and allocates/destructs SwRowFrame/SwCellFrame for each paint despite renderer already owning a complete SwTabFrame. This duplicate client graph is an unnecessary legacy mechanism, not an intentional upstream deviation. Remove it with source-shaped ownership/API. Real physical frame geometry/paint area/root/page/master/follow/rowspan/nested/RTL/vertical/Word ends/junctions/primitives/full layout and complete core/UI parity remain unverified; represented flat grid adaptation is retained, no broad promotion. Protected browser Space and registered save/open/recovery/settings exceptions unchanged. No suspicious core upstream logic identified in this ownership path.
