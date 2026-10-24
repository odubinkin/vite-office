---
id: "202610241702-J1K3KF"
title: "Canonize Writer line-number core widths and ODT interval import"
status: "DOING"
priority: "high"
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
doc_updated_at: "2026-10-24T17:07:13.293Z"
doc_updated_by: "CODER"
description: "Second and last of exactly two tasks authorized after H0Q3NZ. Align existing unsigned16 line-number core scalar fields and strict transfer validation with native typed ownership;reuse existing sax Converter for original ODT signed16 interval narrowing and UNO main-positive/separator-nonnegative admission. Preserve ignored-invalid behavior rather than throwing for interval values. Test boundaries,defaults,real ODT re-export and source UI normalization. No other import attributes,format/style services,network or other tasks. Only writer checkout/branch,up to24primary paths plus paired records. Task5after checkpoint,no full suite due. Close this task and pause goal."
sections:
  Summary: "Canonize represented line-number scalar widths and native interval import admission."
  Scope: "Only writer checkout/branch;up to24primary paths plus paired records. Existing scalar/core/ODT interval responsibilities and tests only;no other attribute parser,format/style/UNO service implementation,network or additional tasks. Second and last task;pause goal after closure."
  Plan: "Keep unsigned16 core scalar ownership in constructor/setters and reject out-of-width transfer values. Replace ad-hoc interval Number conversion/range throw with existing native sax Converter,source signed16 narrowing and original positive main/nonnegative separator admission;preserve fallback when invalid or narrowed negative. Retain source edge behavior and document suspected narrowing issue. Test source boundaries,all core/query/copy behavior,real ODT import/re-export and current dialog normalization. Run focused proof and declared gates,commit,evaluate,close and pause goal."
  Verify Steps: "Run focused Vitest for lineinfo,ODT line numbering,native SAX converter and source dialog. Require strict100coverage for changed core lineinfo and XMLLineNumberingImportContext;cover every new branch without ignores/threshold changes. Cases include0,32767,32768,65535,65536,65537,signed32 overflow,negative,empty,leading/trailing whitespace,plus/fraction/invalid strings,missing values and divider zero. Verify direct ushort setters/constructor,transfer rejection,copy/equality,real ODT re-export and source dialog clamping. Run related model/layout consumers and production Chromium1280/390 line-number controls/ODT. Build,typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean status. Task5after full checkpoint;no full suite due. Record evaluator pass,finish exactly this second task and pause goal."
  Verification: |-
    Command (apps/office): npx vitest run src/sw/inc/lineinfo.test.ts src/sw/source/filter/xml/odt-line-numbering.test.ts src/xmloff/source/text/native-line-number-interval.test.ts src/sax/source/tools/converter-number.test.ts src/sw/source/ui/misc/linenum.test.ts --coverage --coverage.include=src/sw/inc/lineinfo.ts --coverage.include=src/xmloff/source/text/XMLLineNumberingImportContext.ts --coverage.include=src/xmloff/source/text/XMLLineNumberingExport.ts --coverage.reportsDirectory=coverage/J1K3KF-final.
    Result: pass,14cases/5files;strict3owner100coverage S79/B70/F35/L72,zero skips/no ignores or reduced thresholds. Evidence:J1K3KF-coverage-final.log and coverage/J1K3KF-final summary. Scope: core defaults/copy/equality/getters/setters/transfer bounds;all new SAX/narrowing/admission branches;native source UI normalization;real package/model/filter import and re-export including rare negative exported intervals.
    Command: exact native consumer argv HGNC48-consumers-args.json. Result: pass,152cases/20files,J1K3KF-consumers.log. Scope: current source model/layout/browser consumers.
    Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-line-number-controls.spec.ts. Result: pass,2production cases1280/390,J1K3KF-build-final.log/J1K3KF-e2e.log;no page errors. Scope: current source UI,actual menu/controller/document/ODT zero separator interval and focus,draft cancellation/acceptance. Both width screenshots inspected for the unchanged UI in the first task.
    Command: exact final15command argv in J1K3KF-gates.json. Result: pass,15/15;corresponding J1K3KF-gate-N.log. Scope: scoped format/lint,typecheck,docs,deps,size,tree,provenance,resources,registry invariants/parity,static,doctor,routing,diff;registry build separately passed. J1K3KF-hashes.json binds all final implementation/test/paired-record/doc paths. Initial build test-type error corrected by supplying the actual base-context end token;runtime tests and final build pass. This is task5after checkpoint;no full suite due. Second and last authorized task;finish and pause goal.
  Rollback Plan: "Revert only this task commits;preserve first completed task and other work."
  Findings: |-
    Native core countBy,dividerCountBy,posFromLeft are unsigned16. Constructor and typed setters retain integer narrowing;untrusted transfer restoration validates the stored domain rather than silently accepting impossible-width state. Existing SAX Converter is reused;no library or second parser was introduced.
    The source ODT interval path converts with minimum0,then narrows to signed16. Main interval must be positive;separator interval may be0. Invalid,narrowed-negative or nonpositive main values retain the original defaults. Existing exception expectation for negative interval input was replaced by source-backed fallback/ODT assertions. Tests preserve leading/trailing whitespace,empty strings,invalid/plus/fractional lexemes and signed32/16 boundaries. Native property reads/export narrow unsigned core intervals to signed16 too;XML export retains that behavior and rare direct-core negative interval round-trip is tested. WRITER089 documents this surprising upstream behavior without fixing it.
    Full UNO supplier/style services and other ODT boolean,format,position/offset paths remain bounded existing implementation and are not certified by this leaf. No classifications/default parity states promoted,no parser-wide changes,network,other tasks,merge or full suite. Initial test endFastElement type mismatch was repaired with its actual token argument. Exactly two authorized tasks are now implemented;after this closure pause goal.
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

