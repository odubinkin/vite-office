---
id: "202610111735-R760SH"
title: "Restore native frame-area geometry ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:36:35.195Z"
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
    body: "Start: restore original frame area/print geometry, validity and scoped writeback owners and remove duplicate SwFrame validity fields, preserve native empty containment and old acceptance/inventory/IO contracts; targeted current four-module100 coverage, correction2."
events:
  -
    type: "status"
    at: "2026-10-11T17:36:44.275Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore original frame area/print geometry, validity and scoped writeback owners and remove duplicate SwFrame validity fields, preserve native empty containment and old acceptance/inventory/IO contracts; targeted current four-module100 coverage, correction2."
doc_version: 3
doc_updated_at: "2026-10-11T17:36:44.275Z"
doc_updated_by: "CODER"
description: "Correction2 after full checkpoint: replace SwFrame-owned validity booleans with original SwFrameAreaDefinition composition and native area/print rectangles, frame IDs and scoped original write accesses. Port represented Point/Size/SwRect ownership and literal geometry, record source empty-rectangle containment without fixing it. Preserve original frame APIs/clients, inventory history and registered IO deviations; geometric lookup integration remains subsequent work."
sections:
  Summary: "Restore original SwFrameAreaDefinition geometry ownership and remove direct duplicate validity storage from SwFrame. Correction2 following full checkpoint and accepted QJTZN0 native content-node query. Previous goal turn was completed progress, exact semanticb682d0ff/close180e855b. Broad goal remains active."
  Scope: "Four production files: new tools/inc/gen.ts, sw/inc/swrect.ts, sw/source/core/inc/frame.ts and existing sw/source/core/layout/wsfrm.ts. Fresh native geometry/frame-area tests, corresponding eight canonical runtime/provenance records (six new,two existing), WRITER-006 in docs/program/writer-upstream-suspected-issues.md and parent/task evidence. Preserve all old acceptance files, semantic/default/classification/history fields and registered recovery/open/save/settings differences. No query/formatter/DOM geometry integration, old cursor registry changes, Calc code or network."
  Plan: "Port original represented Point/Size class ownership and SwRect value semantics including integer native edges, copy/rectangle ownership, empty/negative geometry and containment. Introduce actual SwFrameAreaDefinition with native empty rectangles, validity defaults, original process uint32 postincrement ID and copy-on-scope-release FrameAreaWriteAccess/FramePrintAreaWriteAccess. Use composition for C++ multiple inheritance while retaining current SwFrame APIs and original clients; remove the three direct booleans and delegate their owners. Test original root/text/table/row/cell frame component identity, validity and writeback isolation, literal native rectangle values, copy/print-relative geometry and unchanged object ownership. Preserve source questionable zero-area containment and append observed initialized example. Record canonical boundaries explicitly, validate related tests/whole four-module100 maps with three references absent, then metadata gates restored. Commit exact semantic result, same-agent non-independent review, clean finish. Native transforms/Calc/page geometry/client iteration/UI query remain unported; no whole parity promotion."
  Verify Steps: |-
    1. Inspect pinned tools/gen.hxx, swrect.hxx, frame.hxx and wsfrm/newfrm.cxx constructors/write-access/validity/ID definitions. Native point/size/rectangle API/value and original validity ownership must be retained; WRITER-006 reproduces zero-area containment without normalization.
    2. With LibreOffice/mdds/ICU links physically absent run format/lint/TS7/dependencies/JSDoc/file-size/build/current-static, related Vitest for four changed modules with whole-file Istanbul100 in lines/statements/functions/branches, fresh actual native geometry/owner cases and source-independent ownership/provenance/resource tooling cases. Restore references in finally; never edit sources/tests/ref links while producer live. No full checkpoint for correction2.
    3. Inspect complete current raw maps/IDs/locations/nonnegative integer counters and original source hashes; all four whole modules100, all related/new assertions pass with zero skipped acceptance, every old acceptance file byte-identical and canonical old scalar/evidence/history prefixes unchanged. Fresh fixtures must use actual native owners and integer literal source contracts; no mapped-copy model or counter adjustment.
    4. After restoration run9metadata gates: source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor/diff. Confirm reference targets and pin unchanged, only approved paths changed, no upstream/helpers/Python/raw maps/logs in AgentPlane.
    5. Record English evidence/Findings and exact semantic same-agent non-independent quality review; finish clean writer and leave broad goal active.
  Verification: "Pending production refactor and actual whole-module/current-source targeted verification."
  Rollback Plan: "Use a separately approved corrective task to revert the semantic source/inventory/document changes if needed. Restore all three original ignored source-reference link names and targets in finally. No network or reference execution."
  Findings: "Clean authoritative baselinewriter180e855b. Actual frame area ownership in frame.hxx includes two SwRects, ID andthreevalidity flags, with scoped native by-value writeback in wsfrm.cxx. Current SwFrame fields claim only bounded validity, not native geometry owner. Composition will represent source multiple inheritance without changing original SwClient identity or introducing an index/model copy. Source Contains(Point) admits an empty rectangle origin despite IsEmpty; preserve and document unconfirmed observation. Read-only discovery of absent src/tools and core/inc directories was rerouted before mutation; new native directories are intentional source-shaped declarations. No gateway user-instructions found. Original query/UI measured registry/geometry/Calc responsibilities remain incomplete."
