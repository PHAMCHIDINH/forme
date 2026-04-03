import { Link } from "react-router-dom";

import { Button } from "../../shared/ui/Button";
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { portfolioData } from "./data";

export function PortfolioPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
      <Panel className="overflow-hidden border-2 p-0 shadow-[var(--shadow-crisp-lg)]">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6 bg-secondary px-6 py-8 lg:px-10 lg:py-12">
            <p className="text-sm uppercase tracking-[0.24em] text-accent">
              {portfolioData.displayName}
            </p>
            <h1 className="max-w-3xl font-display text-5xl uppercase leading-tight tracking-[0.08em] text-text">
              Personal Digital Hub
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">{portfolioData.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/#systems">Explore Systems</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/login">Enter Workspace</Link>
              </Button>
            </div>
          </div>

          <div className="flex h-full flex-col justify-between bg-accent px-6 py-8 lg:px-8 lg:py-12">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-text">Role</p>
              <p className="mt-3 text-2xl font-display text-text">{portfolioData.title}</p>
              <p className="mt-4 text-sm leading-7 text-text/80">
                Building integrated digital systems with modular interfaces, stable APIs, and
                production-ready workflows.
              </p>
            </div>
            <div className="mt-8 border-t-2 border-text pt-6">
              <p className="text-xs uppercase tracking-[0.24em] text-text/80">Mode</p>
              <p className="mt-3 text-lg text-text">Poster framing for the public operating surface.</p>
            </div>
          </div>
        </div>
      </Panel>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Framework"
          title="Operating Principles"
          description="A calm system only scales when the boundaries, rituals, and interfaces stay clear."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {portfolioData.principles.map((principle) => (
            <Panel className="p-6" key={principle.title}>
              <h3 className="font-display text-2xl text-text">{principle.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{principle.description}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section id="systems" className="space-y-6">
        <SectionHeading
          eyebrow="Portfolio"
          title="Selected Systems"
          description="Project highlights framed as operational systems instead of static case studies."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {portfolioData.projects.map((project) => (
            <Panel className="p-6" key={project.name}>
              <p className="text-xs uppercase tracking-[0.24em] text-accent">{project.domain}</p>
              <h3 className="mt-3 font-display text-2xl text-text">{project.name}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{project.summary}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Hub"
          title="Live Capabilities"
          description="Current and near-future modules that define the product as a living digital workspace."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {portfolioData.capabilities.map((capability) => (
            <Panel className="p-5" key={capability.name}>
              <p className="text-sm text-muted">{capability.status}</p>
              <p className="mt-3 text-lg text-text">{capability.name}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Architecture"
          title="Architecture Signal"
          description="A focused view into the technical decisions that shape the system."
        />
        <div className="flex flex-wrap gap-3">
          {portfolioData.architectureSignals.map((signal) => (
            <Panel className="px-4 py-3" key={signal}>
              <p className="text-sm text-text">{signal}</p>
            </Panel>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-4 border-t border-border py-6 text-sm text-muted">
        <a href={portfolioData.githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={`mailto:${portfolioData.contactEmail}`}>Contact</a>
      </footer>
    </main>
  );
}
