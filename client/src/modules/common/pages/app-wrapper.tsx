import { HelmetProvider } from "react-helmet-async";

const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default AppWrapper;
