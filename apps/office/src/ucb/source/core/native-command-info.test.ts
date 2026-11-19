/** @fileoverview Actual core UCB identifier and command-info owners plus generated command-argument Any/Sequence transport, source defaults and inherited lvalue contracts. */
import { afterEach, expect, it } from "vitest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import { TypeDescription } from "../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_CompoundTypeDescription as Compound } from "../../../cppu/inc/typelib/typedescription";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XContentIdentifier } from "../../../offapi/com/sun/star/ucb/XContentIdentifier";
import {
  initializeExceptionAbi,
  withCaughtException,
} from "../../../cppuhelper/browser/exception-abi";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import {
  XCommandInfo,
  getCppuType as commandInfoInterfaceType,
} from "../../../offapi/com/sun/star/ucb/XCommandInfo";
import {
  UnsupportedCommandException,
  getCppuType as unsupportedType,
} from "../../../offapi/com/sun/star/ucb/UnsupportedCommandException";
import {
  CommandInfo,
  cppu_detail_getUnoType as infoType,
  getCppuType as infoCppuType,
} from "../../../offapi/com/sun/star/ucb/CommandInfo";
import {
  GlobalTransferCommandArgument as Transfer,
  cppu_detail_getUnoType as transferType,
  getCppuType as transferCppuType,
} from "../../../offapi/com/sun/star/ucb/GlobalTransferCommandArgument";
import {
  GlobalTransferCommandArgument2 as Transfer2,
  cppu_detail_getUnoType as transfer2Type,
  getCppuType as transfer2CppuType,
} from "../../../offapi/com/sun/star/ucb/GlobalTransferCommandArgument2";
import {
  CheckinArgument as Checkin,
  cppu_detail_getUnoType as checkinType,
  getCppuType as checkinCppuType,
} from "../../../offapi/com/sun/star/ucb/CheckinArgument";
import {
  TransferCommandOperation as Operation,
  cppu_detail_getUnoType_TransferCommandOperation as operationType,
} from "../../../offapi/com/sun/star/ucb/TransferCommandOperation";
import { ContentIdentifier } from "./identify";
import { CommandProcessorInfo } from "./ucbcmds.info";
import { GETCOMMANDINFO_HANDLE, GLOBALTRANSFER_HANDLE, CHECKIN_HANDLE } from "./ucbcmds";
afterEach(releaseDomScope);
it.each([
  ["FILE:///tmp/a.docx", "file"],
  ["relative.xlsx", ""],
  ["", ""],
  [":part", ""],
  ["vnd.Office:a:b", "vnd.office"],
  ["ÄBC:東京/é", "Äbc"],
  ["a\0b:part", "a\0b"],
])(
  "retains original core identifier %s",
  /** Core identifiers preserve colonless text and fold scheme ASCII only. @param identifier - Source text. @param scheme - Expected cached scheme. @returns Nothing. */ (
    identifier,
    scheme,
  ) => {
    const text = u(identifier),
      owner = own(new Reference(new ContentIdentifier(text))),
      facet = own(
        new Reference<XContentIdentifier>(owner, UNO_QUERY_THROW, XContentIdentifier.static_type),
      );
    text.assign(u("mutated"));
    expect(read(facet.operatorStar().getContentIdentifier())).toBe(identifier);
    expect(read(facet.operatorStar().getContentProviderScheme())).toBe(scheme);
    expect(read(facet.operatorStar().getContentProviderScheme())).toBe(scheme);
  },
);
it("returns independent strings surviving actual identifier destruction", /** Actual weak lifetime observes the component without owning its memory. @returns Nothing. */ () => {
  const owner = own(new Reference(new ContentIdentifier(u("FILE:///a")))),
    weak = own(new WeakReferenceHelper(owner)),
    id = own(owner.operatorStar().getContentIdentifier()),
    scheme = own(owner.operatorStar().getContentProviderScheme());
  id.assign(u("different"));
  scheme.assign(u("other"));
  expect(read(owner.operatorStar().getContentIdentifier())).toBe("FILE:///a");
  expect(read(owner.operatorStar().getContentProviderScheme())).toBe("file");
  owner.clear();
  expect(own(weak.get()).is()).toBe(false);
  expect(id.equals(u("different"))).toBe(true);
  expect(scheme.equals(u("other"))).toBe(true);
});
it("preserves all original command descriptors, exact lookups and unsupported-command errors", /** The metadata component does not execute or fabricate command results. @returns Nothing. */ () => {
  const owner = own(new Reference(new CommandProcessorInfo())),
    info = own(new Reference<XCommandInfo>(owner, UNO_QUERY_THROW, XCommandInfo.static_type)),
    commands = own(info.operatorStar().getCommands());
  expect(commands.getLength()).toBe(3);
  const shared = own(info.operatorStar().getCommands());
  expect(commands.get()).toBe(shared.get());
  const names = ["getCommandInfo", "globalTransfer", "checkin"],
    handles = [GETCOMMANDINFO_HANDLE, GLOBALTRANSFER_HANDLE, CHECKIN_HANDLE],
    types = [UnoType.get("void"), transferType(), checkinType()];
  for (let index = 0; index < 3; ++index) {
    const fields = CommandInfo.unacquired(commands.operatorIndex(index)),
      byName = own(info.operatorStar().getCommandInfoByName(u(names[index] as string))),
      byHandle = own(info.operatorStar().getCommandInfoByHandle(handles[index] as number));
    expect(fields.Name.equals(u(names[index] as string))).toBe(true);
    expect(fields.Handle).toBe(handles[index]);
    expect(fields.ArgType.equals(types[index] as Type)).toBe(true);
    expect(byName.equals(byHandle)).toBe(true);
    expect(info.operatorStar().hasCommandByName(u(names[index] as string))).toBe(true);
    expect(info.operatorStar().hasCommandByHandle(handles[index] as number)).toBe(true);
  }
  expect(info.operatorStar().hasCommandByName(u("GetCommandInfo"))).toBe(false);
  expect(info.operatorStar().hasCommandByName(u("missing"))).toBe(false);
  expect(info.operatorStar().hasCommandByHandle(-1)).toBe(false);
  for (const call of [
    /** Original missing name. @returns Owned result or actual exception. */ () =>
      info.operatorStar().getCommandInfoByName(u("missing")),
    /** Original missing handle. @returns Owned result or actual exception. */ () =>
      info.operatorStar().getCommandInfoByHandle(-1),
  ]) {
    let caught = false;
    try {
      own(call());
    } catch (error) {
      if (!(error instanceof UnsupportedCommandException)) throw error;
      try {
        expect(error.Message.isEmpty()).toBe(true);
        expect(error.Context.is()).toBe(false);
        caught = true;
      } finally {
        error.dispose();
      }
    }
    expect(caught).toBe(true);
  }
  const copy = own(info.operatorStar().getCommandInfoByName(u("globalTransfer")));
  copy.Name.assign(u("changed"));
  copy.Handle = -7;
  copy.ArgType = UnoType.get("void");
  expect(
    read(own(info.operatorStar().getCommandInfoByHandle(GLOBALTRANSFER_HANDLE)).Name.copy(0)),
  ).toBe("globalTransfer");
  const detached = CommandInfo.unacquired(
    (commands.getArray() as SequenceElements).get(0) as SequenceElements,
  );
  (detached.Name as OUString).assign(u("local"));
  (commands.operatorIndex(0).get(8) as [number])[0] = 999;
  expect(info.operatorStar().hasCommandByName(u("getCommandInfo"))).toBe(true);
  expect(own(info.operatorStar().getCommands()).getLength()).toBe(3);
  expect(infoCppuType().equals(infoType())).toBe(true);
  expect(unsupportedType().getTypeLibType()).not.toBeNull();
});
it("preserves generated CommandInfo defaults, copy and actual type fields", /** Type values are owned fields, not borrowed cached types. @returns Nothing. */ () => {
  const initial = own(new CommandInfo());
  expect(initial.Name.isEmpty()).toBe(true);
  expect(initial.Handle).toBe(0);
  expect(initial.ArgType.equals(UnoType.get("void"))).toBe(true);
  const value = own(new CommandInfo(u("x"), 2147483648, checkinType())),
    copy = own(new CommandInfo(value));
  expect(value.Handle).toBe(-2147483648);
  expect(value.equals(copy)).toBe(true);
  expect(value.notEquals(copy)).toBe(false);
  copy.Name = u("y");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.Handle = 42;
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.ArgType = UnoType.get("void");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(copy);
  const any = own(new Any(value, infoType)),
    result = own(new CommandInfo());
  expect(any.extract(result, infoType)).toBe(true);
  expect(result.equals(value)).toBe(true);
  const borrowed = CommandInfo.unacquired(result);
  expect(borrowed.ArgType.equals(checkinType())).toBe(true);
});
it("preserves full transfer defaults and all-member transport including extended fields", /** Base and derived source IDL declarations retain independent field values. @returns Nothing. */ () => {
  const base = own(new Transfer());
  expect(base.Operation).toBe(Operation.COPY);
  expect(base.NameClash).toBe(0);
  for (const text of [base.SourceURL, base.TargetURL, base.NewTitle])
    expect(text.isEmpty()).toBe(true);
  const value = own(
      new Transfer(
        Operation.MOVE,
        u("file:///source"),
        u("file:///target"),
        u("renamed"),
        2147483648,
      ),
    ),
    copy = own(new Transfer(value));
  expect(value.NameClash).toBe(-2147483648);
  expect(value.equals(copy)).toBe(true);
  expect(value.notEquals(copy)).toBe(false);
  copy.Operation = Operation.LINK;
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.SourceURL = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.TargetURL = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.NewTitle = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.NameClash = 8;
  expect(value.notEquals(copy)).toBe(true);
  const extended = own(
      new Transfer2(
        Operation.MOVE,
        u("source"),
        u("target"),
        u("title"),
        2,
        u("application/xml"),
        u("id"),
      ),
    ),
    derivedCopy = own(new Transfer2(extended));
  expect(extended.equals(derivedCopy)).toBe(true);
  expect(extended.notEquals(derivedCopy)).toBe(false);
  derivedCopy.MimeType = u("text/plain");
  expect(extended.notEquals(derivedCopy)).toBe(true);
  derivedCopy.assign(extended);
  derivedCopy.DocumentId = u("other");
  expect(extended.notEquals(derivedCopy)).toBe(true);
  derivedCopy.assign(extended);
  const empty = own(new Transfer2());
  expect(empty.MimeType.isEmpty()).toBe(true);
  expect(empty.DocumentId.isEmpty()).toBe(true);
  const any = own(new Any(extended, transfer2Type)),
    result = own(new Transfer2());
  expect(any.extract(result, transfer2Type)).toBe(true);
  expect(result.equals(extended)).toBe(true);
  const inherited = own(new Transfer());
  expect(any.extract(inherited, transferType)).toBe(true);
  expect(inherited.SourceURL.equals(extended.SourceURL)).toBe(true);
  const live = Transfer2.unacquired(extended);
  extended.Operation = Operation.LINK;
  extended.NameClash = 9;
  expect(live.Operation).toBe(Operation.LINK);
  extended.SourceURL.assign(u("new-source"));
  extended.TargetURL.assign(u("new-target"));
  extended.NewTitle.assign(u("new-title"));
  expect(live.SourceURL.equals(u("new-source"))).toBe(true);
  expect(live.TargetURL.equals(u("new-target"))).toBe(true);
  expect(live.NewTitle.equals(u("new-title"))).toBe(true);
  expect(live.NameClash).toBe(9);
  expect(live.MimeType.equals(extended.MimeType)).toBe(true);
  expect(live.DocumentId.equals(extended.DocumentId)).toBe(true);
  const nativeBase = own(new Transfer(extended));
  expect(Transfer.prototype.notEquals.call(extended, nativeBase)).toBe(false);
  expect(transferCppuType().equals(transferType())).toBe(true);
  expect(transfer2CppuType().equals(transfer2Type())).toBe(true);
  expect(operationType().getTypeLibType()).not.toBeNull();
});
it("preserves check-in defaults, all members and boolean Any/Sequence transport", /** The source major-version flag defaults to false. @returns Nothing. */ () => {
  const empty = own(new Checkin());
  expect(empty.MajorVersion).toBe(false);
  for (const field of [
    empty.VersionComment,
    empty.SourceURL,
    empty.TargetURL,
    empty.NewTitle,
    empty.MimeType,
  ])
    expect(field.isEmpty()).toBe(true);
  const value = own(
      new Checkin(true, u("version"), u("source"), u("target"), u("title"), u("mime")),
    ),
    copy = own(new Checkin(value));
  expect(value.equals(copy)).toBe(true);
  expect(value.notEquals(copy)).toBe(false);
  copy.MajorVersion = false;
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.VersionComment = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.SourceURL = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.TargetURL = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.NewTitle = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.MimeType = u("other");
  expect(value.notEquals(copy)).toBe(true);
  copy.assign(value);
  copy.assign(copy);
  const any = own(new Any(value, checkinType)),
    result = own(new Checkin());
  expect(any.extract(result, checkinType)).toBe(true);
  expect(result.equals(value)).toBe(true);
  const Checks = Sequence.specialize<Checkin>(checkinType, 48),
    seq = own(
      new Checks(
        {
          /** Real initializer-list address. @param offset - Declared element offset. @returns Existing compound. */ get(
            offset: number,
          ): unknown {
            expect(offset).toBe(0);
            return value;
          },
        },
        1,
      ),
    ),
    fields = Checkin.unacquired(seq.operatorIndex(0));
  expect(fields.MajorVersion).toBe(true);
  expect(fields.VersionComment.equals(value.VersionComment)).toBe(true);
  expect(fields.SourceURL.equals(value.SourceURL)).toBe(true);
  expect(fields.TargetURL.equals(value.TargetURL)).toBe(true);
  expect(fields.NewTitle.equals(value.NewTitle)).toBe(true);
  expect(fields.MimeType.equals(value.MimeType)).toBe(true);
  expect(checkinCppuType().equals(checkinType())).toBe(true);
});
it("keeps original logical compound metadata sizes and derived base order", /** This checks the selected VM logical ABI, not native physical pointer layout. @returns Nothing. */ () => {
  for (const [getter, size] of [
    [infoType, 24],
    [transferType, 40],
    [transfer2Type, 56],
    [checkinType, 48],
  ] as const) {
    const description = own(new TypeDescription(getter()));
    description.makeComplete();
    expect(description.get()?.nSize).toBe(size);
  }
  const description = own(new TypeDescription(transfer2Type()));
  description.makeComplete();
  const compound = description.get() as unknown as Compound;
  expect(compound.pBaseTypeDescription).not.toBeNull();
  expect(compound.pBaseTypeDescription?.aBase.pWeakRef).toBe(transferType().getTypeLibType());
  expect(Array.from(compound.pMemberOffsets as Int32Array)).toEqual([40, 48]);
  expect(compound.nMembers).toBe(2);
});

