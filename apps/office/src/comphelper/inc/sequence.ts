/** @fileoverview Original variadic concatSequences template over genuine UNO Sequence/C++ element assignment; explicit constructor binds erased T/sizeof only, without an alternate allocator or value/type provider. */
import type {
  Sequence,
  SequenceConstructor,
  SequenceElements,
} from "../../cppu/inc/com/sun/star/uno/Sequence";
import { getTypeFavourUnsigned } from "../../cppu/inc/unotype";
import { uno_type_assignData } from "../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference } from "../../cppu/inc/typelib/typedescription";
/** Original unary-fold size and ordered std::copy operations; existing C UNO assignment lowers initialized C++ element lvalues. @param Element - Actual compiled Sequence specialization for T and sizeof. @param first - Original first sequence. @param rest - Original nonempty parameter pack. @returns New sequence value with the summed size. */
export function concatSequences<T>(
  Element: SequenceConstructor<T>,
  first: Sequence<T>,
  ...rest: [Sequence<T>, ...Sequence<T>[]]
): Sequence<T> {
  let length = first.getLength();
  for (const sequence of rest) length += sequence.getLength();
  const result = new Element(length);
  try {
    const target = result.getArray() as SequenceElements;
    const type = getTypeFavourUnsigned(
      Element.ElementType,
    ).getTypeLibType() as typelib_TypeDescriptionReference;
    let offset = 0;
    for (const sequence of [first, ...rest]) {
      const source = sequence.getConstArray() as SequenceElements;
      for (let i = 0; i < sequence.getLength(); ++i) {
        uno_type_assignData(
          target.get(offset),
          type,
          source.get(i * Element.ElementSize),
          type,
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        );
        offset += Element.ElementSize;
      }
    }
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  }
}
