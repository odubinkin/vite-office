---
id: "202610141032-EXNMG6"
title: "Restore shared unsigned item values and Calc cell indentation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T10:32:38.074Z"
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
    body: "Start: restore actual shared unsigned numeric value/copy/Any/hash contracts and Calc indentation under approved scope, no native memory engine or fake document."
events:
  -
    type: "status"
    at: "2026-10-14T10:32:47.990Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore actual shared unsigned numeric value/copy/Any/hash contracts and Calc indentation under approved scope, no native memory engine or fake document."
doc_version: 3
doc_updated_at: "2026-10-14T10:37:43.275Z"
doc_updated_by: "CODER"
description: "Task115: original CntUInt16/32 and SfxUInt16/32 logical values, actual Any and shared hash reuse, native headers and ScIndentItem default/copy/Clone on DocPool path. WholeCalc/changedshared raw100 and targeted consumers, no memory engine or full replay before121."
sections:
  Summary: "Restore original shared unsigned value contracts required for Calc DocPool and add actual ScIndentItem. User continuation approves local implementation; branchcalc/worktree only, no merges."
  Scope: "Eight runtime owners: shared cintitem/intitem sources and new canonical cintitem/intitem headers; Calc attrib.values actual ScIndentItem and canonical attrib source/header exports plus Which131 in scitems. Three tests (new unsigned native values, new Calc indent and one source-backed existing cintitem expectation migration), exact SVL→o3tl dependency/checker tests,16runtime/provenance records,2capabilities,3Calc docs. Expected34intentionalpaths. Existing scalar constructor/range guards retained as browser-domain boundaries; unchanged signed16 and other integer families not certified."
  Plan: "Implement actual CntUInt16/32 implicit copy, mutable value, same-type payload equality ignoringWhich, hash support via existing o3tl64seed unsigned identity helper, Clone, native Any queries and original typed extraction. UInt16 accepts actualu16 then legacy signed32 extraction withu16 wrapping; UInt32 accepts signed32 extraction and unsigned reinterpretation. Existing browser plain signed32 transport and explicit checked valid scalar constructor/SetValue domains remain. SfxUInt16/32 add actual defaultfactory/copy/Clone. Add canonical native headers, no duplicate implementation. ScIndentItem default0/Which131, value/copy/Clone with fixedWhich restoration. Native presentation/localization/diagnostics/cache/assertion/invalid domains/ABI and complete document/config/storage/UI/ODS remain excluded or pending. Preserve quirks documented in Calc issues. Run actual wholeCalc and changedwhole shared owners raw100 source-absent, targeted existing numeric/pool/Writer consumers and exact checker tests;12focused gates/exact hashes/pins/APsame-agent evaluation/close. Full121next."
  Verify Steps: |-
    1. Review complete native UInt16/32 bodies/headers/factories, ScIndent header/ctor/Clone and DocPool defaults, Any/assign and hash helper. Test actual native default/copy/mutation/Clone/Which/equality/hash/unsigned highbits, typed signed/unsigned/fallback/fail untouched outputs, real existing pool/Writer consumers. No fake provider/document or native compilation.
    2. Whole current Calc and complete changed cintitem/intitem owner rawS/B/F/L100/everycounterpositive with all4source links absent and restoredfinally; source-bound same-map evidence. Run related current numeric/pool/Writer/Any consumers and module checker tests. Retain thresholds and failures, no Writer-only coverage repairs or full replay before121.
    3. Focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, exact intended34paths/currentcommittedGitbaseline hashes and nativepins. Same-agent evaluator explicitly not independent. APverify/finish clean oncalc, goal active and document/UI/ODS pending.
  Verification: |-
    Command: node output/playwright/task115-checks/portable.mjs; node output/playwright/task115-checks/portable.mjs --shared-only
    Result: pass wholeCalc160tests56files33owners rawS4130/B2729/F819/L3679; related98tests7files complete2changed sharedowners rawS84/B72/F29/L78. All four100metrics/everyrawcounterpositive. All4source symlinks absent/restoredfinally. Shared-only repeat follows a test-only type-narrowing correction, no runtime/Calc source change. Existing numeric/pool/dispatch/Writer list/headline/Any consumers pass.
    Command: npx vitest run scripts/check-module-boundaries.test.ts
    Result: pass25tests for exact SVL→o3tl and existing reverse/browser gates.
    Command: node output/playwright/task115-checks/gates.mjs
    Result: final12focused gates recorded in gates-results.json before finalverify; exact34intentionalpaths and currentGit committed hashes/native12pins reviewed before evaluation. Scope limited to actual initialized unsigned value contracts/ScIndent.
    Fulloffice/browser/static nextscheduled121 under user once-per10tasks cadence. No Writer-only coverage repair or native compilation.
  Rollback Plan: "Revert only task115 source commit; preserve user integration, tasks113/114 and unrelated active tasks. No destructive reset/merge/outside-worktree edits."
  Findings: "Initial160Calc and98related tests passed firsttime strict raw100. Typecheck found only new test heterogeneous-constructor union lost the correlation to its copied actual item; selecting each actual original constructor with normal instanceof narrowing fixed it without runtime implementation changes. Related complete source profile replay passed98tests/raw100; Calc profile/source remains unchanged. Existing cintitem test Which-sensitive UInt16 expectation migrated to source payload-only equality; all other old assertions/guards retained. Native signed32 legacy overflow acceptance, unsigned32 signed Any bits, equality/hash Which asymmetry and ScIndent copy/Clone Which history preserved in CALC101. Actual existing CPPU/o3tl/shared pool/Writer owners reused, no fake type/provider/document or memory engine. Existing invalid JS scalar constructor/SetValue guards retained as explicit browser domain, not native typed invalid-input parity. Source-backed logical64hash specialization no native stdlib/binary/ABI claim. Same-agent evaluator not independent. Full document/configuration/storage/UI/ODS pending, goalactive, full121next."
