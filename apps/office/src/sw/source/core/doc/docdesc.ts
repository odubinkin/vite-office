/** @fileoverview Native document page-collection operations from docdesc.cxx; existing browser geometry ingress remains an explicit boundary. */
import type { SwDoc } from "./doc";
import {
  SwPageDesc,
  createDefaultWriterPageDescriptor,
  equalWriterPageDescriptors,
  type WriterPageDescriptorValue,
} from "../layout/pagedesc";
/** Creates a named descriptor, optionally copying supported geometry. @param document - Owning document. @param pageDescs - Actual document collection. @param name - Unique page-style name. @param source - Optional source descriptor. @returns New document-owned descriptor. */
export function MakePageDesc(
  document: SwDoc,
  pageDescs: SwPageDesc[],
  name: string,
  source?: SwPageDesc,
): SwPageDesc {
  if (document.FindPageDesc(name) !== undefined)
    throw new Error(`Writer page descriptor exists: ${name}`);
  const descriptor =
    source?.Clone() ?? createDefaultWriterPageDescriptor(document.GetLocale(), document, name);
  descriptor.SetName(name);
  pageDescs.push(descriptor);
  document.NotifyModelChange({ kind: "page-descriptor-changed" });
  return descriptor;
}

/** Deletes a non-default descriptor and restores incoming follow links to self-follow. @param document - Owning document. @param pageDescs - Actual document collection. @param descriptor - Name or position. @returns Whether deleted. */
export function DelPageDesc(
  document: SwDoc,
  pageDescs: SwPageDesc[],
  descriptor: number | string,
): boolean {
  const index =
    typeof descriptor === "number"
      ? descriptor
      : pageDescs.findIndex(
          /** Finds a page style by name. @param item - Candidate page style. @returns Whether names match. */ (
            item,
          ) => item.GetName() === descriptor,
        );
  if (index <= 0 || index >= pageDescs.length) return false;
  const removed = pageDescs[index] as SwPageDesc;
  for (const item of pageDescs) if (item.GetFollow() === removed) item.SetFollow(null);
  pageDescs.splice(index, 1);
  removed.DisposeModify();
  document.NotifyModelChange({ kind: "page-descriptor-changed" });
  return true;
}

/** Replaces supported geometry at an existing descriptor identity and publishes one model hint. @param document - Owning document. @param value - Page geometry. @param target - Name or position. @returns Whether it changed. */
export function ChgPageDesc(
  document: SwDoc,
  value: WriterPageDescriptorValue,
  target: number | string,
): boolean {
  const descriptor =
    typeof target === "number" ? document.GetPageDesc(target) : document.FindPageDesc(target);
  if (descriptor === undefined) return false;
  if (value.name !== descriptor.GetName())
    throw new Error("Writer page descriptor replacement must preserve its identity.");
  const before = descriptor.GetValue();
  if (equalWriterPageDescriptors(before, value)) return false;
  descriptor.SetValue(value);
  document.NotifyModelChange({ kind: "page-descriptor-changed" });
  return true;
}
