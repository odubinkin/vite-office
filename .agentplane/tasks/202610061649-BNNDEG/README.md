---
id: "202610061649-BNNDEG"
title: "Prevent Writer list labels from overlapping item text"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on:
  - "202610061618-REBSTT"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T16:49:46.301Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T17:10:36.967Z"
  updated_by: "CODER"
  note: "Verified exact implementation e625c6f3b56279490cd3fc9292afa2a3ee2f4d92: all declared gates pass,13011app109inventory5scripts221Chrome current cases, actual100 coverage; same-agent evaluator, no independent-review claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T17:10:36.198Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA EVALUATOR phase, not independent review: e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 passes bounded occupied label width correction."
  evaluated_sha: "e625c6f3b56279490cd3fc9292afa2a3ee2f4d92"
  blueprint_digest: "6f233a3770469ce17c66c02d0de14dd0d600bc6daa0b16d5acc1b90119dda5bf"
  evidence_refs:
    - ".agentplane/tasks/202610061649-BNNDEG/README.md"
    - ".agentplane/tasks/202610061649-BNNDEG/quality/20261006-171036198-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061649-BNNDEG/quality/20261006-171036198-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061649-BNNDEG/quality/20261006-171036198-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061649-BNNDEG/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061649-BNNDEG/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610061649-BNNDEG/evidence/scope-audit.json"
    - ".agentplane/tasks/202610061649-BNNDEG/evidence/source-review.json"
    - ".agentplane/tasks/202610061649-BNNDEG/evidence/final-coverage.json"
    - ".agentplane/tasks/202610061649-BNNDEG/evidence/governance.json"
  findings:
    - "Intrinsic glyph width plus native minimum distance prevents label/text overlap; original four-field listLayout and all502 prior acceptance files remain unchanged. Current acceptance13011app109inventory5scripts221Chromium PASS, actual100 app/inventory with strict source proof. Full native list/tab/font/continued-line layout and parent parity remain unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: explicit priority bullet-overlap fix and continuing authorized native UI parity; bounded intrinsic label width with upstream-absent verification."
events:
  -
    type: "status"
    at: "2026-10-06T16:49:57.506Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicit priority bullet-overlap fix and continuing authorized native UI parity; bounded intrinsic label width with upstream-absent verification."
  -
    type: "verify"
    at: "2026-10-06T17:10:36.967Z"
    author: "CODER"
    state: "ok"
    note: "Verified exact implementation e625c6f3b56279490cd3fc9292afa2a3ee2f4d92: all declared gates pass,13011app109inventory5scripts221Chrome current cases, actual100 coverage; same-agent evaluator, no independent-review claim."
