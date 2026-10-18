# Task22 verification

Scope:17intentional non-task paths in calc checkout/branch. Actual missing EditEngine static package item SvxFontVariationsItem requires original VCL Variation values and text conversion. This task implements the complete native input parser and scalar value responsibility with true o3tl/RTL owners. It does not create a partial item class or fake EditEngine/Calc pool. Overall goal remains active.

## Checks

- Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage.log,111files/299cases,74.67seconds;raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each. Scope: entire Calc.
- Command: npm run test:coverage -- --coverage.include=src/vcl/source/font/FontVariation.ts --coverage.include=src/vcl/inc/font/Feature.ts --coverage.include=src/o3tl/inc/string_view.ts --coverage.reportsDirectory=coverage/task22-variations src/vcl/source/font/FontVariation.test.ts src/o3tl/inc/string_view-views.test.ts src/o3tl/inc/string_view.test.ts src/sal/rtl/math.test.ts src/sal/rtl/strtmpl.math.test.ts. Result: pass. Evidence: related-coverage.log,5files/15cases;raw S62/62 B53/53 F13/13 L48/48,100percent each. Scope: all new value/parser/tag implementation and entire changed shared helper module,including existing exact native integer/predicate fixtures and RTL parsing/number output tests. This is source-backed parser vector evidence,not a compiled full VCL differential test. No thresholds or exclusions changed.
- Command: npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: boundaries.log,2files/87cases. Scope: existing architecture checker tests plus source-backed new exact header binding and VCL->o3tl edge,with reverse/application/wrong-name/wrong-owner imports rejected.
- Command: npm run typecheck; npm run build; node scripts/check-static-build.mjs. Result: pass. Evidence: types.log,build.log,static.log. Scope: tools/app types,production build and static asset smoke. Existing chunk-size warning retained.
- Command: npm run check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance. Result: pass. Evidence: dependencies-final.log861runtime sources/3733relativeimports/125allowededges;docs-final.log2301authoredsources;size.log;tree.log114requiredpaths/33retiredroots;provenance-final.log862runtime modules (739mapped/105browser/18infra). Scope: complete deterministic gates.
- Command: npm run inventory:parity:shared; npm run inventory:parity:calc; touched Prettier/eslint; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: inventory-shared-final.log and inventory-calc-final.log semanticViolationCount0;style-final.log17intentional paths;doctor.log,routing.log. Successful large inventory outputs are explicitly compacted count/SHA256 summaries. Existing hook-readiness warning remains,doctorOK/routingOK. Scope: actual owner metadata and required local policy checks.

## Source and behavior

Original sources:include/vcl/font/Variation.hxx;vcl/source/font/FontVariation.cxx::VariationsFromString;include/vcl/font/Feature.hxx::featureCode;include/o3tl/string_view.hxx::getToken/trim/toDouble;native shared rtl/math.h and rtl/character.hxx bindings.

Variation aggregate public uint32/binary32 fields,zero defaults,independent copy and ordered tag/value IEEE equality are represented with JS accessors and Math.fround. NaN is unequal even to itself;negativezero compares equal to zero while its stored sign is retained. No axis range clamping.

Parser retains comma token order and duplicates,matched single/double quotes,minimum7UTF16 units,exact4ASCII alphanumeric/space tag units,malformed-token recovery and native numeric prefixes/invalid-zero/special values. Native parsing does not require a space after the closing quote. Nonbreaking/BOM whitespace is not silently accepted as JS trim would. Returned binary32 rounding/overflow/subnormals/signedzero and borrowed source view boundaries are directly tested;input remains unchanged.

The native size<6 check is entailed by the preceding size<7 guard. Likewise a wholly trimmed token of at least7units with closing quote at5 has a nonempty trimmed numeric suffix. These redundant source guards are omitted as logical equivalences;there is no unreachable-branch exclusion or success criterion change.

UTF16 getToken preserves original size_t-position semantics,borrowed subarrays,empty/trailing tokens and the checked position<=size assertion. Negativeone represents npos after the final token;passing npos again throws the same checked contract. trim uses the unchanged original whitespace classifier and default empty view behavior. toDouble directly calls rtl_math_uStringToDouble with period,no grouping and no status/end outputs. Original toInt32 and whitespace function bodies plus all existing native fixture assertions remain unchanged.

## Diagnoses

Initial architecture gate correctly rejected unregistered native dependencies. Pinned FontVariation.cxx includes o3tl/string_view.hxx,and that header includes rtl/math.h and directly calls rtl_math_uStringToDouble. Added only the native VCL->o3tl allowed edge and exact original importer/target/named binding to the existing SAL/o3tl witness map. All cycle/syntax/import-check function bodies remain unchanged. New negative tests reject reverse VCL access,Calc import,wrong decimal binding and wrong importing owner. This is alignment with actual upstream dependencies,not removal of a guard.

Initial authored provenance status partial was invalid:the repository requires mapped for real source ownership. Corrected to mapped while keeping runtime state foundation and behavior/contract/default unverified with explicit omissions. Header facade reexports are not local definitions;its runtime localSymbols array is empty,with implementation symbols recorded at the actual source owner. Final inventory reports no semantic violations. No validator changed to accept incorrect metadata.

One new helper test had mismatched parentheses and missing inline JSDoc;repaired before recorded final checks. No production workaround or test assertion weakening.

## Remaining work

VariationsToString requires the actual RTL float formatter;it is not approximated with JS String or exposed as a stub. VariationAxis metadata,full Feature services,SvxFontVariationsItem(including native float hashing/typed Any),remaining EditEngine defaults and pool,EditTextObjectImpl,ScPageHFItem,ScDocumentPool and actual document formatting/Sfx UI integration remain pending. Native pools must retain their own actual constructor/default packages. All current formatting controls remain correctly unavailable. No complete font/pool/native/UI parity is claimed. Full cadence remains task30;no full/E2E suite was required or run for this backend prerequisite.
