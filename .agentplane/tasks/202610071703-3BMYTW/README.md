---
id: "202610071703-3BMYTW"
title: "Preserve native bullet font families through ODT list styles"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 22
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T17:15:35.611Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T17:33:07.727Z"
  updated_by: "EVALUATOR"
  note: "Same current agent EVALUATOR, explicitly not independent: exact implementation c057c3284b2861dc181147670974e3927294b481 preserves native represented bullet font family through ODT/UNO; sole full absent-upstream284 Chromium PASS and only original3 app/1 inventory closures PASS; actual all4 current-source app/inventory coverage100; no unresolved cases/uncaught/passing replay."
  evaluated_sha: "c057c3284b2861dc181147670974e3927294b481"
  blueprint_digest: "f657966473b2c715d0ed88c280ff2d18ddd87d51e2ecfd0cdec8fa095332e2dc"
  evidence_refs:
    - ".agentplane/tasks/202610071703-3BMYTW/README.md"
    - ".agentplane/tasks/202610071703-3BMYTW/quality/20261007-173307727-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071703-3BMYTW/quality/20261007-173307727-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071703-3BMYTW/quality/20261007-173307727-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071703-3BMYTW/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071703-3BMYTW/evidence/exact-sha-review.json"
  findings:
    - "Complete font descriptors, historical glyph recoding, full SwFont/VCL/script/style/graphics/config and exhaustive parent parity remain explicitly unverified; conscious I/O/recovery exceptions preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore the native represented bullet font family ODT path with source lookup/fallback/import precedence/empty-descriptor behavior; preserve upstream ruler admission and all deliberate I/O deviations."
events:
  -
    type: "status"
    at: "2026-10-07T17:04:35.142Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the native represented bullet font family ODT path with source lookup/fallback/import precedence/empty-descriptor behavior; preserve upstream ruler admission and all deliberate I/O deviations."
