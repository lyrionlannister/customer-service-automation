declare module "*.svg?react" {
  import type { ComponentType, SVGProps } from "react";
  const ReactComponent: ComponentType<SVGProps<SVGSVGElement>>;
  export { ReactComponent };
  export default ReactComponent;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
