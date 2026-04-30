import { BrowserRouter, Routes, Route } from "react-router";
import SignInLayout from "./modules/common/layouts/sign-in-layout";
import noAuthRouter from "./router";

const App: React.FC = () => {
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
