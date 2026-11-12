import AppWrapper from "../core/common/pages/app-wrapper";
import { ThemeProvider } from "../core/common/contexts/providers/theme-provider";
import { ToastProvider } from "../core/common/contexts/providers/toast-provider";
import AppRouter from "./app-router";

export const AppProviders = () => {
  return (
    <AppWrapper>
      <ThemeProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </ThemeProvider>
    </AppWrapper>
  );
};

export default AppProviders;
