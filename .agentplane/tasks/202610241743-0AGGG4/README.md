---
id: "202610241743-0AGGG4"
title: "Writer paragraph page-break controls and native dependencies"
status: "DOING"
priority: "med"
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
doc_updated_at: "2026-10-24T17:44:46.774Z"
doc_updated_by: "CODER"
description: "Replace independent page-break controls with the represented definite SvxExtParagraphTabPage contract and connect existing Writer attributes without introducing column break support."
sections:
  Summary: "Canonize definite page-only paragraph break controls and native style/number dependencies using existing Writer attributes."
  Scope: "Writer branch/checkout only. Up to24 primary source/test/docs paths plus paired registry/task artifacts. Existing represented page breaks,style and page offset;no columns,mixed or HTML state,new library,network or full suite. Task8after checkpoint;first of3."
  Plan: "Extend consumed SvxExtParagraphTabPage with definite page-only Reset,handlers,saved-value and FillItemSet decisions from pinned paragrph.cxx/textflowpage.ui. Replace independent controls with source Breaks group,Insert,Type Page,Position,With page style,Page number and dependencies. Preserve hidden widget drafts and unchanged imported attributes;style owns break NONE and page-offset emission is sensitivity gated. Add source boundary and actual dialog/core/history/ODT regression coverage,paired records and suspected-issue note if needed. Focused coverage,build,browser1280/390 and source gates;verify,evaluate,finish. Then execute next consistency task and full checkpoint task,pause after third."
  Verify Steps: "Focused Vitest for new source decisions,existing split tests,Paragraph dialog,AdvancedFormattingControls,writer-paragraph-toolbar,attribute/ODT consumers;strict100coverage of new represented source decisions without ignores or lowering thresholds. Test Reset with absent,known/unknown styles,before/after/both imports,no-op Fill,dependent enabled states,retained disabled drafts,default style selection,source page-number bounds and changed-only emission. Build and production Chromium1280/390 actual Format request,Cancel,accept,Undo/Redo,ODT export/reopen,no page errors and screenshots. Scoped format/lint,typecheck,docs,deps,size,tree,provenance,resources,registry,invariants/parity,static,doctor,routing,diff. Record exact evidence,evaluator pass,clean finish;full suite due task10."
  Verification: "Pending implementation and scoped checks."
  Rollback Plan: "Revert only this task implementation commit;retain unrelated tasks and commits."
  Findings: "User continuation authorizes three in-scope tasks. Existing core supports only page breaks;unsupported column choices will not be advertised. Upstream spinPageNumber upper bound55535,lower0 is preserved and will be documented."
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

Pending implementation and scoped checks.

## Rollback Plan

Revert only this task implementation commit;retain unrelated tasks and commits.

## Findings

User continuation authorizes three in-scope tasks. Existing core supports only page breaks;unsupported column choices will not be advertised. Upstream spinPageNumber upper bound55535,lower0 is preserved and will be documented.
