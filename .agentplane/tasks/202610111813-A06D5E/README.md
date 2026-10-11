---
id: "202610111813-A06D5E"
title: "Reuse original formatted frames for browser cursor lines"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
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
doc_updated_at: "2026-10-11T18:41:15.743Z"
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
  Verification: |-
    Command: see ignored A06D5E preflight, commands, repair-commands and audit-commands JSON for exact argv; accepted-profile.json and proof.json bind current source bytes to actual unedited raw reports.
    Result: pass. Related scope has7207 accepted scenario instances in309 files: current newfrm repair7182/307 plus25 initial-only scenarios in unchanged native-frame-position-mapping.test.ts/native-paragraph-lines.test.ts (15+10), which do not depend on the repaired root. Root tooling25/4 and Chromium3/3 pass;7235 total accepted scenarios in316 files,9 fresh core/React/Chromium cases,0 failure/pending/skip/flaky/browser errors. The repair-related rerun follows a real root production correction, not a wrapper replay.
    Scope: both complete production modules have actual Istanbul100 lines/statements/functions/branches,406lines444statements79functions381branches,904 strictly positive integer raw counters. Current newfrm map comes from repair-coverage; unchanged txtfrm uses its complete initial related-coverage entry, with identical initial/final source hash explicitly checked. No synthetic merged raw report, map edits, normalization, threshold/config or provider changes. Original IDs and finite locations checked; installed remapper Infinity serializes only unbounded end columns as null;55 implicit second if-branch locations tied to actual source no-else IfStatements. Raw map hashes and six execution input hashes retained.
    Evidence: initial static checks and final format/lint/TS7/JSDoc/file-size/dependencies/build/static pass; initial root tooling25 pass, then final Chromium3 pass after fixing CLI argument order. Every producer ran with all three LO/mdds/ICU references physically absent and restored in finally. All nine restored metadata gates pass: source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff. Reference targets unchanged; pinned LO9bc445578031fecf56086729d8e4940c77e14d65 and five source hashes retained.
    Traceability:2821 existing non-AgentPlane paths inspected; only seven scoped old paths changed. Of867 old acceptance files,866 byte-identical; native-cursor-frame-chain.test.tsx exactly two IsInDtor expectations true-to-false with every other byte unchanged. Four canonical old array/evidence/history/text prefixes, statuses/default/classification/responsibility retained; append-only new facts. Three fresh tests added. No upstream source/helpers/Python/raw maps/logs in AgentPlane artifacts, no runtime imports of refs.
    Failures retained: initial fresh Chromium formatting and project-argument discovery errors repaired; no browser scenario started in failed CLI call. A new-only equal-span ownership regression initially failed (master250 rather than150; six old cases explicitly filtered), then genuine original-occurrence claim fix passed all seven fresh core cases within current root profile. This is a port collision, not a suspected native bug; initialized zero-length occurrences do not certify full native field formatting. Initial and repair logs/maps preserved separately in ignored cache.
    Remaining: measured availability/text-freshness registry, native geometric query/Calc/full paragraph formatter, unformatted cell/table hierarchy and broader parity remain incomplete. Registered recovery/open/save/settings deviations untouched. Correction3/10 after A77JR3; no full run here. Goal remains active; pause after next accepted full run and any required repairs. Same-agent exact semantic SHA review is explicitly non-independent.
  Rollback Plan: "Revert the task-scoped semantic implementation commit and its canonical/test changes; do not rewrite history or registered user deviations. Preserve failure evidence in ignored cache."
  Findings: |-
    Previous goal turn completed taskR760SH and changed authoritative code/inventory/evidence with verified ownership coverage. Current audit confirms page formatting and cursor publication duplicate body SwTextFrame clients. The old React assertion explicitly encoded destruction on every key movement, contrary to retaining native formatted frame identity. This task fixes that runtime ownership and adjusts only those causal expectations. The separate measured-availability registry, unformatted cell layout and full native geometry query integration remain explicitly outside this atomic correction; no broad parity promotion.

    - Observation: Actual duplicate body clients are removed: original formatter frames now serve mounted cursor measurements, preserving native registration, root, ID and master/follow identities. Equal source spans exposed a port occurrence collision in a new red regression.
      Impact: Span-only matching updated the master cache twice, yielding250 rather than150. This initialized native ownership case is not evidence of an upstream bug or complete field formatting. Two old React destructor assertions encoded the adapter lifetime and required precise native-lifetime migration.
      Resolution: Claim each original occurrence once; source SetPara returns old ownership and clears missing input. Current root-related7182 and unchanged txtfrm-only25 accepted, tooling25, Chromium3; both whole modules100all-four/904positive counters.866 other old acceptance files byte-identical, two exact assertion changes, four canonical histories preserved. Nine restored metadata gates pass. Initial CLI/format/red evidence retained; only causal production repair rerun. Broader native query/geometry/table layout remain pending; goalactive correction3/10, pause after next full and repairs.
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

