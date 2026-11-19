/** @fileoverview Actual core UCB identifier/command metadata and extended argument transport in browser main and DOM-free Worker, without a partial broker or provider. */
import { probeNativeFilterState } from "./native-filter-state-probe";
import { probeNativeMediumData } from "./native-medium-data-probe";
import { ContentIdentifier } from "../../apps/office/src/ucb/source/core/identify";
import { CommandProcessorInfo } from "../../apps/office/src/ucb/source/core/ucbcmds.info";
import { CommandInfo } from "../../apps/office/src/offapi/com/sun/star/ucb/CommandInfo";
import { cppu_detail_getUnoType as transferType } from "../../apps/office/src/offapi/com/sun/star/ucb/GlobalTransferCommandArgument";
import {
  GlobalTransferCommandArgument2,
  cppu_detail_getUnoType as extendedType,
} from "../../apps/office/src/offapi/com/sun/star/ucb/GlobalTransferCommandArgument2";
import { TransferCommandOperation } from "../../apps/office/src/offapi/com/sun/star/ucb/TransferCommandOperation";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../apps/office/src/sal/inc/rtl/ustring";
/** Uses original objects and only exports public scalar observations. @returns Contract observations. */
export function probeNativeUcbCommands(): {
  filterState: ReturnType<typeof probeNativeFilterState>;
  mediumData: ReturnType<typeof probeNativeMediumData>;
  identifier: string;
  scheme: string;
  names: string[];
  handles: number[];
  legacyTransfer: boolean;
  extendedTransport: boolean;
} {
  const owners: { dispose(): void }[] = [];
  /** Retains actual owners for reverse destruction. @param value - Actual owner. @returns Same object. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Binds source UTF16 literals. @param text - Source literal. @returns Owned RTL string. */
  function literal(text: string): OUString {
    return own(
      new OUString(
        new OUStringLiteral(
          Uint16Array.from(
            text.split("").concat("\0"),
            /** Source code unit. @param unit - Literal unit. @returns Numeric unit. */ (unit) =>
              unit.charCodeAt(0),
          ),
        ),
      ),
    );
  }
  /** Reads counted UTF16 public data. @param value - Borrowed native string. @returns Scalar observation. */
  function text(value: OUStringConstReference): string {
    let result = "";
    for (let index = 0; index < value.getLength(); ++index)
      result += String.fromCharCode(value.getStr()[index] as number);
    return result;
  }
  try {
    const identifier = own(new Reference(new ContentIdentifier(literal("relative.xlsx")))),
      schemeIdentifier = own(new Reference(new ContentIdentifier(literal("FILE:///tmp/docx")))),
      info = own(new Reference(new CommandProcessorInfo())),
      commands = own(info.operatorStar().getCommands()),
      names: string[] = [],
      handles: number[] = [];
    for (let index = 0; index < commands.getLength(); ++index) {
      const value = CommandInfo.unacquired(commands.operatorIndex(index));
      names.push(text(value.Name));
      handles.push(value.Handle);
    }
    const transfer = own(info.operatorStar().getCommandInfoByName(literal("globalTransfer"))),
      extended = own(
        new GlobalTransferCommandArgument2(
          TransferCommandOperation.COPY,
          literal("source"),
          literal("target"),
          literal("title"),
          2,
          literal("application/zip"),
          literal("document-id"),
        ),
      ),
      argument = own(new Any(extended, extendedType)),
      copy = own(new GlobalTransferCommandArgument2());
    if (!argument.extract(copy, extendedType))
      throw new Error("Native extended transfer extraction failed");
    const result = {
      filterState: probeNativeFilterState(),
      mediumData: probeNativeMediumData(),
      identifier: text(own(identifier.operatorStar().getContentIdentifier())),
      scheme: text(own(schemeIdentifier.operatorStar().getContentProviderScheme())),
      names,
      handles,
      legacyTransfer: transfer.ArgType.equals(transferType()),
      extendedTransport: copy.equals(extended),
    };
    if (
      result.identifier !== "relative.xlsx" ||
      result.scheme !== "file" ||
      names.join() !== "getCommandInfo,globalTransfer,checkin" ||
      handles.join() !== "1024,1025,1026" ||
      !result.legacyTransfer ||
      !result.extendedTransport
    )
      throw new Error("Native UCB command contract failed");
    return result;
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
