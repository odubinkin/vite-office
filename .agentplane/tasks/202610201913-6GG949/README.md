---
id: "202610201913-6GG949"
title: "Restore native Calc cell-pattern style association and registered-style lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T19:14:31.878Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T19:38:11.083Z"
  updated_by: "CODER"
  note: "Pass:515 distinct Calc cases,46related style/pool cases,8fresh Chromium/Worker cases,14final static checks and build. Fresh full Calc raw100 and hash-verified unchanged shared54 raw100 audited from committed archives. Same7test guard cases replayed without duplicate counting after lint-only rewrite;production maps unchanged. Actual native style association/lifecycle and mounted inherited fonts verified. Missing Calc style owners/resolution/UI/history/ODS/repaint and automatic-height remain explicit;goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T19:38:11.980Z"
  updated_by: "EVALUATOR"
  note: "Approved native pattern-style association and registered-style lifecycle satisfy bounded task55 contracts;actual Calc style owner/application and broader UI goal remain active."
  evaluated_sha: "81bc54301c7a78ecc91f8c769cd3b99d65aa7e23"
  blueprint_digest: "6fc46460aef1e353e1a1aa8897d80ef6aaab32b7e6b42cf13a156618c648ce94"
  evidence_refs:
    - ".agentplane/tasks/202610201913-6GG949/README.md"
    - ".agentplane/tasks/202610201913-6GG949/quality/20261020-193811980-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201913-6GG949/quality/20261020-193811980-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201913-6GG949/quality/20261020-193811980-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201913-6GG949/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610201913-6GG949/evidence/proof.json"
    - ".agentplane/tasks/202610201913-6GG949/evidence/commands.json"
    - ".agentplane/tasks/202610201913-6GG949/evidence/audit-archives.mjs"
    - ".agentplane/tasks/202610201913-6GG949/evidence/screenshots.json"
  findings:
    - "Compared pinned patattr.cxx/hxx pointer/name ownership,copy,parent identity,default clearDirectFormat=true,null/name retention,StyleToName,symbol-font query and helper rename/delete/all-to-name methods to committed code. Borrowed const views expose only consumed GetName;mutable attach/rename references remain actual native base operations."
    - "Tests use genuine shared SfxStyleSheet/SfxStyleSheetPool and actual Calc pool/helper/holders. Inherited/default/INVALID states,copy/equality,same-named other identities,failed rename,empty/nonempty registry groups,canonical release,independent copied names and default-pattern separation are covered. No fake Calc style owner,pool,resolver,cache invalidator or browser style model exists."
    - "Mounted actual Calc reads three-script fonts through the registered column pattern and detaches to stored names on deletion. Worker/browser executes the same genuine classes. Explicit projection rerender does not claim missing native repaint/StyleApply behavior. Source asymmetries preserved and documented as CALC240."
    - "Portable archive audit proves515 distinct Calc cases,46related cases,8fresh packaged browser cases and exact raw Calc/shared four-metric100. Shared54 owners are individually source-hash unchanged. Latest7test-only guard cases replace identical prior IDs without duplicate counting;full production raw maps unchanged. Build,14final static checks,source/native hashes and screenshots pass;original lint failures retained."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore original native pattern style inheritance and registered-style rename/delete lifecycle using genuine shared style values;no replacement Calc style or browser-only model."
events:
  -
    type: "status"
    at: "2026-10-20T19:15:05.245Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore original native pattern style inheritance and registered-style rename/delete lifecycle using genuine shared style values;no replacement Calc style or browser-only model."
  -
    type: "verify"
    at: "2026-10-20T19:38:11.083Z"
    author: "CODER"
    state: "ok"
    note: "Pass:515 distinct Calc cases,46related style/pool cases,8fresh Chromium/Worker cases,14final static checks and build. Fresh full Calc raw100 and hash-verified unchanged shared54 raw100 audited from committed archives. Same7test guard cases replayed without duplicate counting after lint-only rewrite;production maps unchanged. Actual native style association/lifecycle and mounted inherited fonts verified. Missing Calc style owners/resolution/UI/history/ODS/repaint and automatic-height remain explicit;goal active."
