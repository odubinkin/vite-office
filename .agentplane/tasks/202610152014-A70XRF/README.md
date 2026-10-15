---
id: "202610152014-A70XRF"
title: "Restore native Writer client-list ownership before shared notifier correction"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T20:19:41.701Z"
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
doc_updated_at: "2026-10-15T20:38:47.692Z"
doc_updated_by: "CODER"
description: "Task169: remove incorrect SfxBroadcaster/SfxListener inheritance from SwModify/SwClient, restore original WriterListener links/Add/Remove/iteration repair and migrate required consumers. This unblocks canonical shared notifier reuse by Calc without preserving wrong shared contracts for Writer."
sections:
  Summary: "Task169 removes Writer's incorrect dependency on generic SfxBroadcaster/SfxListener as a necessary prerequisite to canonical shared notifier correction for Calc style-pool construction. Restore actual WriterListener/SwClient/SwModify ownership and native iteration semantics."
  Scope: "sw/inc/calbck.ts and calbck.iterator.ts, actual Writer-list regression tests, all direct removed-Sfx-API consumers and tests discovered by exact TypeScript diagnostics (including Writer browser/editor and history fixtures), small test-only protected notification hook spy if needed; source-scoped shared/Writer runtime/provenance/capability records and Calc readiness/suspected-issues docs. Read-only discovery found more fixture call sites than the initial40path estimate: allowance now up to65non-task paths for this same necessary canonical correction, under the user's explicit standing authorization to fix shared contracts and required Writer consumers. No new product scope, save/recovery change, memory/refcount/weak library or native compiler/probe. Existing browser callback/transaction boundaries remain explicit local adapters; no removed Sfx lifecycle compatibility aliases. Actual shared SfxBroadcaster/SfxListener correction follows detachment."
  Plan: "1. Restore native WriterListener left/right fields, SwClient single registration and SwModify extends SwClient. Port source Add insertion immediately right of anchor, Remove updates and active iterator repair, head/first semantics and source death reparenting. Use JS references for relationships; per-owner active iterator tracking erases native intrusive iterator ring, not its observable repair behavior. 2. Implement native exact SwIterator/WriterListenerIterator responsibilities and JS iterable binding for safe source iteration scope cleanup; no fake generic Sfx forwarding/duplicate rules remain in Writer. Full WriterMultiListener/UnwrapMulti is outside represented scope and not fabricated. 3. Migrate direct old broadcaster-shaped calls to genuine Writer iteration/registration hooks; retain existing explicitly bounded browser transactions/callbacks, not old Sfx lifecycle aliases. 4. Add source-derived list/order/removal/nested iterator/registration/death tests; adjust old expectations only with native evidence. Run related Writer functional tests and shared regressions,allCalc strict raw100,13source gates and related19Writer browser acceptance. Writer-only coverage gaps exempt by user. 5. Record truthful architecture boundaries,source pins,exact checks and source commit/evaluator. Persist safe implementation checkpoints if dependency work spans turns; task remainsDOING until required verification complete."
  Verify Steps: "Audit pinned sw/inc/calbck.hxx and sw/source/core/attr/calbck.cxx plus original consumers GetFrameOfModify/table owner iterations. Verify SwModify actual inheritance, Add/Remove order, anchor changes, live iterator current/position repair and nested scopes; no SfxBroadcaster/SfxListener imports/aliases remain in calbck. Tests cover held client identity, single registration,self/reparent/death,callback order and actual native lookup/claim-frame consumers. Run selected affected Writer/shared Vitest (Writer coverage gaps exempt),npm run test:coverage:calc exact33 raw positive S/B/F/L100 with4source links absent/restored. Run13source gates plus build/19relatedWriter browser scenarios. Record unsupported multi-listener and remaining actual shared notifier/Calc styles/pools/UI/ODS explicitly; no full-suite milestone or goal pause. Source commit plus same-agent evaluator review and clean intentional state beforefinish."
  Verification: "Pending implementation and related functional acceptance. Shared SfxBroadcaster correction is a subsequent dependency stage, not a completed claim."
  Rollback Plan: "Revert only task169 intentional Writer-list/consumer/test/metadata changes through follow-up task; no git reset/merge or changes to unrelated goals/tasks. Preserve task168 style index and string pool."
  Findings: |-
    - Observation: Initial typecheck after restoring Writer inheritance fails at the expected old ForAllListeners consumers and DocumentStateManager.Dispose override. No fallback aliases were added to the new Writer ownership.
      Impact: Consumer migration remains part of the approved task; no passing implementation or complete Sfx correction is claimed.
      Resolution: Migrate old generic broadcaster iteration calls to exact native SwIterator loops and update explicit override annotations,then run related functional tests. Keep taskDOING until verification and registry complete.

    - Observation: Exact compiler discovery found additional native browser/history fixture call sites of removed Sfx Notify/HasListeners/ForAllListeners APIs; initial40path estimate was too low. A bounded migration script also stopped at a callback returning an expression rather than a literal.
      Impact: The same preauthorized canonical Writer consumer correction needs up to65paths; behavior and verification scope are unchanged. Do not add old API aliases to make tests compile.
      Resolution: Plan scope readback updated/reapproved under standing explicit user authorization for canonical shared and necessary Writer corrections. Migration now preserves arbitrary boolean return expressions with labeled iterator break/continue and skips nested functions; migrate spies to the actual native protected SwClientNotify hook.

    - Observation: First functional profile:262pass/6fail across47files. Four failures assumed old generic-slot ordering,one exposed dropped browser-batch propagation into native format callbacks,and one expected a foreign-source rejection absent from SwFormat::SwClientNotify (its source argument is unnamed). Native source confirms anchor-right insertion and filter behavior. Initial failed Vitest log was overwritten by the bounded wrapper; failure summaries remain in tool output and these Findings,not claimed as a retained raw file.
      Impact: Retain native ordering and hint-based filtering rather than reintroducing generic Sfx aliases. Existing browser batches must still unpack before native filters. Auxiliary byte-only formatting comparison also rejected earlier formatting output; no stale source-map/coverage transfer is claimed.
      Resolution: Correct source-derived expectations,remove invalid generic append-during-iteration fixture assumptions,restore explicit browser batch unpacking and support represented SwLegacyModify. Current revalidation passes268related cases before the added legacy case; final269-case run follows on formatted code. All53 formatted files now have identical before/after emitted JS in the successful final formatting proof. Merge iterator definitions into original calbck.ts because423lines fits the500line budget; no unnecessary filename shard remains.

    - Observation: Final formatted source passes270related functional scenarios/47files,187Calc/76files,production build and19Writer browser scenarios. All13source gates pass. Added represented SwLegacyModify native filter and corrected StartListeningToSameModifyAs absent-source path to EndListeningAll,not derived Dispose. Writer-only coverage gap is exempt,unchanged in acceptance criteria.
      Impact: Writer no longer depends on incorrect shared Sfx listener/broadcaster contracts. Canonical shared Sfx correction for Calc is the next dependency; no full style/pool/document/UI/ODS readiness or full-suite milestone is claimed.
      Resolution: Native7blob audit and nine source-derived client cases validate ownership/order/removal/iteration. Final53file formatting proof compares emitted JS tokens; raw formatting-byte checks were overstrict for pretty-print changes,so final acceptance uses fresh runtime tests and source hashes. A premature native-audit attempt failed because the still-running portable wrapper had intentionally removed reference links;waited for that exact process to finish and reran audit after confirmed restoration,without restarting tests. Keep no new native memory/weak/intrusive library or Sfx compatibility aliases.
