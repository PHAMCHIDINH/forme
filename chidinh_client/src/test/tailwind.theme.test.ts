import { readFile } from "node:fs/promises";
import path from "node:path";

import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

describe("tailwind theme integration", () => {
  it("uses the RetroUI token contract", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");

    expect(input).toContain("--radius: 0.5rem;");
    expect(input).toContain("--background: #FCFFE7;");
    expect(input).toContain("--primary: #EA435F;");
    expect(input).toContain("--secondary: #FFDA5C;");
    expect(input).toContain("--accent: #CEEBFC;");
    expect(input).toContain("--border: #000000;");
    expect(input).toContain("--primary-hover: #D00000;");
    expect(input).toContain(':root[data-theme="dark"]');
    expect(input).toContain(".dark");
  });

  it("defines hard-edged retro base styling", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");

    expect(input).toContain("border: 2px solid var(--border)");
    expect(input).toContain("box-shadow:");
    expect(input).toContain("background-color: var(--background)");
  });

  it("generates custom theme utilities used by the UI", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");

    const result = await postcss([tailwindcss()]).process(input, {
      from: cssPath,
    });

    expect(result.css).toContain(".bg-primary");
    expect(result.css).toContain(".text-foreground");
    expect(result.css).toContain(".font-head");
    expect(result.css).toContain(".shadow-md");
  });

  it("defines the active theme tokens and brutalist base rules", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");

    expect(input).toContain("--font-head");
    expect(input).toContain("--color-primary");
    expect(input).toContain("--background");
    expect(input).toContain("input:focus");
    expect(input).toContain("button {");
  });

  it("keeps only approved legacy alias bridge tokens", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");

    expect(input).toContain("--color-base");
    expect(input).toContain("--color-surfaceAlt");
    expect(input).not.toContain("--color-surface-alt");
  });

  it("defines the dark-mode tokens required by the spec baseline", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");
    const darkThemeBlock = input.match(/:root\[data-theme="dark"\],\s*\.dark\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

    expect(input).toMatch(/:root\[data-theme="dark"\],\s*\.dark\s*\{/);
    expect(darkThemeBlock).toContain("--background:");
    expect(darkThemeBlock).toContain("--foreground:");
    expect(darkThemeBlock).toContain("--border:");
    expect(darkThemeBlock).toContain("--ring:");
    expect(darkThemeBlock).toContain("--primary-hover:");
    expect(darkThemeBlock).toContain("--surface-shell:");
    expect(darkThemeBlock).toContain("--surface-panel-muted:");
    expect(darkThemeBlock).toContain("--surface-panel-featured:");
    expect(darkThemeBlock).toContain("--form-state-disabled-bg:");
    expect(darkThemeBlock).toContain("--surface-panel:");
  });
});
