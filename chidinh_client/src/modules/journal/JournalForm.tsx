import type { FormEvent } from "react";

import { getFieldShellClassName } from "../../shared/form-system/primitives/InputShell";
import { Button } from "../../shared/ui/Button";
import { Field, FieldLabel, FieldMessage } from "../../shared/ui/Field";
import { Input } from "../../shared/ui/Input";
import type { JournalFormState, JournalImageMode } from "./journalFormState";

export type JournalFieldErrors = {
  title: string | null;
  consumedOn: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
};

type Props = {
  mode: "create" | "edit";
  state: JournalFormState;
  fieldErrors: JournalFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  isUploading: boolean;
  onChange: (patch: Partial<JournalFormState>) => void;
  onImageModeChange: (mode: JournalImageMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
};

const selectClassName = getFieldShellClassName("appearance-none");
const textAreaClassName = getFieldShellClassName("min-h-32 resize-y");

export function JournalForm({
  mode,
  state,
  fieldErrors,
  formError,
  isSubmitting,
  isUploading,
  onChange,
  onImageModeChange,
  onSubmit,
  onCancelEdit,
}: Props) {
  const isBusy = isSubmitting || isUploading;

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-display text-3xl uppercase text-foreground">
            {mode === "edit" ? "Edit Entry" : "New Entry"}
          </h3>
          <p className="max-w-xl text-sm text-foreground/75">
            Luu lai sach, phim, video, hoac bat ky thu ban vua xem voi poster, link, va nhan xet ngan.
          </p>
        </div>

        {mode === "edit" ? (
          <Button onClick={onCancelEdit} size="sm" type="button" variant="ghost">
            Cancel Edit
          </Button>
        ) : null}
      </div>

      <fieldset className="grid gap-4 md:grid-cols-2" disabled={isBusy}>
        <Field>
          <FieldLabel htmlFor="journal-type">Type</FieldLabel>
          <select
            className={selectClassName}
            id="journal-type"
            value={state.type}
            onChange={(event) => onChange({ type: event.target.value as JournalFormState["type"] })}
          >
            <option value="book">Book</option>
            <option value="video">Video</option>
          </select>
        </Field>

        <Field>
          <FieldLabel htmlFor="journal-consumed-on">Consumed date</FieldLabel>
          <Input
            aria-invalid={fieldErrors.consumedOn ? "true" : "false"}
            id="journal-consumed-on"
            name="consumedOn"
            type="date"
            value={state.consumedOn}
            onChange={(event) => onChange({ consumedOn: event.target.value })}
          />
          {fieldErrors.consumedOn ? <FieldMessage tone="error">{fieldErrors.consumedOn}</FieldMessage> : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="journal-title">Title</FieldLabel>
          <Input
            aria-invalid={fieldErrors.title ? "true" : "false"}
            id="journal-title"
            name="title"
            placeholder="Ten sach, phim, hoac video"
            value={state.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
          {fieldErrors.title ? <FieldMessage tone="error">{fieldErrors.title}</FieldMessage> : null}
        </Field>

        <Field className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FieldLabel htmlFor={state.imageMode === "url" ? "journal-image-url" : "journal-image-file"}>
              Poster or cover
            </FieldLabel>
            <div className="flex gap-2">
              <Button
                selected={state.imageMode === "upload"}
                size="sm"
                type="button"
                variant="scope"
                onClick={() => onImageModeChange("upload")}
              >
                Upload File
              </Button>
              <Button
                selected={state.imageMode === "url"}
                size="sm"
                type="button"
                variant="scope"
                onClick={() => onImageModeChange("url")}
              >
                Paste URL
              </Button>
            </div>
          </div>

          {state.imageMode === "url" ? (
            <>
              <Input
                aria-invalid={fieldErrors.imageUrl ? "true" : "false"}
                id="journal-image-url"
                inputMode="url"
                name="imageUrl"
                placeholder="https://example.com/cover.jpg"
                value={state.imageUrl}
                onChange={(event) => onChange({ imageUrl: event.target.value, imageFile: null })}
              />
              {fieldErrors.imageUrl ? <FieldMessage tone="error">{fieldErrors.imageUrl}</FieldMessage> : null}
            </>
          ) : (
            <div className="space-y-2">
              <input
                className={selectClassName}
                id="journal-image-file"
                accept="image/*"
                type="file"
                onChange={(event) =>
                  onChange({
                    imageFile: event.target.files?.[0] ?? null,
                  })
                }
              />
              <FieldMessage>
                {state.imageFile
                  ? `Selected file: ${state.imageFile.name}`
                  : "Chon anh poster/cover tu may cua ban."}
              </FieldMessage>
            </div>
          )}

          {state.imageUrl ? (
            <div className="space-y-3 rounded-[var(--radius-md)] border-2 border-dashed border-border bg-secondary p-3">
              <img
                alt={state.title ? `Poster preview for ${state.title}` : "Poster preview"}
                className="h-40 w-28 rounded-[var(--radius-sm)] border-2 border-border object-cover shadow-[var(--shadow-crisp-sm)]"
                src={state.imageUrl}
              />
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onChange({ imageFile: null, imageUrl: "" })}
              >
                Remove Poster
              </Button>
            </div>
          ) : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="journal-source-url">Source link</FieldLabel>
          <Input
            aria-invalid={fieldErrors.sourceUrl ? "true" : "false"}
            id="journal-source-url"
            inputMode="url"
            name="sourceUrl"
            placeholder="https://youtube.com/... or https://book-link.example"
            value={state.sourceUrl}
            onChange={(event) => onChange({ sourceUrl: event.target.value })}
          />
          {fieldErrors.sourceUrl ? <FieldMessage tone="error">{fieldErrors.sourceUrl}</FieldMessage> : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="journal-review">Review</FieldLabel>
          <textarea
            className={textAreaClassName}
            id="journal-review"
            name="review"
            placeholder="Ban thay no the nao?"
            value={state.review}
            onChange={(event) => onChange({ review: event.target.value })}
          />
        </Field>
      </fieldset>

      {isUploading ? <FieldMessage>Uploading image...</FieldMessage> : null}
      {formError ? <FieldMessage tone="error">{formError}</FieldMessage> : null}

      <div className="flex flex-wrap gap-3">
        <Button pending={isBusy} type="submit">
          {mode === "edit" ? "Update Entry" : "Save Entry"}
        </Button>
        <Button size="sm" type="button" variant="secondary" onClick={onCancelEdit}>
          Clear Form
        </Button>
      </div>
    </form>
  );
}
