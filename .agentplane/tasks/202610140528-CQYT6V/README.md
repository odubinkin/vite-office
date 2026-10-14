---
id: "202610140528-CQYT6V"
title: "Implement shared XML reader spans and text accumulation for Calc configuration"
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
  updated_at: "2026-10-14T05:32:21.930Z"
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
    body: "Start: implement actual Span/Pad shared XML value contracts over native byte views/arrays and real OUString/UNO, verify native strict UTF8/BOM equivalence broadly before converter reuse, complete source-absent focused verification under active goal approval."
events:
  -
    type: "status"
    at: "2026-10-14T05:32:30.269Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual Span/Pad shared XML value contracts over native byte views/arrays and real OUString/UNO, verify native strict UTF8/BOM equivalence broadly before converter reuse, complete source-absent focused verification under active goal approval."
doc_version: 3
doc_updated_at: "2026-10-14T05:32:30.269Z"
doc_updated_by: "CODER"
description: "Task109: actual xmlreader Span/Pad header/core responsibilities needed by real configmgr readers. Reuse actual OUString/UNO values, native strict TextDecoder only after source-backed scalar/error/BOM correspondence; ordinary JS byte views/arrays no buffer allocator/ICU/ownership library. Preserve borrowing/copy/ephemeral accumulation/value outputs. Calc/affected raw100, static/Calc0UI/current gates; full111pause unchanged."
sections:
  Summary: "Task109 implements actual xmlreader Span/Pad byte-view/text-accumulation responsibilities required by configmgr schema readers, reusing existing real OUString/UNO values. Verify native strict TextDecoder against pinned UTF8 conversion semantics rather than porting a converter/ICU library."
  Scope: "Four runtime files xmlreader/inc/span.ts,inc/pad.ts,source/span.ts,source/pad.ts; one source/span-pad.test.ts; eight shared runtime/provenance records; one shared capability; Calc core/GC docs; two existing module-boundary files registering exact xmlreader->cppu/sal and header ownership/rejection tests. Eighteen planned non-task paths. No existing shared runtime implementation changes. Original configmgr uses xmlreader distinct from the existing shared SAX path; no duplicated substitute XML engine or fake Components/provider. Actual XML reader/config schema/backend/Calc defaults/document/grid/ODS integration remains pending."
  Plan: "Port complete logical original Span default/raw/literal/copy/clear/is/length/byte comparison/equals/strictUTF8 and Pad add/addEphemeral/clear/get/privateflushSpan over ordinary native JS byte views/arrays. Native literal arrays include terminator and lengthN-1, explicit length is signed32; clear only nulls begin and retains length. Span values copy fields while sharing borrowed bytes. Pad first stable add borrows input, subsequent append flushes to owned bytes; ephemeral input copies immediately; zero length is ignored; get returns value copies over stable current backing with a terminating byte for owned/empty buffer. Native OStringBuffer capacity256/allocation/reallocation/address/postmutation borrow behavior excluded, no allocator/refcount/pool/capacity engine. Native JS arrays store owned bytes, ArrayLike byte view erases char pointer; existing actual OUString/RuntimeException preserve public values/error. Verify native TextDecoder fatal/ignoreBOMtrue: source flags preserve BOM and reject malformed/truncated/overlong/surrogate/out-of-range/5-6byte sequences; test all1112064validUnicode scalars split17planes, exhaustive65536two-byte combinations plus malformed categories and bounded realSpan cases. No compiled C++/sanitizer/native memory experiment/new generator, no fake decoder/type provider or counter suppression. Explicit header aggregates/source owners; exact xmlreader dependency/ownership registration and reverse/app/browser rejection tests. WholeCalc and complete new owners raw100, actual source-absent static/Calc0UI/fourlinksrestored and16gates serial after108observed contention, exacthashes/separate same-agent evaluator/DONE/clean. Goalactive until requested secondfull111/repairs pause; no Writer-only repair."
  Verify Steps: |-
    1. Review full pinned span/pad headers/bodies and actual SAL UTF8 conversion/error/FLUSH/BOM/scalar rules. Source-backed realSpan/Pad tests verify default/raw/literal/copy/clear retained length/byte alias/equality/literal comparisons/owned output/zero input/get value copy/borrowed first input/flushed and ephemeral copies/terminator/clear reuse. Valid native producer views only, no invalid pointer/private-state forcing. Native strictTextDecoder with BOM preserved must match all valid scalars17planes, all65536two-byte accept/reject classifications and malformed3/4/5/6byte boundaries; actualSpan cases verify exact realOUString and original RuntimeException message. No native compiled/memory/wholeQA/ABI/allocation-address/postmutation pointer claims.
    2. Whole source-absent Calc coverage and complete four new XML owner/aggregate files profile using actual tests, rawS/B/F/L100/everycounterpositive. Pure header aggregates have no executable owners. Existing unchanged SAL/cppu dependencies reused without remeasured-owner claims. Actual source-absent static/Calc0UI/four exact link targets restored; no Writer-only coverage repair/full office before111.
    3. All16existing repository gates afterlastedit, run serial to avoid108format/inventory contention; currentintentionalformat. Exact xmlreader cppu/sal and header ownership boundaries with reverse/app/browser rejection tests, truthful source/runtime/capability/GC records. No new converter/ICU/allocator/provider, source-routing/threshold weakening or counter forcing. Retain failures before bounded corrections.
    4. Exact3386baseline/current/committed hashes and only18intentionalpaths, source/gate/coverage manifests bound to sourceSHA. Separate same-agent EVAL not independent review, APverify/DONE/clean branchcalc. Goalactive until secondfull111 requestedpause after relevant repairs.
  Verification: "Pending implementation and actual current checks."
  Rollback Plan: "Finally restore four exact source links on all test exits. Revert only intentional task changes through a new task if needed; no branch merge/history rewrite/unrelated changes."
  Findings: "Actual PropertyNode backend getValue requires Components and external service contracts not yet implemented; do not invent a provider to bypass this boundary. Real configmgr ValueParser/ParseManager instead require xmlreader Span/Pad, a distinct upstream module from existing SAX. Span UTF8 uses strict RTL flags, no GLOBAL_SIGNATURE; BOM is retained, so default TextDecoder BOM stripping would differ. Prefer native fatal decoder with ignoreBOMtrue after broad source-backed verification, not ICU/converter port. Native Pad owned buffer default capacity256 is allocation detail; ordinary JS byte arrays retain logical data/borrow contracts, no capacity allocator. Native pointers/ABI and postmutation borrowed-view allocation behavior are not certified. Task108observed two inventory timeouts during concurrentformat; keep109gates serial without changinglimits. An exploratory missing sal/rtl/strtmpl.cxx read was corrected to actual ustring.cxx conversion owner; no mutation resulted."
