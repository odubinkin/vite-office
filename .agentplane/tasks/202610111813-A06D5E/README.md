---
id: "202610111813-A06D5E"
title: "Reuse original formatted frames for browser cursor lines"
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
  updated_at: "2026-10-11T18:15:06.190Z"
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
    body: "Start: Reuse actual body formatter clients for browser line movement, retaining native paragraph cache/root/master/follow ownership and correcting only the two prior duplicate-client destruction expectations. Goal authorizes this local parity correction; all tests run once without three upstream references."
events:
  -
    type: "status"
    at: "2026-10-11T18:15:06.650Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Reuse actual body formatter clients for browser line movement, retaining native paragraph cache/root/master/follow ownership and correcting only the two prior duplicate-client destruction expectations. Goal authorizes this local parity correction; all tests run once without three upstream references."
doc_version: 3
doc_updated_at: "2026-10-11T18:15:06.650Z"
doc_updated_by: "CODER"
description: "Correction3 since full checkpoint A77JR3. Remove duplicated body SwTextFrame clients during mounted Home/End publication: update actual formatted native paragraph caches through source SetPara, preserve original root/node/master/follow identity and reject stale body fragment spans. Keep native construction for genuinely unformatted nodes and explicit measurement freshness guards. Add core/React/browser evidence, narrowly update the old React assertion that encoded duplicate-client destruction, preserve all other acceptance and historical inventory. No full checkpoint; stop after next full run and repair failures before pause."
sections:
  Summary: "Reuse actual formatted body text frames when browser cursor measurements refresh native paragraph lines. Eliminate duplicate registered body clients and preserve master/follow links; original SetPara replaces the native paragraph cache and returns its previous owner."
  Scope: "Production: apps/office/src/sw/source/core/text/txtfrm.ts and sw/source/core/layout/newfrm.ts. Fresh core, React and Chromium tests: native-formatted-cursor-frame-reuse.test.ts, browser/editor/native-formatted-cursor-frame-reuse.test.tsx, e2e/writer-native-formatted-cursor-frame-reuse.spec.ts. Narrowly change two IsInDtor expectations in existing browser/editor/native-cursor-frame-chain.test.tsx from true to false, because original body frame identities now survive repeated line movements. No other old acceptance edits. Append-only runtime/provenance records for txtfrm.ts/newfrm.ts (four files), current task and parent evidence. Registered recovery/open/save deviations unchanged; no new native or upstream source artifacts."
  Plan: "1. Port actual SwTextFrame::SetPara old-cache return/null replacement and extract the existing measured-line-to-native-ParaPortion builder once. 2. SetCursorTextFrames reuses original snapshot body fragments with matching source spans and refreshes their native cache; stale/mismatched body spans produce no duplicate client. Unformatted nodes still construct native clients. Release only owned standalone cursor clients; borrowed body aliases must not be destroyed or re-linked. Reject disposed measured aliases and deduplicate root teardown. 3. Verify native cache identity, original registered frame counts/root/follows, body/cell publication, stale spans/text/document, geometry reflow and actual React/Chromium repeated Home/End editing/history. 4. Update inventory/evidence and close exact same-agent non-independent reviewed semantic commit; leave goal active until next full checkpoint."
  Verify Steps: |-
    1. Inspect pinned txtcache.cxx SetPara and txtfrm.hxx actual cache/root/client contracts; source files are read-only references, never runtime imports. Test actual native cache old-owner return, undefined clearing and identity.
    2. With LibreOffice/mdds/ICU links physically absent, run related/new Vitest and complete changed-module Istanbul100 (both production files), fresh actual native/React tests and relevant existing browser tests plus fresh Chromium behavior; run format/lint/TS7/dependencies/JSDoc/file-size/build/static/tooling. Restore all links in finally; do not edit sources/tests/references while a producer is live. No full checkpoint for correction3.
    3. Verify current raw map IDs/locations and nonnegative integer counters, all four metrics100 and exact source hashes. Every old acceptance file stays byte-identical except precisely two old React IsInDtor expectations required by native original-frame reuse; record this causal semantic correction and preserve the rest of that file exactly. Preserve old canonical scalar/default/status/classification/evidence/history prefixes.
    4. After restoration, run source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff gates. Ensure only approved paths, pin and links unchanged, no upstream/source helpers/Python/log/maps in AgentPlane.
    5. Record verification and non-independent evaluator review tied to exact semantic SHA; finish clean writer. Full run cadence remains once per10tasks; latest user stop rule is pause after next full run, fixing any failures first.
  Verification: "Pending implementation and upstream-absent evidence. No completion claim."
  Rollback Plan: "Revert the task-scoped semantic implementation commit and its canonical/test changes; do not rewrite history or registered user deviations. Preserve failure evidence in ignored cache."
  Findings: "Previous goal turn completed taskR760SH and changed authoritative code/inventory/evidence with verified ownership coverage. Current audit confirms page formatting and cursor publication duplicate body SwTextFrame clients. The old React assertion explicitly encoded destruction on every key movement, contrary to retaining native formatted frame identity. This task fixes that runtime ownership and adjusts only those causal expectations. The separate measured-availability registry, unformatted cell layout and full native geometry query integration remain explicitly outside this atomic correction; no broad parity promotion."
