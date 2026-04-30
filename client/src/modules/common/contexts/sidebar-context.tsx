import { createContext } from "react";

import SidebarContextType from "../types/interfaces/contexts/sidebar-context-type";

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default SidebarContext;