id_source: "generated"
---
## Summary

Task109 implements actual xmlreader Span/Pad byte-view/text-accumulation responsibilities required by configmgr schema readers, reusing existing real OUString/UNO values. Verify native strict TextDecoder against pinned UTF8 conversion semantics rather than porting a converter/ICU library.

## Scope

Four runtime files xmlreader/inc/span.ts,inc/pad.ts,source/span.ts,source/pad.ts; one source/span-pad.test.ts; eight shared runtime/provenance records; one shared capability; Calc core/GC docs; two existing module-boundary files registering exact xmlreader->cppu/sal and header ownership/rejection tests. Eighteen planned non-task paths. No existing shared runtime implementation changes. Original configmgr uses xmlreader distinct from the existing shared SAX path; no duplicated substitute XML engine or fake Components/provider. Actual XML reader/config schema/backend/Calc defaults/document/grid/ODS integration remains pending.

## Plan

Port complete logical original Span default/raw/literal/copy/clear/is/length/byte comparison/equals/strictUTF8 and Pad add/addEphemeral/clear/get/privateflushSpan over ordinary native JS byte views/arrays. Native literal arrays include terminator and lengthN-1, explicit length is signed32; clear only nulls begin and retains length. Span values copy fields while sharing borrowed bytes. Pad first stable add borrows input, subsequent append flushes to owned bytes; ephemeral input copies immediately; zero length is ignored; get returns value copies over stable current backing with a terminating byte for owned/empty buffer. Native OStringBuffer capacity256/allocation/reallocation/address/postmutation borrow behavior excluded, no allocator/refcount/pool/capacity engine. Native JS arrays store owned bytes, ArrayLike byte view erases char pointer; existing actual OUString/RuntimeException preserve public values/error. Verify native TextDecoder fatal/ignoreBOMtrue: source flags preserve BOM and reject malformed/truncated/overlong/surrogate/out-of-range/5-6byte sequences; test all1112064validUnicode scalars split17planes, exhaustive65536two-byte combinations plus malformed categories and bounded realSpan cases. No compiled C++/sanitizer/native memory experiment/new generator, no fake decoder/type provider or counter suppression. Explicit header aggregates/source owners; exact xmlreader dependency/ownership registration and reverse/app/browser rejection tests. WholeCalc and complete new owners raw100, actual source-absent static/Calc0UI/fourlinksrestored and16gates serial after108observed contention, exacthashes/separate same-agent evaluator/DONE/clean. Goalactive until requested secondfull111/repairs pause; no Writer-only repair.