doc_version: 3
doc_updated_at: "2026-10-20T19:38:11.168Z"
doc_updated_by: "CODER"
description: "Advance the required named-cell-style UI path with original ScPatternAttr style pointer/name inheritance,copy,clear-direct-format and symbol-font contracts plus CellAttributeHelper rename/delete/all-styles-to-names ownership. Reuse genuine shared SfxStyleSheet values through erased borrowed base operations;do not invent ScStyleSheet,ScStyleSheetPool,document style resolution or browser style state."
sections:
  Summary: |-
    Restore native Calc cell-pattern style association and registered-style lifecycle

    Advance the required named-cell-style UI path with original ScPatternAttr style pointer/name inheritance,copy,clear-direct-format and symbol-font contracts plus CellAttributeHelper rename/delete/all-styles-to-names ownership. Reuse genuine shared SfxStyleSheet values through erased borrowed base operations;do not invent ScStyleSheet,ScStyleSheetPool,document style resolution or browser style state.
  Scope: "Native ScPatternAttr style pointer/name association,copy,clear-direct-format inheritance,StyleToName and IsSymbolFont;CellAttributeHelper registered-style rename,delete and all-to-name lifecycle. Up to20 source/test files plus registry/provenance/readiness/evidence. Borrow only real shared native style operations;do not fabricate the missing Calc style/pool/document-resolution or UI command owners."
  Plan: "Add the original borrowed style pointer to ScPatternAttr and preserve it and actual itemset parent through native copying. Implement GetStyleSheet,GetStyleName,SetStyleSheet default clearDirectFormat=true,StyleToName and IsSymbolFont from pinned patattr.cxx/hxx. Preserve null-attach name retention,clearing only style SET fields including inherited SET states,and exact name/value versus parent-identity equality. Add CellAttributeHelper CellStyleDeleted,RenameCellStyle and AllStylesToNames using actual name-group registries and canonical holders,including failed-rename re-insertion and forced default-pattern existence. Declare only erased borrowed base style operations consumed at those read sites;use genuine existing SfxStyleSheet/SfxStyleSheetPool in tests,not a fake ScStyleSheet or resolver. Native ScStyleSheet/ScStyleSheetPool,UpdateStyleSheet/document style resolution,full named style UI/ODS and automatic-height remain required and explicitly unported. Verify inheritance through actual column/pattern and mounted Calc display where current native operations permit it;do not add a browser-only style model or enable unsupported StyleApply. Run Calc100,related actual style/itemset tests and fresh changed-owner100 coverage;retain unchanged shared54 evidence by verified source hashes. Run all declared static/build gates and desktop/mobile font/wrap/ODS and DOM-free Worker native lifecycle acceptance. Up to20 source/test files plus records/evidence;only calc checkout/branch,no network,merges,subagents or full-suite checkpoint before60."
  Verify Steps: "Read pinned patattr.cxx/hxx style binding,copy/equality and helper rename/delete/to-name contracts. Require stock complete Calc Istanbul100 S/B/F/L and related shared style/pool/itemset cases. Verify native borrowed style reference with genuine shared classes,canonical registry holder lifetimes,source null/failed rename/empty-group cases,inherited/default/INVALID states,symbol font and mounted Calc inheritance if reachable. Recompute complete shared100 from task54 only after verifying unchanged source hashes;fresh changed Calc owner coverage required. Run types,changed-source lint/format,dependencies,Writer/Calc resources,docs,size,tree,provenance,registry,routing,doctor,build/static-build. Run relevant Calc font/wrap/ODS desktop/mobile and native lifecycle Worker/browser cases,inspect screenshots. Archive raw reports,exact commands,source/native hashes and portable audit;obtain evaluator pass and finish clean calc. Keep heavyweight concurrency bounded to two jobs and avoid overlapping build/type work with slow native replay. No full app suite until60. Do not claim missing Calc style owners/UI/ODS or automatic-height complete."
  Verification: |-
    Command: exact commands,cwds and static argv in evidence/commands.json. Portable audit: node .agentplane/tasks/202610201913-6GG949/evidence/audit-archives.mjs.

    Result: pass.

    Evidence:515 distinct Calc cases in157files,46 related cases in6files,and8 fresh Chromium/Worker cases pass with0failures/0skips/0retries. Full Calc raw S/B/F/L100 at10561/6564/1975/9477. Complete shared100 is the hash-verified unchanged task54 raw baseline;no shared runtime owner changed. Build and14final static checks pass. Test-only presence guard rewrites were revalidated in the same7cases;the accepted report replaces identical case IDs without duplicate counting. Production and its complete raw maps remained unchanged.

    Scope: original pattern style pointer/name association,copy,clear-direct-format default,actual itemset inheritance,symbol-font detection,registered exact-style rename/delete and all-to-name/default lifecycle. Genuine shared style/pool classes supply only consumed borrowed base operations;no Calc style owner/resolver or browser model is substituted. Mounted real Calc column projection and Worker demonstrate the actual contracts. Reports,source/native hashes and4current screenshots archived. Original lint failure and corrected lint/format/types retained.

    Remaining: actual Calc style/pool/helper,standard styles,document resolution,StyleApply/UI/history/ODS and repaint consumers remain unported;automatic-height also remains required. Broader goal active. Repaired all-app checkpoint51 retained;next complete checkpoint60.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T19:38:11.083Z — VERIFY — ok

    By: CODER

    Note: Pass:515 distinct Calc cases,46related style/pool cases,8fresh Chromium/Worker cases,14final static checks and build. Fresh full Calc raw100 and hash-verified unchanged shared54 raw100 audited from committed archives. Same7test guard cases replayed without duplicate counting after lint-only rewrite;production maps unchanged. Actual native style association/lifecycle and mounted inherited fonts verified. Missing Calc style owners/resolution/UI/history/ODS/repaint and automatic-height remain explicit;goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T19:37:41.108Z, excerpt_hash=sha256:2ebc2a09d11abe7c2c801f6fe4573b20bda55001585744f7b0fedabe80a636d6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201913-6GG949/blueprint/resolved-snapshot.json
    - old_digest: 6fc46460aef1e353e1a1aa8897d80ef6aaab32b7e6b42cf13a156618c648ce94
    - current_digest: 6fc46460aef1e353e1a1aa8897d80ef6aaab32b7e6b42cf13a156618c648ce94
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201913-6GG949

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201913-6GG949
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit,preserving prior verified formatting/context work;no branch,merge or history changes."
  Findings: |-
    Observation: pinned patattr.cxx/hxx stores a borrowed style pointer separately from an optional owned style name. Copy preserves the pointer and actual item-set parent. SetStyleSheet defaults to clearing direct fields only where the style reports SET,including inherited SET,then attaches the actual style item set. Native null attachment keeps an existing stored name. StyleToName copies the name and drops the pointer/parent;symbol-font detection reads explicitly SET direct/inherited font encoding rather than pool defaults.
    Impact: original cell-pattern inheritance is now available to the native column owner and existing Calc projection. Mounted acceptance shows independent Latin/CJK/CTL fonts inherited from the actual registered column pattern with no direct font items or browser style store. Native clear-direct-format=false,INVALID/default states,copy/equality,parent identity,null/name retention and independent copied names are exercised.
    Resolution: CellAttributeHelper preserves exact borrowed identity during deletion and rename,removes affected patterns before SetName,re-inserts by the actual resulting name even on failed rename,and preserves canonical holder ownership. AllStylesToNames visits registered patterns and explicitly forces/visits the default. CALC240 documents these source distinctions;no normalization or dummy cache invalidation is added.

    Borrowed boundary: ScPatternStyleReference erases only existing native base operations consumed at these call sites. Tests use genuine shared SfxStyleSheet/SfxStyleSheetPool classes;no fake ScStyleSheet,Calc style pool or document resolver exists. Native const GetStyleSheet/deletion references expose only the consumed const GetName operation;mutable attach/rename references retain required operations. The first complete Calc run passed515 cases at100;the final const-view annotations are verified again by a complete final-source run. A diagnostic attempt to load a standalone Istanbul instrumenter found that it is bundled privately;no probe changed source or counters and no equivalence shortcut is used for acceptance.

    Residual scope: actual ScStyleSheet/ScStyleSheetPool/ScPoolHelper,standard styles,document UpdateStyleSheet resolution and complete StyleApply/UI/history/ODS consumers remain required and unported. The mounted test explicitly refreshes projection after native deletion;it does not claim the missing native style repaint owner or automatic notifications. Native render/number/hash caches remain absent in this existing data slice. Actual EditEngine/GetNeededSize and automatic wrapped-height remain required. Full UI/device/font/UNO/ABI parity is not claimed. The broader goal remains active;only task55 closes. Repaired all-app checkpoint51 retained;next complete checkpoint60.

    Test-only lint repair: the original static lint gate rejected34 non-null assertions in the new fixtures. They were replaced by explicit presence guards,including a local guard inside the serialized Worker function. The same7affected cases were replayed successfully with identical case identities. Production source and its fresh full raw coverage remain unchanged;the accepted515-case report replaces those2file results rather than counting duplicate cases. Latest scoped lint/format/type checks and a fresh8-case browser profile validate the guards. No lint rule,timeout,coverage threshold or exclusion was weakened.
