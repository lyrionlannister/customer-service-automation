import { GridIcon } from "../../../modules/common/icons";
import { MessageCircle } from "lucide-react";

const signInNavbarItems = [
  {
    name: "Inicio",
    icon: <GridIcon />,
    path: "/",
    new: false,
  },
  {
    name: "WhatsApp",
    icon: <MessageCircle className="w-5 h-5" />,
    path: "/admin/whatsapp",
    new: false,
  },
];

export const otherSignInItems = [];

export default signInNavbarItems;