doc_version: 3
doc_updated_at: "2026-10-07T17:33:25.001Z"
doc_updated_by: "CODER"
description: "Iteration221: close the actual existing optional bullet Font family loss across source-owned Writer UNO, xmloff list import/export and font-face lookup boundaries; preserve native empty-descriptor behavior and registered I/O/recovery deviations. Upstream confirms admitted tight-tab indent gesture consumes click intentionally, so do not invent a pointer-affinity fix."
sections:
  Summary: "Restore the existing optional bullet Font family across native Writer UNO and ODT boundaries. Mirror xmlnume.cxx CHAR_SPECIAL nonempty family, font auto-style pool Find branch and direct fo:font-family fallback; keep Writer font pool ownership and no artificial bullet-font registration. Mirror xmlnumi.cxx declared face resolution followed by nonempty direct-family override under original level context ownership, then source GetProperties bullet FontDescriptor publication and SwXNumberingRules copy/apply/commit ignoring an empty descriptor Name. Reuse existing shared family-name import/export handlers, no private adapters or duplicate font owner. Pass immutable represented descriptor member only, not a fake full FontDescriptor. Include common/automatic rules, body/cell, family quoting and missing/empty/numbered paths, actual graph roundtrip and Chromium glyph/reset/history. Preserve594 old acceptance bytes and all300 prior metadata fields/statuses/defaults/exceptions, append bounded evidence only. Upstream admitted indent drag consumes the tight-tab click intentionally; record correction to prior suspected defect without altering DONE220. Preserve conscious save/open/recovery deviations. Same current agent role phases, no independent evaluator claim; no network, outside-repo access or raw/upstream/source/Python artifacts in AgentPlane."
  Scope: |-
    apps/office/src/sw/source/core/unocore/unosett.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/sw/source/filter/xml/xmlimp.ts
    apps/office/src/xmloff/source/style/xmlnume.ts
    apps/office/src/xmloff/source/style/xmlnumi.ts
    apps/office/src/xmloff/source/text/txtparae.ts
    apps/office/src/xmloff/source/text/txtparai.ts
    apps/office/src/xmloff/source/style/XMLFontAutoStylePool.ts
    apps/office/src/xmloff/source/style/XMLFontStylesContext.ts
    apps/office/src/editeng/source/uno/unofdesc.ts
    apps/office/src/sw/source/filter/xml/native-bullet-font-roundtrip.test.ts
    apps/office/src/xmloff/source/style/native-bullet-font.test.ts
    apps/office/e2e/native-bullet-font-roundtrip.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/xmloff/source/style/xmlnumi.test.ts
  Plan: "Restore the existing optional bullet Font family across native Writer UNO and ODT boundaries. Mirror xmlnume.cxx CHAR_SPECIAL nonempty family, font auto-style pool Find branch and direct fo:font-family fallback; keep Writer font pool ownership and no artificial bullet-font registration. Mirror xmlnumi.cxx declared face resolution followed by nonempty direct-family override under original level context ownership, then source GetProperties bullet FontDescriptor publication and SwXNumberingRules copy/apply/commit ignoring an empty descriptor Name. Reuse existing shared family-name import/export handlers, no private adapters or duplicate font owner. Pass immutable represented descriptor member only, not a fake full FontDescriptor. Include common/automatic rules, body/cell, family quoting and missing/empty/numbered paths, actual graph roundtrip and Chromium glyph/reset/history. Preserve594 old acceptance bytes and all300 prior metadata fields/statuses/defaults/exceptions, append bounded evidence only. Upstream admitted indent drag consumes the tight-tab click intentionally; record correction to prior suspected defect without altering DONE220. Preserve conscious save/open/recovery deviations. Same current agent role phases, no independent evaluator claim; no network, outside-repo access or raw/upstream/source/Python artifacts in AgentPlane. Include native editeng unofdesc responsibility for represented FontDescriptor Name conversion, because enforced module boundaries forbid direct sw/core -> vcl constructor dependency. Preserve actual Font/format copy ownership; pure Name conversion returns original native Font, not a fabricated full descriptor class. Scope adds only this necessary source-owned file (15 semantic paths)."
  Verify Steps: "Initial npm format:check,lint,typecheck,check:dependencies,check:docs,check:file-size once; ONE full upstream-absent profile: hide vendor/libreoffice-reference and run test:static, app coverage, inventory coverage, infrastructure14 and full Chromium; restore in finally, freeze source/task writes until terminal actual handle. Never invoke pinned upstream from tests. Later runtime only original failed or truly new cases, zero passing replay; static/source closures only failures/changed inputs. Require actual current-source all4 metrics100 app/inventory using complete byte-identical maps or contiguous full declaration/body/enclosing-branch/location proofs, no exclusions/clamps/skipped promotion. Preserve594 old acceptance bytes (only exact actual source-default assertion migration after original failure with all other inputs/assertions retained if needed),all300 prior records/fields/statuses/defaults/exceptions plus one explicitly bounded unverified editeng Name-conversion mapping, no module promotion. After restored run resource generator--check,source-tree,provenance,invariants,parity. Inspect exact source xmlnume/xmlnumi/unosett family/empty/lookup/precedence contracts and edtwin3+edtwin ruler admission correction; JSDoc/actual physical<1000, English bounded evidence, artifact census, doctor/routing/diff, clean actual implementation SHA and full parent prefix. Final Findings/Verification before canonical verify; same-current-agent EVALUATOR explicitly not independent; persist canonical verification state before finish actual implementation SHA."
  Verification: "PASS: source-reviewed represented bullet Font family ODT/UNO path with source-owned editeng conversion and native empty-Name policy; real packages/common+automatic/body+cell/Worker and all284 Chromium PASS. ONE full upstream-absent profile only; original3 app and1 inventory failures closed in one bounded absent-upstream closure, zero passing replay,5app+2inventory skipped observations retained. Final unique13579app110inventory14infra284Chromium;zero uncaught/unresolved. Actual current-source all4 coverage100 for app/inventory with complete maps/source/counter bindings,298+38whole files and9complete prior app-region proofs. Production unchanged after full build/Chromium. Initial6static and scoped failed/changed-input closures,5restored source gates,scoped JSDoc/physical<1000(max997),scope594old593unchanged1literalnative-empty-descriptor migration,all300prior metadata preserved+1unverified new301,artifact census,doctor0errors2oldwarnings/routing/diff pass. Clean exact implementation c057c3284b2861dc181147670974e3927294b481 review and same-current-agent EVALUATOR quality/20261007-173307727-recovery-context/quality-report.json PASS; no independent review claim. Final canonical verification must be persisted before finish actual implementation SHA."
  Rollback Plan: "Revert this leaf implementation only; preserve prior DONE tasks, complete parent Findings prefix, deferred stash and all conscious I/O/recovery deviations."
  Findings: |-
    Iteration221 closes actual custom bullet Font family loss in ODT list styles. The original native optional Font stays owned by SwNumFormat; the represented UNO descriptor Name is validated before copy/apply/commit and converted by source-owned editeng unofdesc. Empty Name ignores the copied optional Font, malformed values reject atomically. CHAR_SPECIAL nonempty family exports an existing font auto-style pool Find alias or shared quoted direct fo:font-family fallback; no artificial bullet-font registration. Import resolves a nonempty existing declaration first and then applies nonempty direct family override; unknown/absent faces retain prior level state, bullet GetProperties publishes the native empty descriptor. Existing family handlers are shared without cyclic exporter imports or a new font owner. Common/automatic rules, body/cell nodes, package reexport/reopen and Worker graph preserve actual families.
    Source correction to prior220 suspicion: edtwin3 RulerMarginDrag returns !StartDocDrag; edtwin MouseButtonDown returns before ordinary selection when indent tracking is admitted. Tight-tab zero-indent marker capture is native behavior, not a confirmed defect. No pointer-affinity patch or DONE220 mutation.
    ONE full upstream-absent profile: build PASS; app13576 PASS3 failed of13579; inventory109 PASS1 failed of110; infrastructure14 PASS; all284 Chromium PASS, including actual loaded Liberation Mono marker, native weight/posture reset, body/cell real glyph separation at1280/390, label Home/edit/Undo/Redo. Zero uncaught. Original failures only in closure1: app3 PASS5 skipped observations, inventory1 PASS2 skipped observations; exit1 retained solely unchanged whole-graph focused coverage thresholds. No Chromium rerun or passing-case replay. One old expected GetProperties object adds only source-native empty BulletFont descriptor after original failure; all other inputs/assertions unchanged. Fresh body/cell fixture now inspects correct separate owners; fresh duplicate fixture uses distinct XML aliases for one actual native rule name. Accidental locale-sort metadata order restored to binary lexical order. Source review anchor spacing mismatch corrected from actual pinned source, no semantic source change. An empty orchestration-template invocation produced no verification and was corrected before evidence claims.
    Final unique13579app110inventory14infra284Chromium, no unresolved accepted case or uncaught error. Actual current-source app L16559/S18182/F4225/B13717 and inventory L1464/S1523/F384/B1081 all four metrics100, complete source/maps and full contiguous declaration/body/enclosing-branch/location certificates,298whole app38whole inventory9complete prior app regions. No exclusions/clamps/threshold edits/skipped promotion. All10 production hashes unchanged after full runtime, so final build/Chromium binding retained.16semantic paths,594prior acceptance with593 byte-identical and1exact source-backed expectation migration;3fresh files/597current. All300 prior metadata fields/statuses/defaults/prefixes/exceptions preserved plus1bounded unverified editeng mapping,301total. Initial6static once and failure/changed-input scoped closures PASS;5restored-only source gates PASS;actual JSDoc/physical max997,doctor0errors2pre-existing warnings,routing/diff/artifact PASS. No upstream/source/Python/raw results/maps/snapshots/scripts in AgentPlane; raw only ignored node_modules cache. All semantic/task writes waited for terminal runtime/profile handles; vendor restored. Parent full616548-character Findings prefix SHA16a9119ea2bb5a1cfe5a36092e0e80309d5b869627008ed64fbe63cbcf0b2c5f and deferred stash preserved. Clean exact implementation SHA c057c3284b2861dc181147670974e3927294b481 review PASS. Same-current-agent EVALUATOR explicitly not independent, quality/20261007-173307727-recovery-context/quality-report.json PASS.
    Residuals: complete FontDescriptor members/style/family classification/pitch/charset/metrics and StarBats/StarMath glyph conversion remain unrepresented; full SwFont/scripts/style/paragraph-mark/redline/graphics/device shaping and ODT true compatibility-flag config persistence remain unverified. Exhaustive parent goal remains ACTIVE, deliberate save/open/recovery deviations unchanged.
