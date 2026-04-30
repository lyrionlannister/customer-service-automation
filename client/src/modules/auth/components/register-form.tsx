import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useRegister } from "../../common/hooks/use-register";
import Input from "../../common/components/ui/inputs/input";
import Label from "../../common/components/ui/inputs/label";
import Button from "../../common/components/ui/button/button";
import Alert from "../../common/components/ui/alert/alert";
import { EyeCloseIcon, EyeIcon } from "../../common/icons";

const RegisterForm: React.FC = () => {
  const { register, loading, error, success, clearError, clearSuccess } =
    useRegister();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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

    const result = await register(formData);
    if (result) {
      // Registro exitoso, redirigir a login o dashboard
      setTimeout(() => {
        navigate("/admin/sign-in", { replace: true });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Crear una nueva cuenta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Completa los siguientes datos para registrarte
            </p>
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
                message="Registro completado. Serás redirigido a iniciar sesión."
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label className="text-gray-500">
                  Nombre <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Tu nombre"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-gray-500">
                  Apellido <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Tu apellido"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

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
                    placeholder="Mínimo 8 caracteres"
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
                  {loading ? "Registrando..." : "Registrarse"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/admin/sign-in"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
