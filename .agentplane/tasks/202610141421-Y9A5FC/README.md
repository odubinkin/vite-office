---
id: "202610141421-Y9A5FC"
title: "Implement native shared font-color attribute ownership for Calc"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T14:23:16.169Z"
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
    body: "Start: original shared ColorItem value prerequisites and actual Calc font-color109 ownership, no fake UNO or DocPool/provider."
events:
  -
    type: "status"
    at: "2026-10-14T14:23:25.403Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original shared ColorItem value prerequisites and actual Calc font-color109 ownership, no fake UNO or DocPool/provider."
doc_version: 3
doc_updated_at: "2026-10-14T14:23:25.403Z"
doc_updated_by: "CODER"
description: "Task131: actual SvxColorItem value ownership, canonical colritem header, original defaults/constructors/copy/clone/color and ComplexColor access/equality/hash. Use real shared Color/ComplexColor and actual item sets, no fake DocPool. Native Any interface transport/presentation/Writer string migration remain a later phase once actual shared UNO helper exists, no scalar compatibility proxy."
sections:
  Summary: "Task131 adds real SvxColorItem value ownership required by ScDocumentPool, not a color scalar proxy. Use canonical header and single shared source class with actual Tools Color/docmodel ComplexColor/SVL item peers. Success: original value defaults/constructors/copy/clone/access/equality/hash and real Calc Which109 itemset copies, strict related and Calc100, inventory and clean calc. Full run only actual minimum UI/document+ODS readiness then pause."
  Scope: "At most18paths: new editeng/inc/colritem.ts, source/items/textitem.color.ts and native-font-color.test.ts; existing sc/inc/scitems.ts ATTR_FONT_COLOR109 and actual color-defaults.test.ts; runtime/provenance records for3owners and one shared capability; scripts module-boundary graph/test for native editeng->docmodel; calc-core progress. Native Any/UNO interface wrapper, presentation/XMLdump and Writer string/color consumer migration remain later once actual helper exists. No placeholder complex-color Any member or fabricated DocPool/default factory."
  Plan: "Real shared SvxColorItem value/clone/color/complex/equality/hash owner, canonical header; actual Calc109 Auto/defaultUnused Complex through real itemset copies. Strict8sharedowners and Calc raw100,12gates33boundaries, inventory/native/sourcehash review. Any/UNO helpers and Writer full migration pending, no fake transport or DocPool. No full before UI/ODS readiness."
  Verify Steps: "Read include/editeng/colritem.hxx and editeng/source/items/textitem.cxx constructors/operator==/hash/Clone/getters; actual include/docmodel/color/ComplexColor.hxx, sc/inc/scitems.hxx ATTR_FONT_COLOR109, sc/source/core/data/docpool.cxx COL_AUTO default. Native real sc/qa/unit/ucalc_DocumentThemes.cxx color/complex/Which value usage. Literal all4constructors/headerconstant/factory defaults, stable borrowed color/complex, input/copy/clone independence, setters do not synchronize unrelated final/complex fields, samevalue/differentWhich equality/hash, all equality guards and original hash fold. Actual itemset copy/default ownership with109/COL_AUTO/UnusedComplex; themed ctor retains caller state, no fake resolver. Strict related8completeowners100S/B/F/L everycounterpositive and npm run test:coverage:calc.4upstream links absent/restoredfinally.12format/lint/typecheck/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates and33boundaries. Exactallowlist/sourcehash/nativepins and clean calc, no full/browser before actual readiness."
  Verification: "Pending implementation and checks."
  Rollback Plan: "Revert only this task implementation and metadata with a later approved task; no reset, merging or unrelated edits."
  Findings: "Previous turn authoritative progress: shared ComplexColor completed. Preflight clean calc. SvxColorItem natively owns Color plus defaultUnused ComplexColor; fontAuto is Which109 from actual ScDocPool. Existing canonical wrappers for XComplexColor/WeakImplHelper are absent; value phase avoids replacing those helpers with a fake provider or rebuilding native memory-management mechanisms. Any methods are not implemented in this value phase and inherited base unsupported projection is not claimed as native SvxColorItem transport. Native textitem shared owner already split for size; color methods get their own source shard. Direct editeng QA search and sw attr search had no explicit ColorItem tests; bounded Calc QA fallback found real ucalc_DocumentThemes ctor/getColor consumers, no fullQA claim. Existing Writer scalar string state is not converted until full actual transport/state integration exists, no compatibility constructor added."
