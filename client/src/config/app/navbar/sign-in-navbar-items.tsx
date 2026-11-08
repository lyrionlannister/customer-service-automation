import {
  LayoutDashboard,
  MessagesSquare,
  Settings2,
  Users,
  Wrench,
  Store,
  MessageSquareText,
  Tags,
  Boxes,
  ShoppingCart,
  FileText,
  Wallet,
} from "lucide-react";

const signInNavbarItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/admin/dashboard",
    group: "General",
    new: false,
  },
  {
    name: "Chats",
    icon: <MessagesSquare className="w-5 h-5" />,
    path: "/admin/chats",
    group: "General",
    new: false,
  },
  {
    name: "Configuración",
    icon: <Settings2 className="w-5 h-5" />,
    path: "/admin/whatsapp",
    group: "General",
    new: false,
  },
  {
    name: "Reparaciones",
    icon: <Wrench className="w-5 h-5" />,
    path: "/admin/repair-notes",
    group: "Operación",
    new: false,
  },
  {
    name: "Mi Local",
    icon: <Store className="w-5 h-5" />,
    path: "/admin/local",
    group: "Operación",
    new: false,
  },
  {
    name: "Templates",
    icon: <MessageSquareText className="w-5 h-5" />,
    path: "/admin/templates",
    group: "Operación",
    new: false,
  },
  {
    name: "Lista de Precios",
    icon: <Tags className="w-5 h-5" />,
    path: "/admin/price-list",
    group: "Ventas y stock",
    new: false,
  },
  {
    name: "Inventario",
    icon: <Boxes className="w-5 h-5" />,
    path: "/admin/inventory",
    group: "Ventas y stock",
    new: false,
  },
  {
    name: "Venta Rápida",
    icon: <ShoppingCart className="w-5 h-5" />,
    path: "/admin/sales/new",
    group: "Ventas y stock",
    new: false,
  },
  {
    name: "Cotizaciones",
    icon: <FileText className="w-5 h-5" />,
    path: "/admin/quotes",
    group: "Ventas y stock",
    new: false,
  },
  {
    name: "Usuarios",
    icon: <Users className="w-5 h-5" />,
    path: "/admin/users",
    group: "Administración",
    new: false,
  },
  {
    name: "Caja",
    icon: <Wallet className="w-5 h-5" />,
    path: "/admin/cash",
    group: "Administración",
    new: false,
  },
];

export const otherSignInItems = [];

export default signInNavbarItems;
