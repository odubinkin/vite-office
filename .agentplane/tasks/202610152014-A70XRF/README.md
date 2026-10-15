---
id: "202610152014-A70XRF"
title: "Restore native Writer client-list ownership before shared notifier correction"
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
  updated_at: "2026-10-15T20:15:24.561Z"
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
    body: "Start: restore real Writer client-list ownership and iteration so shared Sfx notification can be corrected for Calc without a Writer compatibility shim."
events:
  -
    type: "status"
    at: "2026-10-15T20:15:25.838Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore real Writer client-list ownership and iteration so shared Sfx notification can be corrected for Calc without a Writer compatibility shim."
doc_version: 3
doc_updated_at: "2026-10-15T20:15:25.838Z"
doc_updated_by: "CODER"
description: "Task169: remove incorrect SfxBroadcaster/SfxListener inheritance from SwModify/SwClient, restore original WriterListener links/Add/Remove/iteration repair and migrate required consumers. This unblocks canonical shared notifier reuse by Calc without preserving wrong shared contracts for Writer."
sections:
  Summary: "Task169 removes Writer's incorrect dependency on generic SfxBroadcaster/SfxListener as a necessary prerequisite to canonical shared notifier correction for Calc style-pool construction. Restore actual WriterListener/SwClient/SwModify ownership and native iteration semantics."
  Scope: "sw/inc/calbck.ts plus source-responsibility iterator implementation shard if needed for500line limit; native Writer client-list regression tests; all direct ForAllListeners consumers in sw/inc/swtblfmt.ts,core/{table/swtable-boxline.ts,layout/tabfrm.ts,layout/frmtool.ts,docnode/nodes.ts,undo/untbl.ts} and affected native tests/notification tests; source-scoped shared/Writer runtime/provenance/capability records and Calc readiness/suspected-issues docs as needed. Up to40non-task paths. Preserve existing browser notification transaction/callback bindings as explicit local adapters, without new compatibility aliases for removed Sfx inheritance. No change to save/recovery policy, no new memory/refcount/weak library, no native compiler/probe. Actual SfxBroadcaster/SfxListener correction follows after detachment, not claimed complete by this task."
  Plan: "1. Restore native WriterListener left/right fields, SwClient single registration and SwModify extends SwClient. Port source Add insertion immediately right of anchor, Remove updates and active iterator repair, head/first semantics and source death reparenting. Use JS references for relationships; per-owner active iterator tracking erases native intrusive iterator ring, not its observable repair behavior. 2. Implement native exact SwIterator/WriterListenerIterator responsibilities and JS iterable binding for safe source iteration scope cleanup; no fake generic Sfx forwarding/duplicate rules remain in Writer. Full WriterMultiListener/UnwrapMulti is outside represented scope and not fabricated. 3. Migrate direct old broadcaster-shaped calls to genuine Writer iteration/registration hooks; retain existing explicitly bounded browser transactions/callbacks, not old Sfx lifecycle aliases. 4. Add source-derived list/order/removal/nested iterator/registration/death tests; adjust old expectations only with native evidence. Run related Writer functional tests and shared regressions,allCalc strict raw100,13source gates and related19Writer browser acceptance. Writer-only coverage gaps exempt by user. 5. Record truthful architecture boundaries,source pins,exact checks and source commit/evaluator. Persist safe implementation checkpoints if dependency work spans turns; task remainsDOING until required verification complete."
  Verify Steps: "Audit pinned sw/inc/calbck.hxx and sw/source/core/attr/calbck.cxx plus original consumers GetFrameOfModify/table owner iterations. Verify SwModify actual inheritance, Add/Remove order, anchor changes, live iterator current/position repair and nested scopes; no SfxBroadcaster/SfxListener imports/aliases remain in calbck. Tests cover held client identity, single registration,self/reparent/death,callback order and actual native lookup/claim-frame consumers. Run selected affected Writer/shared Vitest (Writer coverage gaps exempt),npm run test:coverage:calc exact33 raw positive S/B/F/L100 with4source links absent/restored. Run13source gates plus build/19relatedWriter browser scenarios. Record unsupported multi-listener and remaining actual shared notifier/Calc styles/pools/UI/ODS explicitly; no full-suite milestone or goal pause. Source commit plus same-agent evaluator review and clean intentional state beforefinish."
  Verification: "Pending implementation and related functional acceptance. Shared SfxBroadcaster correction is a subsequent dependency stage, not a completed claim."
  Rollback Plan: "Revert only task169 intentional Writer-list/consumer/test/metadata changes through follow-up task; no git reset/merge or changes to unrelated goals/tasks. Preserve task168 style index and string pool."
  Findings: ""