id_source: "generated"
---
## Summary

Task131 adds real SvxColorItem value ownership required by ScDocumentPool, not a color scalar proxy. Use canonical header and single shared source class with actual Tools Color/docmodel ComplexColor/SVL item peers. Success: original value defaults/constructors/copy/clone/access/equality/hash and real Calc Which109 itemset copies, strict related and Calc100, inventory and clean calc. Full run only actual minimum UI/document+ODS readiness then pause.

## Scope

At most18paths: new editeng/inc/colritem.ts, source/items/textitem.color.ts and native-font-color.test.ts; existing sc/inc/scitems.ts ATTR_FONT_COLOR109 and actual color-defaults.test.ts; runtime/provenance records for3owners and one shared capability; scripts module-boundary graph/test for native editeng->docmodel; calc-core progress. Native Any/UNO interface wrapper, presentation/XMLdump and Writer string/color consumer migration remain later once actual helper exists. No placeholder complex-color Any member or fabricated DocPool/default factory.

## Plan

Real shared SvxColorItem value/clone/color/complex/equality/hash owner, canonical header; actual Calc109 Auto/defaultUnused Complex through real itemset copies. Strict8sharedowners and Calc raw100,12gates33boundaries, inventory/native/sourcehash review. Any/UNO helpers and Writer full migration pending, no fake transport or DocPool. No full before UI/ODS readiness.

## Verify Steps

Read include/editeng/colritem.hxx and editeng/source/items/textitem.cxx constructors/operator==/hash/Clone/getters; actual include/docmodel/color/ComplexColor.hxx, sc/inc/scitems.hxx ATTR_FONT_COLOR109, sc/source/core/data/docpool.cxx COL_AUTO default. Native real sc/qa/unit/ucalc_DocumentThemes.cxx color/complex/Which value usage. Literal all4constructors/headerconstant/factory defaults, stable borrowed color/complex, input/copy/clone independence, setters do not synchronize unrelated final/complex fields, samevalue/differentWhich equality/hash, all equality guards and original hash fold. Actual itemset copy/default ownership with109/COL_AUTO/UnusedComplex; themed ctor retains caller state, no fake resolver. Strict related8completeowners100S/B/F/L everycounterpositive and npm run test:coverage:calc.4upstream links absent/restoredfinally.12format/lint/typecheck/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates and33boundaries. Exactallowlist/sourcehash/nativepins and clean calc, no full/browser before actual readiness.

## Verification

Pending implementation and checks.

## Rollback Plan

Revert only this task implementation and metadata with a later approved task; no reset, merging or unrelated edits.

## Findings

Previous turn authoritative progress: shared ComplexColor completed. Preflight clean calc. SvxColorItem natively owns Color plus defaultUnused ComplexColor; fontAuto is Which109 from actual ScDocPool. Existing canonical wrappers for XComplexColor/WeakImplHelper are absent; value phase avoids replacing those helpers with a fake provider or rebuilding native memory-management mechanisms. Any methods are not implemented in this value phase and inherited base unsupported projection is not claimed as native SvxColorItem transport. Native textitem shared owner already split for size; color methods get their own source shard. Direct editeng QA search and sw attr search had no explicit ColorItem tests; bounded Calc QA fallback found real ucalc_DocumentThemes ctor/getColor consumers, no fullQA claim. Existing Writer scalar string state is not converted until full actual transport/state integration exists, no compatibility constructor added.
