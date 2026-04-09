import type { ComponentPropsWithoutRef } from "react";

import { Panel } from "../../ui/Panel";

type SurfaceProps = ComponentPropsWithoutRef<typeof Panel>;

export function Surface(props: SurfaceProps) {
  return <Panel {...props} />;
}
