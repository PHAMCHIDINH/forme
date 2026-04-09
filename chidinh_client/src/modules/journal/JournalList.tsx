import { Button } from "../../shared/ui/Button";
import { Panel } from "../../shared/ui/Panel";
import type { JournalItem } from "./journalTypes";

type Props = {
  items: JournalItem[];
  editingEntryId: string | null;
  deletingEntryId: string | null;
  onEdit: (item: JournalItem) => void;
  onDelete: (item: JournalItem) => void;
};

function typeLabel(type: JournalItem["type"]) {
  return type === "book" ? "Book" : "Video";
}

export function JournalList({ items, editingEntryId, deletingEntryId, onEdit, onDelete }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <Panel
          className="overflow-hidden"
          key={item.id}
          variant={editingEntryId === item.id ? "featured" : "default"}
        >
          <div className="grid gap-4 p-4 md:grid-cols-[120px_minmax(0,1fr)] md:p-5">
            <div className="flex min-h-44 items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-border bg-secondary p-2">
              {item.imageUrl ? (
                <img
                  alt={`Cover for ${item.title}`}
                  className="h-40 w-28 rounded-[var(--radius-sm)] border-2 border-border object-cover shadow-[var(--shadow-crisp-sm)]"
                  src={item.imageUrl}
                />
              ) : (
                <div className="text-center text-xs font-black uppercase tracking-[0.16em] text-foreground/55">
                  No poster
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block border-2 border-border bg-accent px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-accent-foreground shadow-[var(--shadow-crisp-sm)]">
                    {typeLabel(item.type)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/65">
                    {item.consumedOn}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-3xl uppercase leading-none text-foreground">{item.title}</h3>
                  {item.sourceUrl ? (
                    <a
                      className="mt-2 inline-block text-sm font-bold text-foreground underline decoration-2 underline-offset-4"
                      href={item.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open source link
                    </a>
                  ) : null}
                </div>

                {item.review ? (
                  <p className="rounded-[var(--radius-md)] border-2 border-border bg-secondary p-3 text-sm leading-7 text-foreground/85">
                    {item.review}
                  </p>
                ) : (
                  <p className="text-sm text-foreground/60">No review yet.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" type="button" variant="secondary" onClick={() => onEdit(item)}>
                  Edit
                </Button>
                <Button
                  disabled={deletingEntryId === item.id}
                  pending={deletingEntryId === item.id}
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(item)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
