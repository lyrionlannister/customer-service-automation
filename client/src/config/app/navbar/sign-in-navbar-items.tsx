import { GridIcon } from "../../../modules/common/icons";
import { MessagesSquare } from "lucide-react";

const signInNavbarItems = [
  {
    name: "Inicio",
    icon: <GridIcon />,
    path: "/admin",
    new: false,
  },
  {
    name: "Administrar WhatsApp",
    icon: <GridIcon />,
    path: "/admin/whatsapp",
    new: false,
  },
  {
    name: "Conversaciones",
    icon: <MessagesSquare className="w-5 h-5" />,
    path: "/admin/chats",
    new: false,
  },
];

export const otherSignInItems = [];

export default signInNavbarItems;
