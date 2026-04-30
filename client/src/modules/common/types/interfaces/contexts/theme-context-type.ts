export type Theme = "light" | "dark";

export default interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
