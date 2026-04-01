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

    expect(result.css).toContain(".bg-surface");
    expect(result.css).toContain(".text-text");
    expect(result.css).toContain(".font-display");
    expect(result.css).toContain(".shadow-panel");
  });

  it("defines wallpaper, glass, and dock desktop classes", async () => {
    const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
    const input = await readFile(cssPath, "utf8");

    expect(input).toContain("--wallpaper-start");
    expect(input).toContain("--glass-surface");
    expect(input).toContain("--dock-surface");
    expect(input).toContain(".desktop-dock");
    expect(input).toContain("@media (max-width: 768px)");
  });
});
