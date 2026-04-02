import { Panel } from "./Panel";

type ShellStatusProps = {
  title: string;
  description: string;
};

export function ShellStatus({ title, description }: ShellStatusProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10 lg:px-10">
      <Panel className="w-full p-8 lg:p-10" data-testid="shell-status">
        <p className="text-xs uppercase tracking-[0.24em] text-accent">Workspace</p>
        <h1 className="mt-4 font-display text-3xl text-text">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{description}</p>
      </Panel>
    </main>
  );
}
