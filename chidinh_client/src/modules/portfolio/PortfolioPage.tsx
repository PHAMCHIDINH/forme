import { Link } from "react-router-dom";

import { portfolioData } from "./data";

export function PortfolioPage() {
  return (
    <main>
      <header>
        <p>{portfolioData.displayName}</p>
        <h1>Personal Digital Hub</h1>
        <h2>{portfolioData.title}</h2>
        <p>{portfolioData.intro}</p>
      </header>

      <section>
        <h2>Selected Projects</h2>
        <ul>
          {portfolioData.projects.map((project) => (
            <li key={project.name}>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <a href={portfolioData.githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={`mailto:${portfolioData.contactEmail}`}>Contact</a>
        <Link to="/login">Owner Login</Link>
      </footer>
    </main>
  );
}