Command (apps/office): npx vitest run src/sw/inc/lineinfo.test.ts src/sw/source/filter/xml/odt-line-numbering.test.ts src/xmloff/source/text/native-line-number-interval.test.ts src/sax/source/tools/converter-number.test.ts src/sw/source/ui/misc/linenum.test.ts --coverage --coverage.include=src/sw/inc/lineinfo.ts --coverage.include=src/xmloff/source/text/XMLLineNumberingImportContext.ts --coverage.include=src/xmloff/source/text/XMLLineNumberingExport.ts --coverage.reportsDirectory=coverage/J1K3KF-final.
Result: pass,14cases/5files;strict3owner100coverage S79/B70/F35/L72,zero skips/no ignores or reduced thresholds. Evidence:J1K3KF-coverage-final.log and coverage/J1K3KF-final summary. Scope: core defaults/copy/equality/getters/setters/transfer bounds;all new SAX/narrowing/admission branches;native source UI normalization;real package/model/filter import and re-export including rare negative exported intervals.
Command: exact native consumer argv HGNC48-consumers-args.json. Result: pass,152cases/20files,J1K3KF-consumers.log. Scope: current source model/layout/browser consumers.
Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-line-number-controls.spec.ts. Result: pass,2production cases1280/390,J1K3KF-build-final.log/J1K3KF-e2e.log;no page errors. Scope: current source UI,actual menu/controller/document/ODT zero separator interval and focus,draft cancellation/acceptance. Both width screenshots inspected for the unchanged UI in the first task.
Command: exact final15command argv in J1K3KF-gates.json. Result: pass,15/15;corresponding J1K3KF-gate-N.log. Scope: scoped format/lint,typecheck,docs,deps,size,tree,provenance,resources,registry invariants/parity,static,doctor,routing,diff;registry build separately passed. J1K3KF-hashes.json binds all final implementation/test/paired-record/doc paths. Initial build test-type error corrected by supplying the actual base-context end token;runtime tests and final build pass. This is task5after checkpoint;no full suite due. Second and last authorized task;finish and pause goal.

## Rollback Plan

Revert only this task commits;preserve first completed task and other work.

## Findings

Native core countBy,dividerCountBy,posFromLeft are unsigned16. Constructor and typed setters retain integer narrowing;untrusted transfer restoration validates the stored domain rather than silently accepting impossible-width state. Existing SAX Converter is reused;no library or second parser was introduced.
The source ODT interval path converts with minimum0,then narrows to signed16. Main interval must be positive;separator interval may be0. Invalid,narrowed-negative or nonpositive main values retain the original defaults. Existing exception expectation for negative interval input was replaced by source-backed fallback/ODT assertions. Tests preserve leading/trailing whitespace,empty strings,invalid/plus/fractional lexemes and signed32/16 boundaries. Native property reads/export narrow unsigned core intervals to signed16 too;XML export retains that behavior and rare direct-core negative interval round-trip is tested. WRITER089 documents this surprising upstream behavior without fixing it.
Full UNO supplier/style services and other ODT boolean,format,position/offset paths remain bounded existing implementation and are not certified by this leaf. No classifications/default parity states promoted,no parser-wide changes,network,other tasks,merge or full suite. Initial test endFastElement type mismatch was repaired with its actual token argument. Exactly two authorized tasks are now implemented;after this closure pause goal.
