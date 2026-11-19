/** @fileoverview Original fileaccess ReconnectingFile over actual OSL File; retry predicates, remembered flags and disconnect/cursor rules are retained. */
import { File, FileBase } from "../../../../sal/inc/osl/file.hxx";
import {
  osl_File_OpenFlag_Create as CREATE,
  osl_File_OpenFlag_Write as WRITE,
  osl_File_OpenFlag_Read as READ,
  osl_Pos_Absolut as ABS,
} from "../../../../sal/inc/osl/file";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ByteElements } from "../../../../sal/inc/rtl/byteseq.h";
/** Original noncopyable reconnecting file owner. */
export class ReconnectingFile {
  private readonly m_aFile: File;
  private m_nFlags = 0;
  private m_bFlagsSet = false;
  private m_bDisconnect = false;
  /** Original URL constructor. @param url - Borrowed file URL. @returns Owner. */
  constructor(url: OUStringConstReference) {
    this.m_aFile = new File(url);
  }
  /** Original destructor closes before destroying the File member. @returns Nothing. */
  dispose(): void {
    this.close();
    this.m_aFile.dispose();
  }
  /** Original disconnect retains successful-open flags. @returns Nothing. */
  disconnect(): void {
    this.m_aFile.close();
    this.m_bDisconnect = true;
  }
  /** Original reopening tries remembered flags then read-only, without restoring the cursor. @returns Success. */
  reconnect(): boolean {
    let result = false;
    if (this.m_bFlagsSet) {
      this.disconnect();
      if (
        this.m_aFile.open(this.m_nFlags) === FileBase.E_None ||
        this.m_aFile.open(READ) === FileBase.E_None
      ) {
        this.m_bDisconnect = false;
        result = true;
      }
    }
    return result;
  }
  /** Original successful open remembers CREATE as WRITE for retries. @param flags - Original open flags. @returns OSL status. */
  open(flags: number) {
    const result = this.m_aFile.open(flags);
    if (result === FileBase.E_None) {
      this.m_nFlags = flags & CREATE ? (flags & ~CREATE) | WRITE : flags;
      this.m_bFlagsSet = true;
    }
    return result;
  }
  /** Original close resets retry state before closing. @returns OSL status. */
  close() {
    this.m_nFlags = 0;
    this.m_bFlagsSet = false;
    this.m_bDisconnect = false;
    return this.m_aFile.close();
  }
  /** Original positive absolute seeks alone permit reconnection. @param how - Seek origin. @param position - Signed offset. @returns OSL status. */
  setPos(how: number, position: bigint) {
    let result = FileBase.E_NETWORK;
    if (how === ABS && position > 0n) {
      if (this.m_bDisconnect) {
        if (this.reconnect()) result = this.m_aFile.setPos(how, position);
      } else {
        result = this.m_aFile.setPos(how, position);
        if ((result === FileBase.E_NETWORK || result === FileBase.E_INVAL) && this.reconnect())
          result = this.m_aFile.setPos(how, position);
      }
    } else if (!this.m_bDisconnect) result = this.m_aFile.setPos(how, position);
    return result;
  }
  /** Original disconnected position query does not reopen. @param position - Output reference. @returns OSL status. */
  getPos(position: [bigint]) {
    return this.m_bDisconnect ? FileBase.E_NETWORK : this.m_aFile.getPos(position);
  }
  /** Original zero-length truncate alone permits reconnection. @param size - Unsigned length. @returns OSL status. */
  setSize(size: bigint) {
    let result = FileBase.E_NETWORK;
    if (size === 0n) {
      if (this.m_bDisconnect) {
        if (this.reconnect()) result = this.m_aFile.setSize(size);
      } else {
        result = this.m_aFile.setSize(size);
        if ((result === FileBase.E_NETWORK || result === FileBase.E_INVAL) && this.reconnect())
          result = this.m_aFile.setSize(size);
      }
    } else if (!this.m_bDisconnect) result = this.m_aFile.setSize(size);
    return result;
  }
  /** Original size repair retrieves the length then disconnects because the cursor was lost. @param size - Output reference. @returns OSL status. */
  getSize(size: [bigint]) {
    let result = FileBase.E_NETWORK;
    if (!this.m_bDisconnect) result = this.m_aFile.getSize(size);
    if ((result === FileBase.E_NETWORK || result === FileBase.E_INVAL) && this.reconnect()) {
      result = this.m_aFile.getSize(size);
      this.disconnect();
    }
    return result;
  }
  /** Original disconnected read preserves the caller output. @param buffer - Byte destination. @param count - Unsigned count. @param read - Output count. @returns OSL status. */
  read(buffer: ByteElements | null, count: bigint, read: [bigint]) {
    return this.m_bDisconnect ? FileBase.E_NETWORK : this.m_aFile.read(buffer, count, read);
  }
  /** Original disconnected write preserves the caller output. @param buffer - Source bytes. @param count - Unsigned count. @param written - Output count. @returns OSL status. */
  write(buffer: ByteElements | null, count: bigint, written: [bigint]) {
    return this.m_bDisconnect ? FileBase.E_NETWORK : this.m_aFile.write(buffer, count, written);
  }
  /** Original disconnected synchronization never reopens. @returns OSL status. */
  sync() {
    return this.m_bDisconnect ? FileBase.E_NETWORK : this.m_aFile.sync();
  }
}
