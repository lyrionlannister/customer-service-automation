import { LayoutDashboard, Settings2, MessagesSquare } from "lucide-react";

const signInNavbarItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/admin/dashboard",
    new: false,
  },
  {
    name: "Chats",
    icon: <MessagesSquare className="w-5 h-5" />,
    path: "/admin/chats",
    new: false,
  },
  {
    name: "Configuración",
    icon: <Settings2 className="w-5 h-5" />,
    path: "/admin/whatsapp",
    new: false,
  },
];

export const otherSignInItems = [];

export default signInNavbarItems;
