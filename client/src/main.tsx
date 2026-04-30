import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AppWrapper from "./modules/common/pages/AppWrapper.tsx";
import { ThemeProvider } from "./modules/common/contexts/providers/ThemeProvider.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AppWrapper>
  </StrictMode>
);