doc_version: 3
doc_updated_at: "2026-10-06T17:11:12.030Z"
doc_updated_by: "CODER"
description: "Priority iteration193: match pinned SwNumberPortion minimum occupied width in the existing browser paragraph renderer; preserve native list ownership/defaults and all existing acceptance contracts."
sections:
  Summary: "Iteration193, priority user-reported bullet/text overlap. Match SwNumberPortion::Format minimum occupied label width in the browser text device without changing native rules, defaults, ownership or registered I/O deviations."
  Scope: "Only apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/editor/native-list-marker-width.test.tsx, apps/office/e2e/writer-native-list-marker-width.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all502 existing acceptance files byte-identically,275 metadata contracts and evidence prefixes; append bounded evidence only to existing browser boundary records. Mouse-row resizing remains next priority; THKZ38 draft remains stashed."
  Plan: "Under existing iterative authorization and explicit user fix request: project the native minimum distance (zero for alignment mode, GetCharTextDistance for legacy mode); let CSS intrinsic glyph width plus that interval lower-bound the authored marker slot. Keep native indentation, tab targets, editable text and canonical nodes untouched. Add actual owner/mounted projection contracts and production Chromium glyph/text range geometry including collapsed slots, large fonts, nested levels, cells, wrapping and edit/history. No upstream code/helpers in AP."
  Verify Steps: |-
    1. Initial six static gates format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; scoped unchanged JSDoc and actual physical lines<1000. Repeat only original failed or genuinely changed-path checks.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. No source/scope/AP audit while profile live. Only original failed or genuinely new cases afterward; no passing/full replay or with-upstream tests. Actual100 app/inventory counters with identical complete source/maps or complete contiguous byte-identical regions/whole function declaration-body/full branch-location proof; focused skips remain skipped. Raw maps/reports/source/cases only ignored app cache, AP bounded prose/counts/hashes.
    3. Actual native owner/mounted contracts and Chromium1280/390 prove bullet/number marker text ranges do not intersect item text at collapsed/narrow slots, large fonts, nested levels and table cells; standard authored slots retained, legacy minimum distance retained, wrapping and editing/history intact.502 old acceptance files byte-identical+2new=504;275 prior metadata/evidence/semantic/default/responsibility/justification contracts retained; I/O mapping unchanged.
    4. Once restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff/pinned hashes/current-leaf quality census0forbidden. Same-agent EVALUATOR exact implementation SHA explicitly not independent, verification tail before finish(actual implementationSHA), clean final tracked state. Parent entire490339-character prefix SHA aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec preserved; whole parity remains UNVERIFIED.
  Verification: |-
    Command: initial six static gates; ONE full upstream-absent build/app/inventory/scripts/Chromium profile; only original failed or genuinely new contract/compatibility cases afterward; changed-path checks; once-restored five source gates; doctor/routing/diff; exact-SHA audit.
    Result: PASS at implementation e625c6f3b56279490cd3fc9292afa2a3ee2f4d92. Current acceptance union13011app109inventory5scripts221Chromium; no historical passing/full replay.502 old acceptance files byte-identical+2new=504;275 metadata contracts/prefixes retained. Actual100 app272/inventory38 across lines/statements/functions/branches with strict complete source proof.
    Evidence: evidence/exact-sha-review.json,absent-profile.json,failure-closure1/2/3.json,final-coverage.json,coverage-source-proof.json,source-gates.json,scope-audit.json,source-review.json,governance.json,changed-file-checks.json and quality/20261006-171036198-recovery-context/quality-report.json. Same current agent EVALUATOR phase explicitly not independent review. Source/raw diagnostics/cases/maps remain only ignored application cache. Vendor restored; THKZ38 stash preserved.
    Scope: occupied list-label width in existing browser renderer and immutable distance projection. Complete native font/tab/alignment/continued-line/clipping/layout and whole parity remain UNVERIFIED; parent/goal ACTIVE.
  Rollback Plan: "Revert only the final leaf implementation commit with a new task; preserve other task history and the THKZ38 stash."
  Findings: |-
    Pinned porfld.cxx SwNumberPortion::Format sets nDiff at least m_nFixWidth+m_nMinDist. txtfld.cxx NewNumberPortion supplies zero minimum distance for label-alignment and GetCharTextDistance for legacy position mode. Current fixed-width browser marker can overflow into editable text when the slot is narrower than the glyph. Bound this fix to intrinsic occupied width; wider native tabs/alignment/font-device/layout parity remains unverified.

    Implemented intrinsic max-content marker minimum plus native legacy interval in the existing browser display. Minimum distance is separate from the exact four-field authored listLayout contract. Six approved semantic paths;502 old acceptance files byte-identical+2new=504;275 semantic states/defaults/evidence/responsibility/justification/symbol prefixes and I/O mappings preserved. Parent entire490339-character prefix aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec retained; THKZ38 stash intact.
    Initial full absent buildPASS,13009appPASS1oldexact-layoutFAIL,109inventoryPASSactual100,5scriptsPASS,217oldChromePASS4newfixtureFAIL. First exact-layout mismatch corrected by projecting label minimum outside listLayout, retaining old test bytes. Eight draft nested-field tests replaced with eight new separate-contract tests. Closure1 oldfailed1+new8PASS2skips, rebuilt distPASS;Chrome4FAIL on wrap-range fragment measurement. Closure2 newdetached/followcase1PASS8skips,Chrome4FAIL on platform End position. Closure3 onlyoriginalfailedChrome4PASS+typecheckPASS. Historical passing cases/full profiles never replayed. Final current union13011app109inventory5scripts221ChromePASS.
    Actual100 app272files L14425S15820F3688B11789 map9fe0761d10f8d10359add7d2bd0e4651a529363c69590dfdb141bd7cd052f5dd;inventory38files L1464S1523F384B1080 map2bb3c6c1d2293b5a4d2df8c7d4ba57c96e51ee48176a56fc3c7894eb0f56e1e7. Only complete source/map or contiguous byte-identical regions/full function declaration-body/full enclosing branch-location proofs admit actual counters. Raw maps/source/cases stay in ignored app cache; focused skips not promoted.
    Six initial static gates executed once; only failed format/docs rechecked, scoped changed acceptance checks and required type/build after production correction. Restored five source gatesPASS; scopePASS; doctor0errors2knownwarnings,routing/diffPASS; current-leaf census0forbidden. Same-agent EVALUATOR exact implementation e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 PASS, explicitly not independent. Full native font/style/RTL/alignment/tab fallback/continued-line indentation/clipping/layout parity remains unverified; parent/goal ACTIVE. Row resize remains next priority.
    Coverage source proof: app270whole-identical+2complete-region files, raw proofSHA8a4baa6ac19263e42e10b72163f5ff92a62fa78d2c6feb6a2bc89eea29ce7c68;inventory38whole-identical, raw proofSHAb1662f9d320f06d26815b24845b2b5c8d10e74f29ad002812c630a3f38a2d606. Exact-SHA acceptance identity audit preserves duplicate occurrence identities, excludes8superseded draft nested-field cases, admits8actual new separate-contract cases and1newcompatibility case, retains2+8focused skips as skipped. Same-agent review0failures; evaluator report quality/20261006-171036198-recovery-context/quality-report.json.
