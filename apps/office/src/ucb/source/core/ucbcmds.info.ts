/** @fileoverview Original source-internal CommandProcessorInfo from ucbcmds.cxx. All three source command descriptors and exact lookup/copy contracts are retained; execution/transfer/check-in owners remain separate dependencies. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../../cppu/inc/unotype";
import { XCommandInfo } from "../../../offapi/com/sun/star/ucb/XCommandInfo";
import {
  CommandInfo,
  cppu_detail_getUnoType as infoType,
  type CommandInfoConstReference,
} from "../../../offapi/com/sun/star/ucb/CommandInfo";
import { cppu_detail_getUnoType as transferType } from "../../../offapi/com/sun/star/ucb/GlobalTransferCommandArgument";
import { cppu_detail_getUnoType as checkinType } from "../../../offapi/com/sun/star/ucb/CheckinArgument";
import { UnsupportedCommandException } from "../../../offapi/com/sun/star/ucb/UnsupportedCommandException";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  GETCOMMANDINFO_NAME,
  GETCOMMANDINFO_HANDLE,
  GLOBALTRANSFER_NAME,
  GLOBALTRANSFER_HANDLE,
  CHECKIN_NAME,
  CHECKIN_HANDLE,
} from "./ucbcmds";
const Infos = Sequence.specialize<CommandInfo>(infoType, 24);
/** Original three-command metadata component. */
export class CommandProcessorInfo
  extends WeakImplHelper.specialize(XCommandInfo)
  implements XCommandInfo
{
  private readonly m_xInfo: Sequence<CommandInfo>;
  /** Original initializer-list sequence uses void, legacy transfer and check-in argument types. @returns Component. */
  constructor() {
    super();
    const entries = [
      new CommandInfo(GETCOMMANDINFO_NAME, GETCOMMANDINFO_HANDLE, UnoType.get("void")),
      new CommandInfo(GLOBALTRANSFER_NAME, GLOBALTRANSFER_HANDLE, transferType()),
      new CommandInfo(CHECKIN_NAME, CHECKIN_HANDLE, checkinType()),
    ];
    try {
      this.m_xInfo = new Infos(
        {
          /** Original initializer-list element address. @param offset - Declared byte offset. @returns Actual compound value address. */ get(
            offset: number,
          ): unknown {
            return entries[offset / 24];
          },
        },
        entries.length,
      );
    } finally {
      for (const entry of entries) entry.dispose();
    }
  }
  /** Original sequence member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xInfo.dispose();
    super.destroy();
  }
  /** Original shared sequence return; later mutable access follows actual UNO copy-on-write. @returns Owned sequence. */
  getCommands(): Sequence<CommandInfo> {
    return new Infos(this.m_xInfo);
  }
  /** Original std::find_if traversal over const initialized command descriptors. @param predicate - Original source predicate. @returns Borrowed found fields or null. */
  private find(
    predicate: (value: CommandInfoConstReference) => boolean,
  ): CommandInfoConstReference | null {
    const fields = this.m_xInfo.getConstArray() as SequenceElements;
    for (let index = 0; index < this.m_xInfo.getLength(); ++index) {
      const value = CommandInfo.unacquired(fields.get(index * 24) as SequenceElements);
      if (predicate(value)) return value;
    }
    return null;
  }
  /** Original exact name lookup returns a copied descriptor. @param name - Borrowed name. @returns Owned descriptor. */
  getCommandInfoByName(name: OUStringConstReference): CommandInfo {
    const found = this.find(
      /** Original exact name predicate. @param value - Borrowed descriptor. @returns Match. */ (
        value,
      ) => value.Name.equals(name),
    );
    if (found) return new CommandInfo(found);
    throw new UnsupportedCommandException();
  }
  /** Original handle lookup returns a copied descriptor. @param handle - Signed32 handle. @returns Owned descriptor. */
  getCommandInfoByHandle(handle: number): CommandInfo {
    const found = this.find(
      /** Original exact handle predicate. @param value - Borrowed descriptor. @returns Match. */ (
        value,
      ) => value.Handle === handle,
    );
    if (found) return new CommandInfo(found);
    throw new UnsupportedCommandException();
  }
  /** Original exact name membership. @param name - Borrowed name. @returns Membership. */
  hasCommandByName(name: OUStringConstReference): boolean {
    return (
      this.find(
        /** Original name membership predicate. @param value - Borrowed descriptor. @returns Match. */ (
          value,
        ) => value.Name.equals(name),
      ) !== null
    );
  }
  /** Original exact handle membership. @param handle - Signed32 handle. @returns Membership. */
  hasCommandByHandle(handle: number): boolean {
    return (
      this.find(
        /** Original handle membership predicate. @param value - Borrowed descriptor. @returns Match. */ (
          value,
        ) => value.Handle === handle,
      ) !== null
    );
  }
}
