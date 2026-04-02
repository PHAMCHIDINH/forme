import { readFile } from "node:fs/promises";
import path from "node:path";

import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

describe("tailwind theme integration", () => {
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
});
