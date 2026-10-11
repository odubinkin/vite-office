---
id: "202610111735-R760SH"
title: "Restore native frame-area geometry ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
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
doc_updated_at: "2026-10-11T18:04:36.885Z"
doc_updated_by: "CODER"
description: "Correction2 after full checkpoint: replace SwFrame-owned validity booleans with original SwFrameAreaDefinition composition and native area/print rectangles, frame IDs and scoped original write accesses. Port represented Point/Size/SwRect ownership and literal geometry, record source empty-rectangle containment without fixing it. Preserve original frame APIs/clients, inventory history and registered IO deviations; geometric lookup integration remains subsequent work."
sections:
  Summary: "Restore original SwFrameAreaDefinition geometry ownership and remove direct duplicate validity storage from SwFrame. Correction2 following full checkpoint and accepted QJTZN0 native content-node query. Previous goal turn was completed progress, exact semanticb682d0ff/close180e855b. Broad goal remains active."
  Scope: |-
    Four production files: new tools/inc/gen.ts, sw/inc/swrect.ts, sw/source/core/inc/frame.ts and existing sw/source/core/layout/wsfrm.ts. Fresh native geometry/frame-area tests, corresponding eight canonical runtime/provenance records (six new,two existing), WRITER-006 in docs/program/writer-upstream-suspected-issues.md and parent/task evidence. Preserve all old acceptance files, semantic/default/classification/history fields and registered recovery/open/save/settings differences. No query/formatter/DOM geometry integration, old cursor registry changes, Calc code or network.

    Necessary native tools owner registration also touches scripts/check-module-boundaries.mjs and one fresh scripts/native-tools-ownership.test.ts. Register only the source-proven tools owner and sw-to-tools edge; prohibit reverse/application/browser dependencies. No previous acceptance file edited.
  Plan: "Port original represented Point/Size class ownership and SwRect value semantics including integer native edges, copy/rectangle ownership, empty/negative geometry and containment. Introduce actual SwFrameAreaDefinition with native empty rectangles, validity defaults, original process uint32 postincrement ID and copy-on-scope-release FrameAreaWriteAccess/FramePrintAreaWriteAccess. Use composition for C++ multiple inheritance while retaining current SwFrame APIs and original clients; remove the three direct booleans and delegate their owners. Test original root/text/table/row/cell frame component identity, validity and writeback isolation, literal native rectangle values, copy/print-relative geometry and unchanged object ownership. Preserve source questionable zero-area containment and append observed initialized example. Record canonical boundaries explicitly, validate related tests/whole four-module100 maps with three references absent, then metadata gates restored. Commit exact semantic result, same-agent non-independent review, clean finish. Native transforms/Calc/page geometry/client iteration/UI query remain unported; no whole parity promotion."
  Verify Steps: |-
    1. Inspect pinned tools/gen.hxx, swrect.hxx, frame.hxx and wsfrm/newfrm.cxx constructors/write-access/validity/ID definitions. Native point/size/rectangle API/value and original validity ownership must be retained; WRITER-006 reproduces zero-area containment without normalization.
    2. With LibreOffice/mdds/ICU links physically absent run format/lint/TS7/dependencies/JSDoc/file-size/build/current-static, related Vitest for four changed modules with whole-file Istanbul100 in lines/statements/functions/branches, fresh actual native geometry/owner cases and source-independent ownership/provenance/resource tooling cases with new tools-owner allowlist/ownership acceptance; dependency-checker algorithm is unchanged. Restore references in finally; never edit sources/tests/ref links while producer live. No full checkpoint for correction2.
    3. Inspect complete current raw maps/IDs/locations/nonnegative integer counters and original source hashes; all four whole modules100, all related/new assertions pass with zero skipped acceptance, every old acceptance file byte-identical and canonical old scalar/evidence/history prefixes unchanged. Fresh fixtures must use actual native owners and integer literal source contracts; no mapped-copy model or counter adjustment.
    4. After restoration run9metadata gates: source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor/diff. Confirm reference targets and pin unchanged, only approved paths changed, no upstream/helpers/Python/raw maps/logs in AgentPlane.
    5. Record English evidence/Findings and exact semantic same-agent non-independent quality review; finish clean writer and leave broad goal active.
  Verification: |-
    Command: upstream-absent static/related/tooling command arrays in apps/office/node_modules/.cache/parity-coverage/R760SH/commands.json, preflight-commands.json, repair-commands.json and final-size-commands.json; source-only audit command arrays in audit-commands.json/audit-repair-commands.json/audit-final-commands.json.
    Result: pass after bounded declaration/comment and canonical-witness repairs.
    Evidence:14030 related cases/510files plus26 tooling cases/5files =14056 unique cases, zero failed/pending.35fresh cases use actual Point/Size/SwRect, native area scopes and original root/text/table/row/cell clients, plus source ownership constraints. Four complete current production modules have100% lines280/280, statements306/306, functions114/114 and branches196/196.616raw positive safe-integer counters; map SHA256 23de3b2a0d4e5a548346630a6078b418187a25ae02bfcb16f28c6f396d96b526; source hashes, map-ID/line/finite-column checks and explicit remapper conventions are recorded in ignored proof.json.598unbounded end columns and44implicit else locations retain original raw representations; no counter/map edits. All864prior acceptance files byte-identical;2809prior non-AgentPlane paths audited, only5approved existing paths changed; old canonical scalar/default/status/classification/array/evidence/text prefixes retained.
    Scope: actual frame-area base ownership and represented geometry contracts, replacing original misplaced validity storage. Native shared tools ownership registration adds only tools module, empty outbound allowlist and source-proven sw-to-tools edge; fresh test rejects reverse/application/browser edges. Runtime symbol records name genuine class/method declarations; nested helper/property evidence remains in provenance without weakening declaration validators. Inventory:6new runtime/provenance records and2append-only wsfrm records, broad statuses/defaults remain unverified. WRITER-006 preserves original empty-area containment.
    All runtime/static/build/test runs hide LibreOffice/mdds/ICU links physically and restore original targets in finally. Source pin 9bc445578031fecf56086729d8e4940c77e14d65 and original five-file source hashes retained.9metadata gates pass: source-tree/provenance/registry/resource-generation/invariants/parity/routing/doctor/diff. Source-dependent audits execute after restoration only; no runtime reads/executes pinned upstream. No upstream/helper/Python/log/raw-map files in AgentPlane.
    Residual: finite JavaScript exact-range geometry only; complete native tools/SwRect operators, transforms, full layout geometry, formatter/query/client unification, measured browser cursor registry and UI integration remain pending. This is a substrate refactor, not a completed UI geometry port. Same-agent evaluator review is non-independent. No full checkpoint for correction2; the broad goal remains active and must pause after the next full checkpoint only after correcting any failures.
  Rollback Plan: "Use a separately approved corrective task to revert the semantic source/inventory/document changes if needed. Restore all three original ignored source-reference link names and targets in finally. No network or reference execution."
  Findings: |-
    Clean authoritative baselinewriter180e855b. Actual frame area ownership in frame.hxx includes two SwRects, ID andthreevalidity flags, with scoped native by-value writeback in wsfrm.cxx. Current SwFrame fields claim only bounded validity, not native geometry owner. Composition will represent source multiple inheritance without changing original SwClient identity or introducing an index/model copy. Source Contains(Point) admits an empty rectangle origin despite IsEmpty; preserve and document unconfirmed observation. Read-only discovery of absent src/tools and core/inc directories was rerouted before mutation; new native directories are intentional source-shaped declarations. No gateway user-instructions found. Original query/UI measured registry/geometry/Calc responsibilities remain incomplete.

    - Observation: Initial source-independent static preflight found constructor-overload lint, readonly return typing and overload JSDoc defects; source audits later found insufficient SwRect method witnesses and a declaration-inventory limit for class-expression/property names.
      Impact: No production behavior test failed. Metadata and static gates were initially incomplete; runtime reports remain valid at unchanged final production bytes.
      Resolution: Repair only fresh declarations/comments and canonical witnesses. Lint/TS7/JSDoc then pass; 14030 related and26 tooling cases pass once, all four complete modules100. Provenance uses actual methods and nested helper evidence without weakening validators. Retain initial raw logs in ignored cache; do not replay passing acceptance.

    - Observation: Native frame validity was stored directly in SwFrame and represented frames lacked their original area-definition owner. Upstream SwRect empty containment and Size/SwRect negative-size emptiness are unusual but defined.
      Impact: Original area/print scope, identity and geometry contracts were unavailable to future direct frame-query/UI integration; normalizing the unusual contracts would diverge from pinned source.
      Resolution: Compose original SwFrameAreaDefinition into all real frames; port shared Point/Size and SwRect values/scoped native writes with full changed-app-module Istanbul100 and35fresh scenarios. Record WRITER-006, preserve registration/defaults and all prior acceptance. Full browser geometry/query integration and complete native operators/transforms remain explicitly unverified.