id_source: "generated"
---
## Summary

Reuse actual formatted body text frames when browser cursor measurements refresh native paragraph lines. Eliminate duplicate registered body clients and preserve master/follow links; original SetPara replaces the native paragraph cache and returns its previous owner.

## Scope

Production: apps/office/src/sw/source/core/text/txtfrm.ts and sw/source/core/layout/newfrm.ts. Fresh core, React and Chromium tests: native-formatted-cursor-frame-reuse.test.ts, browser/editor/native-formatted-cursor-frame-reuse.test.tsx, e2e/writer-native-formatted-cursor-frame-reuse.spec.ts. Narrowly change two IsInDtor expectations in existing browser/editor/native-cursor-frame-chain.test.tsx from true to false, because original body frame identities now survive repeated line movements. No other old acceptance edits. Append-only runtime/provenance records for txtfrm.ts/newfrm.ts (four files), current task and parent evidence. Registered recovery/open/save deviations unchanged; no new native or upstream source artifacts.

## Plan

1. Port actual SwTextFrame::SetPara old-cache return/null replacement and extract the existing measured-line-to-native-ParaPortion builder once. 2. SetCursorTextFrames reuses original snapshot body fragments with matching source spans and refreshes their native cache; stale/mismatched body spans produce no duplicate client. Unformatted nodes still construct native clients. Release only owned standalone cursor clients; borrowed body aliases must not be destroyed or re-linked. Reject disposed measured aliases and deduplicate root teardown. 3. Verify native cache identity, original registered frame counts/root/follows, body/cell publication, stale spans/text/document, geometry reflow and actual React/Chromium repeated Home/End editing/history. 4. Update inventory/evidence and close exact same-agent non-independent reviewed semantic commit; leave goal active until next full checkpoint.

## Verify Steps

1. Inspect pinned txtcache.cxx SetPara and txtfrm.hxx actual cache/root/client contracts; source files are read-only references, never runtime imports. Test actual native cache old-owner return, undefined clearing and identity.
2. With LibreOffice/mdds/ICU links physically absent, run related/new Vitest and complete changed-module Istanbul100 (both production files), fresh actual native/React tests and relevant existing browser tests plus fresh Chromium behavior; run format/lint/TS7/dependencies/JSDoc/file-size/build/static/tooling. Restore all links in finally; do not edit sources/tests/references while a producer is live. No full checkpoint for correction3.
3. Verify current raw map IDs/locations and nonnegative integer counters, all four metrics100 and exact source hashes. Every old acceptance file stays byte-identical except precisely two old React IsInDtor expectations required by native original-frame reuse; record this causal semantic correction and preserve the rest of that file exactly. Preserve old canonical scalar/default/status/classification/evidence/history prefixes.
4. After restoration, run source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff gates. Ensure only approved paths, pin and links unchanged, no upstream/source helpers/Python/log/maps in AgentPlane.
5. Record verification and non-independent evaluator review tied to exact semantic SHA; finish clean writer. Full run cadence remains once per10tasks; latest user stop rule is pause after next full run, fixing any failures first.

## Verification

Pending implementation and upstream-absent evidence. No completion claim.

## Rollback Plan

Revert the task-scoped semantic implementation commit and its canonical/test changes; do not rewrite history or registered user deviations. Preserve failure evidence in ignored cache.

## Findings

Previous goal turn completed taskR760SH and changed authoritative code/inventory/evidence with verified ownership coverage. Current audit confirms page formatting and cursor publication duplicate body SwTextFrame clients. The old React assertion explicitly encoded destruction on every key movement, contrary to retaining native formatted frame identity. This task fixes that runtime ownership and adjusts only those causal expectations. The separate measured-availability registry, unformatted cell layout and full native geometry query integration remain explicitly outside this atomic correction; no broad parity promotion.
