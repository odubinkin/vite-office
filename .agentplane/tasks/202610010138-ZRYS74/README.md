---
id: "202610010138-ZRYS74"
title: "Restore native list-item start-value normalization"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T01:39:43.221Z"
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
    body: "Start: restore native ordinary list-item start-value normalization and shared fast-attribute ownership under the persistent approved goal."
events:
  -
    type: "status"
    at: "2026-10-01T01:39:43.697Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native ordinary list-item start-value normalization and shared fast-attribute ownership under the persistent approved goal."
doc_version: 3
doc_updated_at: "2026-10-01T01:42:36.005Z"
doc_updated_by: "CODER"
description: "Iteration31: use shared fast-attribute byte-int conversion and native list-item range acceptance instead of strict rejection. Preserve intentional save/open/recovery behavior."
sections:
  Summary: "Restore ordinary list-item restart normalization through the native fast-attribute byte-int path. Iteration31 under the persistent approved full upstream goal."
  Scope: "xmloff/source/core/xmlimp.ts FastAttributeList and focused tests; style/xmlnumi.ts removes its private decimal bridge and uses the shared API; text/txtparai.ts and its context tests; genuine ODT list-start normalization tests; runtime inventory/source provenance/writer-odt-format.md; active task-local native probes. No new module root or validator/config/schema change. Existing hierarchical Arabic/bullet ODF1.3, Worker16, intentional save/open/recovery preserved. Repeated-sublist restart and whole fast attribute/UNO ownership remain separate."
  Plan: "Move the existing bounded decimal byte-int implementation from listDeclarationInt32 into FastAttributeList.getAsInteger, using nullable absence as the native bool/out-value adapter. Both declaration and ordinary item consumers delegate; preserve declaration defaults and branch normalization. Ordinary item constructor ignores converted negative/out-of-range values, accepts0..32767 including zero, and does not throw for conversion grammar. Headers continue to ignore start entirely. Confirm signed/whitespace/partial/no-digit/overflow/UTF8/NUL behavior against compiled unmodified pinned rtl/o3tl bodies plus exact native item range branch before making assertions. Verify helper extraction preserves previous declaration contracts and genuine ordinary/header/multi-paragraph/nested ODT state, literal counters/labels, owned copies,Worker16,export/reopen. Run unchanged full verify, source/doctor/routing/diff checks; record actual code hash and quality."
  Verify Steps: "Reproduce strict rejection of -1,32768,+1,garbage. Compile unmodified pinned rtl::str::toInt<sal_Int64>, HandleSignChar,DivMod,implGetDigit,implIsWhitespace and byte-view o3tl::toInt32 with explicit platform/view aliases; compare shared attribute conversion and exact native item0..SHRTMAX acceptance for empty,sign-only,signed zero/endpoints,ASCII control/space,Unicode UTF8,partial digits,decimal tail,hex-looking,embedded NUL,int32/int64 overflows and long digits. Assert nullable absent attributes and unchanged list declaration start/index/display defaults through existing focused tests. Genuine common/automatic numbered and bullet ODT fixtures must assert literal text,counted,level,restart,start,number,vector,label state,header ignored start,item first-para consumption,nested use,independent item/rule copies,Worker16,selected XML and reopen. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/metadata gates, ap doctor,routing validator,git diff --check. Record actual implementation hash, quality review and clean final tracked state. No mandatory skips or whole-module/full-goal promotion."
  Verification: "Pending implementation and declared checks. No mandatory gate is skipped."
  Rollback Plan: "If needed revert only the scoped implementation through a new executable task. Preserve immutable DONE evidence and keep the full parent goal active."
  Findings: |-
    Preflight clean main/direct; parent202609240501-C9TN6M only active. User goal authorizes safe local iterations; no network/outside access or delegation. Previous turn is progress: iteration30 M2EDTZ DONE, real code fd0ede9f505568377bbcd15595938cb72dbfcf8c, quality417e99b6bd2e93918aa6a1cf96c0a9f6f2095c96, close8d2c70c5710de1a05fce8bfc40aeb44d01711192,parent8469c1ab21d8045c0efd66ec88a84c9f45294763. Pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native ordinary XMLTextListItemContext calls toInt32 then accepts0..SHRT_MAX and retains-1 otherwise; local parser throws. Existing listDeclarationInt32 already models bounded decimal fast-attribute grammar but lives under one consuming list-style context. Shared FastAttributeList API is an adapter over native sax fast-attribute bool/out-int access, not a claim of full native ownership. Invalid guessed optional source paths in read-only discovery were resolved to include/sax/fastattribs.hxx,sax/source/tools/fastattribs.cxx and include/o3tl/string_view.hxx; no mutation resulted. Native repeated-sublist restart,full attribute token/container/scalar/UNO architecture and all broader model/UI obligations remain open.

    - Observation: Native harness compilation exits1: extracted with_length struct lacks its declaration semicolon because the balanced-body extractor stops at the closing brace.
      Impact: Adapter declaration assembly fails; no native/local conversion result has been compared yet.
      Resolution: Append the struct semicolon outside the unmodified body, persist the active harness artifacts and rerun; runtime scope and verification thresholds remain unchanged.
