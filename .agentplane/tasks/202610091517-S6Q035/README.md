---
id: "202610091517-S6Q035"
title: "Port shared mdds flat segment tree for Calc row segments"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T15:20:02.789Z"
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
    body: "Start: Implement approved shared pinned mdds segment storage prerequisite in calc with exact native source evidence."
events:
  -
    type: "status"
    at: "2026-10-09T15:20:11.900Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved shared pinned mdds segment storage prerequisite in calc with exact native source evidence."
doc_version: 3
doc_updated_at: "2026-10-09T15:20:11.900Z"
doc_updated_by: "CODER"
description: "Build original pinned mdds3.2.1 flat_segment_tree prerequisite for Calc ScFlatBoolRowSegments and ScMultiSel, preserving storage/tree/iterator contracts and documenting upstream observations. Seventh task of resumed interval."
sections:
  Summary: "Implement the original mdds flat_segment_tree prerequisite used by pinned Calc ScFlatBoolRowSegments and ScMultiSel. Preserve real segment storage/search/iterator architecture rather than supplying a substitute union algorithm."
  Scope: "Calc checkout/branch only, task7 of resumed10. Shared external/mdds TypeScript owners shaped after the original include/mdds headers, their portable tests/native fixture, dedicated source-verification/native-probe script, explicit external module dependency allowlist/test, new shared runtime/provenance/capability records, calc-core and suspected-issues documentation. Optional native reference stays ignored at vendor/mdds-reference (add narrow ignore entries); bootstrap/reference docs identify exact pinned download/version/hash and LibreOffice patch. Registry external reference mock support may be adapted in related inventory tests as needed. No Writer consumers, document/formula/string stand-ins, engine wrappers before dependencies, network writes or merges. Existing user authorization permits upstream network source reads; LibreOffice Makefile.fetch/download.lst identify authoritative archive and SHA256."
  Plan: "Port original pinned shared mdds flat_segment_tree with leaf/tree/iterator ownership and actual native comparisons; preserve behavior and scoped100 gates, task7 of10."
  Verify Steps: "Verify reference archive SHA256673f5bb94612dbba581fc92b99b5e5dd1a53e29496a5dbc936432f6b0687c112 from pinned LibreOffice download.lst and original patch. Run dedicated native probe --write/--check with source hashes and ASan/UBSan. Compare ordered segment boundaries/defaults, insertion outcomes/change flags, invalid ranges, clipping, search output preservation/tree readiness, iterator positioning and copies, defined shifts/erase/clear behavior. Use real original mdds headers in the comparison, no replacement native tree. Portable ordinary tests require neither upstream nor compiler/network. Run Calc actual100 coverage plus targeted new shared-owner test/coverage (all four actual Istanbul metrics100), TS7 typecheck, affected ESLint/Prettier, dependency/tooling tests, affected provenance/inventory tests as applicable, ownership/docs/size/tree/provenance checks, Calc and shared registry checks with zero semantic violations, routing/doctor/diff/final clean status. Full Writer/full-suite validation remains at task10; no Writer coverage repair. Do not claim whole generic native memory/template/pointer lifetime parity from finite fixtures."
  Verification: "Pending. Prior task6 completed at c143b5642bf4,77 Calc tests/17files actual100; clean calc checkout and two unrelated active tasks preserved. Original ScMultiSel uses a segment owner requiring real mdds, absent from the local LibreOffice source-only checkout. Source inspection is now determining exact dependency contracts."
  Rollback Plan: "Revert only this task's implementation commits and optional local mdds reference link; existing Calc numerical and row-mark owners remain intact."
  Findings: "LibreOffice pins mdds3.2.1 by exact archive checksum and an original gcc warning patch. The source-only reference has no unpacked external headers/archive. Optional source-discovery path solenv/bin/download-sources was absent; bounded fallback found exact fetch URL in Makefile.fetch. Network reads of upstream are already authorized by the user. No source changes or engine stand-ins have been made in this task yet."
id_source: "generated"
---
## Summary

Implement the original mdds flat_segment_tree prerequisite used by pinned Calc ScFlatBoolRowSegments and ScMultiSel. Preserve real segment storage/search/iterator architecture rather than supplying a substitute union algorithm.

## Scope

Calc checkout/branch only, task7 of resumed10. Shared external/mdds TypeScript owners shaped after the original include/mdds headers, their portable tests/native fixture, dedicated source-verification/native-probe script, explicit external module dependency allowlist/test, new shared runtime/provenance/capability records, calc-core and suspected-issues documentation. Optional native reference stays ignored at vendor/mdds-reference (add narrow ignore entries); bootstrap/reference docs identify exact pinned download/version/hash and LibreOffice patch. Registry external reference mock support may be adapted in related inventory tests as needed. No Writer consumers, document/formula/string stand-ins, engine wrappers before dependencies, network writes or merges. Existing user authorization permits upstream network source reads; LibreOffice Makefile.fetch/download.lst identify authoritative archive and SHA256.

## Plan

Port original pinned shared mdds flat_segment_tree with leaf/tree/iterator ownership and actual native comparisons; preserve behavior and scoped100 gates, task7 of10.

## Verify Steps

Verify reference archive SHA256673f5bb94612dbba581fc92b99b5e5dd1a53e29496a5dbc936432f6b0687c112 from pinned LibreOffice download.lst and original patch. Run dedicated native probe --write/--check with source hashes and ASan/UBSan. Compare ordered segment boundaries/defaults, insertion outcomes/change flags, invalid ranges, clipping, search output preservation/tree readiness, iterator positioning and copies, defined shifts/erase/clear behavior. Use real original mdds headers in the comparison, no replacement native tree. Portable ordinary tests require neither upstream nor compiler/network. Run Calc actual100 coverage plus targeted new shared-owner test/coverage (all four actual Istanbul metrics100), TS7 typecheck, affected ESLint/Prettier, dependency/tooling tests, affected provenance/inventory tests as applicable, ownership/docs/size/tree/provenance checks, Calc and shared registry checks with zero semantic violations, routing/doctor/diff/final clean status. Full Writer/full-suite validation remains at task10; no Writer coverage repair. Do not claim whole generic native memory/template/pointer lifetime parity from finite fixtures.

## Verification

Pending. Prior task6 completed at c143b5642bf4,77 Calc tests/17files actual100; clean calc checkout and two unrelated active tasks preserved. Original ScMultiSel uses a segment owner requiring real mdds, absent from the local LibreOffice source-only checkout. Source inspection is now determining exact dependency contracts.

## Rollback Plan

Revert only this task's implementation commits and optional local mdds reference link; existing Calc numerical and row-mark owners remain intact.

## Findings

LibreOffice pins mdds3.2.1 by exact archive checksum and an original gcc warning patch. The source-only reference has no unpacked external headers/archive. Optional source-discovery path solenv/bin/download-sources was absent; bounded fallback found exact fetch URL in Makefile.fetch. Network reads of upstream are already authorized by the user. No source changes or engine stand-ins have been made in this task yet.
