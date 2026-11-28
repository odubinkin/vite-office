/** @fileoverview Calc workbook cell note access and comment-person ownership. */
import type { ScDocument } from "../../../inc/document";
import type { ScAddress } from "../../../inc/address";
import { ScPostIt, type NoteEntry, type ScPersonData } from "../../../inc/postit";

/** Gets the independent cell note. @param this - Actual workbook. @param position - Cell address. @returns Borrowed note. */
export function GetNote(this: ScDocument, position: ScAddress): ScPostIt | null {
  return this.FetchTable(position.Tab())?.GetNote(position.Col(), position.Row()) ?? null;
}

/** Indicates whether the cell owns a note. @param this - Actual workbook. @param position - Cell address. @returns Whether a note exists. */
export function HasNote(this: ScDocument, position: ScAddress): boolean {
  return this.GetNote(position) !== null;
}

/** Places a note in the sheet's native column store. @param this - Actual workbook. @param position - Cell address. @param note - Owned note. @returns Nothing. */
export function SetNote(this: ScDocument, position: ScAddress, note: ScPostIt | null): void {
  const table = this.FetchTable(position.Tab());
  if (table) table.SetNote(position.Col(), position.Row(), note);
  else note?.Dispose();
}

/** Returns the existing note or creates an initially empty one. @param this - Actual workbook. @param position - Cell address. @returns Native note or null for an invalid address. */
export function GetOrCreateNote(this: ScDocument, position: ScAddress): ScPostIt | null {
  if (!this.ValidColRow(position.Col(), position.Row()) || !this.FetchTable(position.Tab()))
    return null;
  const existing = this.GetNote(position);
  if (existing) return existing;
  const note = new ScPostIt();
  this.SetNote(position, note);
  return note;
}

/** Keeps the first native document person with an authored ID. @param this - Actual workbook. @param person - Person data. @returns Nothing. */
export function AddPerson(this: ScDocument, person: ScPersonData): void {
  if (!this.GetPersonById(person.maId)) this["maPersonList"].push({ ...person });
}

/** Borrows one represented comment person by ID. @param this - Actual workbook. @param id - Original person ID. @returns Person or null. */
export function GetPersonById(this: ScDocument, id: string): ScPersonData | null {
  return (
    this["maPersonList"].find(
      /** Matches a person using the original exact ID. @param person - Candidate. @returns Whether the ID matches. */
      (person) => person.maId === id,
    ) ?? null
  );
}

/** Collects borrowed native note entries for a sheet. @param this - Actual workbook. @param tab - Sheet. @param notes - Output vector. @returns Nothing. */
export function GetAllNoteEntries(this: ScDocument, tab: number, notes: NoteEntry[]): void {
  this.FetchTable(tab)?.GetAllNoteEntries(notes);
}
