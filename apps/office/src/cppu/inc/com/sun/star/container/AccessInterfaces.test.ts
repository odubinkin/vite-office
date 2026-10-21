/** @fileoverview Compile-time IDL access contracts retain actual native value owners without manufacturing runtime interfaces or services. */
import { expectTypeOf, it } from "vitest";
import type { XElementAccess } from "./XElementAccess";
import type { XIndexAccess } from "./XIndexAccess";
import type { XIndexReplace } from "./XIndexReplace";
import type { XIndexContainer } from "./XIndexContainer";
import type { XNameAccess } from "./XNameAccess";
import type { XNameReplace } from "./XNameReplace";
import type { XNameContainer } from "./XNameContainer";
import type { XInterface } from "../uno/XInterface";
import type { Any } from "../uno/Any";
import type { Type } from "../uno/Type";
import type { Sequence } from "../uno/Sequence";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
it("retains native indexed inheritance, values and declared input/output directions", /** Checks all indexed declaration contracts. @returns Nothing. */ () => {
  expectTypeOf<XElementAccess>().toExtend<XInterface>();
  expectTypeOf<XIndexAccess>().toExtend<XElementAccess>();
  expectTypeOf<XIndexReplace>().toExtend<XIndexAccess>();
  expectTypeOf<XIndexContainer>().toExtend<XIndexReplace>();
  expectTypeOf<XElementAccess["getElementType"]>().returns.toEqualTypeOf<Type>();
  expectTypeOf<XElementAccess["hasElements"]>().returns.toEqualTypeOf<boolean>();
  expectTypeOf<XIndexAccess["getCount"]>().toEqualTypeOf<() => number>();
  expectTypeOf<XIndexAccess["getByIndex"]>().toEqualTypeOf<(Index: number) => Any>();
  expectTypeOf<XIndexReplace["replaceByIndex"]>().toEqualTypeOf<
    (Index: number, Element: Any) => void
  >();
  expectTypeOf<XIndexContainer["insertByIndex"]>().toEqualTypeOf<
    (Index: number, Element: Any) => void
  >();
  expectTypeOf<XIndexContainer["removeByIndex"]>().toEqualTypeOf<(Index: number) => void>();
});
it("retains native named inheritance and owned Any/Sequence with borrowed Unicode names", /** Checks all named declaration contracts. @returns Nothing. */ () => {
  expectTypeOf<XNameAccess>().toExtend<XElementAccess>();
  expectTypeOf<XNameReplace>().toExtend<XNameAccess>();
  expectTypeOf<XNameContainer>().toExtend<XNameReplace>();
  expectTypeOf<XNameAccess["getByName"]>().toEqualTypeOf<(aName: OUStringConstReference) => Any>();
  expectTypeOf<XNameAccess["getElementNames"]>().toEqualTypeOf<() => Sequence<OUString>>();
  expectTypeOf<XNameAccess["hasByName"]>().toEqualTypeOf<
    (aName: OUStringConstReference) => boolean
  >();
  expectTypeOf<XNameReplace["replaceByName"]>().toEqualTypeOf<
    (aName: OUStringConstReference, aElement: Any) => void
  >();
  expectTypeOf<XNameContainer["insertByName"]>().toEqualTypeOf<
    (aName: OUStringConstReference, aElement: Any) => void
  >();
  expectTypeOf<XNameContainer["removeByName"]>().toEqualTypeOf<
    (Name: OUStringConstReference) => void
  >();
});
