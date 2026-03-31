import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        surfaceAlt: "var(--color-surface-alt)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "\"Times New Roman\"", "serif"],
        sans: ["\"Segoe UI\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
