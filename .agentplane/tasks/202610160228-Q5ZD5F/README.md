---
id: "202610160228-Q5ZD5F"
title: "Implement native system language resolution and locale wrappers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T02:29:50.872Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T02:54:07.134Z"
  updated_by: "CODER"
  note: "28related/196Calc,exact10shared/36Calc raw S/B/F/L100,every counter positive.13gates,9native pins/2aliases/defaults,unchanged moved host logic/private tables/consumers/Writer/guards. Actual configured/system/UI and empty-Locale real text/Calc consumers pass;build,Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Platform input divergence explicit;full LanguageTag/font/pool/UI/ODS pending,no all-app run."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port actual native system/data/UI language resolution and Locale wrappers,reuse host Locale preparation and correct empty-language shared fallback;verify related and Calc raw100 without RTL memory machinery."
events:
  -
    type: "status"
    at: "2026-10-16T02:29:51.289Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual native system/data/UI language resolution and Locale wrappers,reuse host Locale preparation and correct empty-language shared fallback;verify related and Calc raw100 without RTL memory machinery."
  -
    type: "verify"
    at: "2026-10-16T02:54:07.134Z"
    author: "CODER"
    state: "ok"
    note: "28related/196Calc,exact10shared/36Calc raw S/B/F/L100,every counter positive.13gates,9native pins/2aliases/defaults,unchanged moved host logic/private tables/consumers/Writer/guards. Actual configured/system/UI and empty-Locale real text/Calc consumers pass;build,Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Platform input divergence explicit;full LanguageTag/font/pool/UI/ODS pending,no all-app run."