id_source: "generated"
---
## Summary

Task169 removes Writer's incorrect dependency on generic SfxBroadcaster/SfxListener as a necessary prerequisite to canonical shared notifier correction for Calc style-pool construction. Restore actual WriterListener/SwClient/SwModify ownership and native iteration semantics.

## Scope

sw/inc/calbck.ts and calbck.iterator.ts, actual Writer-list regression tests, all direct removed-Sfx-API consumers and tests discovered by exact TypeScript diagnostics (including Writer browser/editor and history fixtures), small test-only protected notification hook spy if needed; source-scoped shared/Writer runtime/provenance/capability records and Calc readiness/suspected-issues docs. Read-only discovery found more fixture call sites than the initial40path estimate: allowance now up to65non-task paths for this same necessary canonical correction, under the user's explicit standing authorization to fix shared contracts and required Writer consumers. No new product scope, save/recovery change, memory/refcount/weak library or native compiler/probe. Existing browser callback/transaction boundaries remain explicit local adapters; no removed Sfx lifecycle compatibility aliases. Actual shared SfxBroadcaster/SfxListener correction follows detachment.

## Plan

1. Restore native WriterListener left/right fields, SwClient single registration and SwModify extends SwClient. Port source Add insertion immediately right of anchor, Remove updates and active iterator repair, head/first semantics and source death reparenting. Use JS references for relationships; per-owner active iterator tracking erases native intrusive iterator ring, not its observable repair behavior. 2. Implement native exact SwIterator/WriterListenerIterator responsibilities and JS iterable binding for safe source iteration scope cleanup; no fake generic Sfx forwarding/duplicate rules remain in Writer. Full WriterMultiListener/UnwrapMulti is outside represented scope and not fabricated. 3. Migrate direct old broadcaster-shaped calls to genuine Writer iteration/registration hooks; retain existing explicitly bounded browser transactions/callbacks, not old Sfx lifecycle aliases. 4. Add source-derived list/order/removal/nested iterator/registration/death tests; adjust old expectations only with native evidence. Run related Writer functional tests and shared regressions,allCalc strict raw100,13source gates and related19Writer browser acceptance. Writer-only coverage gaps exempt by user. 5. Record truthful architecture boundaries,source pins,exact checks and source commit/evaluator. Persist safe implementation checkpoints if dependency work spans turns; task remainsDOING until required verification complete.