## Verify Steps

1. Review full pinned span/pad headers/bodies and actual SAL UTF8 conversion/error/FLUSH/BOM/scalar rules. Source-backed realSpan/Pad tests verify default/raw/literal/copy/clear retained length/byte alias/equality/literal comparisons/owned output/zero input/get value copy/borrowed first input/flushed and ephemeral copies/terminator/clear reuse. Valid native producer views only, no invalid pointer/private-state forcing. Native strictTextDecoder with BOM preserved must match all valid scalars17planes, all65536two-byte accept/reject classifications and malformed3/4/5/6byte boundaries; actualSpan cases verify exact realOUString and original RuntimeException message. No native compiled/memory/wholeQA/ABI/allocation-address/postmutation pointer claims.
2. Whole source-absent Calc coverage and complete four new XML owner/aggregate files profile using actual tests, rawS/B/F/L100/everycounterpositive. Pure header aggregates have no executable owners. Existing unchanged SAL/cppu dependencies reused without remeasured-owner claims. Actual source-absent static/Calc0UI/four exact link targets restored; no Writer-only coverage repair/full office before111.
3. All16existing repository gates afterlastedit, run serial to avoid108format/inventory contention; currentintentionalformat. Exact xmlreader cppu/sal and header ownership boundaries with reverse/app/browser rejection tests, truthful source/runtime/capability/GC records. No new converter/ICU/allocator/provider, source-routing/threshold weakening or counter forcing. Retain failures before bounded corrections.
4. Exact3386baseline/current/committed hashes and only18intentionalpaths, source/gate/coverage manifests bound to sourceSHA. Separate same-agent EVAL not independent review, APverify/DONE/clean branchcalc. Goalactive until secondfull111 requestedpause after relevant repairs.

## Verification

Pending implementation and actual current checks.

## Rollback Plan

Finally restore four exact source links on all test exits. Revert only intentional task changes through a new task if needed; no branch merge/history rewrite/unrelated changes.

## Findings

Actual PropertyNode backend getValue requires Components and external service contracts not yet implemented; do not invent a provider to bypass this boundary. Real configmgr ValueParser/ParseManager instead require xmlreader Span/Pad, a distinct upstream module from existing SAX. Span UTF8 uses strict RTL flags, no GLOBAL_SIGNATURE; BOM is retained, so default TextDecoder BOM stripping would differ. Prefer native fatal decoder with ignoreBOMtrue after broad source-backed verification, not ICU/converter port. Native Pad owned buffer default capacity256 is allocation detail; ordinary JS byte arrays retain logical data/borrow contracts, no capacity allocator. Native pointers/ABI and postmutation borrowed-view allocation behavior are not certified. Task108observed two inventory timeouts during concurrentformat; keep109gates serial without changinglimits. An exploratory missing sal/rtl/strtmpl.cxx read was corrected to actual ustring.cxx conversion owner; no mutation resulted.
