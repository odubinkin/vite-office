/** @fileoverview Original file_impl.hxx DirectoryItem_Impl path/refcount/dirent type owner; ordinary records are JS VM-managed. */
import { OString } from "../../inc/rtl/string";
import type { OStringConstReference } from "../../inc/rtl/string";
import { oslFileType } from "../../inc/osl/file";
import { directoryItemType } from "../../../external/emscripten/file";
/** Original directory item record, with source-owned OString and logical reference lifetime. */
export class DirectoryItem_Impl {
  readonly m_strFilePath: OString;
  private m_RefCount = 1;
  private readonly m_DType: number;
  /** Original value/move path and default unknown dirent type. @param path - Original native byte pathname. @param dtype - Source unsigned-byte type. @returns Item. */
  constructor(path: OStringConstReference, dtype = 0) {
    this.m_strFilePath = new OString(path);
    this.m_DType = dtype & 255;
  }
  /** Original logical acquire. @returns Nothing. */
  acquire(): void {
    ++this.m_RefCount;
  }
  /** Original logical release destroys the OString only at zero; the VM owns record memory. @returns Nothing. */
  release(): void {
    if (--this.m_RefCount === 0) this.m_strFilePath.dispose();
  }
  /** Original selected SDK dirent type switch. @returns Original file type. */
  getFileType(): oslFileType {
    return directoryItemType(this.m_DType) as oslFileType;
  }
}
