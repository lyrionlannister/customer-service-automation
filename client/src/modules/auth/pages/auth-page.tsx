import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import AuthForm from "../components/auth-form";
import AuthLayout from "../components/auth-layout";
import PageMeta from "../../common/pages/page-meta";
import Loader from "@/modules/common/components/ui/loader/loader";

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
          <AuthForm />
        </AuthLayout>
      )}
    </>
  );
};

export default AuthPage;
