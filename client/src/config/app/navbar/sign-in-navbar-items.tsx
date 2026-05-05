import { LayoutDashboard, Settings2, MessagesSquare, Users, Wrench, Store, MessageSquareText, Tags } from "lucide-react";

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
  {
    name: "Usuarios",
    icon: <Users className="w-5 h-5" />,
    path: "/admin/users",
    new: false,
  },
  {
    name: "Reparaciones",
    icon: <Wrench className="w-5 h-5" />,
    path: "/admin/repair-notes",
    new: false,
  },
  {
    name: "Mi Local",
    icon: <Store className="w-5 h-5" />,
    path: "/admin/local",
    new: false,
  },
  {
    name: "Templates",
    icon: <MessageSquareText className="w-5 h-5" />,
    path: "/admin/templates",
    new: false,
  },
  {
    name: "Lista de Precios",
    icon: <Tags className="w-5 h-5" />,
    path: "/admin/price-list",
    new: false,
  },
];

export const otherSignInItems = [];

export default signInNavbarItems;