## Verify Steps

Audit pinned sw/inc/calbck.hxx and sw/source/core/attr/calbck.cxx plus original consumers GetFrameOfModify/table owner iterations. Verify SwModify actual inheritance, Add/Remove order, anchor changes, live iterator current/position repair and nested scopes; no SfxBroadcaster/SfxListener imports/aliases remain in calbck. Tests cover held client identity, single registration,self/reparent/death,callback order and actual native lookup/claim-frame consumers. Run selected affected Writer/shared Vitest (Writer coverage gaps exempt),npm run test:coverage:calc exact33 raw positive S/B/F/L100 with4source links absent/restored. Run13source gates plus build/19relatedWriter browser scenarios. Record unsupported multi-listener and remaining actual shared notifier/Calc styles/pools/UI/ODS explicitly; no full-suite milestone or goal pause. Source commit plus same-agent evaluator review and clean intentional state beforefinish.

## Verification

Pending implementation and related functional acceptance. Shared SfxBroadcaster correction is a subsequent dependency stage, not a completed claim.

## Rollback Plan

Revert only task169 intentional Writer-list/consumer/test/metadata changes through follow-up task; no git reset/merge or changes to unrelated goals/tasks. Preserve task168 style index and string pool.

## Findings

- Observation: Initial typecheck after restoring Writer inheritance fails at the expected old ForAllListeners consumers and DocumentStateManager.Dispose override. No fallback aliases were added to the new Writer ownership.
  Impact: Consumer migration remains part of the approved task; no passing implementation or complete Sfx correction is claimed.
  Resolution: Migrate old generic broadcaster iteration calls to exact native SwIterator loops and update explicit override annotations,then run related functional tests. Keep taskDOING until verification and registry complete.

- Observation: Exact compiler discovery found additional native browser/history fixture call sites of removed Sfx Notify/HasListeners/ForAllListeners APIs; initial40path estimate was too low. A bounded migration script also stopped at a callback returning an expression rather than a literal.
  Impact: The same preauthorized canonical Writer consumer correction needs up to65paths; behavior and verification scope are unchanged. Do not add old API aliases to make tests compile.
  Resolution: Plan scope readback updated/reapproved under standing explicit user authorization for canonical shared and necessary Writer corrections. Migration now preserves arbitrary boolean return expressions with labeled iterator break/continue and skips nested functions; migrate spies to the actual native protected SwClientNotify hook.

- Observation: First functional profile:262pass/6fail across47files. Four failures assumed old generic-slot ordering,one exposed dropped browser-batch propagation into native format callbacks,and one expected a foreign-source rejection absent from SwFormat::SwClientNotify (its source argument is unnamed). Native source confirms anchor-right insertion and filter behavior. Initial failed Vitest log was overwritten by the bounded wrapper; failure summaries remain in tool output and these Findings,not claimed as a retained raw file.
  Impact: Retain native ordering and hint-based filtering rather than reintroducing generic Sfx aliases. Existing browser batches must still unpack before native filters. Auxiliary byte-only formatting comparison also rejected earlier formatting output; no stale source-map/coverage transfer is claimed.
  Resolution: Correct source-derived expectations,remove invalid generic append-during-iteration fixture assumptions,restore explicit browser batch unpacking and support represented SwLegacyModify. Current revalidation passes268related cases before the added legacy case; final269-case run follows on formatted code. All53 formatted files now have identical before/after emitted JS in the successful final formatting proof. Merge iterator definitions into original calbck.ts because423lines fits the500line budget; no unnecessary filename shard remains.

- Observation: Final formatted source passes270related functional scenarios/47files,187Calc/76files,production build and19Writer browser scenarios. All13source gates pass. Added represented SwLegacyModify native filter and corrected StartListeningToSameModifyAs absent-source path to EndListeningAll,not derived Dispose. Writer-only coverage gap is exempt,unchanged in acceptance criteria.
  Impact: Writer no longer depends on incorrect shared Sfx listener/broadcaster contracts. Canonical shared Sfx correction for Calc is the next dependency; no full style/pool/document/UI/ODS readiness or full-suite milestone is claimed.
  Resolution: Native7blob audit and nine source-derived client cases validate ownership/order/removal/iteration. Final53file formatting proof compares emitted JS tokens; raw formatting-byte checks were overstrict for pretty-print changes,so final acceptance uses fresh runtime tests and source hashes. A premature native-audit attempt failed because the still-running portable wrapper had intentionally removed reference links;waited for that exact process to finish and reran audit after confirmed restoration,without restarting tests. Keep no new native memory/weak/intrusive library or Sfx compatibility aliases.
