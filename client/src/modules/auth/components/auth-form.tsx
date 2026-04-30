import { useState } from "react";
import { useNavigate } from "react-router";
import { useLogin } from "../../common/hooks/use-login";
import Input from "../../common/components/ui/inputs/input";
import Label from "../../common/components/ui/inputs/label";
import Button from "../../common/components/ui/button/button";
import Alert from "../../common/components/ui/alert/alert";
import { EyeCloseIcon, EyeIcon } from "../../common/icons";

interface AuthFormProps {
  controller?: any; // Para compatibilidad hacia atrás
}

const AuthForm: React.FC<AuthFormProps> = () => {
  const { login, loading, error, success, clearError, clearSuccess } =
    useLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();

    const result = await login(formData);
    if (result) {
      // Login exitoso, redirigir al dashboard
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Ingresa a tu cuenta
            </h1>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" title="Error" message={error} />
            </div>
          )}

          {success && (
            <div className="mb-4">
              <Alert
                variant="success"
                title="¡Éxito!"
                message="Sesión iniciada. Serás redirigido..."
              />
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label className="text-gray-500">
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-gray-500">
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    variant="primary"
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
