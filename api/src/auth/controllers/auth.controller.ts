import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AUTH_MESSAGES } from "../constants/auth.constants.js";
import { getValidationMessages } from "../helpers/auth.helpers.js";
import { AuthService } from "../services/auth.service.js";
import { RegisterUserDto } from "../dtos/register-user.dto.js";
import { LoginUserDto } from "../dtos/login-user.dto.js";
import { CreateEmployeeDto } from "../dtos/create-employee.dto.js";

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

  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.authService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || AUTH_MESSAGES.REGISTER_ERROR });
    }
  };

  createEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(CreateEmployeeDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const messages = getValidationMessages(errors);
        res.status(400).json({ error: messages });
        return;
      }

      const user = await this.authService.createEmployee(dto);
      res.status(201).json({ message: AUTH_MESSAGES.REGISTER_SUCCESS, user });
    } catch (error: any) {
      const message = error.message || AUTH_MESSAGES.REGISTER_ERROR;
      res.status(400).json({ error: message });
    }
  };

  listEmployees = async (_req: Request, res: Response): Promise<void> => {
    try {
      const employees = await this.authService.listEmployees();
      res.status(200).json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message || AUTH_MESSAGES.REGISTER_ERROR });
    }
  };

  toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const user = await this.authService.toggleUserStatus(id);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message || AUTH_MESSAGES.REGISTER_ERROR });
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