id_source: "generated"
---
## Summary

Restore ordinary list-item restart normalization through the native fast-attribute byte-int path. Iteration31 under the persistent approved full upstream goal.

## Scope

xmloff/source/core/xmlimp.ts FastAttributeList and focused tests; style/xmlnumi.ts removes its private decimal bridge and uses the shared API; text/txtparai.ts and its context tests; genuine ODT list-start normalization tests; runtime inventory/source provenance/writer-odt-format.md; active task-local native probes. No new module root or validator/config/schema change. Existing hierarchical Arabic/bullet ODF1.3, Worker16, intentional save/open/recovery preserved. Repeated-sublist restart and whole fast attribute/UNO ownership remain separate.

## Plan

Move the existing bounded decimal byte-int implementation from listDeclarationInt32 into FastAttributeList.getAsInteger, using nullable absence as the native bool/out-value adapter. Both declaration and ordinary item consumers delegate; preserve declaration defaults and branch normalization. Ordinary item constructor ignores converted negative/out-of-range values, accepts0..32767 including zero, and does not throw for conversion grammar. Headers continue to ignore start entirely. Confirm signed/whitespace/partial/no-digit/overflow/UTF8/NUL behavior against compiled unmodified pinned rtl/o3tl bodies plus exact native item range branch before making assertions. Verify helper extraction preserves previous declaration contracts and genuine ordinary/header/multi-paragraph/nested ODT state, literal counters/labels, owned copies,Worker16,export/reopen. Run unchanged full verify, source/doctor/routing/diff checks; record actual code hash and quality.

## Verify Steps

Reproduce strict rejection of -1,32768,+1,garbage. Compile unmodified pinned rtl::str::toInt<sal_Int64>, HandleSignChar,DivMod,implGetDigit,implIsWhitespace and byte-view o3tl::toInt32 with explicit platform/view aliases; compare shared attribute conversion and exact native item0..SHRTMAX acceptance for empty,sign-only,signed zero/endpoints,ASCII control/space,Unicode UTF8,partial digits,decimal tail,hex-looking,embedded NUL,int32/int64 overflows and long digits. Assert nullable absent attributes and unchanged list declaration start/index/display defaults through existing focused tests. Genuine common/automatic numbered and bullet ODT fixtures must assert literal text,counted,level,restart,start,number,vector,label state,header ignored start,item first-para consumption,nested use,independent item/rule copies,Worker16,selected XML and reopen. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/metadata gates, ap doctor,routing validator,git diff --check. Record actual implementation hash, quality review and clean final tracked state. No mandatory skips or whole-module/full-goal promotion.

## Verification

Pending implementation and declared checks. No mandatory gate is skipped.

## Rollback Plan

If needed revert only the scoped implementation through a new executable task. Preserve immutable DONE evidence and keep the full parent goal active.

## Findings

Preflight clean main/direct; parent202609240501-C9TN6M only active. User goal authorizes safe local iterations; no network/outside access or delegation. Previous turn is progress: iteration30 M2EDTZ DONE, real code fd0ede9f505568377bbcd15595938cb72dbfcf8c, quality417e99b6bd2e93918aa6a1cf96c0a9f6f2095c96, close8d2c70c5710de1a05fce8bfc40aeb44d01711192,parent8469c1ab21d8045c0efd66ec88a84c9f45294763. Pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native ordinary XMLTextListItemContext calls toInt32 then accepts0..SHRT_MAX and retains-1 otherwise; local parser throws. Existing listDeclarationInt32 already models bounded decimal fast-attribute grammar but lives under one consuming list-style context. Shared FastAttributeList API is an adapter over native sax fast-attribute bool/out-int access, not a claim of full native ownership. Invalid guessed optional source paths in read-only discovery were resolved to include/sax/fastattribs.hxx,sax/source/tools/fastattribs.cxx and include/o3tl/string_view.hxx; no mutation resulted. Native repeated-sublist restart,full attribute token/container/scalar/UNO architecture and all broader model/UI obligations remain open.

- Observation: Native harness compilation exits1: extracted with_length struct lacks its declaration semicolon because the balanced-body extractor stops at the closing brace.
  Impact: Adapter declaration assembly fails; no native/local conversion result has been compared yet.
  Resolution: Append the struct semicolon outside the unmodified body, persist the active harness artifacts and rerun; runtime scope and verification thresholds remain unchanged.