id_source: "generated"
---
## Summary

Restore original SwFrameAreaDefinition geometry ownership and remove direct duplicate validity storage from SwFrame. Correction2 following full checkpoint and accepted QJTZN0 native content-node query. Previous goal turn was completed progress, exact semanticb682d0ff/close180e855b. Broad goal remains active.

## Scope

Four production files: new tools/inc/gen.ts, sw/inc/swrect.ts, sw/source/core/inc/frame.ts and existing sw/source/core/layout/wsfrm.ts. Fresh native geometry/frame-area tests, corresponding eight canonical runtime/provenance records (six new,two existing), WRITER-006 in docs/program/writer-upstream-suspected-issues.md and parent/task evidence. Preserve all old acceptance files, semantic/default/classification/history fields and registered recovery/open/save/settings differences. No query/formatter/DOM geometry integration, old cursor registry changes, Calc code or network.

Necessary native tools owner registration also touches scripts/check-module-boundaries.mjs and one fresh scripts/native-tools-ownership.test.ts. Register only the source-proven tools owner and sw-to-tools edge; prohibit reverse/application/browser dependencies. No previous acceptance file edited.

## Plan

Port original represented Point/Size class ownership and SwRect value semantics including integer native edges, copy/rectangle ownership, empty/negative geometry and containment. Introduce actual SwFrameAreaDefinition with native empty rectangles, validity defaults, original process uint32 postincrement ID and copy-on-scope-release FrameAreaWriteAccess/FramePrintAreaWriteAccess. Use composition for C++ multiple inheritance while retaining current SwFrame APIs and original clients; remove the three direct booleans and delegate their owners. Test original root/text/table/row/cell frame component identity, validity and writeback isolation, literal native rectangle values, copy/print-relative geometry and unchanged object ownership. Preserve source questionable zero-area containment and append observed initialized example. Record canonical boundaries explicitly, validate related tests/whole four-module100 maps with three references absent, then metadata gates restored. Commit exact semantic result, same-agent non-independent review, clean finish. Native transforms/Calc/page geometry/client iteration/UI query remain unported; no whole parity promotion.