id_source: "generated"
---
## Summary

Restore the existing optional bullet Font family across native Writer UNO and ODT boundaries. Mirror xmlnume.cxx CHAR_SPECIAL nonempty family, font auto-style pool Find branch and direct fo:font-family fallback; keep Writer font pool ownership and no artificial bullet-font registration. Mirror xmlnumi.cxx declared face resolution followed by nonempty direct-family override under original level context ownership, then source GetProperties bullet FontDescriptor publication and SwXNumberingRules copy/apply/commit ignoring an empty descriptor Name. Reuse existing shared family-name import/export handlers, no private adapters or duplicate font owner. Pass immutable represented descriptor member only, not a fake full FontDescriptor. Include common/automatic rules, body/cell, family quoting and missing/empty/numbered paths, actual graph roundtrip and Chromium glyph/reset/history. Preserve594 old acceptance bytes and all300 prior metadata fields/statuses/defaults/exceptions, append bounded evidence only. Upstream admitted indent drag consumes the tight-tab click intentionally; record correction to prior suspected defect without altering DONE220. Preserve conscious save/open/recovery deviations. Same current agent role phases, no independent evaluator claim; no network, outside-repo access or raw/upstream/source/Python artifacts in AgentPlane.

## Scope

apps/office/src/sw/source/core/unocore/unosett.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/sw/source/filter/xml/xmlimp.ts
apps/office/src/xmloff/source/style/xmlnume.ts
apps/office/src/xmloff/source/style/xmlnumi.ts
apps/office/src/xmloff/source/text/txtparae.ts
apps/office/src/xmloff/source/text/txtparai.ts
apps/office/src/xmloff/source/style/XMLFontAutoStylePool.ts
apps/office/src/xmloff/source/style/XMLFontStylesContext.ts
apps/office/src/editeng/source/uno/unofdesc.ts
apps/office/src/sw/source/filter/xml/native-bullet-font-roundtrip.test.ts
apps/office/src/xmloff/source/style/native-bullet-font.test.ts
apps/office/e2e/native-bullet-font-roundtrip.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/xmloff/source/style/xmlnumi.test.ts

