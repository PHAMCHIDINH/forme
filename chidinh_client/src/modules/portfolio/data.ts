export type PortfolioProject = {
  name: string;
  summary: string;
};

export type PortfolioData = {
  displayName: string;
  title: string;
  intro: string;
  githubUrl: string;
  contactEmail: string;
  projects: PortfolioProject[];
};

export const portfolioData: PortfolioData = {
  displayName: "Pham Chi Dinh",
  title: "Personal Digital Hub Builder",
  intro:
    "I design practical software systems with modular architecture, clean APIs, and fast delivery cycles.",
  githubUrl: "https://github.com/PHAMCHIDINH",
  contactEmail: "contact@example.com",
  projects: [
    {
      name: "AI Service Hub",
      summary: "A modular platform for AI-powered internal tools and integrations.",
    },
    {
      name: "E-commerce Marketplace",
      summary:
        "A marketplace architecture focused on operational workflows and scalable product modules.",
    },
  ],
};
