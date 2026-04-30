import React from "react";

import DefaultLayoutProps from "@types/interfaces/layouts/DefaultLayoutProps";

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default DefaultLayout;
