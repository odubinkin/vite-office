# Accepted scalar frontend and native boundary proof

This is a bounded source/accepted-domain proof for task75, not a claim of complete native Calc execution or matrix support. Baseline: LibreOffice9bc445578031fecf56086729d8e4940c77e14d65.

## Native error contracts remain

The final tests construct actual ScDocument, ScFormulaCell, ScFormulaCellGroup, column stores and listener contexts through their public APIs. They cover pending group-prefix/top adoption, actual shared-code replacement before SyncSharedCode, and disagreement between the formula constructor's position and the column adoption row. These are deliberate public argument/lifecycle boundary tests. No private store field, compiler buffer, copied workbook backend or simulated reference counter is injected.

The original column3 IllegalArgumentException checks remain. Native top, row, block-bound and shared-code assertions remain. Cold-listener missing-top recovery and short-block clamp/assert remain. Group split's zero-lower-part branch remains, including its behavior for a mismatched public tail-adoption row. Live edits, real relocated invalid references, already pending listening flags, closed-document resource access and an actual public presenter callback cover the other observed paths.

## One default declaration

Native column.hxx declares RegroupFormulaCells's default once; column3.cxx's out-of-class definition has no default. The TypeScript public ScColumn method retains default null. Its out-of-class implementation now requires that already-bound parameter. No caller behavior changes.

## Private AutoSum geometry

Pinned viewfun2.cxx contains exactly one caller for each static lcl_GetAutoSumForColumnRange/lcl_GetAutoSumForRowRange helper. Their ScRange constructors repeat the same column or row respectively. Their only None returns are the opposite-axis mismatch checks. Other exits retain Sum or convert None to Data. Consequently both private axis checks and their callers' None-result conditions are impossible for all callers, including the complete original source translation unit. The port retains helper/range owners and all reachable selection, summation and output behavior; it omits these duplicate conditions.

The browser caret subtotal offset is outside the supported return domain: GetAutoSumFormula explicitly throws for subtotal before the controller can receive a formula. CanAutoSum also reports that kernel boundary. The successful ordinary aggregate offset remains open+1. No SUBTOTAL computation or unavailable UI command is simulated.

## Scalar compiler admission

FormulaCompiler.ts admits exactly20 opcodes: nine lexical/control/range operators, five binary arithmetic operators, unary negation and percent, and SUM/SUMSQ/PRODUCT/AVERAGE. CompileTokenArray rejects non-Unknown forced-array context before parsing. Its constructor rejects matrix compilation. Genuine ScMatrixToken input is explicitly tested at that boundary.

The real ScParameterClassification audit records all11 active operation classifications against the existing238-row native-table correspondence: binary/unary parameters are Value or Array; their results are not Reference. The four admitted aggregate families have Reference or ReferenceOrRefArray parameters, which the original ParameterMayBeImplicitIntersection excludes. Reference/force-array return functions, ROUND/VLOOKUP/SUMIF and other native function families are not admitted. General private classification/exclusion paths for those unavailable contexts are therefore omitted from this frontend, rather than implemented as false-returning placeholder services.

Every actual shared-parser HandleIIOpCode call is gated by mbComputeII. Binary sites pass exactly two locations; unary/percent sites pass exactly one. Aggregate sites retain the native eight-location limit. The original bad-expression location validation remains. The derived private native hook's duplicate flag/arity conditions have no additional accepted callers.

## Actual RPN location lifetime

Captured locations borrow the same actual dense RPN array, not a copied parameter buffer. RangeLine can replace/pop the final operands of an unfinished range; completed arithmetic operators append. A later operand's tail reduction cannot remove an earlier completed operand root. Nested ranges and aggregate operands are tested through actual compilation and interpretation.

The native pending-token identity check remains essential: a malformed expression may capture one operand location twice. After its first conversion the second pending entry must be skipped. An initial attempted simplification failed the genuine malformed-expression vector; that attempt is retained in diagnostics and the final implementation restores the native identity guard.

In this adapter, a non-null captured token still identical at its dense-array index implies the index is below that same array's logical length. Array.pop deletes an element rather than leaving a native allocation-capacity slot behind. Thus the native pointer-end check is already implied by the retained identity check. The final operation cannot acquire forced-array context: admission rejects it and this represented scalar parser has no array-context propagation. The final identity guard, delayed timing, eligible reference flags and scalar intersection logic remain unchanged.

## Limits

This proof does not extend the admission domain. Adding actual matrix/forced-array/reference-return functions requires their original context propagation and corresponding native classification/exclusion services. No complete matrix evaluator, formatter, Calc style factory, clipboard sharing/reset/paste or broader formula frontend is claimed. All global raw coverage thresholds remain100; no coverage ignore, file exclusion or fake owner has been added.
