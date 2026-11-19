/** @fileoverview Original MediaDescriptor ComponentData operations from mediadescriptor.cxx over the actual UNO Any, NamedValueCollection and SequenceAsHashMap owners. Existing input/readonly/file-content profiles are represented; URL/locking/authentication/password orchestration remains unported. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  SequenceAsHashMap,
  type ConstSequenceAsHashMap,
} from "../../../comphelper/source/misc/sequenceashashmap";
import { NamedValueCollection } from "../../../comphelper/inc/namedvaluecollection";
import { cppu_detail_getUnoType_NamedValue as namedType } from "../../../udkapi/com/sun/star/beans/NamedValue";
import { cppu_detail_getUnoType_PropertyValue as propertyType } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  PROP_COMPONENTDATA,
  PROP_INPUTSTREAM,
  PROP_POSTDATA,
  PROP_READONLY,
  PROP_STREAM,
  PROP_UCBCONTENT,
  PROP_URL,
} from "../../inc/mediadescriptor";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XContent } from "../../../offapi/com/sun/star/ucb/XContent";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { removeFragment } from "./mediadescriptor.uri";
/** Compiler-known source literal binding. @param value - Original message. @returns Actual owned RTL string. */
function literal(value: string): OUString {
  return OUString.fromUtf8(new TextEncoder().encode(value));
}
/** Original existing-input presence fast path and absent/invalid-source handling. Positive URL/PostData trust/interaction opening remains an explicit prerequisite, not a fallback stream/provider. @param descriptor - Actual native map. @returns Original result for represented arguments. */
export function addInputStream(descriptor: SequenceAsHashMap): boolean {
  if (descriptor.find(PROP_INPUTSTREAM) !== undefined) return true;
  try {
    const post = descriptor.find(PROP_POSTDATA);
    if (post !== undefined) {
      const input = new Reference<XInputStream>();
      try {
        post[1].extract(input.getAddress(), ["Reference", XInputStream.static_type]);
        if (!input.is()) {
          const message = literal("Found invalid PostData."),
            context = new Reference();
          try {
            throw new IllegalArgumentException(message, context, 1);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
        throw new Error(
          "MediaDescriptor PostData opening requires unported interaction/post orchestration",
        );
      } finally {
        input.dispose();
      }
    }
    const empty = new OUString();
    let url: OUString;
    try {
      url = descriptor.getUnpackedValueOrDefault(PROP_URL, empty, "OUString");
    } finally {
      empty.dispose();
    }
    try {
      if (url.isEmpty()) {
        const message = literal("Found no URL."),
          context = new Reference();
        try {
          throw new Exception(message, context);
        } finally {
          context.dispose();
          message.dispose();
        }
      }
      const stripped = removeFragment(url);
      try {
        throw new Error(
          "MediaDescriptor URL opening requires unported trust/interaction orchestration",
        );
      } finally {
        stripped.dispose();
      }
    } finally {
      url.dispose();
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
    return false;
  }
}
/** Original explicit ReadOnly/PostData/Stream precedence and actual file-content inference. Non-file property lookup still requires original default command/interaction services. @param descriptor - Actual readonly map. @returns Source readonly result for represented profiles. */
export function isStreamReadOnly(descriptor: ConstSequenceAsHashMap): boolean {
  const entry = descriptor.find(PROP_READONLY);
  if (entry !== undefined) {
    const flag = [false];
    entry[1].extract(flag, "bool");
    return flag[0] as boolean;
  }
  if (descriptor.find(PROP_POSTDATA) !== undefined) return true;
  if (descriptor.find(PROP_STREAM) !== undefined) return false;
  let readonly = false;
  try {
    const empty = new Reference<XContent>();
    let content: Reference<XContent>;
    try {
      content = descriptor.getUnpackedValueOrDefault(PROP_UCBCONTENT, empty, [
        "Reference",
        XContent.static_type,
      ]);
    } finally {
      empty.dispose();
    }
    try {
      if (content.is()) {
        const identifier = content.operatorStar().getIdentifier(),
          scheme = new OUString();
        try {
          if (identifier.is()) {
            const value = identifier.operatorStar().getContentProviderScheme();
            try {
              scheme.assign(value);
            } finally {
              value.dispose();
            }
          }
          const file = literal("file");
          try {
            if (scheme.equalsIgnoreAsciiCase(file)) readonly = true;
            else
              throw new Error(
                "MediaDescriptor non-file readonly lookup requires original default command environment",
              );
          } finally {
            file.dispose();
          }
        } finally {
          scheme.dispose();
          identifier.dispose();
        }
      }
    } finally {
      content.dispose();
    }
  } catch (error) {
    if (error instanceof RuntimeException) throw error;
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
  return readonly;
}
/** Original return-by-value copies the NamedValueCollection result before destroying its temporary. @param descriptor - Actual descriptor map. @param name - Actual component key. @returns Owned Any, empty when absent. */
export function getComponentDataEntry(
  descriptor: ConstSequenceAsHashMap,
  name: OUStringConstReference,
): Any {
  const property = descriptor.find(PROP_COMPONENTDATA);
  if (property !== undefined) {
    const collection = new NamedValueCollection(property[1]);
    try {
      const value = collection.get(name);
      return new Any(value.pData, value.pType);
    } finally {
      collection.dispose();
    }
  }
  return new Any();
}
/** Original inserts/replaces while preserving a NamedValue or PropertyValue sequence discriminator; VOID means removal. @param descriptor - Actual descriptor. @param name - Component key. @param value - Actual borrowed value. @returns Nothing. */
export function setComponentDataEntry(
  descriptor: SequenceAsHashMap,
  name: OUStringConstReference,
  value: Any,
): void {
  if (value.hasValue()) {
    const component = descriptor.operatorIndex(PROP_COMPONENTDATA),
      named = !component.hasValue() || component.has(["Sequence", namedType]),
      properties = component.has(["Sequence", propertyType]);
    // Original OSL_ENSURE diagnoses unsupported types; release code leaves them unchanged.
    if (named || properties) {
      const data = new SequenceAsHashMap(component);
      try {
        data.operatorIndex(name).assign(value);
        const sequence = data.getAsConstAny(properties);
        try {
          component.assign(sequence);
        } finally {
          sequence.dispose();
        }
      } finally {
        data.dispose();
      }
    }
  } else clearComponentDataEntry(descriptor, name);
}
/** Original erases the outer property only after the last component is removed; an invalid existing sequence is retained. @param descriptor - Actual descriptor. @param name - Component key. @returns Nothing. */
export function clearComponentDataEntry(
  descriptor: SequenceAsHashMap,
  name: OUStringConstReference,
): void {
  const property = descriptor.find(PROP_COMPONENTDATA);
  if (property === undefined) return;
  const component = property[1],
    named = component.has(["Sequence", namedType]),
    properties = component.has(["Sequence", propertyType]);
  if (named || properties) {
    const data = new SequenceAsHashMap(component);
    try {
      data.erase(name);
      if (data.empty()) descriptor.erase(PROP_COMPONENTDATA);
      else {
        const sequence = data.getAsConstAny(properties);
        try {
          component.assign(sequence);
        } finally {
          sequence.dispose();
        }
      }
    } finally {
      data.dispose();
    }
  }
}