id_source: "generated"
---
## Summary

Restore native Calc cell-pattern style association and registered-style lifecycle

Advance the required named-cell-style UI path with original ScPatternAttr style pointer/name inheritance,copy,clear-direct-format and symbol-font contracts plus CellAttributeHelper rename/delete/all-styles-to-names ownership. Reuse genuine shared SfxStyleSheet values through erased borrowed base operations;do not invent ScStyleSheet,ScStyleSheetPool,document style resolution or browser style state.

## Scope

Native ScPatternAttr style pointer/name association,copy,clear-direct-format inheritance,StyleToName and IsSymbolFont;CellAttributeHelper registered-style rename,delete and all-to-name lifecycle. Up to20 source/test files plus registry/provenance/readiness/evidence. Borrow only real shared native style operations;do not fabricate the missing Calc style/pool/document-resolution or UI command owners.

## Plan

Add the original borrowed style pointer to ScPatternAttr and preserve it and actual itemset parent through native copying. Implement GetStyleSheet,GetStyleName,SetStyleSheet default clearDirectFormat=true,StyleToName and IsSymbolFont from pinned patattr.cxx/hxx. Preserve null-attach name retention,clearing only style SET fields including inherited SET states,and exact name/value versus parent-identity equality. Add CellAttributeHelper CellStyleDeleted,RenameCellStyle and AllStylesToNames using actual name-group registries and canonical holders,including failed-rename re-insertion and forced default-pattern existence. Declare only erased borrowed base style operations consumed at those read sites;use genuine existing SfxStyleSheet/SfxStyleSheetPool in tests,not a fake ScStyleSheet or resolver. Native ScStyleSheet/ScStyleSheetPool,UpdateStyleSheet/document style resolution,full named style UI/ODS and automatic-height remain required and explicitly unported. Verify inheritance through actual column/pattern and mounted Calc display where current native operations permit it;do not add a browser-only style model or enable unsupported StyleApply. Run Calc100,related actual style/itemset tests and fresh changed-owner100 coverage;retain unchanged shared54 evidence by verified source hashes. Run all declared static/build gates and desktop/mobile font/wrap/ODS and DOM-free Worker native lifecycle acceptance. Up to20 source/test files plus records/evidence;only calc checkout/branch,no network,merges,subagents or full-suite checkpoint before60.

