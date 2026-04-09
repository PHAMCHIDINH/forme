import type { JournalEntryType, JournalItem } from "./journalTypes";

export type JournalImageMode = "upload" | "url";

export type JournalFormState = {
  type: JournalEntryType;
  title: string;
  consumedOn: string;
  imageUrl: string;
  sourceUrl: string;
  review: string;
  imageMode: JournalImageMode;
  imageFile: File | null;
};

export const DEFAULT_JOURNAL_FORM_STATE: JournalFormState = {
  type: "book",
  title: "",
  consumedOn: "",
  imageUrl: "",
  sourceUrl: "",
  review: "",
  imageMode: "upload",
  imageFile: null,
};

export function toJournalFormState(item: JournalItem): JournalFormState {
  return {
    type: item.type,
    title: item.title,
    consumedOn: item.consumedOn,
    imageUrl: item.imageUrl ?? "",
    sourceUrl: item.sourceUrl ?? "",
    review: item.review ?? "",
    imageMode: "url",
    imageFile: null,
  };
}
