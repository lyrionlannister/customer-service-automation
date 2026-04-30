import { createContext } from "react";

import SidebarContextType from "../types/interfaces/contexts/SidebarContextType";

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default SidebarContext;