id_source: "generated"
---
## Summary

Task169 removes Writer's incorrect dependency on generic SfxBroadcaster/SfxListener as a necessary prerequisite to canonical shared notifier correction for Calc style-pool construction. Restore actual WriterListener/SwClient/SwModify ownership and native iteration semantics.

## Scope

sw/inc/calbck.ts plus source-responsibility iterator implementation shard if needed for500line limit; native Writer client-list regression tests; all direct ForAllListeners consumers in sw/inc/swtblfmt.ts,core/{table/swtable-boxline.ts,layout/tabfrm.ts,layout/frmtool.ts,docnode/nodes.ts,undo/untbl.ts} and affected native tests/notification tests; source-scoped shared/Writer runtime/provenance/capability records and Calc readiness/suspected-issues docs as needed. Up to40non-task paths. Preserve existing browser notification transaction/callback bindings as explicit local adapters, without new compatibility aliases for removed Sfx inheritance. No change to save/recovery policy, no new memory/refcount/weak library, no native compiler/probe. Actual SfxBroadcaster/SfxListener correction follows after detachment, not claimed complete by this task.

## Plan

1. Restore native WriterListener left/right fields, SwClient single registration and SwModify extends SwClient. Port source Add insertion immediately right of anchor, Remove updates and active iterator repair, head/first semantics and source death reparenting. Use JS references for relationships; per-owner active iterator tracking erases native intrusive iterator ring, not its observable repair behavior. 2. Implement native exact SwIterator/WriterListenerIterator responsibilities and JS iterable binding for safe source iteration scope cleanup; no fake generic Sfx forwarding/duplicate rules remain in Writer. Full WriterMultiListener/UnwrapMulti is outside represented scope and not fabricated. 3. Migrate direct old broadcaster-shaped calls to genuine Writer iteration/registration hooks; retain existing explicitly bounded browser transactions/callbacks, not old Sfx lifecycle aliases. 4. Add source-derived list/order/removal/nested iterator/registration/death tests; adjust old expectations only with native evidence. Run related Writer functional tests and shared regressions,allCalc strict raw100,13source gates and related19Writer browser acceptance. Writer-only coverage gaps exempt by user. 5. Record truthful architecture boundaries,source pins,exact checks and source commit/evaluator. Persist safe implementation checkpoints if dependency work spans turns; task remainsDOING until required verification complete.

## Verify Steps

Audit pinned sw/inc/calbck.hxx and sw/source/core/attr/calbck.cxx plus original consumers GetFrameOfModify/table owner iterations. Verify SwModify actual inheritance, Add/Remove order, anchor changes, live iterator current/position repair and nested scopes; no SfxBroadcaster/SfxListener imports/aliases remain in calbck. Tests cover held client identity, single registration,self/reparent/death,callback order and actual native lookup/claim-frame consumers. Run selected affected Writer/shared Vitest (Writer coverage gaps exempt),npm run test:coverage:calc exact33 raw positive S/B/F/L100 with4source links absent/restored. Run13source gates plus build/19relatedWriter browser scenarios. Record unsupported multi-listener and remaining actual shared notifier/Calc styles/pools/UI/ODS explicitly; no full-suite milestone or goal pause. Source commit plus same-agent evaluator review and clean intentional state beforefinish.

## Verification

Pending implementation and related functional acceptance. Shared SfxBroadcaster correction is a subsequent dependency stage, not a completed claim.

## Rollback Plan

Revert only task169 intentional Writer-list/consumer/test/metadata changes through follow-up task; no git reset/merge or changes to unrelated goals/tasks. Preserve task168 style index and string pool.

## Findings
