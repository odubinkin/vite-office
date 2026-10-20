---
id: "202610200048-GWT2KJ"
title: "Implement Calc clear direct formatting through native hard-attribute deletion and history"
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
  updated_at: "2026-10-20T00:49:15.191Z"
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
    body: "Start: implement source-shaped Clear direct formatting through real hard-attribute deletion/history and existing shared Writer UI;verify declared scoped100 and actual ODS/browser behavior."
events:
  -
    type: "status"
    at: "2026-10-20T00:49:20.687Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-shaped Clear direct formatting through real hard-attribute deletion/history and existing shared Writer UI;verify declared scoped100 and actual ODS/browser behavior."
doc_version: 3
doc_updated_at: "2026-10-20T01:13:06.239Z"
doc_updated_by: "CODER"
description: "Task45 of the continuing authorized Calc UI goal. Wire existing shared Writer Clear command and shortcut to the actual native SID_CELL_FORMAT_RESET HARDATTR|EDITATTR path for represented plain cells. Preserve styles,merge fields,cell data,selection/grouping and native attribute Undo/Redo;extend original document/table/column/attribute-array deletion owners and real ODS verification. Stay only in calc checkout/branch;no network,branches or integration;next full checkpoint50."
sections:
  Summary: "Task45: enable native Calc Clear direct formatting in the shared Writer menu/shortcut through real hard-attribute deletion owners and genuine history. Continue the approved overall UI goal without claiming full parity."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60 non-task paths: original sc attribute/document/table/column deletion methods,InsertDeleteFlags,source view/cell-shell/document-operation/undo boundaries,existing browser controller/dispatch,focused tests/e2e and exact runtime/provenance/capability/issue docs. Preserve original style and merge fields;represented plain cells only. No invented rich EditEngine,protection,matrix,alternate views,device or UNO services;do not replace deletion with explicit defaults. Related shared code only when actually required. No branches,merges,network,outside files or verification weakening."
  Plan: "1. Port native consumed hard-attribute deletion through ScAttrArray/Column/Table/Document,retaining style/merge/default-column ownership and original flag identities. 2. Connect native delete operation/history/view boundaries and existing shared Clear menu/shortcut with real input admission and marks. 3. Add source-derived kernel/ODS/browser/Worker tests and exact metadata/source issue evidence. 4. Run declared scoped100/related checks,quality review,commit and clean direct closure. Existing user authorization covers this safe local task;stop only for material scope/security/verification drift."
  Verify Steps: "Pin source hashes/anchors;read brief and route. Test actual ScAttrArray deletion across split/coalesced runs,default reuse,style inheritance and preserved merge/merge-flag items;actual document/table/column range/mark paths,grouped/disjoint selections,empty styled ranges and full-sheet default tails. Verify native command identity/no-arg path,input admission,no loss of strings/numbers/formulas/style names,Undo/Redo/save-point behavior and repeated no-op history consistent with source. Independently authored ODS styling and repeated packages preserve cleared direct item states,styles and all cell values. Run scoped Calc raw S/B/F/L100 plus related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build and real1280/390 shared menu/shortcut,history,primary ODS save/reload/open plus DOM-free Worker,no uncaught errors. Types,authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact commands/exits/raw/current hashes/source/browser evidence;record quality review,implementation commit and clean calc closure. Full checkpoint40 retained;next50."
  Verification: "Pass: full Calc132 files/408 cases,raw S8644/B5415/F1683/L7739 all100. Final original-flag retention correction in DocFuncUtil is verified by fresh3-file13-case complete helper-owner raw100;whole current raw maps/source hashes reconcile in calc-current-proof.json. All16 changed executable application owners100. Final focused13,related Writer9/shared110/tooling92 pass. Related browser9+8 unique cases pass;current Clear3-case rerun certifies final fresh production build at1280/390,shared menu/toolbar/Ctrl+M,history,primary ODS and DOM-free Worker. Actual native style/merge preservation,split/coalesced runs,inherited parent values,disjoint/grouped marks,default-column tails,source no-op history,save-point state,independent ODS text/numeric/formula preservation,STRING snapshot restoration/removal/re-interning and lifetime refcounts pass. Types,root authored lint/format plus current late checks,dependencies,JSDoc,size,resources,source tree/provenance,invariants/scoped parity,static,routing/doctor/diff pass. Exact argv/exits/logs/raw/source hashes/screenshots: evidence/verification-checks.json and proof files. Full checkpoint40 retained;next50. No broad parity promotion."
  Rollback Plan: "Revert only this task implementation and registration commits through a new authorized task;never reset unrelated user work or alter upstream reference."
  Findings: "Source ScCellShell26067 passes HARDATTR|EDITATTR through real ScViewFunc/ScDocFunc and DeleteCell/DeleteContent operation owners. ScAttrArray clears every direct item except merge/merge-flag,retains style names/parents and reuses canonical defaults. Source table deletion touches allocated columns only;CALC217 records the retained default-tail behavior. Source EDITATTR also snapshots ordinary STRING payloads: actual typed-store copying preserves re-interning,empty-string removal markers and lack of setter broadcasts. Discarded undo graphs release owned string stores/pool;native refcounts verify lifetime. An early implementation candidate incorrectly used an attribute-only snapshot and was corrected against the source before final evidence;late original flag bits are retained and the whole helper owner has fresh raw100. Full raw132/408 plus current helper3/13 reconcile whole current maps/hashes,never incompatible maps or stale code hashes. Initial fixture candidates used a wrong ScMF import,nonexistent GetString helper and nonfresh XML document;these were corrected to real owners. Existing viewfunc query code was temporarily replaced during extension;typecheck caught it and original functions were restored from HEAD before verification. Initial raw missed one unselected-sheet branch and old toolbar fixture still expected Clear disabled;meaningful selection test and actual newly enabled command expectation fix both. No thresholds,exclusions or tests were reduced. Only current plain/default-view hard/edit-attribute deletion is certified;rich text,style resolution,protection,matrix/merged-range expansion,conditional formats,drawing/alternate views/full services remain unverified. Related native sparkline deletion QA is a call-boundary reference,not executed full sparkline acceptance. Existing Writer primary-save/open/no-recovery deviations remain. No network,outside-repo files,branches or integration. Known deterministic close-subject CLI failure,if repeated,is recovered through the route and a meaningful task-artifact closure subject. Overall goal stays active;next full all-app checkpoint50."
