---
id: "202610200048-GWT2KJ"
title: "Implement Calc clear direct formatting through native hard-attribute deletion and history"
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
doc_updated_at: "2026-10-20T00:49:20.687Z"
doc_updated_by: "CODER"
description: "Task45 of the continuing authorized Calc UI goal. Wire existing shared Writer Clear command and shortcut to the actual native SID_CELL_FORMAT_RESET HARDATTR|EDITATTR path for represented plain cells. Preserve styles,merge fields,cell data,selection/grouping and native attribute Undo/Redo;extend original document/table/column/attribute-array deletion owners and real ODS verification. Stay only in calc checkout/branch;no network,branches or integration;next full checkpoint50."
sections:
  Summary: "Task45: enable native Calc Clear direct formatting in the shared Writer menu/shortcut through real hard-attribute deletion owners and genuine history. Continue the approved overall UI goal without claiming full parity."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60 non-task paths: original sc attribute/document/table/column deletion methods,InsertDeleteFlags,source view/cell-shell/document-operation/undo boundaries,existing browser controller/dispatch,focused tests/e2e and exact runtime/provenance/capability/issue docs. Preserve original style and merge fields;represented plain cells only. No invented rich EditEngine,protection,matrix,alternate views,device or UNO services;do not replace deletion with explicit defaults. Related shared code only when actually required. No branches,merges,network,outside files or verification weakening."
  Plan: "1. Port native consumed hard-attribute deletion through ScAttrArray/Column/Table/Document,retaining style/merge/default-column ownership and original flag identities. 2. Connect native delete operation/history/view boundaries and existing shared Clear menu/shortcut with real input admission and marks. 3. Add source-derived kernel/ODS/browser/Worker tests and exact metadata/source issue evidence. 4. Run declared scoped100/related checks,quality review,commit and clean direct closure. Existing user authorization covers this safe local task;stop only for material scope/security/verification drift."
  Verify Steps: "Pin source hashes/anchors;read brief and route. Test actual ScAttrArray deletion across split/coalesced runs,default reuse,style inheritance and preserved merge/merge-flag items;actual document/table/column range/mark paths,grouped/disjoint selections,empty styled ranges and full-sheet default tails. Verify native command identity/no-arg path,input admission,no loss of strings/numbers/formulas/style names,Undo/Redo/save-point behavior and repeated no-op history consistent with source. Independently authored ODS styling and repeated packages preserve cleared direct item states,styles and all cell values. Run scoped Calc raw S/B/F/L100 plus related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build and real1280/390 shared menu/shortcut,history,primary ODS save/reload/open plus DOM-free Worker,no uncaught errors. Types,authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact commands/exits/raw/current hashes/source/browser evidence;record quality review,implementation commit and clean calc closure. Full checkpoint40 retained;next50."
  Verification: "Pending implementation and declared scoped checks;no completion or broad parity claim."
  Rollback Plan: "Revert only this task implementation and registration commits through a new authorized task;never reset unrelated user work or alter upstream reference."
  Findings: "Preflight clean calc;previous task44 is verified progress. Native cellsh3 SID_CELL_FORMAT_RESET invokes HARDATTR|EDITATTR deletion. Original ScAttrArray::DeleteHardAttr clears all direct item ids except ATTR_MERGE and ATTR_MERGE_FLAG,retaining styles and reusing the document default pattern when equal. Source DeleteContentOperation/DeleteCellOperation and ScUndoDeleteContents own deletion/history;do not fake reset by applying pool defaults. Existing represented cell model has no rich EditText attributes;that branch is not certified."
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

Pending implementation and declared scoped checks;no completion or broad parity claim.

## Rollback Plan

Revert only this task implementation and registration commits through a new authorized task;never reset unrelated user work or alter upstream reference.

## Findings

Preflight clean calc;previous task44 is verified progress. Native cellsh3 SID_CELL_FORMAT_RESET invokes HARDATTR|EDITATTR deletion. Original ScAttrArray::DeleteHardAttr clears all direct item ids except ATTR_MERGE and ATTR_MERGE_FLAG,retaining styles and reusing the document default pattern when equal. Source DeleteContentOperation/DeleteCellOperation and ScUndoDeleteContents own deletion/history;do not fake reset by applying pool defaults. Existing represented cell model has no rich EditText attributes;that branch is not certified.
