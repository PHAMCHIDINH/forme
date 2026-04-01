import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";

export function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Workspace"
        title="Private Workspace"
        description="A calmer desktop surface for live modules, operational notes, and upcoming tools."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <p className="text-sm text-muted">Live App</p>
          <h3 className="mt-3 text-xl font-semibold text-text">Todo</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Capture and complete active execution items.
          </p>
        </Panel>

        <Panel>
          <p className="text-sm text-muted">Registered</p>
          <h3 className="mt-3 text-xl font-semibold text-text">Files</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Reserved for future asset and reference storage.
          </p>
        </Panel>

        <Panel>
          <p className="text-sm text-muted">Registered</p>
          <h3 className="mt-3 text-xl font-semibold text-text">Automation</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Reserved for recurring workflows and assistant actions.
          </p>
        </Panel>
      </div>
    </section>
  );
}