id_source: "generated"
---
## Summary

Task45: enable native Calc Clear direct formatting in the shared Writer menu/shortcut through real hard-attribute deletion owners and genuine history. Continue the approved overall UI goal without claiming full parity.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60 non-task paths: original sc attribute/document/table/column deletion methods,InsertDeleteFlags,source view/cell-shell/document-operation/undo boundaries,existing browser controller/dispatch,focused tests/e2e and exact runtime/provenance/capability/issue docs. Preserve original style and merge fields;represented plain cells only. No invented rich EditEngine,protection,matrix,alternate views,device or UNO services;do not replace deletion with explicit defaults. Related shared code only when actually required. No branches,merges,network,outside files or verification weakening.

## Plan

1. Port native consumed hard-attribute deletion through ScAttrArray/Column/Table/Document,retaining style/merge/default-column ownership and original flag identities. 2. Connect native delete operation/history/view boundaries and existing shared Clear menu/shortcut with real input admission and marks. 3. Add source-derived kernel/ODS/browser/Worker tests and exact metadata/source issue evidence. 4. Run declared scoped100/related checks,quality review,commit and clean direct closure. Existing user authorization covers this safe local task;stop only for material scope/security/verification drift.

## Verify Steps

Pin source hashes/anchors;read brief and route. Test actual ScAttrArray deletion across split/coalesced runs,default reuse,style inheritance and preserved merge/merge-flag items;actual document/table/column range/mark paths,grouped/disjoint selections,empty styled ranges and full-sheet default tails. Verify native command identity/no-arg path,input admission,no loss of strings/numbers/formulas/style names,Undo/Redo/save-point behavior and repeated no-op history consistent with source. Independently authored ODS styling and repeated packages preserve cleared direct item states,styles and all cell values. Run scoped Calc raw S/B/F/L100 plus related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build and real1280/390 shared menu/shortcut,history,primary ODS save/reload/open plus DOM-free Worker,no uncaught errors. Types,authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact commands/exits/raw/current hashes/source/browser evidence;record quality review,implementation commit and clean calc closure. Full checkpoint40 retained;next50.

