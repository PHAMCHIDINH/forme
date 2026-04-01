export type PortfolioDockItem = {
  label: string;
  to: string;
  end?: boolean;
};

export type DesktopWindowCopy = {
  title: string;
  subtitle: string;
};

export type ArchiveCard = {
  title: string;
  summary: string;
};

export type RegistryCard = {
  name: string;
  status: string;
  summary: string;
};

export type PortfolioData = {
  displayName: string;
  title: string;
  intro: string;
  githubUrl: string;
  contactEmail: string;
  desktopIndicators: string[];
  dockItems: PortfolioDockItem[];
  windows: {
    identity: DesktopWindowCopy;
    archive: DesktopWindowCopy;
    operatingModel: DesktopWindowCopy;
    registry: DesktopWindowCopy;
    notes: DesktopWindowCopy;
  };
  principles: string[];
  archiveCards: ArchiveCard[];
  registryCards: RegistryCard[];
  architectureSignals: string[];
};

export const portfolioData: PortfolioData = {
  displayName: "Pham Chi Dinh",
  title: "System Architect",
  intro:
    "A curated desktop scene for system design, active modules, and architecture artifacts that feel alive rather than archived.",
  githubUrl: "https://github.com/PHAMCHIDINH",
  contactEmail: "contact@example.com",
  desktopIndicators: ["Public Desktop", "Live Modules", "Warm macOS"],
  dockItems: [
    { label: "Portfolio", to: "/", end: true },
    { label: "Systems", to: "/#archive" },
    { label: "Workspace", to: "/login" },
    { label: "Contact", to: "/#contact" },
  ],
  windows: {
    identity: {
      title: "About / Identity",
      subtitle: "Curated desktop scene",
    },
    archive: {
      title: "System Archive",
      subtitle: "Selected systems and dossiers",
    },
    operatingModel: {
      title: "Operating Model",
      subtitle: "Principles behind the machine",
    },
    registry: {
      title: "Module Registry",
      subtitle: "Live and near-future modules",
    },
    notes: {
      title: "Architecture Notes",
      subtitle: "Signals from the technical stack",
    },
  },
  principles: [
    "Modular boundaries over sprawling complexity.",
    "Interfaces should feel calm even when systems are dense.",
    "Products should expose structure instead of hiding it behind generic templates.",
  ],
  archiveCards: [
    {
      title: "AI Service Hub",
      summary:
        "Operational tooling framed as a modular service environment with reusable assistant workflows.",
    },
    {
      title: "Marketplace Systems",
      summary:
        "Commerce architecture documented as a living system with integration boundaries and delivery artifacts.",
    },
  ],
  registryCards: [
    {
      name: "Todo.app",
      status: "Live",
      summary: "The first active application inside the private workspace.",
    },
    {
      name: "Files",
      status: "Registered",
      summary: "Reserved for future asset and reference storage inside the machine.",
    },
    {
      name: "Automation",
      status: "Registered",
      summary: "Planned space for recurring workflows and assistant actions.",
    },
  ],
  architectureSignals: [
    "API Design",
    "Secure Access",
    "Data Modeling",
    "Deployment Workflow",
  ],
};