## Plan

Restore the existing optional bullet Font family across native Writer UNO and ODT boundaries. Mirror xmlnume.cxx CHAR_SPECIAL nonempty family, font auto-style pool Find branch and direct fo:font-family fallback; keep Writer font pool ownership and no artificial bullet-font registration. Mirror xmlnumi.cxx declared face resolution followed by nonempty direct-family override under original level context ownership, then source GetProperties bullet FontDescriptor publication and SwXNumberingRules copy/apply/commit ignoring an empty descriptor Name. Reuse existing shared family-name import/export handlers, no private adapters or duplicate font owner. Pass immutable represented descriptor member only, not a fake full FontDescriptor. Include common/automatic rules, body/cell, family quoting and missing/empty/numbered paths, actual graph roundtrip and Chromium glyph/reset/history. Preserve594 old acceptance bytes and all300 prior metadata fields/statuses/defaults/exceptions, append bounded evidence only. Upstream admitted indent drag consumes the tight-tab click intentionally; record correction to prior suspected defect without altering DONE220. Preserve conscious save/open/recovery deviations. Same current agent role phases, no independent evaluator claim; no network, outside-repo access or raw/upstream/source/Python artifacts in AgentPlane. Include native editeng unofdesc responsibility for represented FontDescriptor Name conversion, because enforced module boundaries forbid direct sw/core -> vcl constructor dependency. Preserve actual Font/format copy ownership; pure Name conversion returns original native Font, not a fabricated full descriptor class. Scope adds only this necessary source-owned file (15 semantic paths).

## Verify Steps

Initial npm format:check,lint,typecheck,check:dependencies,check:docs,check:file-size once; ONE full upstream-absent profile: hide vendor/libreoffice-reference and run test:static, app coverage, inventory coverage, infrastructure14 and full Chromium; restore in finally, freeze source/task writes until terminal actual handle. Never invoke pinned upstream from tests. Later runtime only original failed or truly new cases, zero passing replay; static/source closures only failures/changed inputs. Require actual current-source all4 metrics100 app/inventory using complete byte-identical maps or contiguous full declaration/body/enclosing-branch/location proofs, no exclusions/clamps/skipped promotion. Preserve594 old acceptance bytes (only exact actual source-default assertion migration after original failure with all other inputs/assertions retained if needed),all300 prior records/fields/statuses/defaults/exceptions plus one explicitly bounded unverified editeng Name-conversion mapping, no module promotion. After restored run resource generator--check,source-tree,provenance,invariants,parity. Inspect exact source xmlnume/xmlnumi/unosett family/empty/lookup/precedence contracts and edtwin3+edtwin ruler admission correction; JSDoc/actual physical<1000, English bounded evidence, artifact census, doctor/routing/diff, clean actual implementation SHA and full parent prefix. Final Findings/Verification before canonical verify; same-current-agent EVALUATOR explicitly not independent; persist canonical verification state before finish actual implementation SHA.

## Verification

PASS: source-reviewed represented bullet Font family ODT/UNO path with source-owned editeng conversion and native empty-Name policy; real packages/common+automatic/body+cell/Worker and all284 Chromium PASS. ONE full upstream-absent profile only; original3 app and1 inventory failures closed in one bounded absent-upstream closure, zero passing replay,5app+2inventory skipped observations retained. Final unique13579app110inventory14infra284Chromium;zero uncaught/unresolved. Actual current-source all4 coverage100 for app/inventory with complete maps/source/counter bindings,298+38whole files and9complete prior app-region proofs. Production unchanged after full build/Chromium. Initial6static and scoped failed/changed-input closures,5restored source gates,scoped JSDoc/physical<1000(max997),scope594old593unchanged1literalnative-empty-descriptor migration,all300prior metadata preserved+1unverified new301,artifact census,doctor0errors2oldwarnings/routing/diff pass. Clean exact implementation c057c3284b2861dc181147670974e3927294b481 review and same-current-agent EVALUATOR quality/20261007-173307727-recovery-context/quality-report.json PASS; no independent review claim. Final canonical verification must be persisted before finish actual implementation SHA.

