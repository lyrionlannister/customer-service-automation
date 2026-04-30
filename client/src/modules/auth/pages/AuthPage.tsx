import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import AuthForm from "../components/AuthForm";
import AuthLayout from "../components/AuthLayout";
import PageMeta from "../../common/pages/PageMeta";
import authController from "../controller/authController";
import Loader from "@/modules/common/components/ui/loader/Loader";

const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = sessionStorage.getItem("accessToken");
    if (checkLogin) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <>
      <PageMeta title="Sign In" description="Inicia Sesión en Sofia" />
      {loading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <Loader />
        </div>
      ) : (
        <AuthLayout>
          <AuthForm controller={authController} />
        </AuthLayout>
      )}
    </>
  );
};

export default AuthPage;
