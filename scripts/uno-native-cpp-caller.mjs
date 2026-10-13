/** @fileoverview Reuses complete original native value observations, adapting only the pure caller's C++ virtual interface field observer where its physical layout differs from the binary UNO witness. */
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
const binaryObservation =
  "case typelib_TypeClass_INTERFACE:{auto*w=*static_cast<W**>(p);emit({w==nullptr});if(w)emit({w->id,w->count});break;}";
if (!unoNativeValueCaller.includes(binaryObservation))
  throw Error("Original caller interface observer changed");
/** Exact shared caller plus one actual C++ pointer observer declaration; every value/type/description/name/offset/callback owner remains original. This changes authored observation input syntax only, not any native library source. */
export const unoNativeCppValueCaller = unoNativeValueCaller
  .replace("void value(void*,R*);", "void cppPointerValue(void*);\nvoid value(void*,R*);")
  .replace(
    binaryObservation,
    "case typelib_TypeClass_INTERFACE:{cppPointerValue(*static_cast<void**>(p));break;}",
  );
