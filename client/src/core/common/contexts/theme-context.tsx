"use client";

import { createContext } from "react";

import ThemeContextType from "../types/interfaces/contexts/theme-context-type";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default ThemeContext;
