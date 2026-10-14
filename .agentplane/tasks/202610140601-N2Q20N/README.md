---
id: "202610140601-N2Q20N"
title: "Implement shared XML pull reader for Calc configuration schemas"
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
  updated_at: "2026-10-14T06:05:17.442Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-14T06:10:10.636Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-14T06:10:10.636Z"
doc_updated_by: "CODER"
description: "Task110: full logical upstream xmlreader event/state/namespace/attribute/text/reference parser over actual Span/Pad and existing shared values, with browser supplied bytes and URL instead of native filesystem/mmap ownership. Preserve source quirks and record them; no SAX substitution or memory/provider library. Calc/affected raw100, static/Calc0UI/16serialgates. Next task111full thenpause."
sections:
  Summary: "Task110 implements the complete logical original xmlreader event/state/namespace/attribute/text/reference parser needed by real configmgr schema loading over actual Span/Pad/OUString/UNO values."
  Scope: "Seven runtime/header files xmlreader/source/xmlreader.ts, xmlreader.state.ts,xmlreader.lexical.ts,xmlreader.references.ts,xmlreader.tags.ts,xmlreader.text.ts and xmlreader/inc/xmlreader.ts; three tests for events/namespaces, text/attributes, errors/reference cases; fourteen runtime/provenance records, one shared capability and Calc core/GC/suspected issues docs. Twenty-eight planned non-task paths, no existing shared runtime changes. Original900line body is sharded by actual lexical/reference/tag/text scopes to honor500line cap. Helpers operate the actual Reader through an erased private-state type view, never a new state wrapper/fake provider. Browser constructor takes actual preloaded Uint8Array plus original URL instead of native synchronous open/mmap/close; event/namespace/output contracts retained. Native OS I/O errors/destruction/memory mapping/ABI/debug/invalid native ranges/postmutation pointers/private access excluded, host byte range failures use native DataView errors. No new allocator/pointer/refcount/library/cache or SAX substitute."
  Plan: "Port original private/public state defaults, Text/Result/state enums and namespace IDs, registrations incl legacy undeclared xsi compatibility, reverse prefix scope/shadowing, attributes iteration/output timing/normalization, tags/end/default namespaces/Done behavior, all three text modes/comments/PI/DTD/CDATA/name scanning/lineends/entities/numeric refs over real Span/Pad. Numeric file indices and native DataView/Uint8Array replace pointer/mmap syntax without a pointer or allocation engine; exact output Span fields and primitive tuple writes. Private-state view is an erased type over actual class fields with no runtime object duplication; actual byte owner copied on construction, URL copied. Omit native hex scalar overflow guard proven unreachable after digit0..15 and invalid sentinel break; retain source hex value overwrite/sentinel and release encoding outcome without inventing a correct accumulated hex value. Use native parseInt on single byte with exhaustive256byte proof vs original convertToHex. Preserve normalized CDATA prefix markup and nonnormalized attribute CR global-peek behavior; record CALC-094..096 with source-only release/debug boundaries. Preserve root Done/trailing-input and explicit empty namespace handling. No native UB/debug/memory experiment, C++ generator or compiled differential claim. Source-backed real Reader input streams and public event protocols exercise all meaningful cases/outputs/bytes/error classes; no fake reader/private-state forcing. WholeCalc and complete XML owner/header profile raw100 with existingSpanPad tests/native UTF8 proof, actual source-absent static/Calc0UI/four links restored/16serialgates/exacthashes/separate same-agent EVAL/DONE/clean. Goalactive until nexttask111full and relevantrepairs then requestedpause; no Writer-only repair."
  Verify Steps: |-
    1. Review complete original Reader header/body plus Span/Pad and actual SAL/o3tl helper scopes. Real public Reader tests over provided byte input verify defaults/enums/URL ownership/state/events/namespace registration and shadowing/default/legacyxsi/unknown/duplicate/empty URI/attribute iteration and both normalizations/all text modes/lineends/comments/PI/DTD/CDATA/references/all defined error messages/output timing/root Done. Single-byte native parseInt hex matches all256source char classes. Source-backed suspicioushex/CDATA/CR cases preserved; native redundant unreachable hex guard proof recorded. No private state forcing/fake reader/provider, native debug/UB/OS/ABI/postmutation pointer/compiled/fullQA outcome claim. Host preloaded-byte constructor and native DataView range errors are explicit browser boundaries, not fake OS results.
    2. Whole source-absent Calc coverage and complete all actual XML reader runtime/header files including unchanged Span/Pad/native UTF8 tests, rawS/B/F/L100/everycounterpositive. Pure types/header aggregates no executable counters. Unchanged SAL/cppu reused without remeasured-owner claims. Actual source-absent static/Calc0UI/four exact links restored; no Writer-only repair/full office before111.
    3. All16existing repository gates serial afterlastedit and currentintentionalformat; truthful source/runtime/capability/GC/suspected issue records, no source-routing/threshold weakening or private state/counter forcing. Retain failures before bounded corrections.
    4. Exact3400baseline/current/committed hashes and only28intentionalpaths, source/gate/coverage manifests sourceSHA-bound; separate same-agent EVAL not independent review, APverify/DONE/cleanbranchcalc. Goalactive until immediately following full111/relevantrepairs requestedpause.
  Verification: "Pending implementation and actual current checks."
  Rollback Plan: "Finally restore four exact source links on every test exit. Revert only intentional task changes via a new task if necessary; no branch merge/history rewrite/unrelated work changes."
  Findings: "Native Reader opens/maps a URL synchronously, unavailable as the same browser constructor operation; supply already loaded bytes plus original URL as explicit host I/O binding, preserve all event/core contracts, no file-handle/mmap/ownership facade or fake loader. Existing SAX parser rejects DTD and has different normalization/validation, so substituting it would alter configmgr behavior. Original hex loop overwrites rather than accumulates and ends with unsigned invalid sentinel; scalar guard inside loop is unreachable after0..15digit validation. Preserve release bytes/debug boundary and document CALC-094, not silently correct hex. Original normalized CDATA can include markup after ordinary text(CALC-095); nonnormalized attribute CR uses global peek rather than local next byte(CALC-096), which can violate native range invariants. Native DataView bounds prevent unbounded host reads; invalid-range host outcomes are not native parity claims. Actual schema/Property/backend/default/Calc document/grid/ODS integration remains pending."
