import { Outlet } from "react-router";

import useSidebar from "../hooks/useSidebar";
// import useAuthGuard from "../hooks/useAuthGuard";
import AsideMenu from "../components/menu/AsideMenu";
import NavbarMenu from "../components/menu/NavbarMenu";
import SidebarProvider from "../contexts/providers/SidebarProvider";
import signInNavbarItems, {
  otherSignInItems,
} from "../../../config/app/navbar/SignInNavbarItems";
import Backdrop from "../components/menu/Backdrop";

const LayoutContent: React.FC = () => {
  //   useAuthGuard("/admin/sign-in");
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AsideMenu
          navItems={signInNavbarItems}
          othersItems={otherSignInItems}
        />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <NavbarMenu />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const SignInLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default SignInLayout;