## Verification

Pass: full Calc132 files/408 cases,raw S8644/B5415/F1683/L7739 all100. Final original-flag retention correction in DocFuncUtil is verified by fresh3-file13-case complete helper-owner raw100;whole current raw maps/source hashes reconcile in calc-current-proof.json. All16 changed executable application owners100. Final focused13,related Writer9/shared110/tooling92 pass. Related browser9+8 unique cases pass;current Clear3-case rerun certifies final fresh production build at1280/390,shared menu/toolbar/Ctrl+M,history,primary ODS and DOM-free Worker. Actual native style/merge preservation,split/coalesced runs,inherited parent values,disjoint/grouped marks,default-column tails,source no-op history,save-point state,independent ODS text/numeric/formula preservation,STRING snapshot restoration/removal/re-interning and lifetime refcounts pass. Types,root authored lint/format plus current late checks,dependencies,JSDoc,size,resources,source tree/provenance,invariants/scoped parity,static,routing/doctor/diff pass. Exact argv/exits/logs/raw/source hashes/screenshots: evidence/verification-checks.json and proof files. Full checkpoint40 retained;next50. No broad parity promotion.

## Rollback Plan

Revert only this task implementation and registration commits through a new authorized task;never reset unrelated user work or alter upstream reference.

## Findings

Source ScCellShell26067 passes HARDATTR|EDITATTR through real ScViewFunc/ScDocFunc and DeleteCell/DeleteContent operation owners. ScAttrArray clears every direct item except merge/merge-flag,retains style names/parents and reuses canonical defaults. Source table deletion touches allocated columns only;CALC217 records the retained default-tail behavior. Source EDITATTR also snapshots ordinary STRING payloads: actual typed-store copying preserves re-interning,empty-string removal markers and lack of setter broadcasts. Discarded undo graphs release owned string stores/pool;native refcounts verify lifetime. An early implementation candidate incorrectly used an attribute-only snapshot and was corrected against the source before final evidence;late original flag bits are retained and the whole helper owner has fresh raw100. Full raw132/408 plus current helper3/13 reconcile whole current maps/hashes,never incompatible maps or stale code hashes. Initial fixture candidates used a wrong ScMF import,nonexistent GetString helper and nonfresh XML document;these were corrected to real owners. Existing viewfunc query code was temporarily replaced during extension;typecheck caught it and original functions were restored from HEAD before verification. Initial raw missed one unselected-sheet branch and old toolbar fixture still expected Clear disabled;meaningful selection test and actual newly enabled command expectation fix both. No thresholds,exclusions or tests were reduced. Only current plain/default-view hard/edit-attribute deletion is certified;rich text,style resolution,protection,matrix/merged-range expansion,conditional formats,drawing/alternate views/full services remain unverified. Related native sparkline deletion QA is a call-boundary reference,not executed full sparkline acceptance. Existing Writer primary-save/open/no-recovery deviations remain. No network,outside-repo files,branches or integration. Known deterministic close-subject CLI failure,if repeated,is recovered through the route and a meaningful task-artifact closure subject. Overall goal stays active;next full all-app checkpoint50.
