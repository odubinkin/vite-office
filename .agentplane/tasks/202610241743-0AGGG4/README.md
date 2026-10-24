---
id: "202610241743-0AGGG4"
title: "Writer paragraph page-break controls and native dependencies"
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
  updated_at: "2026-10-24T17:44:42.208Z"
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
    body: "Start: implement represented native page-break controls and source dependencies with targeted verification."
events:
  -
    type: "status"
    at: "2026-10-24T17:44:46.774Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement represented native page-break controls and source dependencies with targeted verification."
doc_version: 3
doc_updated_at: "2026-10-24T17:51:28.265Z"
doc_updated_by: "CODER"
description: "Replace independent page-break controls with the represented definite SvxExtParagraphTabPage contract and connect existing Writer attributes without introducing column break support."
sections:
  Summary: "Canonize definite page-only paragraph break controls and native style/number dependencies using existing Writer attributes."
  Scope: "Writer branch/checkout only. Up to24 primary source/test/docs paths plus paired registry/task artifacts. Existing represented page breaks,style and page offset;no columns,mixed or HTML state,new library,network or full suite. Task8after checkpoint;first of3."
  Plan: "Extend consumed SvxExtParagraphTabPage with definite page-only Reset,handlers,saved-value and FillItemSet decisions from pinned paragrph.cxx/textflowpage.ui. Replace independent controls with source Breaks group,Insert,Type Page,Position,With page style,Page number and dependencies. Preserve hidden widget drafts and unchanged imported attributes;style owns break NONE and page-offset emission is sensitivity gated. Add source boundary and actual dialog/core/history/ODT regression coverage,paired records and suspected-issue note if needed. Focused coverage,build,browser1280/390 and source gates;verify,evaluate,finish. Then execute next consistency task and full checkpoint task,pause after third."
  Verify Steps: "Focused Vitest for new source decisions,existing split tests,Paragraph dialog,AdvancedFormattingControls,writer-paragraph-toolbar,attribute/ODT consumers;strict100coverage of new represented source decisions without ignores or lowering thresholds. Test Reset with absent,known/unknown styles,before/after/both imports,no-op Fill,dependent enabled states,retained disabled drafts,default style selection,source page-number bounds and changed-only emission. Build and production Chromium1280/390 actual Format request,Cancel,accept,Undo/Redo,ODT export/reopen,no page errors and screenshots. Scoped format/lint,typecheck,docs,deps,size,tree,provenance,resources,registry,invariants/parity,static,doctor,routing,diff. Record exact evidence,evaluator pass,clean finish;full suite due task10."
  Verification: "Command (apps/office): npx vitest run src/cui/source/tabpages/paragrph.test.ts src/sw/browser/presentation/WriterParagraphDialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/writer-paragraph-toolbar.test.tsx src/sw/source/uibase/shells/textsh1.test.ts src/sw/source/filter/xml/odt-property-roundtrip.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/browser/presentation/WriterPageLayout.test.tsx --coverage --coverage.include=src/cui/source/tabpages/paragrph.ts --coverage.reportsDirectory=coverage/0AGGG4-final. Result: pass76cases/9files;strict100 S96/B125/F17/L84. Evidence:output/playwright/writer-full-checkpoint/0AGGG4-coverage-exact.log. Scope:actual paragraph requests,core validation,history,ODT0/55535/65535 and new original control decisions. Command:npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-break-controls.spec.ts. Result:2production Chromium1280/390 pass,cancel,accept,dependencies,Undo/Redo,ODT export/reopen;both screenshots inspected. Command:15exact argv in0AGGG4-gates.json. Result:15/15pass;registry build separately passed. Scope:format/lint,typecheck,docs,deps,size,tree,provenance,resources,invariants/parity,static,doctor,routing,diff. Final source hashes in0AGGG4-hashes.json. No full suite due(task8)."
  Rollback Plan: "Revert only this task implementation commit;retain unrelated tasks and commits."
  Findings: "Source permits zero offset and spin bound55535;WRITER091 documents it. Actual core and ODT preserve0/55535/65535;untouched imported offsets retain original values. Synthetic old-item equality guard coverage is explicitly marked unreachable for ordinary snapshotted dialog inputs. Existing mixed/HTML,column controls and complete property-service semantics remain unported. Source review found signed XML numeric handler and browser transfer zero/absent distinction needing a coherent follow-up;second authorized task addresses those contracts before checkpoint. Initial fixture selectors and source JSDoc/lint defects fixed;all15final gates pass. No threshold reduction or coverage ignore."
