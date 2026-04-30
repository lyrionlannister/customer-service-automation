// import { jwtDecode } from "jwt-decode";

import CommonController from "@/modules/common/controllers/CommonController";

export class AuthController extends CommonController {
  constructor() {
    super();
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  login = async (user: { user: string; password: string }) => {
    console.log(user);
    // const headers = {
    //   "Content-Type": "application/json",
    // };
    // const response = await this.create("/api/auth/login", user, headers);
    // const { accessToken, refreshToken } = response;
    // if (accessToken && refreshToken) {
    //   sessionStorage.setItem("refreshToken", refreshToken);
    //   sessionStorage.setItem("user", JSON.stringify(jwtDecode(accessToken)));
    //   return true;
    // }
    // return false;
  };

  refreshToken = async () => {
    const headers = {
      "Content-Type": "application/json",
    };

    const refreshToken = sessionStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const response = await this.create(
      "/api/auth/refresh",
      { refreshToken: refreshToken },
      headers
    );
    return response.data;
  };
}

let authController: AuthController | null = null;

if (!authController) {
  authController = new AuthController();
}

export default authController;