## Verify Steps

Read pinned patattr.cxx/hxx style binding,copy/equality and helper rename/delete/to-name contracts. Require stock complete Calc Istanbul100 S/B/F/L and related shared style/pool/itemset cases. Verify native borrowed style reference with genuine shared classes,canonical registry holder lifetimes,source null/failed rename/empty-group cases,inherited/default/INVALID states,symbol font and mounted Calc inheritance if reachable. Recompute complete shared100 from task54 only after verifying unchanged source hashes;fresh changed Calc owner coverage required. Run types,changed-source lint/format,dependencies,Writer/Calc resources,docs,size,tree,provenance,registry,routing,doctor,build/static-build. Run relevant Calc font/wrap/ODS desktop/mobile and native lifecycle Worker/browser cases,inspect screenshots. Archive raw reports,exact commands,source/native hashes and portable audit;obtain evaluator pass and finish clean calc. Keep heavyweight concurrency bounded to two jobs and avoid overlapping build/type work with slow native replay. No full app suite until60. Do not claim missing Calc style owners/UI/ODS or automatic-height complete.

## Verification

Command: exact commands,cwds and static argv in evidence/commands.json. Portable audit: node .agentplane/tasks/202610201913-6GG949/evidence/audit-archives.mjs.

Result: pass.

Evidence:515 distinct Calc cases in157files,46 related cases in6files,and8 fresh Chromium/Worker cases pass with0failures/0skips/0retries. Full Calc raw S/B/F/L100 at10561/6564/1975/9477. Complete shared100 is the hash-verified unchanged task54 raw baseline;no shared runtime owner changed. Build and14final static checks pass. Test-only presence guard rewrites were revalidated in the same7cases;the accepted report replaces identical case IDs without duplicate counting. Production and its complete raw maps remained unchanged.

Scope: original pattern style pointer/name association,copy,clear-direct-format default,actual itemset inheritance,symbol-font detection,registered exact-style rename/delete and all-to-name/default lifecycle. Genuine shared style/pool classes supply only consumed borrowed base operations;no Calc style owner/resolver or browser model is substituted. Mounted real Calc column projection and Worker demonstrate the actual contracts. Reports,source/native hashes and4current screenshots archived. Original lint failure and corrected lint/format/types retained.

