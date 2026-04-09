import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { EmptyState } from "../../shared/ui/EmptyState";
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { createJournal, deleteJournal, listJournal, updateJournal, uploadJournalImage } from "./api";
import {
  DEFAULT_JOURNAL_FORM_STATE,
  type JournalFormState,
  type JournalImageMode,
  toJournalFormState,
} from "./journalFormState";
import { JournalFieldErrors, JournalForm } from "./JournalForm";
import { JournalList } from "./JournalList";
import type { CreateJournalInput, JournalItem, UpdateJournalInput } from "./journalTypes";

const DEFAULT_FIELD_ERRORS: JournalFieldErrors = {
  title: null,
  consumedOn: null,
  imageUrl: null,
  sourceUrl: null,
};

function isValidURL(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateFormState(state: JournalFormState) {
  const nextErrors: JournalFieldErrors = { ...DEFAULT_FIELD_ERRORS };
  const title = state.title.trim();

  if (!title) {
    nextErrors.title = "Title is required";
  }

  if (!state.consumedOn) {
    nextErrors.consumedOn = "Consumed date is required";
  }

  if (state.imageMode === "url" && state.imageUrl.trim() && !isValidURL(state.imageUrl.trim())) {
    nextErrors.imageUrl = "Image URL is invalid";
  }

  if (state.sourceUrl.trim() && !isValidURL(state.sourceUrl.trim())) {
    nextErrors.sourceUrl = "Source URL is invalid";
  }

  return nextErrors;
}

function hasFieldErrors(errors: JournalFieldErrors) {
  return Object.values(errors).some(Boolean);
}

function toCreatePayload(state: JournalFormState, imageUrl: string): CreateJournalInput {
  const payload: CreateJournalInput = {
    type: state.type,
    title: state.title.trim(),
    consumedOn: state.consumedOn,
  };

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }
  if (state.sourceUrl.trim()) {
    payload.sourceUrl = state.sourceUrl.trim();
  }
  if (state.review.trim()) {
    payload.review = state.review.trim();
  }

  return payload;
}

function toUpdatePayload(state: JournalFormState, imageUrl: string): UpdateJournalInput {
  return {
    type: state.type,
    title: state.title.trim(),
    consumedOn: state.consumedOn,
    imageUrl: imageUrl || null,
    sourceUrl: state.sourceUrl.trim() || null,
    review: state.review.trim() || null,
  };
}

export function JournalPage() {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState(DEFAULT_JOURNAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState(DEFAULT_FIELD_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const journalQuery = useQuery({
    queryKey: ["journal"],
    queryFn: listJournal,
  });

  const createMutation = useMutation({
    mutationFn: createJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJournalInput }) => updateJournal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadJournalImage,
  });

  const items = journalQuery.data?.items ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setFormState(DEFAULT_JOURNAL_FORM_STATE);
    setFieldErrors(DEFAULT_FIELD_ERRORS);
    setFormError(null);
    setEditingEntryId(null);
  };

  const handleChange = (patch: Partial<JournalFormState>) => {
    setFormState((current) => ({ ...current, ...patch }));
    if (formError) {
      setFormError(null);
    }
    if (pageError) {
      setPageError(null);
    }
  };

  const handleImageModeChange = (mode: JournalImageMode) => {
    setFormState((current) => ({
      ...current,
      imageMode: mode,
      imageFile: mode === "url" ? null : current.imageFile,
    }));
    if (fieldErrors.imageUrl) {
      setFieldErrors((current) => ({ ...current, imageUrl: null }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateFormState(formState);
    setFieldErrors(nextErrors);
    setFormError(null);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    try {
      let imageUrl = formState.imageUrl.trim();
      if (formState.imageMode === "upload" && formState.imageFile) {
        const upload = await uploadMutation.mutateAsync(formState.imageFile);
        imageUrl = upload.imageUrl;
      }

      if (editingEntryId) {
        await updateMutation.mutateAsync({
          id: editingEntryId,
          payload: toUpdatePayload(formState, imageUrl),
        });
      } else {
        await createMutation.mutateAsync(toCreatePayload(formState, imageUrl));
      }

      resetForm();
    } catch {
      setFormError(editingEntryId ? "Failed to update journal entry" : "Failed to save journal entry");
    }
  };

  const handleEdit = (item: JournalItem) => {
    setEditingEntryId(item.id);
    setFieldErrors(DEFAULT_FIELD_ERRORS);
    setFormError(null);
    setPageError(null);
    setFormState(toJournalFormState(item));
  };

  const handleDelete = async (item: JournalItem) => {
    if (!window.confirm(`Delete "${item.title}" from your journal?`)) {
      return;
    }

    setDeletingEntryId(item.id);
    setPageError(null);

    try {
      await deleteMutation.mutateAsync(item.id);
      if (editingEntryId === item.id) {
        resetForm();
      }
    } catch {
      setPageError("Failed to delete journal entry");
    } finally {
      setDeletingEntryId(null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        description="Track the books, films, and videos you finish with a date, poster, link, and a short note."
        eyebrow="Journal"
        title="Watch and Read Journal"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
        <Panel className="p-5 lg:p-6" variant="featured">
          <JournalForm
            fieldErrors={fieldErrors}
            formError={formError}
            isSubmitting={isSubmitting}
            isUploading={uploadMutation.isPending}
            mode={editingEntryId ? "edit" : "create"}
            state={formState}
            onCancelEdit={resetForm}
            onChange={handleChange}
            onImageModeChange={handleImageModeChange}
            onSubmit={handleSubmit}
          />
        </Panel>

        <div className="space-y-4">
          <Panel className="flex flex-wrap items-center justify-between gap-3 p-5" variant="shell">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-foreground/65">
                Entries
              </p>
              <p className="font-display text-3xl uppercase text-foreground">{items.length} saved</p>
            </div>
            <p className="max-w-md text-sm text-foreground/75">
              Use Edit to revise notes or replace a poster. Delete removes the entry from your private log.
            </p>
          </Panel>

          {pageError ? (
            <Panel className="p-4 text-sm font-bold text-destructive" variant="default">
              {pageError}
            </Panel>
          ) : null}

          {journalQuery.isLoading ? (
            <Panel className="p-5 text-sm font-bold uppercase tracking-[0.12em] text-foreground/70" variant="default">
              Loading journal entries...
            </Panel>
          ) : null}

          {journalQuery.isError ? (
            <Panel className="p-5 text-sm font-bold text-destructive" variant="default">
              Failed to load journal entries.
            </Panel>
          ) : null}

          {!journalQuery.isLoading && !journalQuery.isError && items.length === 0 ? (
            <Panel className="p-8 lg:p-10" variant="default">
              <EmptyState
                description="Your diary is empty. Add the first book or video you want to remember."
                title="No journal entries yet"
              />
            </Panel>
          ) : null}

          {!journalQuery.isLoading && !journalQuery.isError && items.length > 0 ? (
            <JournalList
              deletingEntryId={deletingEntryId}
              editingEntryId={editingEntryId}
              items={items}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
