---
id: "202610241702-J1K3KF"
title: "Canonize Writer line-number core widths and ODT interval import"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-24T17:02:34.478Z"
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
    body: "Start: implement native line-number unsigned scalar and ODT signed interval contracts,verify and close second task then pause goal."
events:
  -
    type: "status"
    at: "2026-10-24T17:02:39.964Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native line-number unsigned scalar and ODT signed interval contracts,verify and close second task then pause goal."
doc_version: 3
doc_updated_at: "2026-10-24T17:02:39.964Z"
doc_updated_by: "CODER"
description: "Second and last of exactly two tasks authorized after H0Q3NZ. Align existing unsigned16 line-number core scalar fields and strict transfer validation with native typed ownership;reuse existing sax Converter for original ODT signed16 interval narrowing and UNO main-positive/separator-nonnegative admission. Preserve ignored-invalid behavior rather than throwing for interval values. Test boundaries,defaults,real ODT re-export and source UI normalization. No other import attributes,format/style services,network or other tasks. Only writer checkout/branch,up to24primary paths plus paired records. Task5after checkpoint,no full suite due. Close this task and pause goal."
sections:
  Summary: "Canonize represented line-number scalar widths and native interval import admission."
  Scope: "Only writer checkout/branch;up to24primary paths plus paired records. Existing scalar/core/ODT interval responsibilities and tests only;no other attribute parser,format/style/UNO service implementation,network or additional tasks. Second and last task;pause goal after closure."
  Plan: "Keep unsigned16 core scalar ownership in constructor/setters and reject out-of-width transfer values. Replace ad-hoc interval Number conversion/range throw with existing native sax Converter,source signed16 narrowing and original positive main/nonnegative separator admission;preserve fallback when invalid or narrowed negative. Retain source edge behavior and document suspected narrowing issue. Test source boundaries,all core/query/copy behavior,real ODT import/re-export and current dialog normalization. Run focused proof and declared gates,commit,evaluate,close and pause goal."
  Verify Steps: "Run focused Vitest for lineinfo,ODT line numbering,native SAX converter and source dialog. Require strict100coverage for changed core lineinfo and XMLLineNumberingImportContext;cover every new branch without ignores/threshold changes. Cases include0,32767,32768,65535,65536,65537,signed32 overflow,negative,empty,leading/trailing whitespace,plus/fraction/invalid strings,missing values and divider zero. Verify direct ushort setters/constructor,transfer rejection,copy/equality,real ODT re-export and source dialog clamping. Run related model/layout consumers and production Chromium1280/390 line-number controls/ODT. Build,typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean status. Task5after full checkpoint;no full suite due. Record evaluator pass,finish exactly this second task and pause goal."
  Verification: "Pending implementation and focused checks."
  Rollback Plan: "Revert only this task commits;preserve first completed task and other work."
  Findings: "Pinned XMLLineNumberingImportContext converts with sax Converter(min0),narrows to sal_Int16 and ignores negatives. UNO Interval admits only>0;SeparatorInterval admits>=0. Native core fields are sal_uInt16. Existing parser throws for out-of-range/fraction strings and accepts main0 directly;existing JS core setters retain out-of-width numbers."
id_source: "generated"
---
## Summary

Canonize represented line-number scalar widths and native interval import admission.

## Scope

Only writer checkout/branch;up to24primary paths plus paired records. Existing scalar/core/ODT interval responsibilities and tests only;no other attribute parser,format/style/UNO service implementation,network or additional tasks. Second and last task;pause goal after closure.

## Plan

Keep unsigned16 core scalar ownership in constructor/setters and reject out-of-width transfer values. Replace ad-hoc interval Number conversion/range throw with existing native sax Converter,source signed16 narrowing and original positive main/nonnegative separator admission;preserve fallback when invalid or narrowed negative. Retain source edge behavior and document suspected narrowing issue. Test source boundaries,all core/query/copy behavior,real ODT import/re-export and current dialog normalization. Run focused proof and declared gates,commit,evaluate,close and pause goal.

## Verify Steps

Run focused Vitest for lineinfo,ODT line numbering,native SAX converter and source dialog. Require strict100coverage for changed core lineinfo and XMLLineNumberingImportContext;cover every new branch without ignores/threshold changes. Cases include0,32767,32768,65535,65536,65537,signed32 overflow,negative,empty,leading/trailing whitespace,plus/fraction/invalid strings,missing values and divider zero. Verify direct ushort setters/constructor,transfer rejection,copy/equality,real ODT re-export and source dialog clamping. Run related model/layout consumers and production Chromium1280/390 line-number controls/ODT. Build,typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean status. Task5after full checkpoint;no full suite due. Record evaluator pass,finish exactly this second task and pause goal.

## Verification

Pending implementation and focused checks.

## Rollback Plan

Revert only this task commits;preserve first completed task and other work.

## Findings

Pinned XMLLineNumberingImportContext converts with sax Converter(min0),narrows to sal_Int16 and ignores negatives. UNO Interval admits only>0;SeparatorInterval admits>=0. Native core fields are sal_uInt16. Existing parser throws for out-of-range/fraction strings and accepts main0 directly;existing JS core setters retain out-of-width numbers.
