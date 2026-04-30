import React from "react";

import DefaultLayoutProps from "@types/interfaces/layouts/default-layout-props";

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default DefaultLayout;
