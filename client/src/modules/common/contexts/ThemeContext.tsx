"use client";

import { createContext } from "react";

import ThemeContextType from "../types/interfaces/contexts/ThemeContextType";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default ThemeContext;