id_source: "generated"
---
## Summary

Task110 implements the complete logical original xmlreader event/state/namespace/attribute/text/reference parser needed by real configmgr schema loading over actual Span/Pad/OUString/UNO values.

## Scope

Seven runtime/header files xmlreader/source/xmlreader.ts, xmlreader.state.ts,xmlreader.lexical.ts,xmlreader.references.ts,xmlreader.tags.ts,xmlreader.text.ts and xmlreader/inc/xmlreader.ts; three tests for events/namespaces, text/attributes, errors/reference cases; fourteen runtime/provenance records, one shared capability and Calc core/GC/suspected issues docs. Twenty-eight planned non-task paths, no existing shared runtime changes. Original900line body is sharded by actual lexical/reference/tag/text scopes to honor500line cap. Helpers operate the actual Reader through an erased private-state type view, never a new state wrapper/fake provider. Browser constructor takes actual preloaded Uint8Array plus original URL instead of native synchronous open/mmap/close; event/namespace/output contracts retained. Native OS I/O errors/destruction/memory mapping/ABI/debug/invalid native ranges/postmutation pointers/private access excluded, host byte range failures use native DataView errors. No new allocator/pointer/refcount/library/cache or SAX substitute.

## Plan

Port original private/public state defaults, Text/Result/state enums and namespace IDs, registrations incl legacy undeclared xsi compatibility, reverse prefix scope/shadowing, attributes iteration/output timing/normalization, tags/end/default namespaces/Done behavior, all three text modes/comments/PI/DTD/CDATA/name scanning/lineends/entities/numeric refs over real Span/Pad. Numeric file indices and native DataView/Uint8Array replace pointer/mmap syntax without a pointer or allocation engine; exact output Span fields and primitive tuple writes. Private-state view is an erased type over actual class fields with no runtime object duplication; actual byte owner copied on construction, URL copied. Omit native hex scalar overflow guard proven unreachable after digit0..15 and invalid sentinel break; retain source hex value overwrite/sentinel and release encoding outcome without inventing a correct accumulated hex value. Use native parseInt on single byte with exhaustive256byte proof vs original convertToHex. Preserve normalized CDATA prefix markup and nonnormalized attribute CR global-peek behavior; record CALC-094..096 with source-only release/debug boundaries. Preserve root Done/trailing-input and explicit empty namespace handling. No native UB/debug/memory experiment, C++ generator or compiled differential claim. Source-backed real Reader input streams and public event protocols exercise all meaningful cases/outputs/bytes/error classes; no fake reader/private-state forcing. WholeCalc and complete XML owner/header profile raw100 with existingSpanPad tests/native UTF8 proof, actual source-absent static/Calc0UI/four links restored/16serialgates/exacthashes/separate same-agent EVAL/DONE/clean. Goalactive until nexttask111full and relevantrepairs then requestedpause; no Writer-only repair.