Remaining: actual Calc style/pool/helper,standard styles,document resolution,StyleApply/UI/history/ODS and repaint consumers remain unported;automatic-height also remains required. Broader goal active. Repaired all-app checkpoint51 retained;next complete checkpoint60.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T19:38:11.083Z — VERIFY — ok

By: CODER

Note: Pass:515 distinct Calc cases,46related style/pool cases,8fresh Chromium/Worker cases,14final static checks and build. Fresh full Calc raw100 and hash-verified unchanged shared54 raw100 audited from committed archives. Same7test guard cases replayed without duplicate counting after lint-only rewrite;production maps unchanged. Actual native style association/lifecycle and mounted inherited fonts verified. Missing Calc style owners/resolution/UI/history/ODS/repaint and automatic-height remain explicit;goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T19:37:41.108Z, excerpt_hash=sha256:2ebc2a09d11abe7c2c801f6fe4573b20bda55001585744f7b0fedabe80a636d6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201913-6GG949/blueprint/resolved-snapshot.json
- old_digest: 6fc46460aef1e353e1a1aa8897d80ef6aaab32b7e6b42cf13a156618c648ce94
- current_digest: 6fc46460aef1e353e1a1aa8897d80ef6aaab32b7e6b42cf13a156618c648ce94
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201913-6GG949

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201913-6GG949
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit,preserving prior verified formatting/context work;no branch,merge or history changes.

## Findings

Observation: pinned patattr.cxx/hxx stores a borrowed style pointer separately from an optional owned style name. Copy preserves the pointer and actual item-set parent. SetStyleSheet defaults to clearing direct fields only where the style reports SET,including inherited SET,then attaches the actual style item set. Native null attachment keeps an existing stored name. StyleToName copies the name and drops the pointer/parent;symbol-font detection reads explicitly SET direct/inherited font encoding rather than pool defaults.
Impact: original cell-pattern inheritance is now available to the native column owner and existing Calc projection. Mounted acceptance shows independent Latin/CJK/CTL fonts inherited from the actual registered column pattern with no direct font items or browser style store. Native clear-direct-format=false,INVALID/default states,copy/equality,parent identity,null/name retention and independent copied names are exercised.
Resolution: CellAttributeHelper preserves exact borrowed identity during deletion and rename,removes affected patterns before SetName,re-inserts by the actual resulting name even on failed rename,and preserves canonical holder ownership. AllStylesToNames visits registered patterns and explicitly forces/visits the default. CALC240 documents these source distinctions;no normalization or dummy cache invalidation is added.

Borrowed boundary: ScPatternStyleReference erases only existing native base operations consumed at these call sites. Tests use genuine shared SfxStyleSheet/SfxStyleSheetPool classes;no fake ScStyleSheet,Calc style pool or document resolver exists. Native const GetStyleSheet/deletion references expose only the consumed const GetName operation;mutable attach/rename references retain required operations. The first complete Calc run passed515 cases at100;the final const-view annotations are verified again by a complete final-source run. A diagnostic attempt to load a standalone Istanbul instrumenter found that it is bundled privately;no probe changed source or counters and no equivalence shortcut is used for acceptance.

Residual scope: actual ScStyleSheet/ScStyleSheetPool/ScPoolHelper,standard styles,document UpdateStyleSheet resolution and complete StyleApply/UI/history/ODS consumers remain required and unported. The mounted test explicitly refreshes projection after native deletion;it does not claim the missing native style repaint owner or automatic notifications. Native render/number/hash caches remain absent in this existing data slice. Actual EditEngine/GetNeededSize and automatic wrapped-height remain required. Full UI/device/font/UNO/ABI parity is not claimed. The broader goal remains active;only task55 closes. Repaired all-app checkpoint51 retained;next complete checkpoint60.

Test-only lint repair: the original static lint gate rejected34 non-null assertions in the new fixtures. They were replaced by explicit presence guards,including a local guard inside the serialized Worker function. The same7affected cases were replayed successfully with identical case identities. Production source and its fresh full raw coverage remain unchanged;the accepted515-case report replaces those2file results rather than counting duplicate cases. Latest scoped lint/format/type checks and a fresh8-case browser profile validate the guards. No lint rule,timeout,coverage threshold or exclusion was weakened.
