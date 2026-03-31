export type PortfolioPrinciple = {
  title: string;
  description: string;
};

export type PortfolioProject = {
  name: string;
  domain: string;
  summary: string;
};

export type PortfolioCapability = {
  name: string;
  status: "Live" | "Planned" | "Evolving";
};

export type PortfolioData = {
  displayName: string;
  title: string;
  intro: string;
  githubUrl: string;
  contactEmail: string;
  principles: PortfolioPrinciple[];
  projects: PortfolioProject[];
  capabilities: PortfolioCapability[];
  architectureSignals: string[];
};

export const portfolioData: PortfolioData = {
  displayName: "Pham Chi Dinh",
  title: "System Architect and Personal Digital Hub Builder",
  intro:
    "I design practical digital systems with modular architecture, calm operational surfaces, and resilient delivery workflows.",
  githubUrl: "https://github.com/PHAMCHIDINH",
  contactEmail: "contact@example.com",
  principles: [
    {
      title: "System Thinking",
      description: "Shape tools as connected systems instead of isolated screens or one-off utilities.",
    },
    {
      title: "Modular Integration",
      description: "Keep interfaces composable so new modules can enter the hub without destabilizing it.",
    },
    {
      title: "Operational Clarity",
      description: "Use calm hierarchy and explicit states so the product stays understandable under growth.",
    },
  ],
  projects: [
    {
      name: "AI Service Hub",
      domain: "Internal Tooling",
      summary:
        "A modular platform for AI-powered operations with clean service boundaries and reusable workflows.",
    },
    {
      name: "E-commerce Marketplace",
      domain: "Digital Commerce",
      summary:
        "A marketplace architecture focused on extensible product modules and operational reliability.",
    },
  ],
  capabilities: [
    { name: "Todo", status: "Live" },
    { name: "File Manager", status: "Planned" },
    { name: "Knowledge Base", status: "Planned" },
    { name: "Automation", status: "Evolving" },
  ],
  architectureSignals: [
    "API Design",
    "Deployment Workflow",
    "Secure Access",
    "Data Modeling",
    "Modular Boundaries",
  ],
};
