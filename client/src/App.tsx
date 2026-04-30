import { BrowserRouter, Routes, Route } from "react-router";
import SignInLayout from "./modules/common/layouts/SignInLayout";
import noAuthRouter from "./router";
import User from "./modules/common/types/auth/User";

const App: React.FC = () => {
  const setUserToTest = () => {
    const user: User = {
      id: 1,
      fullname: "Luis Guzmán",
      profilePhoto: "/images/profile.webp",
      user: "mlopez",
      email: "maria.lopez@example.com",
      role: "admin",
      state: "active",
    };

    sessionStorage.setItem("user", JSON.stringify(user));
  };

  setUserToTest();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInLayout />}>
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center">
                <img src="images/logo.png" />
              </div>
            }
          />
        </Route>

        {noAuthRouter.map((route, index) => {
          return (
            <Route key={index} path={route.path} element={route.element} />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