## Rollback Plan

Revert this leaf implementation only; preserve prior DONE tasks, complete parent Findings prefix, deferred stash and all conscious I/O/recovery deviations.

## Findings

Iteration221 closes actual custom bullet Font family loss in ODT list styles. The original native optional Font stays owned by SwNumFormat; the represented UNO descriptor Name is validated before copy/apply/commit and converted by source-owned editeng unofdesc. Empty Name ignores the copied optional Font, malformed values reject atomically. CHAR_SPECIAL nonempty family exports an existing font auto-style pool Find alias or shared quoted direct fo:font-family fallback; no artificial bullet-font registration. Import resolves a nonempty existing declaration first and then applies nonempty direct family override; unknown/absent faces retain prior level state, bullet GetProperties publishes the native empty descriptor. Existing family handlers are shared without cyclic exporter imports or a new font owner. Common/automatic rules, body/cell nodes, package reexport/reopen and Worker graph preserve actual families.
Source correction to prior220 suspicion: edtwin3 RulerMarginDrag returns !StartDocDrag; edtwin MouseButtonDown returns before ordinary selection when indent tracking is admitted. Tight-tab zero-indent marker capture is native behavior, not a confirmed defect. No pointer-affinity patch or DONE220 mutation.
ONE full upstream-absent profile: build PASS; app13576 PASS3 failed of13579; inventory109 PASS1 failed of110; infrastructure14 PASS; all284 Chromium PASS, including actual loaded Liberation Mono marker, native weight/posture reset, body/cell real glyph separation at1280/390, label Home/edit/Undo/Redo. Zero uncaught. Original failures only in closure1: app3 PASS5 skipped observations, inventory1 PASS2 skipped observations; exit1 retained solely unchanged whole-graph focused coverage thresholds. No Chromium rerun or passing-case replay. One old expected GetProperties object adds only source-native empty BulletFont descriptor after original failure; all other inputs/assertions unchanged. Fresh body/cell fixture now inspects correct separate owners; fresh duplicate fixture uses distinct XML aliases for one actual native rule name. Accidental locale-sort metadata order restored to binary lexical order. Source review anchor spacing mismatch corrected from actual pinned source, no semantic source change. An empty orchestration-template invocation produced no verification and was corrected before evidence claims.
Final unique13579app110inventory14infra284Chromium, no unresolved accepted case or uncaught error. Actual current-source app L16559/S18182/F4225/B13717 and inventory L1464/S1523/F384/B1081 all four metrics100, complete source/maps and full contiguous declaration/body/enclosing-branch/location certificates,298whole app38whole inventory9complete prior app regions. No exclusions/clamps/threshold edits/skipped promotion. All10 production hashes unchanged after full runtime, so final build/Chromium binding retained.16semantic paths,594prior acceptance with593 byte-identical and1exact source-backed expectation migration;3fresh files/597current. All300 prior metadata fields/statuses/defaults/prefixes/exceptions preserved plus1bounded unverified editeng mapping,301total. Initial6static once and failure/changed-input scoped closures PASS;5restored-only source gates PASS;actual JSDoc/physical max997,doctor0errors2pre-existing warnings,routing/diff/artifact PASS. No upstream/source/Python/raw results/maps/snapshots/scripts in AgentPlane; raw only ignored node_modules cache. All semantic/task writes waited for terminal runtime/profile handles; vendor restored. Parent full616548-character Findings prefix SHA16a9119ea2bb5a1cfe5a36092e0e80309d5b869627008ed64fbe63cbcf0b2c5f and deferred stash preserved. Clean exact implementation SHA c057c3284b2861dc181147670974e3927294b481 review PASS. Same-current-agent EVALUATOR explicitly not independent, quality/20261007-173307727-recovery-context/quality-report.json PASS.
Residuals: complete FontDescriptor members/style/family classification/pitch/charset/metrics and StarBats/StarMath glyph conversion remain unrepresented; full SwFont/scripts/style/paragraph-mark/redline/graphics/device shaping and ODT true compatibility-flag config persistence remain unverified. Exhaustive parent goal remains ACTIVE, deliberate save/open/recovery deviations unchanged.
