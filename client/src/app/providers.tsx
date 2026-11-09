import AppWrapper from "../modules/common/pages/app-wrapper";
import { ThemeProvider } from "../modules/common/contexts/providers/theme-provider";
import { ToastProvider } from "../modules/common/contexts/providers/toast-provider";
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