id_source: "generated"
---
## Summary

Iteration193, priority user-reported bullet/text overlap. Match SwNumberPortion::Format minimum occupied label width in the browser text device without changing native rules, defaults, ownership or registered I/O deviations.

## Scope

Only apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/editor/native-list-marker-width.test.tsx, apps/office/e2e/writer-native-list-marker-width.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all502 existing acceptance files byte-identically,275 metadata contracts and evidence prefixes; append bounded evidence only to existing browser boundary records. Mouse-row resizing remains next priority; THKZ38 draft remains stashed.

## Plan

Under existing iterative authorization and explicit user fix request: project the native minimum distance (zero for alignment mode, GetCharTextDistance for legacy mode); let CSS intrinsic glyph width plus that interval lower-bound the authored marker slot. Keep native indentation, tab targets, editable text and canonical nodes untouched. Add actual owner/mounted projection contracts and production Chromium glyph/text range geometry including collapsed slots, large fonts, nested levels, cells, wrapping and edit/history. No upstream code/helpers in AP.

## Verify Steps

1. Initial six static gates format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; scoped unchanged JSDoc and actual physical lines<1000. Repeat only original failed or genuinely changed-path checks.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. No source/scope/AP audit while profile live. Only original failed or genuinely new cases afterward; no passing/full replay or with-upstream tests. Actual100 app/inventory counters with identical complete source/maps or complete contiguous byte-identical regions/whole function declaration-body/full branch-location proof; focused skips remain skipped. Raw maps/reports/source/cases only ignored app cache, AP bounded prose/counts/hashes.
3. Actual native owner/mounted contracts and Chromium1280/390 prove bullet/number marker text ranges do not intersect item text at collapsed/narrow slots, large fonts, nested levels and table cells; standard authored slots retained, legacy minimum distance retained, wrapping and editing/history intact.502 old acceptance files byte-identical+2new=504;275 prior metadata/evidence/semantic/default/responsibility/justification contracts retained; I/O mapping unchanged.
4. Once restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff/pinned hashes/current-leaf quality census0forbidden. Same-agent EVALUATOR exact implementation SHA explicitly not independent, verification tail before finish(actual implementationSHA), clean final tracked state. Parent entire490339-character prefix SHA aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec preserved; whole parity remains UNVERIFIED.

## Verification

