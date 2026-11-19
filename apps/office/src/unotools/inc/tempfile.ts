/** @fileoverview Consumed original tempfile.hxx UniqueTokens and parent/file/directory TempFileNamed and public name/base declarations. Original UNIX TempFileFast and its complete fast service are bound; sequential constructors remain unbound. */
import { OUString } from "../../sal/inc/rtl/ustring";
import { Mutex, MutexGuard } from "../../sal/inc/osl/mutex";
import { Time } from "../../tools/source/datetime/ttime";
/** Original token generator interface. */
export abstract class Tokens {
  /** Original output pointer contract. @param token - Actual output pointer or null. @returns Generation success. */
  abstract next(token: OUString | null): boolean;
}
/** Original global radix36 token sequence with per-instance attempt budget. */
export class UniqueTokens extends Tokens {
  private static globalValue = 0xffffffff;
  private m_count = 0;
  /** Original assert/budget/global mutex/ticks/increment/base36 order. @param token - Actual output pointer or null. @returns Whether a token was generated. */
  override next(token: OUString | null): boolean {
    if (token === null) throw new Error("assert(token != nullptr)");
    const radix = 36,
      maximum = radix * radix * radix * radix * radix * radix;
    if (this.m_count === maximum) return false;
    let value: number;
    const guard = new MutexGuard(Mutex.getGlobalMutex());
    try {
      UniqueTokens.globalValue = Number(
        (UniqueTokens.globalValue === 0xffffffff
          ? Time.GetSystemTicks()
          : BigInt(UniqueTokens.globalValue + 1)) % BigInt(maximum),
      );
      value = UniqueTokens.globalValue;
    } finally {
      guard.dispose();
    }
    const text = new OUString(OUString.numberUnsigned(value, radix));
    try {
      token.assign(text);
    } finally {
      text.dispose();
    }
    ++this.m_count;
    return true;
  }
}
export {
  TempFileFast,
  TempFileNamed,
  CreateTempName,
  CreateTempURL,
  SetTempNameBaseDirectory,
  GetTempNameBaseDirectory,
} from "../source/ucbhelper/tempfile";
export { TempFileFastService } from "../source/ucbhelper/tempfile.fast";