doc_version: 3
doc_updated_at: "2026-10-16T02:54:07.187Z"
doc_updated_by: "CODER"
description: "Task188: implement actual MsLangId configured/system/UI resolution and public Locale wrappers;reuse one browser platform-locale field binding instead of adding RTL locale memory structures or fake LanguageTag services."
sections:
  Summary: "Implement native MsLangId configured/system/UI language resolution and public Locale wrappers,closing the explicit empty-language fallback gap needed by LanguageTag and Calc font defaults."
  Scope: "New mslangid core source and browser-platform insys field binding;move existing host Locale preparation unchanged into one shared lower-level platform responsibility and delegate existing SysLocale query. Native configured/system/UI scalar state and getRealLanguage,convertLanguageToLocale,convertLocaleToLanguage,getFallbackLocale plus2required aliases;canonical facade and i18npool integration. Tests,inventory/provenance/capability/readiness and actual Chromium/Worker/Writer. Maximum45non-task paths. No RTL locale allocator/registry/refcount/cache engine,fake LanguageTag/OS/service,no new ICU/native compiler/generator/probe,network or all-app run. Existing private table algorithms and browser host parsing remain unchanged."
  Plan: "Implement documented Task188 native system/configured language scalar state and public locale wrappers over one existing browser platform Locale source under standing user approval."
  Verify Steps: "Pin mslangid.cxx/mslangid.hxx,insys/inunx/inwnt platform sources,lang.h,LanguageTag and LocaleData consumers. Exact native alias constants0x0400/0x0800,configured scalar defaults0,UI/data independence,lazy platform snapshots,normalization/unknown behavior,nonrecursive configured aliases and invalid mapping last-resort only for original system aliases. Actual Locale wrappers copy fields and preserve explicit Locale behavior;empty input resolves actual configured/platform locale. Prove moved host Locale preparation and value-construction emitted tokens unchanged,old private tables/converters and unrelated Writer/defaults/guards unchanged. Existing regressions plus actual empty-Locale decimal/measurement/tab/document setting consumers. Exact changed shared executable owner set raw S/B/F/L100,every counter positive;whole Calc raw100,related Writer tests,13source gates,production build and actual Chromium/dedicated DOM-free Worker/Writer;4refs absent/restored. Platform binding is explicit browser adaptation,not Unix environment/Win32/RTL ABI implementation;full LanguageTag/canonicalization/fonts/pool/document/UI/ODS pending. No compiler/generator/probe or all-app run."
  Verification: |-
    Command: node output/playwright/task188-checks/portable.mjs. Result:pass. Evidence:28related tests/8files and196Calc/78files;exact10shared executable owners raw S237/B175/F47/L211100 and36Calc S4310/B2777/F864/L3857100,every raw counter positive,no coverage filtering or Writer-only repair. Native configured data/UI defaults,independent platform snapshots,alias/UNKNOWN/nonrecursive/origin-sensitive fallback state cases and actual empty-Locale decimal/measurement/tab/Calc consumers pass. Fresh module graphs are test-only process-like initialization;no production reset API. Command: node output/playwright/task188-checks/native-audit.mjs. Result:pass. Evidence:9native blobs pinned,2alias IDs/default state exact,moved host Locale/value-construction emitted bodies identical,old decimal consumer body unchanged;LocaleData emitted runtime differs only in dispatch to actual public fallback. Existing private tables/converters/old fixture,Locale/OUString,document/tab/Writer ODF and guard/test files byte-identical. Native platform-input/selection responsibility is recorded as divergent source mechanism at the insys boundary,with explicit browser input strategy and OS/RTL ABI limits;no fabricated native body parity. Command: node output/playwright/task188-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and controlled-host dedicated DOM-free Worker system/configured resolution and actual text/Calc defaults,Writer startup/load/edit;4refs absent/restored.13source gates and exact owner/path audit pass27non-task paths within45. Public empty-language/system conversion gap from187 closed;full LanguageTag synchronization/canonicalization,script fallbacks,font/pool/document/UI/ODS remain pending. No RTL locale allocator/registry/refcount/mutex/physical cache engine,new ICU,native compiler/generator/probe or all-app run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T02:54:07.134Z — VERIFY — ok

    By: CODER

    Note: 28related/196Calc,exact10shared/36Calc raw S/B/F/L100,every counter positive.13gates,9native pins/2aliases/defaults,unchanged moved host logic/private tables/consumers/Writer/guards. Actual configured/system/UI and empty-Locale real text/Calc consumers pass;build,Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Platform input divergence explicit;full LanguageTag/font/pool/UI/ODS pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T02:53:59.127Z, excerpt_hash=sha256:e96c93d1793765abd925d219b526ee142647fbe4254aa8a3d76601591db13256

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160228-Q5ZD5F/blueprint/resolved-snapshot.json
    - old_digest: 68621e1586a662061726e1f685301b059a1af94b5e00c4f9b038787917627484
    - current_digest: 68621e1586a662061726e1f685301b059a1af94b5e00c4f9b038787917627484
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160228-Q5ZD5F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160228-Q5ZD5F
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only Task188 source/task commits,preserve calc branch,other work and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair."
  Findings: |-
    Native configured data/UI language defaults are independent LANGUAGE_SYSTEM scalars;platform language access lazily captures corresponding values. Scalar configuration and snapshot identity are observable logical behavior,not physical memory management. Browser exposes one primary locale source,so data/UI platform bindings use it while retaining independent snapshots and configured overrides. Public empty-language fallback delegates original getRealLanguage and then private table fallback;do not emulate it by unconditional en-US.

    - Observation: Provenance requires an explicit rationale on the two new local-only browser platform records.
      Impact: Runtime/source checks passed;adapter classification needs its mandatory explanatory field.
      Resolution: Add rationale describing real host Locale preparation/platform selection and explicitly exclude native OS/RTL ABI or fake class claims;do not relax provenance validation.

    - Observation: Local-only adapter provenance additionally requires responsibilities and stackDivergence;the old SysLocale evidence still names the moved unicode helper.
      Impact: Metadata must describe the browser adaptation and its actual moved source location completely.
      Resolution: Complete both adapter records and point the old helper evidence to insys.locale.ts;source algorithms and validation rules remain unchanged.

    - Observation: Inventory exposes a second stale moved-helper anchor in an existing capability record:SysLocale unicode now lives in insys.locale.ts. The pending failure was read after E2E authoring;route was refreshed before remediation.
      Impact: No accepted runtime verification or production behavior changes;the inventory must follow actual source ownership.
      Resolution: Repoint exact unicode implementation markers to the shared platform owner,then rerun inventory/routing/doctor/boundary checks. Keep all work within approved task scope and guard logic unchanged.

    - Observation: Runtime inventory identified incorrect browser-adaptation classification for the two insys source-mechanism files. They implement the native platform-language selection/input responsibility at its upstream-shaped source boundary;their browser input strategy is a stack divergence. Runtime/Calc/build/Chromium/Worker/Writer checks passed;final audit correctly refused pending metadata gates.
      Impact: The records must distinguish native platform-mechanism responsibility from browser application adapters and must not claim exact Unix/Win32/RTL bodies.
      Resolution: Map the actual inunx platform input/selection responsibility with explicit divergent source status and module-resolution/responsibility-split rationale. Retain browser input/ABI limits and all parity flags unverified;change no guard algorithm or known-violation exemption. Rerun source records/gates/final audit only;passing runtime code is unchanged.
