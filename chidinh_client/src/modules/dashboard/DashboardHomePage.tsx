import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";

export function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Workspace"
        title="Workspace Overview"
        description="A focused operating surface for the tools that power the personal digital hub."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-6">
          <p className="text-sm text-muted">Live Module</p>
          <h3 className="mt-3 text-xl font-display text-text">Todo</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Track current execution items and short-term delivery tasks.
          </p>
        </Panel>

        <Panel className="p-6">
          <p className="text-sm text-muted">Planned Module</p>
          <h3 className="mt-3 text-xl font-display text-text">Files</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Reserve space for asset organization and operational references.
          </p>
        </Panel>

        <Panel className="p-6">
          <p className="text-sm text-muted">Planned Module</p>
          <h3 className="mt-3 text-xl font-display text-text">Automation</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Prepare the shell for recurring workflows and assistant-driven tasks.
          </p>
        </Panel>
      </div>
    </section>
  );
}