id_source: "generated"
---
## Summary

Restore original shared unsigned value contracts required for Calc DocPool and add actual ScIndentItem. User continuation approves local implementation; branchcalc/worktree only, no merges.

## Scope

Eight runtime owners: shared cintitem/intitem sources and new canonical cintitem/intitem headers; Calc attrib.values actual ScIndentItem and canonical attrib source/header exports plus Which131 in scitems. Three tests (new unsigned native values, new Calc indent and one source-backed existing cintitem expectation migration), exact SVL→o3tl dependency/checker tests,16runtime/provenance records,2capabilities,3Calc docs. Expected34intentionalpaths. Existing scalar constructor/range guards retained as browser-domain boundaries; unchanged signed16 and other integer families not certified.

## Plan

Implement actual CntUInt16/32 implicit copy, mutable value, same-type payload equality ignoringWhich, hash support via existing o3tl64seed unsigned identity helper, Clone, native Any queries and original typed extraction. UInt16 accepts actualu16 then legacy signed32 extraction withu16 wrapping; UInt32 accepts signed32 extraction and unsigned reinterpretation. Existing browser plain signed32 transport and explicit checked valid scalar constructor/SetValue domains remain. SfxUInt16/32 add actual defaultfactory/copy/Clone. Add canonical native headers, no duplicate implementation. ScIndentItem default0/Which131, value/copy/Clone with fixedWhich restoration. Native presentation/localization/diagnostics/cache/assertion/invalid domains/ABI and complete document/config/storage/UI/ODS remain excluded or pending. Preserve quirks documented in Calc issues. Run actual wholeCalc and changedwhole shared owners raw100 source-absent, targeted existing numeric/pool/Writer consumers and exact checker tests;12focused gates/exact hashes/pins/APsame-agent evaluation/close. Full121next.

## Verify Steps

1. Review complete native UInt16/32 bodies/headers/factories, ScIndent header/ctor/Clone and DocPool defaults, Any/assign and hash helper. Test actual native default/copy/mutation/Clone/Which/equality/hash/unsigned highbits, typed signed/unsigned/fallback/fail untouched outputs, real existing pool/Writer consumers. No fake provider/document or native compilation.
2. Whole current Calc and complete changed cintitem/intitem owner rawS/B/F/L100/everycounterpositive with all4source links absent and restoredfinally; source-bound same-map evidence. Run related current numeric/pool/Writer/Any consumers and module checker tests. Retain thresholds and failures, no Writer-only coverage repairs or full replay before121.
3. Focused format/lint/app typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, exact intended34paths/currentcommittedGitbaseline hashes and nativepins. Same-agent evaluator explicitly not independent. APverify/finish clean oncalc, goal active and document/UI/ODS pending.

## Verification

Command: node output/playwright/task115-checks/portable.mjs; node output/playwright/task115-checks/portable.mjs --shared-only
Result: pass wholeCalc160tests56files33owners rawS4130/B2729/F819/L3679; related98tests7files complete2changed sharedowners rawS84/B72/F29/L78. All four100metrics/everyrawcounterpositive. All4source symlinks absent/restoredfinally. Shared-only repeat follows a test-only type-narrowing correction, no runtime/Calc source change. Existing numeric/pool/dispatch/Writer list/headline/Any consumers pass.
Command: npx vitest run scripts/check-module-boundaries.test.ts
Result: pass25tests for exact SVL→o3tl and existing reverse/browser gates.
Command: node output/playwright/task115-checks/gates.mjs
Result: final12focused gates recorded in gates-results.json before finalverify; exact34intentionalpaths and currentGit committed hashes/native12pins reviewed before evaluation. Scope limited to actual initialized unsigned value contracts/ScIndent.
Fulloffice/browser/static nextscheduled121 under user once-per10tasks cadence. No Writer-only coverage repair or native compilation.

## Rollback Plan

Revert only task115 source commit; preserve user integration, tasks113/114 and unrelated active tasks. No destructive reset/merge/outside-worktree edits.

## Findings

Initial160Calc and98related tests passed firsttime strict raw100. Typecheck found only new test heterogeneous-constructor union lost the correlation to its copied actual item; selecting each actual original constructor with normal instanceof narrowing fixed it without runtime implementation changes. Related complete source profile replay passed98tests/raw100; Calc profile/source remains unchanged. Existing cintitem test Which-sensitive UInt16 expectation migrated to source payload-only equality; all other old assertions/guards retained. Native signed32 legacy overflow acceptance, unsigned32 signed Any bits, equality/hash Which asymmetry and ScIndent copy/Clone Which history preserved in CALC101. Actual existing CPPU/o3tl/shared pool/Writer owners reused, no fake type/provider/document or memory engine. Existing invalid JS scalar constructor/SetValue guards retained as explicit browser domain, not native typed invalid-input parity. Source-backed logical64hash specialization no native stdlib/binary/ABI claim. Same-agent evaluator not independent. Full document/configuration/storage/UI/ODS pending, goalactive, full121next.