it("retains actual unsupported-command exception copy and caught-Any transport", /** Normal generated constructors and ABI linkage carry source message/context. @returns Completion. */ async () => {
  await initializeExceptionAbi();
  const owner = own(new Reference(new ContentIdentifier(u("file:///context")))),
    message = u("unsupported"),
    error = own(new UnsupportedCommandException(message, owner)),
    copy = own(new UnsupportedCommandException(error));
  expect(copy.Message.equals(message)).toBe(true);
  expect(copy.Context.operatorEquals(owner)).toBe(true);
  /** Models the actual JavaScript catch boundary for native caught-exception transport. @returns Owned native Any. */
  function caughtAny(): Any {
    try {
      throw error;
    } catch (caught) {
      if (!(caught instanceof UnsupportedCommandException)) throw caught;
      return withCaughtException(caught, getCaughtException);
    }
  }
  const direct = own(new Any(error, unsupportedType)),
    directResult = own(new UnsupportedCommandException());
  expect(direct.extract(directResult, unsupportedType)).toBe(true);
  expect(directResult.Message.equals(message)).toBe(true);
  const payload = own(caughtAny()),
    result = own(new UnsupportedCommandException());
  expect(payload.extract(result, unsupportedType)).toBe(true);
  expect(result.Message.equals(message)).toBe(true);
  expect(result.Context.operatorEquals(owner)).toBe(true);
  const moving = own(new UnsupportedCommandException(error)),
    moved = own(UnsupportedCommandException.move(moving));
  expect(moved).toBeInstanceOf(UnsupportedCommandException);
  expect(moved.Message.equals(message)).toBe(true);
  expect(moved.Context.operatorEquals(owner)).toBe(true);
  expect(commandInfoInterfaceType(null).equals(XCommandInfo.static_type())).toBe(true);
});