## Verify Steps

1. Inspect pinned tools/gen.hxx, swrect.hxx, frame.hxx and wsfrm/newfrm.cxx constructors/write-access/validity/ID definitions. Native point/size/rectangle API/value and original validity ownership must be retained; WRITER-006 reproduces zero-area containment without normalization.
2. With LibreOffice/mdds/ICU links physically absent run format/lint/TS7/dependencies/JSDoc/file-size/build/current-static, related Vitest for four changed modules with whole-file Istanbul100 in lines/statements/functions/branches, fresh actual native geometry/owner cases and source-independent ownership/provenance/resource tooling cases with new tools-owner allowlist/ownership acceptance; dependency-checker algorithm is unchanged. Restore references in finally; never edit sources/tests/ref links while producer live. No full checkpoint for correction2.
3. Inspect complete current raw maps/IDs/locations/nonnegative integer counters and original source hashes; all four whole modules100, all related/new assertions pass with zero skipped acceptance, every old acceptance file byte-identical and canonical old scalar/evidence/history prefixes unchanged. Fresh fixtures must use actual native owners and integer literal source contracts; no mapped-copy model or counter adjustment.
4. After restoration run9metadata gates: source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor/diff. Confirm reference targets and pin unchanged, only approved paths changed, no upstream/helpers/Python/raw maps/logs in AgentPlane.
5. Record English evidence/Findings and exact semantic same-agent non-independent quality review; finish clean writer and leave broad goal active.

## Verification