id_source: "generated"
---
## Summary

Canonize definite page-only paragraph break controls and native style/number dependencies using existing Writer attributes.

## Scope

Writer branch/checkout only. Up to24 primary source/test/docs paths plus paired registry/task artifacts. Existing represented page breaks,style and page offset;no columns,mixed or HTML state,new library,network or full suite. Task8after checkpoint;first of3.

## Plan

Extend consumed SvxExtParagraphTabPage with definite page-only Reset,handlers,saved-value and FillItemSet decisions from pinned paragrph.cxx/textflowpage.ui. Replace independent controls with source Breaks group,Insert,Type Page,Position,With page style,Page number and dependencies. Preserve hidden widget drafts and unchanged imported attributes;style owns break NONE and page-offset emission is sensitivity gated. Add source boundary and actual dialog/core/history/ODT regression coverage,paired records and suspected-issue note if needed. Focused coverage,build,browser1280/390 and source gates;verify,evaluate,finish. Then execute next consistency task and full checkpoint task,pause after third.

## Verify Steps

Focused Vitest for new source decisions,existing split tests,Paragraph dialog,AdvancedFormattingControls,writer-paragraph-toolbar,attribute/ODT consumers;strict100coverage of new represented source decisions without ignores or lowering thresholds. Test Reset with absent,known/unknown styles,before/after/both imports,no-op Fill,dependent enabled states,retained disabled drafts,default style selection,source page-number bounds and changed-only emission. Build and production Chromium1280/390 actual Format request,Cancel,accept,Undo/Redo,ODT export/reopen,no page errors and screenshots. Scoped format/lint,typecheck,docs,deps,size,tree,provenance,resources,registry,invariants/parity,static,doctor,routing,diff. Record exact evidence,evaluator pass,clean finish;full suite due task10.

## Verification

Command (apps/office): npx vitest run src/cui/source/tabpages/paragrph.test.ts src/sw/browser/presentation/WriterParagraphDialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/writer-paragraph-toolbar.test.tsx src/sw/source/uibase/shells/textsh1.test.ts src/sw/source/filter/xml/odt-property-roundtrip.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/browser/presentation/WriterPageLayout.test.tsx --coverage --coverage.include=src/cui/source/tabpages/paragrph.ts --coverage.reportsDirectory=coverage/0AGGG4-final. Result: pass76cases/9files;strict100 S96/B125/F17/L84. Evidence:output/playwright/writer-full-checkpoint/0AGGG4-coverage-exact.log. Scope:actual paragraph requests,core validation,history,ODT0/55535/65535 and new original control decisions. Command:npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-break-controls.spec.ts. Result:2production Chromium1280/390 pass,cancel,accept,dependencies,Undo/Redo,ODT export/reopen;both screenshots inspected. Command:15exact argv in0AGGG4-gates.json. Result:15/15pass;registry build separately passed. Scope:format/lint,typecheck,docs,deps,size,tree,provenance,resources,invariants/parity,static,doctor,routing,diff. Final source hashes in0AGGG4-hashes.json. No full suite due(task8).

## Rollback Plan

Revert only this task implementation commit;retain unrelated tasks and commits.

## Findings

Source permits zero offset and spin bound55535;WRITER091 documents it. Actual core and ODT preserve0/55535/65535;untouched imported offsets retain original values. Synthetic old-item equality guard coverage is explicitly marked unreachable for ordinary snapshotted dialog inputs. Existing mixed/HTML,column controls and complete property-service semantics remain unported. Source review found signed XML numeric handler and browser transfer zero/absent distinction needing a coherent follow-up;second authorized task addresses those contracts before checkpoint. Initial fixture selectors and source JSDoc/lint defects fixed;all15final gates pass. No threshold reduction or coverage ignore.