id_source: "generated"
---
## Summary

Implement native MsLangId configured/system/UI language resolution and public Locale wrappers,closing the explicit empty-language fallback gap needed by LanguageTag and Calc font defaults.

## Scope

New mslangid core source and browser-platform insys field binding;move existing host Locale preparation unchanged into one shared lower-level platform responsibility and delegate existing SysLocale query. Native configured/system/UI scalar state and getRealLanguage,convertLanguageToLocale,convertLocaleToLanguage,getFallbackLocale plus2required aliases;canonical facade and i18npool integration. Tests,inventory/provenance/capability/readiness and actual Chromium/Worker/Writer. Maximum45non-task paths. No RTL locale allocator/registry/refcount/cache engine,fake LanguageTag/OS/service,no new ICU/native compiler/generator/probe,network or all-app run. Existing private table algorithms and browser host parsing remain unchanged.

## Plan

Implement documented Task188 native system/configured language scalar state and public locale wrappers over one existing browser platform Locale source under standing user approval.

## Verify Steps

Pin mslangid.cxx/mslangid.hxx,insys/inunx/inwnt platform sources,lang.h,LanguageTag and LocaleData consumers. Exact native alias constants0x0400/0x0800,configured scalar defaults0,UI/data independence,lazy platform snapshots,normalization/unknown behavior,nonrecursive configured aliases and invalid mapping last-resort only for original system aliases. Actual Locale wrappers copy fields and preserve explicit Locale behavior;empty input resolves actual configured/platform locale. Prove moved host Locale preparation and value-construction emitted tokens unchanged,old private tables/converters and unrelated Writer/defaults/guards unchanged. Existing regressions plus actual empty-Locale decimal/measurement/tab/document setting consumers. Exact changed shared executable owner set raw S/B/F/L100,every counter positive;whole Calc raw100,related Writer tests,13source gates,production build and actual Chromium/dedicated DOM-free Worker/Writer;4refs absent/restored. Platform binding is explicit browser adaptation,not Unix environment/Win32/RTL ABI implementation;full LanguageTag/canonicalization/fonts/pool/document/UI/ODS pending. No compiler/generator/probe or all-app run.

## Verification

Command: node output/playwright/task188-checks/portable.mjs. Result:pass. Evidence:28related tests/8files and196Calc/78files;exact10shared executable owners raw S237/B175/F47/L211100 and36Calc S4310/B2777/F864/L3857100,every raw counter positive,no coverage filtering or Writer-only repair. Native configured data/UI defaults,independent platform snapshots,alias/UNKNOWN/nonrecursive/origin-sensitive fallback state cases and actual empty-Locale decimal/measurement/tab/Calc consumers pass. Fresh module graphs are test-only process-like initialization;no production reset API. Command: node output/playwright/task188-checks/native-audit.mjs. Result:pass. Evidence:9native blobs pinned,2alias IDs/default state exact,moved host Locale/value-construction emitted bodies identical,old decimal consumer body unchanged;LocaleData emitted runtime differs only in dispatch to actual public fallback. Existing private tables/converters/old fixture,Locale/OUString,document/tab/Writer ODF and guard/test files byte-identical. Native platform-input/selection responsibility is recorded as divergent source mechanism at the insys boundary,with explicit browser input strategy and OS/RTL ABI limits;no fabricated native body parity. Command: node output/playwright/task188-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and controlled-host dedicated DOM-free Worker system/configured resolution and actual text/Calc defaults,Writer startup/load/edit;4refs absent/restored.13source gates and exact owner/path audit pass27non-task paths within45. Public empty-language/system conversion gap from187 closed;full LanguageTag synchronization/canonicalization,script fallbacks,font/pool/document/UI/ODS remain pending. No RTL locale allocator/registry/refcount/mutex/physical cache engine,new ICU,native compiler/generator/probe or all-app run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T02:54:07.134Z — VERIFY — ok