Command: upstream-absent static/related/tooling command arrays in apps/office/node_modules/.cache/parity-coverage/R760SH/commands.json, preflight-commands.json, repair-commands.json and final-size-commands.json; source-only audit command arrays in audit-commands.json/audit-repair-commands.json/audit-final-commands.json.
Result: pass after bounded declaration/comment and canonical-witness repairs.
Evidence:14030 related cases/510files plus26 tooling cases/5files =14056 unique cases, zero failed/pending.35fresh cases use actual Point/Size/SwRect, native area scopes and original root/text/table/row/cell clients, plus source ownership constraints. Four complete current production modules have100% lines280/280, statements306/306, functions114/114 and branches196/196.616raw positive safe-integer counters; map SHA256 23de3b2a0d4e5a548346630a6078b418187a25ae02bfcb16f28c6f396d96b526; source hashes, map-ID/line/finite-column checks and explicit remapper conventions are recorded in ignored proof.json.598unbounded end columns and44implicit else locations retain original raw representations; no counter/map edits. All864prior acceptance files byte-identical;2809prior non-AgentPlane paths audited, only5approved existing paths changed; old canonical scalar/default/status/classification/array/evidence/text prefixes retained.
Scope: actual frame-area base ownership and represented geometry contracts, replacing original misplaced validity storage. Native shared tools ownership registration adds only tools module, empty outbound allowlist and source-proven sw-to-tools edge; fresh test rejects reverse/application/browser edges. Runtime symbol records name genuine class/method declarations; nested helper/property evidence remains in provenance without weakening declaration validators. Inventory:6new runtime/provenance records and2append-only wsfrm records, broad statuses/defaults remain unverified. WRITER-006 preserves original empty-area containment.
All runtime/static/build/test runs hide LibreOffice/mdds/ICU links physically and restore original targets in finally. Source pin 9bc445578031fecf56086729d8e4940c77e14d65 and original five-file source hashes retained.9metadata gates pass: source-tree/provenance/registry/resource-generation/invariants/parity/routing/doctor/diff. Source-dependent audits execute after restoration only; no runtime reads/executes pinned upstream. No upstream/helper/Python/log/raw-map files in AgentPlane.
Residual: finite JavaScript exact-range geometry only; complete native tools/SwRect operators, transforms, full layout geometry, formatter/query/client unification, measured browser cursor registry and UI integration remain pending. This is a substrate refactor, not a completed UI geometry port. Same-agent evaluator review is non-independent. No full checkpoint for correction2; the broad goal remains active and must pause after the next full checkpoint only after correcting any failures.

## Rollback Plan

Use a separately approved corrective task to revert the semantic source/inventory/document changes if needed. Restore all three original ignored source-reference link names and targets in finally. No network or reference execution.

## Findings

Clean authoritative baselinewriter180e855b. Actual frame area ownership in frame.hxx includes two SwRects, ID andthreevalidity flags, with scoped native by-value writeback in wsfrm.cxx. Current SwFrame fields claim only bounded validity, not native geometry owner. Composition will represent source multiple inheritance without changing original SwClient identity or introducing an index/model copy. Source Contains(Point) admits an empty rectangle origin despite IsEmpty; preserve and document unconfirmed observation. Read-only discovery of absent src/tools and core/inc directories was rerouted before mutation; new native directories are intentional source-shaped declarations. No gateway user-instructions found. Original query/UI measured registry/geometry/Calc responsibilities remain incomplete.

- Observation: Initial source-independent static preflight found constructor-overload lint, readonly return typing and overload JSDoc defects; source audits later found insufficient SwRect method witnesses and a declaration-inventory limit for class-expression/property names.
  Impact: No production behavior test failed. Metadata and static gates were initially incomplete; runtime reports remain valid at unchanged final production bytes.
  Resolution: Repair only fresh declarations/comments and canonical witnesses. Lint/TS7/JSDoc then pass; 14030 related and26 tooling cases pass once, all four complete modules100. Provenance uses actual methods and nested helper evidence without weakening validators. Retain initial raw logs in ignored cache; do not replay passing acceptance.

- Observation: Native frame validity was stored directly in SwFrame and represented frames lacked their original area-definition owner. Upstream SwRect empty containment and Size/SwRect negative-size emptiness are unusual but defined.
  Impact: Original area/print scope, identity and geometry contracts were unavailable to future direct frame-query/UI integration; normalizing the unusual contracts would diverge from pinned source.
  Resolution: Compose original SwFrameAreaDefinition into all real frames; port shared Point/Size and SwRect values/scoped native writes with full changed-app-module Istanbul100 and35fresh scenarios. Record WRITER-006, preserve registration/defaults and all prior acceptance. Full browser geometry/query integration and complete native operators/transforms remain explicitly unverified.
