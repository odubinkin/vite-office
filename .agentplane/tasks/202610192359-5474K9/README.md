---
id: "202610192359-5474K9"
title: "Implement native Calc strikethrough UI and shared ODF crossed-out property handlers"
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
  updated_at: "2026-10-20T00:00:13.896Z"
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
    body: "Start: implement native Calc Strikeout and original shared ODF crossed-out handlers using actual item/selection/history/store owners;retain source quirks and current-owner raw100 evidence."
events:
  -
    type: "status"
    at: "2026-10-20T00:00:14.670Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native Calc Strikeout and original shared ODF crossed-out handlers using actual item/selection/history/store owners;retain source quirks and current-owner raw100 evidence."
doc_version: 3
doc_updated_at: "2026-10-20T00:00:14.670Z"
doc_updated_by: "CODER"
description: "Task43 of the authorized Calc UI goal after verified task42. Connect native Strikeout10013/Which106 with shared attribute toggle,actual SvxCrossedOutItem,selection/history,Writer menu and original shared crossed-out ODF type/style/width/text handlers. Calc branch/checkout only;targeted Calc100 plus related/current-owner100,next full checkpoint50."
sections:
  Summary: "Task43 adds native Strikethrough to the real Calc menu/document/ODS paths. Previous goal turn made verified authoritative progress:task42 implementation3cd98e2f9edd,closure5bf603575279,390Calc+58related cases raw100 and14browser cases. Overall UI goal remains active."
  Scope: "Only vite-office-calc branch calc,up to50non-task paths for shared original FontStrikeout IDL and XML crossed-out handlers,Calc typed formatting/controller/slot/plain-cell painting/ODS mapping,appropriate unit/browser tests and source/runtime/provenance/capability/issue records. Reuse actual shared toggle and Writer menu controls. No network,branches,merges,outside-repo access,full device/rich-edit emulation or verification weakening."
  Plan: "Audit pinned cdouthdl.cxx/FontStrikeout.idl and Calc ExecuteAttr/GetAttrState/SDI/property maps. Port shared native crossed-out type/style/width/text handlers using actual Any types,ordered enum tables and source precedence/failure/no-write rules;add original IDL constants. Bind Strikeout10013/106 via existing shared toggle and complete native item requests,real selection/history and Writer menu. Preserve ODS type/style/width/text fields through actual automatic style registration/import/export;plain-cell painting supports source line strikeout while retaining other line decorations. Test shared state/enum maps,source quirks,typed/default/mixed/grouped/disjoint/history/pending-input semantics,independent XML and page/Worker/UI persistence. Record suspected source issues,run Calc100 and complete modified-owner100 plus related/static/source/browser checks;quality,commit and clean closure,next full checkpoint50."
  Verify Steps: "Read task brief/verify-show and pin source hashes/line anchors. Run npm run test:coverage:calc with nonempty raw S/B/F/L100;related shared/Writer tests and full changed executable owner100 with current source hashes,no test/exclusion/threshold reductions. Verify original crossed-out maps,Any signed/unsigned extraction,merge priorities,no-write/failure cases,text first-codeunit rule,all factory/toggle/default/mixed states,complete typed item,grouped/disjoint selection,Undo/Redo,pending input. Verify native automatic ODS styles,independent authored XML and repeated reopen. Fresh build and focused1280/390browser actual shared Format/Text menu,checked/mixed state,painting,history,primary save/reload/reopen and true DOM-free Worker,no uncaught exceptions. Types,authored lint/format respecting existing ignored artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/scoped parity,affected tooling,static smoke,routing/doctor,diff. Retain exact commands/exits/counts/raw/source/browser evidence,quality report,implementation commit and clean final calc status. No full repeat before checkpoint50."
  Verification: "Pending native implementation and acceptance evidence."
  Rollback Plan: "Revert only task43 intentional implementation commits if required;retain evidence and unrelated task state. User owns branch integration."
  Findings: "Direct preflight confirms calc branch and clean tracked/untracked checkout. Existing user authorization covers canonical shared fixes and all feasible UI actions. Unrelated C9TN6M/X6VV8G/Z7BW2Y untouched. Source shared cdouthdl.cxx implements four original property handlers;original FontStrikeout UNO constants are absent locally. Existing SvxCrossedOutItem,bool projection and source default106NONE are available. Shared attribute-toggle helper from task42 must be reused. Next full checkpoint50."
id_source: "generated"
---
## Summary

Task43 adds native Strikethrough to the real Calc menu/document/ODS paths. Previous goal turn made verified authoritative progress:task42 implementation3cd98e2f9edd,closure5bf603575279,390Calc+58related cases raw100 and14browser cases. Overall UI goal remains active.

## Scope

Only vite-office-calc branch calc,up to50non-task paths for shared original FontStrikeout IDL and XML crossed-out handlers,Calc typed formatting/controller/slot/plain-cell painting/ODS mapping,appropriate unit/browser tests and source/runtime/provenance/capability/issue records. Reuse actual shared toggle and Writer menu controls. No network,branches,merges,outside-repo access,full device/rich-edit emulation or verification weakening.

## Plan

Audit pinned cdouthdl.cxx/FontStrikeout.idl and Calc ExecuteAttr/GetAttrState/SDI/property maps. Port shared native crossed-out type/style/width/text handlers using actual Any types,ordered enum tables and source precedence/failure/no-write rules;add original IDL constants. Bind Strikeout10013/106 via existing shared toggle and complete native item requests,real selection/history and Writer menu. Preserve ODS type/style/width/text fields through actual automatic style registration/import/export;plain-cell painting supports source line strikeout while retaining other line decorations. Test shared state/enum maps,source quirks,typed/default/mixed/grouped/disjoint/history/pending-input semantics,independent XML and page/Worker/UI persistence. Record suspected source issues,run Calc100 and complete modified-owner100 plus related/static/source/browser checks;quality,commit and clean closure,next full checkpoint50.

## Verify Steps

Read task brief/verify-show and pin source hashes/line anchors. Run npm run test:coverage:calc with nonempty raw S/B/F/L100;related shared/Writer tests and full changed executable owner100 with current source hashes,no test/exclusion/threshold reductions. Verify original crossed-out maps,Any signed/unsigned extraction,merge priorities,no-write/failure cases,text first-codeunit rule,all factory/toggle/default/mixed states,complete typed item,grouped/disjoint selection,Undo/Redo,pending input. Verify native automatic ODS styles,independent authored XML and repeated reopen. Fresh build and focused1280/390browser actual shared Format/Text menu,checked/mixed state,painting,history,primary save/reload/reopen and true DOM-free Worker,no uncaught exceptions. Types,authored lint/format respecting existing ignored artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/scoped parity,affected tooling,static smoke,routing/doctor,diff. Retain exact commands/exits/counts/raw/source/browser evidence,quality report,implementation commit and clean final calc status. No full repeat before checkpoint50.

## Verification

Pending native implementation and acceptance evidence.

## Rollback Plan

Revert only task43 intentional implementation commits if required;retain evidence and unrelated task state. User owns branch integration.

## Findings

Direct preflight confirms calc branch and clean tracked/untracked checkout. Existing user authorization covers canonical shared fixes and all feasible UI actions. Unrelated C9TN6M/X6VV8G/Z7BW2Y untouched. Source shared cdouthdl.cxx implements four original property handlers;original FontStrikeout UNO constants are absent locally. Existing SvxCrossedOutItem,bool projection and source default106NONE are available. Shared attribute-toggle helper from task42 must be reused. Next full checkpoint50.
