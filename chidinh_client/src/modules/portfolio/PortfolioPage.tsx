import { Button } from "../../shared/ui/Button";
import { DockNav } from "../../shared/ui/DockNav";
import { Panel } from "../../shared/ui/Panel";
import { SystemBar } from "../../shared/ui/SystemBar";
import { WindowFrame } from "../../shared/ui/WindowFrame";
import { portfolioData } from "./data";

export function PortfolioPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-4 lg:px-6 lg:py-6">
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Public Desktop"
        indicators={portfolioData.desktopIndicators}
      />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <WindowFrame
          title={portfolioData.windows.identity.title}
          subtitle={portfolioData.windows.identity.subtitle}
          className="lg:translate-y-2"
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">
              {portfolioData.displayName}
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-text">
              Personal Digital Hub
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">{portfolioData.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button to="/#archive">Mở Kho Lưu Trữ</Button>
              <Button to="/login" variant="secondary">
                Truy Cập Workspace
              </Button>
            </div>
          </div>
        </WindowFrame>

        <WindowFrame
          title={portfolioData.windows.registry.title}
          subtitle={portfolioData.windows.registry.subtitle}
          className="lg:translate-y-10"
        >
          <div className="grid gap-3">
            {portfolioData.registryCards.map((card) => (
              <Panel key={card.name}>
                <p className="text-sm text-muted">{card.status}</p>
                <p className="mt-2 text-lg font-medium text-text">{card.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{card.summary}</p>
              </Panel>
            ))}
          </div>
        </WindowFrame>
      </section>

      <section id="archive" className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <WindowFrame
          title={portfolioData.windows.operatingModel.title}
          subtitle={portfolioData.windows.operatingModel.subtitle}
          className="lg:-translate-y-4"
        >
          <div className="grid gap-3">
            {portfolioData.principles.map((principle) => (
              <Panel key={principle}>
                <p className="leading-7 text-muted">{principle}</p>
              </Panel>
            ))}
          </div>
        </WindowFrame>

        <WindowFrame
          title={portfolioData.windows.archive.title}
          subtitle={portfolioData.windows.archive.subtitle}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {portfolioData.archiveCards.map((card) => (
              <Panel key={card.title}>
                <p className="text-lg font-medium text-text">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{card.summary}</p>
              </Panel>
            ))}
          </div>
        </WindowFrame>
      </section>

      <WindowFrame
        title={portfolioData.windows.notes.title}
        subtitle={portfolioData.windows.notes.subtitle}
      >
        <div className="flex flex-wrap gap-3">
          {portfolioData.architectureSignals.map((signal) => (
            <Panel className="px-4 py-3" key={signal}>
              <p className="text-sm text-text">{signal}</p>
            </Panel>
          ))}
        </div>

        <div
          id="contact"
          className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm text-muted"
        >
          <a href={portfolioData.githubUrl} rel="noreferrer" target="_blank">
            GitHub
          </a>
          <a href={`mailto:${portfolioData.contactEmail}`}>Contact</a>
          <span>{portfolioData.title}</span>
        </div>
      </WindowFrame>

      <DockNav ariaLabel="Desktop dock" items={portfolioData.dockItems} />
    </main>
  );
}
