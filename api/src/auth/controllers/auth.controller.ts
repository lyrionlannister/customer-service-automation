import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
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
        const messages = errors
          .flatMap((err) => Object.values(err.constraints || {}))
          .join(", ");
        res.status(400).json({ error: messages });
        return;
      }

      const user = await this.authService.register(dto);
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      const message = error.message || "Error en el registro";
      res.status(400).json({ error: message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(LoginUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const messages = errors
          .flatMap((err) => Object.values(err.constraints || {}))
          .join(", ");
        res.status(400).json({ error: messages });
        return;
      }

      const { user, token } = await this.authService.login(dto);

      res.status(200).json({
        message: "Sesión iniciada exitosamente",
        user,
        token,
      });
    } catch (error: any) {
      const message = error.message || "Error al iniciar sesión";
      res.status(401).json({ error: message });
    }
  };
}