id_source: "generated"
---
## Summary

Restore original SwFrameAreaDefinition geometry ownership and remove direct duplicate validity storage from SwFrame. Correction2 following full checkpoint and accepted QJTZN0 native content-node query. Previous goal turn was completed progress, exact semanticb682d0ff/close180e855b. Broad goal remains active.

## Scope

Four production files: new tools/inc/gen.ts, sw/inc/swrect.ts, sw/source/core/inc/frame.ts and existing sw/source/core/layout/wsfrm.ts. Fresh native geometry/frame-area tests, corresponding eight canonical runtime/provenance records (six new,two existing), WRITER-006 in docs/program/writer-upstream-suspected-issues.md and parent/task evidence. Preserve all old acceptance files, semantic/default/classification/history fields and registered recovery/open/save/settings differences. No query/formatter/DOM geometry integration, old cursor registry changes, Calc code or network.

## Plan

Port original represented Point/Size class ownership and SwRect value semantics including integer native edges, copy/rectangle ownership, empty/negative geometry and containment. Introduce actual SwFrameAreaDefinition with native empty rectangles, validity defaults, original process uint32 postincrement ID and copy-on-scope-release FrameAreaWriteAccess/FramePrintAreaWriteAccess. Use composition for C++ multiple inheritance while retaining current SwFrame APIs and original clients; remove the three direct booleans and delegate their owners. Test original root/text/table/row/cell frame component identity, validity and writeback isolation, literal native rectangle values, copy/print-relative geometry and unchanged object ownership. Preserve source questionable zero-area containment and append observed initialized example. Record canonical boundaries explicitly, validate related tests/whole four-module100 maps with three references absent, then metadata gates restored. Commit exact semantic result, same-agent non-independent review, clean finish. Native transforms/Calc/page geometry/client iteration/UI query remain unported; no whole parity promotion.

## Verify Steps

1. Inspect pinned tools/gen.hxx, swrect.hxx, frame.hxx and wsfrm/newfrm.cxx constructors/write-access/validity/ID definitions. Native point/size/rectangle API/value and original validity ownership must be retained; WRITER-006 reproduces zero-area containment without normalization.
2. With LibreOffice/mdds/ICU links physically absent run format/lint/TS7/dependencies/JSDoc/file-size/build/current-static, related Vitest for four changed modules with whole-file Istanbul100 in lines/statements/functions/branches, fresh actual native geometry/owner cases and source-independent ownership/provenance/resource tooling cases. Restore references in finally; never edit sources/tests/ref links while producer live. No full checkpoint for correction2.
3. Inspect complete current raw maps/IDs/locations/nonnegative integer counters and original source hashes; all four whole modules100, all related/new assertions pass with zero skipped acceptance, every old acceptance file byte-identical and canonical old scalar/evidence/history prefixes unchanged. Fresh fixtures must use actual native owners and integer literal source contracts; no mapped-copy model or counter adjustment.
4. After restoration run9metadata gates: source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor/diff. Confirm reference targets and pin unchanged, only approved paths changed, no upstream/helpers/Python/raw maps/logs in AgentPlane.
5. Record English evidence/Findings and exact semantic same-agent non-independent quality review; finish clean writer and leave broad goal active.

## Verification

Pending production refactor and actual whole-module/current-source targeted verification.

## Rollback Plan

Use a separately approved corrective task to revert the semantic source/inventory/document changes if needed. Restore all three original ignored source-reference link names and targets in finally. No network or reference execution.

## Findings

Clean authoritative baselinewriter180e855b. Actual frame area ownership in frame.hxx includes two SwRects, ID andthreevalidity flags, with scoped native by-value writeback in wsfrm.cxx. Current SwFrame fields claim only bounded validity, not native geometry owner. Composition will represent source multiple inheritance without changing original SwClient identity or introducing an index/model copy. Source Contains(Point) admits an empty rectangle origin despite IsEmpty; preserve and document unconfirmed observation. Read-only discovery of absent src/tools and core/inc directories was rerouted before mutation; new native directories are intentional source-shaped declarations. No gateway user-instructions found. Original query/UI measured registry/geometry/Calc responsibilities remain incomplete.
