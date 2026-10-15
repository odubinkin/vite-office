---
id: "202610150439-ZH9HYF"
title: "Implement canonical shared XML namespace map for ODF attributes"
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
  updated_at: "2026-10-15T04:41:00.390Z"
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
    body: "Start: implement original namespace-map values, keys, QName caches and URI normalization for shared ODF/Calc attribute dependencies; preserve source quirks using native JS Map/strings without container or memory engines."
events:
  -
    type: "status"
    at: "2026-10-15T04:41:06.159Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original namespace-map values, keys, QName caches and URI normalization for shared ODF/Calc attribute dependencies; preserve source quirks using native JS Map/strings without container or memory engines."
doc_version: 3
doc_updated_at: "2026-10-15T04:41:06.159Z"
doc_updated_by: "CODER"
description: "Task142 ports actual SvXMLNamespaceMap keys/prefix aliases/QName caches/URI normalization and complete native namespace-id declarations as the missing shared XML attribute-container dependency for Calc/ODS. Use native JS Maps/immutable strings and out cells; no generic C++ hash containers, string ownership or memory engine. Retain source cache quirks and unspecified unordered iteration contract."
sections:
  Summary: "Task142 implements the original shared SvXMLNamespaceMap as the missing namespace dependency of the XML attribute container needed by Calc and ODF filters. User continuation authorizes this core/ODS critical path in calc."
  Scope: "At most35intentional source/doc/inventory paths: xmloff namespacemap source/canonical header, full actual xmlnamespace identifier declarations, focused shared tests and Calc namespace-alias persistence witness, bounded source-backed registry/capability, calc-core and calc-upstream-suspected-issues. Reuse existing shared ODF_NAMESPACES URI strings where applicable. Native JS strings/Maps and output cells represent original values/lookup/reference arguments; no C++ hash/container/string ownership engine or ABI iteration order. Original XML token numeric provider is not fabricated; required resolved literal spellings are explicitly source-audited bindings. No fake XmlAttrContainer/ScDocument or ODS filter is claimed."
  Plan: "Port actual complete initialized SvXMLNamespaceMap behavior and full namespace ID declarations using JS Map/strings/out cells, native lookup/QName/deprecated APIs/URI normalization and preserved cache quirks. Reuse existing URI owner, audit required literal token bindings/all IDs, no C++ container/allocator/hash implementation or fabricated filters. Bound35paths, raw100whole shared/Calc, related Writer XML tests, portable build/source gates/pins/hashes and clean calc."
  Verify Steps: "Native constants/sentinels and actual initialized entry equality; all xmlnamespace.hxx identifiers/aliases source-audited. Empty/default/copy/assignment/self assignment and independent value entries, borrowed all-entries map identity, original assignment retaining destination caches and new copies starting empty caches. All Add/AddIfKnown/AddAtIndex existing/new/alias/unknown/NONE cases, first-free0x8000 key allocation/collision and single bounded32k explicit-key fixture exercising reserved NONE allocation and release fallback without full-key exhaustion/native probes. Key/name/prefix/index lookups, empty/missing/reserved QName generation, cached/uncached and empty-result caching, aliases and arbitrary valid iteration order with missing-next precondition host error. QName parsing cached-name/value modes, first-colon value parsing, invalid multi-colon name fallback/output untouched, default namespace and xmlns/unknown cases, exact optional output writes and cold/hot namespace-output differences. All normalization branches: legacy SVG/FO/SMIL, OASIS TC/subid/version checks and source permissive1.x behavior, W3 prefix/suffix-only acceptance and unchanged failures. Calc witness retains multiple prefixes for one key through GetAllEntries as native sheetdata.cxx requires; no actual sheetdata port claim. Complete changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, relevant existing Writer SAX/ODT tests,4source links absent/restored during portable tests/build. Scoped prettier/eslint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries and production build; exact35paths/native pins/source hashes/clean calc. Writer-only gaps exempt, no full-suite checkpoint before real minimum UI+ODS readiness then repair/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication."
  Findings: "Use JS built-ins for logical unordered maps and immutable UTF16 strings. Source nonsemantic hash/bucket/allocator layout and invalid exhausted-key infinite loops are not recreated or probed; valid traversal membership is retained without claiming native unordered iteration order. Original ordinary runtime QName caches are part of observable behavior, so assignment/Add invalidation quirks must be preserved, not corrected. No native C++ generator/compiler or memory manager. Same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task142 implements the original shared SvXMLNamespaceMap as the missing namespace dependency of the XML attribute container needed by Calc and ODF filters. User continuation authorizes this core/ODS critical path in calc.

## Scope

At most35intentional source/doc/inventory paths: xmloff namespacemap source/canonical header, full actual xmlnamespace identifier declarations, focused shared tests and Calc namespace-alias persistence witness, bounded source-backed registry/capability, calc-core and calc-upstream-suspected-issues. Reuse existing shared ODF_NAMESPACES URI strings where applicable. Native JS strings/Maps and output cells represent original values/lookup/reference arguments; no C++ hash/container/string ownership engine or ABI iteration order. Original XML token numeric provider is not fabricated; required resolved literal spellings are explicitly source-audited bindings. No fake XmlAttrContainer/ScDocument or ODS filter is claimed.

## Plan

Port actual complete initialized SvXMLNamespaceMap behavior and full namespace ID declarations using JS Map/strings/out cells, native lookup/QName/deprecated APIs/URI normalization and preserved cache quirks. Reuse existing URI owner, audit required literal token bindings/all IDs, no C++ container/allocator/hash implementation or fabricated filters. Bound35paths, raw100whole shared/Calc, related Writer XML tests, portable build/source gates/pins/hashes and clean calc.

## Verify Steps

Native constants/sentinels and actual initialized entry equality; all xmlnamespace.hxx identifiers/aliases source-audited. Empty/default/copy/assignment/self assignment and independent value entries, borrowed all-entries map identity, original assignment retaining destination caches and new copies starting empty caches. All Add/AddIfKnown/AddAtIndex existing/new/alias/unknown/NONE cases, first-free0x8000 key allocation/collision and single bounded32k explicit-key fixture exercising reserved NONE allocation and release fallback without full-key exhaustion/native probes. Key/name/prefix/index lookups, empty/missing/reserved QName generation, cached/uncached and empty-result caching, aliases and arbitrary valid iteration order with missing-next precondition host error. QName parsing cached-name/value modes, first-colon value parsing, invalid multi-colon name fallback/output untouched, default namespace and xmlns/unknown cases, exact optional output writes and cold/hot namespace-output differences. All normalization branches: legacy SVG/FO/SMIL, OASIS TC/subid/version checks and source permissive1.x behavior, W3 prefix/suffix-only acceptance and unchanged failures. Calc witness retains multiple prefixes for one key through GetAllEntries as native sheetdata.cxx requires; no actual sheetdata port claim. Complete changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, relevant existing Writer SAX/ODT tests,4source links absent/restored during portable tests/build. Scoped prettier/eslint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries and production build; exact35paths/native pins/source hashes/clean calc. Writer-only gaps exempt, no full-suite checkpoint before real minimum UI+ODS readiness then repair/pause.

## Verification

Pending execution.

## Rollback Plan

Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication.

## Findings

Use JS built-ins for logical unordered maps and immutable UTF16 strings. Source nonsemantic hash/bucket/allocator layout and invalid exhausted-key infinite loops are not recreated or probed; valid traversal membership is retained without claiming native unordered iteration order. Original ordinary runtime QName caches are part of observable behavior, so assignment/Add invalidation quirks must be preserved, not corrected. No native C++ generator/compiler or memory manager. Same-agent evaluation is not independent.