By: CODER

Note: 28related/196Calc,exact10shared/36Calc raw S/B/F/L100,every counter positive.13gates,9native pins/2aliases/defaults,unchanged moved host logic/private tables/consumers/Writer/guards. Actual configured/system/UI and empty-Locale real text/Calc consumers pass;build,Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Platform input divergence explicit;full LanguageTag/font/pool/UI/ODS pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T02:53:59.127Z, excerpt_hash=sha256:e96c93d1793765abd925d219b526ee142647fbe4254aa8a3d76601591db13256

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160228-Q5ZD5F/blueprint/resolved-snapshot.json
- old_digest: 68621e1586a662061726e1f685301b059a1af94b5e00c4f9b038787917627484
- current_digest: 68621e1586a662061726e1f685301b059a1af94b5e00c4f9b038787917627484
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160228-Q5ZD5F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160228-Q5ZD5F
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only Task188 source/task commits,preserve calc branch,other work and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair.

## Findings

Native configured data/UI language defaults are independent LANGUAGE_SYSTEM scalars;platform language access lazily captures corresponding values. Scalar configuration and snapshot identity are observable logical behavior,not physical memory management. Browser exposes one primary locale source,so data/UI platform bindings use it while retaining independent snapshots and configured overrides. Public empty-language fallback delegates original getRealLanguage and then private table fallback;do not emulate it by unconditional en-US.

- Observation: Provenance requires an explicit rationale on the two new local-only browser platform records.
  Impact: Runtime/source checks passed;adapter classification needs its mandatory explanatory field.
  Resolution: Add rationale describing real host Locale preparation/platform selection and explicitly exclude native OS/RTL ABI or fake class claims;do not relax provenance validation.

- Observation: Local-only adapter provenance additionally requires responsibilities and stackDivergence;the old SysLocale evidence still names the moved unicode helper.
  Impact: Metadata must describe the browser adaptation and its actual moved source location completely.
  Resolution: Complete both adapter records and point the old helper evidence to insys.locale.ts;source algorithms and validation rules remain unchanged.

- Observation: Inventory exposes a second stale moved-helper anchor in an existing capability record:SysLocale unicode now lives in insys.locale.ts. The pending failure was read after E2E authoring;route was refreshed before remediation.
  Impact: No accepted runtime verification or production behavior changes;the inventory must follow actual source ownership.
  Resolution: Repoint exact unicode implementation markers to the shared platform owner,then rerun inventory/routing/doctor/boundary checks. Keep all work within approved task scope and guard logic unchanged.

- Observation: Runtime inventory identified incorrect browser-adaptation classification for the two insys source-mechanism files. They implement the native platform-language selection/input responsibility at its upstream-shaped source boundary;their browser input strategy is a stack divergence. Runtime/Calc/build/Chromium/Worker/Writer checks passed;final audit correctly refused pending metadata gates.
  Impact: The records must distinguish native platform-mechanism responsibility from browser application adapters and must not claim exact Unix/Win32/RTL bodies.
  Resolution: Map the actual inunx platform input/selection responsibility with explicit divergent source status and module-resolution/responsibility-split rationale. Retain browser input/ABI limits and all parity flags unverified;change no guard algorithm or known-violation exemption. Rerun source records/gates/final audit only;passing runtime code is unchanged.