## Verify Steps

1. Review complete original Reader header/body plus Span/Pad and actual SAL/o3tl helper scopes. Real public Reader tests over provided byte input verify defaults/enums/URL ownership/state/events/namespace registration and shadowing/default/legacyxsi/unknown/duplicate/empty URI/attribute iteration and both normalizations/all text modes/lineends/comments/PI/DTD/CDATA/references/all defined error messages/output timing/root Done. Single-byte native parseInt hex matches all256source char classes. Source-backed suspicioushex/CDATA/CR cases preserved; native redundant unreachable hex guard proof recorded. No private state forcing/fake reader/provider, native debug/UB/OS/ABI/postmutation pointer/compiled/fullQA outcome claim. Host preloaded-byte constructor and native DataView range errors are explicit browser boundaries, not fake OS results.
2. Whole source-absent Calc coverage and complete all actual XML reader runtime/header files including unchanged Span/Pad/native UTF8 tests, rawS/B/F/L100/everycounterpositive. Pure types/header aggregates no executable counters. Unchanged SAL/cppu reused without remeasured-owner claims. Actual source-absent static/Calc0UI/four exact links restored; no Writer-only repair/full office before111.
3. All16existing repository gates serial afterlastedit and currentintentionalformat; truthful source/runtime/capability/GC/suspected issue records, no source-routing/threshold weakening or private state/counter forcing. Retain failures before bounded corrections.
4. Exact3400baseline/current/committed hashes and only28intentionalpaths, source/gate/coverage manifests sourceSHA-bound; separate same-agent EVAL not independent review, APverify/DONE/cleanbranchcalc. Goalactive until immediately following full111/relevantrepairs requestedpause.

## Verification

Pending implementation and actual current checks.

## Rollback Plan

Finally restore four exact source links on every test exit. Revert only intentional task changes via a new task if necessary; no branch merge/history rewrite/unrelated work changes.

## Findings

Native Reader opens/maps a URL synchronously, unavailable as the same browser constructor operation; supply already loaded bytes plus original URL as explicit host I/O binding, preserve all event/core contracts, no file-handle/mmap/ownership facade or fake loader. Existing SAX parser rejects DTD and has different normalization/validation, so substituting it would alter configmgr behavior. Original hex loop overwrites rather than accumulates and ends with unsigned invalid sentinel; scalar guard inside loop is unreachable after0..15digit validation. Preserve release bytes/debug boundary and document CALC-094, not silently correct hex. Original normalized CDATA can include markup after ordinary text(CALC-095); nonnormalized attribute CR uses global peek rather than local next byte(CALC-096), which can violate native range invariants. Native DataView bounds prevent unbounded host reads; invalid-range host outcomes are not native parity claims. Actual schema/Property/backend/default/Calc document/grid/ODS integration remains pending.
