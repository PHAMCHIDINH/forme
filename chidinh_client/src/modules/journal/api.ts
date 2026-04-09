import { apiRequest } from "../../shared/api/client";
import type {
  CreateJournalInput,
  JournalItem,
  UpdateJournalInput,
  UploadJournalImageResponse,
} from "./journalTypes";

export async function listJournal() {
  return apiRequest<{ items: JournalItem[] }>("/api/v1/journal");
}

export async function createJournal(input: CreateJournalInput) {
  return apiRequest<{ item: JournalItem }>("/api/v1/journal", {
    method: "POST",
    body: input,
  });
}

export async function updateJournal(id: string, input: UpdateJournalInput) {
  return apiRequest<{ item: JournalItem }>(`/api/v1/journal/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteJournal(id: string) {
  return apiRequest<{ success: boolean }>(`/api/v1/journal/${id}`, {
    method: "DELETE",
  });
}

export async function uploadJournalImage(file: File) {
  const body = new FormData();
  body.set("file", file);

  return apiRequest<UploadJournalImageResponse>("/api/v1/uploads/images", {
    method: "POST",
    body,
  });
}
