import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AUTH_MESSAGES } from "../constants/auth.constants.js";
import { getValidationMessages } from "../helpers/auth.helpers.js";
import { AuthService } from "../services/auth.service.js";
import { RegisterUserDto } from "../dtos/register-user.dto.js";
import { LoginUserDto } from "../dtos/login-user.dto.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(RegisterUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const messages = getValidationMessages(errors);
        res.status(400).json({ error: messages });
        return;
      }

      const user = await this.authService.register(dto);
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: AUTH_MESSAGES.REGISTER_SUCCESS,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      const message = error.message || AUTH_MESSAGES.REGISTER_ERROR;
      res.status(400).json({ error: message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(LoginUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const messages = getValidationMessages(errors);
        res.status(400).json({ error: messages });
        return;
      }

      const { user, token } = await this.authService.login(dto);

      res.status(200).json({
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        user,
        token,
      });
    } catch (error: any) {
      const message = error.message || AUTH_MESSAGES.LOGIN_ERROR;
      res.status(401).json({ error: message });
    }
  };
}
