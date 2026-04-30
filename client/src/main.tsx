import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AppWrapper from "./modules/common/pages/app-wrapper.tsx";
import { ThemeProvider } from "./modules/common/contexts/providers/theme-provider.tsx";
import { ToastProvider } from "./modules/common/contexts/providers/toast-provider.tsx";
import "./index.css";
import App from "./app.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </AppWrapper>
  </StrictMode>
);
