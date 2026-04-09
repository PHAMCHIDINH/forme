export type JournalEntryType = "book" | "video";

export type JournalItem = {
  id: string;
  type: JournalEntryType;
  title: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  review: string | null;
  consumedOn: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateJournalInput = {
  type: JournalEntryType;
  title: string;
  consumedOn: string;
  imageUrl?: string;
  sourceUrl?: string;
  review?: string;
};

export type UpdateJournalInput = {
  type?: JournalEntryType;
  title?: string;
  consumedOn?: string;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  review?: string | null;
};

export type UploadJournalImageResponse = {
  imageUrl: string;
};