Command: initial six static gates; ONE full upstream-absent build/app/inventory/scripts/Chromium profile; only original failed or genuinely new contract/compatibility cases afterward; changed-path checks; once-restored five source gates; doctor/routing/diff; exact-SHA audit.
Result: PASS at implementation e625c6f3b56279490cd3fc9292afa2a3ee2f4d92. Current acceptance union13011app109inventory5scripts221Chromium; no historical passing/full replay.502 old acceptance files byte-identical+2new=504;275 metadata contracts/prefixes retained. Actual100 app272/inventory38 across lines/statements/functions/branches with strict complete source proof.
Evidence: evidence/exact-sha-review.json,absent-profile.json,failure-closure1/2/3.json,final-coverage.json,coverage-source-proof.json,source-gates.json,scope-audit.json,source-review.json,governance.json,changed-file-checks.json and quality/20261006-171036198-recovery-context/quality-report.json. Same current agent EVALUATOR phase explicitly not independent review. Source/raw diagnostics/cases/maps remain only ignored application cache. Vendor restored; THKZ38 stash preserved.
Scope: occupied list-label width in existing browser renderer and immutable distance projection. Complete native font/tab/alignment/continued-line/clipping/layout and whole parity remain UNVERIFIED; parent/goal ACTIVE.

## Rollback Plan

Revert only the final leaf implementation commit with a new task; preserve other task history and the THKZ38 stash.

## Findings

Pinned porfld.cxx SwNumberPortion::Format sets nDiff at least m_nFixWidth+m_nMinDist. txtfld.cxx NewNumberPortion supplies zero minimum distance for label-alignment and GetCharTextDistance for legacy position mode. Current fixed-width browser marker can overflow into editable text when the slot is narrower than the glyph. Bound this fix to intrinsic occupied width; wider native tabs/alignment/font-device/layout parity remains unverified.

Implemented intrinsic max-content marker minimum plus native legacy interval in the existing browser display. Minimum distance is separate from the exact four-field authored listLayout contract. Six approved semantic paths;502 old acceptance files byte-identical+2new=504;275 semantic states/defaults/evidence/responsibility/justification/symbol prefixes and I/O mappings preserved. Parent entire490339-character prefix aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec retained; THKZ38 stash intact.
Initial full absent buildPASS,13009appPASS1oldexact-layoutFAIL,109inventoryPASSactual100,5scriptsPASS,217oldChromePASS4newfixtureFAIL. First exact-layout mismatch corrected by projecting label minimum outside listLayout, retaining old test bytes. Eight draft nested-field tests replaced with eight new separate-contract tests. Closure1 oldfailed1+new8PASS2skips, rebuilt distPASS;Chrome4FAIL on wrap-range fragment measurement. Closure2 newdetached/followcase1PASS8skips,Chrome4FAIL on platform End position. Closure3 onlyoriginalfailedChrome4PASS+typecheckPASS. Historical passing cases/full profiles never replayed. Final current union13011app109inventory5scripts221ChromePASS.
Actual100 app272files L14425S15820F3688B11789 map9fe0761d10f8d10359add7d2bd0e4651a529363c69590dfdb141bd7cd052f5dd;inventory38files L1464S1523F384B1080 map2bb3c6c1d2293b5a4d2df8c7d4ba57c96e51ee48176a56fc3c7894eb0f56e1e7. Only complete source/map or contiguous byte-identical regions/full function declaration-body/full enclosing branch-location proofs admit actual counters. Raw maps/source/cases stay in ignored app cache; focused skips not promoted.
Six initial static gates executed once; only failed format/docs rechecked, scoped changed acceptance checks and required type/build after production correction. Restored five source gatesPASS; scopePASS; doctor0errors2knownwarnings,routing/diffPASS; current-leaf census0forbidden. Same-agent EVALUATOR exact implementation e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 PASS, explicitly not independent. Full native font/style/RTL/alignment/tab fallback/continued-line indentation/clipping/layout parity remains unverified; parent/goal ACTIVE. Row resize remains next priority.
Coverage source proof: app270whole-identical+2complete-region files, raw proofSHA8a4baa6ac19263e42e10b72163f5ff92a62fa78d2c6feb6a2bc89eea29ce7c68;inventory38whole-identical, raw proofSHAb1662f9d320f06d26815b24845b2b5c8d10e74f29ad002812c630a3f38a2d606. Exact-SHA acceptance identity audit preserves duplicate occurrence identities, excludes8superseded draft nested-field cases, admits8actual new separate-contract cases and1newcompatibility case, retains2+8focused skips as skipped. Same-agent review0failures; evaluator report quality/20261006-171036198-recovery-context/quality-report.json.