Command: see ignored A06D5E preflight, commands, repair-commands and audit-commands JSON for exact argv; accepted-profile.json and proof.json bind current source bytes to actual unedited raw reports.
Result: pass. Related scope has7207 accepted scenario instances in309 files: current newfrm repair7182/307 plus25 initial-only scenarios in unchanged native-frame-position-mapping.test.ts/native-paragraph-lines.test.ts (15+10), which do not depend on the repaired root. Root tooling25/4 and Chromium3/3 pass;7235 total accepted scenarios in316 files,9 fresh core/React/Chromium cases,0 failure/pending/skip/flaky/browser errors. The repair-related rerun follows a real root production correction, not a wrapper replay.
Scope: both complete production modules have actual Istanbul100 lines/statements/functions/branches,406lines444statements79functions381branches,904 strictly positive integer raw counters. Current newfrm map comes from repair-coverage; unchanged txtfrm uses its complete initial related-coverage entry, with identical initial/final source hash explicitly checked. No synthetic merged raw report, map edits, normalization, threshold/config or provider changes. Original IDs and finite locations checked; installed remapper Infinity serializes only unbounded end columns as null;55 implicit second if-branch locations tied to actual source no-else IfStatements. Raw map hashes and six execution input hashes retained.
Evidence: initial static checks and final format/lint/TS7/JSDoc/file-size/dependencies/build/static pass; initial root tooling25 pass, then final Chromium3 pass after fixing CLI argument order. Every producer ran with all three LO/mdds/ICU references physically absent and restored in finally. All nine restored metadata gates pass: source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff. Reference targets unchanged; pinned LO9bc445578031fecf56086729d8e4940c77e14d65 and five source hashes retained.
Traceability:2821 existing non-AgentPlane paths inspected; only seven scoped old paths changed. Of867 old acceptance files,866 byte-identical; native-cursor-frame-chain.test.tsx exactly two IsInDtor expectations true-to-false with every other byte unchanged. Four canonical old array/evidence/history/text prefixes, statuses/default/classification/responsibility retained; append-only new facts. Three fresh tests added. No upstream source/helpers/Python/raw maps/logs in AgentPlane artifacts, no runtime imports of refs.
Failures retained: initial fresh Chromium formatting and project-argument discovery errors repaired; no browser scenario started in failed CLI call. A new-only equal-span ownership regression initially failed (master250 rather than150; six old cases explicitly filtered), then genuine original-occurrence claim fix passed all seven fresh core cases within current root profile. This is a port collision, not a suspected native bug; initialized zero-length occurrences do not certify full native field formatting. Initial and repair logs/maps preserved separately in ignored cache.
Remaining: measured availability/text-freshness registry, native geometric query/Calc/full paragraph formatter, unformatted cell/table hierarchy and broader parity remain incomplete. Registered recovery/open/save/settings deviations untouched. Correction3/10 after A77JR3; no full run here. Goal remains active; pause after next accepted full run and any required repairs. Same-agent exact semantic SHA review is explicitly non-independent.

## Rollback Plan

Revert the task-scoped semantic implementation commit and its canonical/test changes; do not rewrite history or registered user deviations. Preserve failure evidence in ignored cache.

## Findings

Previous goal turn completed taskR760SH and changed authoritative code/inventory/evidence with verified ownership coverage. Current audit confirms page formatting and cursor publication duplicate body SwTextFrame clients. The old React assertion explicitly encoded destruction on every key movement, contrary to retaining native formatted frame identity. This task fixes that runtime ownership and adjusts only those causal expectations. The separate measured-availability registry, unformatted cell layout and full native geometry query integration remain explicitly outside this atomic correction; no broad parity promotion.

- Observation: Actual duplicate body clients are removed: original formatter frames now serve mounted cursor measurements, preserving native registration, root, ID and master/follow identities. Equal source spans exposed a port occurrence collision in a new red regression.
  Impact: Span-only matching updated the master cache twice, yielding250 rather than150. This initialized native ownership case is not evidence of an upstream bug or complete field formatting. Two old React destructor assertions encoded the adapter lifetime and required precise native-lifetime migration.
  Resolution: Claim each original occurrence once; source SetPara returns old ownership and clears missing input. Current root-related7182 and unchanged txtfrm-only25 accepted, tooling25, Chromium3; both whole modules100all-four/904positive counters.866 other old acceptance files byte-identical, two exact assertion changes, four canonical histories preserved. Nine restored metadata gates pass. Initial CLI/format/red evidence retained; only causal production repair rerun. Broader native query/geometry/table layout remain pending; goalactive correction3/10, pause after next full and repairs.
